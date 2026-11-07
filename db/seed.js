const { randomBytes, scryptSync } = require("node:crypto");
const { MongoClient } = require("mongodb");
const { createPool } = require("./mysql");

// Fictional demo data. Equipment IDs stay stable so the script can be re-run safely.
const sites = [[1, "Demo North"], [2, "Demo South"]];
const equipment = [
  ["CAM-001", 1, "Main Entrance Camera"],
  ["CAM-002", 1, "Loading Dock Camera"],
  ["CAM-003", 1, "Parking Lot PTZ Camera"],
  ["ACS-002", 1, "Lobby Door Card Reader"],
  ["ALM-001", 1, "Front Office Alarm Panel"],
  ["ACS-001", 2, "Office Card Reader"],
  ["IDS-001", 2, "Warehouse Motion Detector"],
  ["CAM-101", 2, "Warehouse Aisle Camera"],
  ["IDS-002", 2, "Rear Door Contact Sensor"],
  ["NVR-101", 2, "Network Video Recorder"]
];
const users = [["north.demo", "North Demo User", 1], ["south.demo", "South Demo User", 2]];
// Sample requests: [equipment, username, priority, status, issue, notes...]
const sampleRequests = [
  ["CAM-002", "north.demo", "High", "In Progress", "Loading dock camera shows a black image after 6 PM.",
    "Checked the IR illuminator; it is not turning on at night.", "Replacement IR board ordered."],
  ["ACS-002", "north.demo", "Normal", "Open", "Card reader beeps twice and does not unlock for valid badges.",
    "Reader is online in the access software. Schedule an on-site check."],
  ["IDS-001", "south.demo", "Low", "Closed", "Motion detector triggers false alarms when the HVAC turns on.",
    "Repositioned the sensor away from the supply vent.", "No false alarms for 48 hours. Closing request."]
];

async function seed() {
  const password = process.env.DEMO_PASSWORD;
  if (!password || password.length < 12 || password.length > 256) throw new Error("Set DEMO_PASSWORD to a demo password of 12–256 characters.");
  const pool = createPool();
  const mongo = new MongoClient(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017", { serverSelectionTimeoutMS: 5000 });
  let conn;
  try {
    conn = await pool.getConnection();
    // Older copies of schema.sql used a column too short for "salt:hash" (161 characters).
    // ALTER runs before the transaction because MySQL commits DDL immediately.
    await conn.query("ALTER TABLE users MODIFY password_hash VARCHAR(255) NOT NULL");
    await conn.beginTransaction();
    await conn.query("INSERT IGNORE INTO sites (id,name) VALUES ?", [sites]);
    await conn.query("INSERT IGNORE INTO equipment (id,site_id,name) VALUES ?", [equipment]);
    for (const [username, name, site] of users) {
      const salt = randomBytes(16).toString("hex");
      const hash = salt + ":" + scryptSync(password, salt, 64).toString("hex");
      await conn.execute(`INSERT INTO users (username,name,password_hash) VALUES (?,?,?)
        ON DUPLICATE KEY UPDATE password_hash=?`, [username, name, hash, hash]);
      await conn.execute("INSERT IGNORE INTO user_sites SELECT id, ? FROM users WHERE username=?", [site, username]);
    }
    // Add each sample request once (matched by equipment + issue text).
    const created = [];
    for (const [equipmentId, username, priority, status, issue, ...notes] of sampleRequests) {
      let [[row]] = await conn.execute("SELECT id FROM service_requests WHERE equipment_id=? AND issue=?", [equipmentId, issue]);
      if (!row) {
        const [result] = await conn.execute(`INSERT INTO service_requests (equipment_id,user_id,priority,status,issue)
          SELECT ?, id, ?, ?, ? FROM users WHERE username=?`, [equipmentId, priority, status, issue, username]);
        row = { id: result.insertId };
      }
      created.push({ requestId: row.id, author: users.find(u => u[0] === username)[1], notes });
    }
    await conn.commit();

    // MongoDB: service notes keyed by the numeric MySQL request ID.
    await mongo.connect();
    const collection = mongo.db(process.env.MONGODB_DATABASE || "security_tracker").collection("service_notes");
    await collection.createIndex({ requestId: 1, createdAt: 1 });
    let added = 0;
    for (const { requestId, author, notes } of created) {
      for (const [index, text] of notes.entries()) {
        const result = await collection.updateOne({ requestId, text },
          { $setOnInsert: { requestId, author, text, createdAt: new Date(Date.now() - (notes.length - index) * 3600_000) } },
          { upsert: true });
        added += result.upsertedCount;
      }
    }
    console.log(`Demo accounts ready: north.demo and south.demo. ${equipment.length} equipment items, ${created.length} sample requests, ${added} new service notes.`);
  } catch (error) {
    if (conn) await conn.rollback().catch(() => {});
    throw error;
  } finally {
    conn?.release();
    await Promise.allSettled([pool.end(), mongo.close()]);
  }
}
seed().catch(error => { console.error(error.message); process.exitCode = 1; });
