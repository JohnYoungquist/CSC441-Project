const express = require("express");
const path = require("node:path");
const { randomBytes, scrypt, timingSafeEqual } = require("node:crypto");
const { promisify } = require("node:util");
const { summaryPage } = require("./views/layout");
const derive = promisify(scrypt);
const sessionLifetime = 8 * 60 * 60 * 1000;
const priorities = ["Low", "Normal", "High"];
const statuses = ["Open", "In Progress", "Closed"];

function createApp(sql, notes, { secure = false } = {}) {
  const app = express();
  const sessions = new Map();
  const attempts = new Map();
  const cookie = { httpOnly: true, sameSite: "strict", secure, path: "/" };
  const token = req => (req.headers.cookie || "").match(/(?:^|;\s*)tracker_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  const clean = value => typeof value === "string" ? value.trim() : "";
  const run = async (query, args) => (await sql.execute(query, args))[0];
  const requestFields = `r.id, r.equipment_id AS equipmentId, e.name AS equipmentName,
    s.name AS site, u.name AS requester, r.priority, r.status, r.issue, r.created_at AS createdAt`;
  const scopedRequests = `FROM service_requests r JOIN equipment e ON e.id=r.equipment_id
    JOIN sites s ON s.id=e.site_id JOIN users u ON u.id=r.user_id
    JOIN user_sites us ON us.site_id=e.site_id AND us.user_id=?`;
  const getRequest = (req) => run(`SELECT ${requestFields} ${scopedRequests} WHERE r.id=?`,
    [req.user.id, req.params.id]).then(rows => rows[0]);

  app.disable("x-powered-by");
  app.use("/api", (req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
  app.use(express.json({ limit: "8kb" }));
  // API writes require JSON; cross-origin browser requests are not enabled.
  app.use("/api", (req, res, next) => {
    if (["POST", "PATCH"].includes(req.method) && !req.is("application/json"))
      return res.status(415).json({ error: "Send JSON." });
    next();
  });

  app.post("/api/login", async (req, res) => {
    const now = Date.now();
    for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
    const key = req.ip;
    const limit = attempts.get(key) || { count: 0, until: now + 60_000 };
    if (limit.count >= 10) return res.status(429).json({ error: "Too many attempts. Try again in a minute." });
    limit.count++;
    attempts.set(key, limit);
    const username = clean(req.body?.username).toLowerCase();
    const password = req.body?.password;
    if (!username || username.length > 60 || typeof password !== "string" || password.length > 256)
      return res.status(400).json({ error: "Enter a valid username and password." });
    const [user] = await run("SELECT id,name,password_hash FROM users WHERE username=?", [username]);
    const [salt, hash] = (user?.password_hash || ("0".repeat(32) + ":" + "0".repeat(128))).split(":");
    const candidate = await derive(password, salt, 64);
    if (!user || !timingSafeEqual(candidate, Buffer.from(hash, "hex")))
      return res.status(401).json({ error: "Invalid username or password." });
    for (const [key, value] of sessions) if (value.expires <= now) sessions.delete(key);
    sessions.delete(token(req));
    const id = randomBytes(32).toString("hex");
    sessions.set(id, { user: { id: user.id, name: user.name }, expires: now + sessionLifetime });
    res.cookie("tracker_session", id, { ...cookie, maxAge: sessionLifetime }).json({ name: user.name });
  });
  app.post("/api/logout", (req, res) => {
    sessions.delete(token(req));
    res.clearCookie("tracker_session", cookie).json({ ok: true });
  });
  const currentUser = req => {
    const id = token(req);
    const session = sessions.get(id);
    if (session && session.expires > Date.now()) return session.user;
    sessions.delete(id);
  };
  app.use("/api", (req, res, next) => {
    req.user = currentUser(req);
    if (!req.user) return res.status(401).json({ error: "Sign in to continue." });
    next();
  });
  app.get("/api/session", (req, res) => res.json({ name: req.user.name }));
  app.get("/api/equipment", async (req, res) => res.json(await run(`SELECT e.id,e.name,s.name AS site
    FROM equipment e JOIN sites s ON s.id=e.site_id
    JOIN user_sites us ON us.site_id=e.site_id WHERE us.user_id=? ORDER BY s.name,e.name`, [req.user.id])));
  app.get("/api/requests", async (req, res) => res.json(await run(
    `SELECT ${requestFields} ${scopedRequests} ORDER BY r.id DESC`, [req.user.id])));
  app.post("/api/requests", async (req, res) => {
    const issue = clean(req.body?.issue);
    const equipmentId = clean(req.body?.equipmentId);
    const priority = req.body?.priority;
    if (issue.length < 10 || issue.length > 500 || !equipmentId || equipmentId.length > 30 || !priorities.includes(priority))
      return res.status(400).json({ error: "Choose equipment and priority and enter a 10–500 character description." });
    const result = await run(`INSERT INTO service_requests (equipment_id,user_id,priority,issue)
      SELECT e.id,?,?,? FROM equipment e JOIN user_sites us ON us.site_id=e.site_id
      WHERE us.user_id=? AND e.id=?`, [req.user.id, priority, issue, req.user.id, equipmentId]);
    if (!result.affectedRows) return res.status(403).json({ error: "You cannot submit requests for that equipment." });
    res.status(201).json({ id: result.insertId });
  });
  app.param("id", (req, res, next, id) => {
    if (!/^[1-9][0-9]{0,9}$/.test(id) || Number(id) > 2147483647)
      return res.status(400).json({ error: "Invalid request ID." });
    next();
  });
  app.patch("/api/requests/:id", async (req, res) => {
    if (!statuses.includes(req.body?.status)) return res.status(400).json({ error: "Invalid status." });
    const result = await run(`UPDATE service_requests r JOIN equipment e ON e.id=r.equipment_id
      JOIN user_sites us ON us.site_id=e.site_id AND us.user_id=?
      SET r.status=? WHERE r.id=?`, [req.user.id, req.body.status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: "Request not found." });
    res.json({ status: req.body.status });
  });
  app.get("/api/requests/:id/notes", async (req, res) => {
    if (!await getRequest(req)) return res.status(404).json({ error: "Request not found." });
    res.json(await notes.find({ requestId: Number(req.params.id) }).sort({ createdAt: 1, _id: 1 }).toArray());
  });
  app.post("/api/requests/:id/notes", async (req, res) => {
    if (!await getRequest(req)) return res.status(404).json({ error: "Request not found." });
    const text = clean(req.body?.text);
    if (!text || text.length > 1000) return res.status(400).json({ error: "Enter a note of 1–1000 characters." });
    const note = { requestId: Number(req.params.id), author: req.user.name, text, createdAt: new Date() };
    await notes.insertOne(note);
    res.status(201).json(note);
  });
  app.use("/api", (req, res) => res.status(404).json({ error: "Route not found." }));

  // Page navigation routes: clean URLs for each HTML page.
  const pages = { "/": "index.html", "/about": "about.html", "/equipment": "catalog.html",
    "/requests": "reviews.html", "/submit": "contact.html", "/login": "login.html" };
  for (const [route, file] of Object.entries(pages))
    app.get(route, (req, res) => res.sendFile(path.join(__dirname, "public", file)));

  // Server-rendered page: queries MySQL and MongoDB, then sends finished HTML to the browser.
  app.get("/summary", async (req, res) => {
    const user = currentUser(req);
    if (!user) return res.redirect("/login");
    const sites = await run(`SELECT s.name AS site, COUNT(DISTINCT e.id) AS equipment,
        COUNT(CASE WHEN r.status='Open' THEN 1 END) AS open,
        COUNT(CASE WHEN r.status='In Progress' THEN 1 END) AS inProgress,
        COUNT(CASE WHEN r.status='Closed' THEN 1 END) AS closed
      FROM sites s JOIN user_sites us ON us.site_id=s.id AND us.user_id=?
      LEFT JOIN equipment e ON e.site_id=s.id LEFT JOIN service_requests r ON r.equipment_id=e.id
      GROUP BY s.id, s.name ORDER BY s.name`, [user.id]);
    const equipment = await run(`SELECT e.id, e.name, s.name AS site,
        COUNT(CASE WHEN r.status<>'Closed' THEN 1 END) AS activeRequests
      FROM equipment e JOIN sites s ON s.id=e.site_id JOIN user_sites us ON us.site_id=e.site_id AND us.user_id=?
      LEFT JOIN service_requests r ON r.equipment_id=e.id
      GROUP BY e.id, e.name, s.name ORDER BY s.name, e.name`, [user.id]);
    const ids = (await run(`SELECT r.id FROM service_requests r JOIN equipment e ON e.id=r.equipment_id
      JOIN user_sites us ON us.site_id=e.site_id AND us.user_id=?`, [user.id])).map(r => r.id);
    const recent = ids.length ? await notes.find({ requestId: { $in: ids } }).sort({ createdAt: -1 }).limit(5).toArray() : [];
    res.set("Cache-Control", "no-store").type("html").send(summaryPage(user, sites, equipment, recent));
  });
  app.use(express.static(path.join(__dirname, "public")));
  app.use((error, req, res, next) => {
    if (error.status === 400 || error.status === 413)
      return res.status(error.status).json({ error: "Invalid or oversized request body." });
    console.error(error.code || error.name);
    res.status(500).json({ error: "The server could not complete the request." });
  });
  return app;
}

async function start() {
  const { createPool } = require("./db/mysql");
  const { MongoClient } = require("mongodb");
  const sql = createPool();
  const mongo = new MongoClient(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017", { serverSelectionTimeoutMS: 5000 });
  try {
    await sql.query("SELECT 1");
    await mongo.connect();
    const notes = mongo.db(process.env.MONGODB_DATABASE || "security_tracker").collection("service_notes");
    await notes.createIndex({ requestId: 1, createdAt: 1 });
    const port = Number(process.env.PORT || 3000);
    const server = createApp(sql, notes, { secure: process.env.COOKIE_SECURE === "true" })
      .listen(port, process.env.HOST || "127.0.0.1", () => console.log(`Tracker listening on port ${port}`));
    server.on("error", async error => {
      console.error(error.code || error.name);
      await Promise.allSettled([sql.end(), mongo.close()]);
      process.exitCode = 1;
    });
  } catch (error) {
    await Promise.allSettled([sql.end(), mongo.close()]);
    throw error;
  }
}
if (require.main === module) start().catch(error => { console.error("Startup failed:", error.code || error.name); process.exitCode = 1; });
module.exports = { createApp };
