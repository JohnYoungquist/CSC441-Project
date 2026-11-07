const { test } = require("node:test");
const assert = require("node:assert/strict");
const { scryptSync } = require("node:crypto");
const { once } = require("node:events");
const { createApp } = require("../server");

test("service request and notes HTTP routes enforce assigned sites", async t => {
  const password = "test-only-demo-password";
  const hash = "testsalt:" + scryptSync(password, "testsalt", 64).toString("hex");
  const assets = [{ id: "CAM-001", user: 1 }, { id: "ACS-001", user: 2 }];
  const records = [];
  const documents = [];
  const pool = {
    async execute(query, args) {
      if (query.includes("password_hash")) {
        const id = { north: 1, south: 2 }[args[0]];
        return [id ? [{ id, name: id === 1 ? "North" : "South", password_hash: hash }] : []];
      }
      if (query.startsWith("SELECT e.id")) {
        assert.match(query, /us\.user_id=\?/);
        return [assets.filter(a => a.user === args[0])];
      }
      if (query.startsWith("INSERT")) {
        assert.match(query, /us\.user_id=\? AND e\.id=\?/);
        const [user, priority, issue, accessUser, equipmentId] = args;
        assert.equal(user, accessUser);
        if (!assets.some(a => a.id === equipmentId && a.user === accessUser)) return [{ affectedRows: 0 }];
        records.push({ id: records.length + 1, user, equipmentId, requester: user === 1 ? "North" : "South", status: "Open", priority, issue });
        return [{ affectedRows: 1, insertId: records.length }];
      }
      if (query.startsWith("UPDATE")) {
        assert.match(query, /us\.user_id=\?/);
        const r = records.find(r => r.user === args[0] && r.id === Number(args[2]));
        if (r) r.status = args[1];
        return [{ affectedRows: r ? 1 : 0 }];
      }
      assert.match(query, /us\.user_id=\?/);
      return [records.filter(r => r.user === args[0] && (args.length === 1 || r.id === Number(args[1])))];
    }
  };
  const notes = {
    async insertOne(note) { documents.push(note); },
    find({ requestId }) { return { sort: () => ({ toArray: async () => documents.filter(n => n.requestId === requestId) }) }; }
  };
  const server = createApp(pool, notes).listen(0, "127.0.0.1");
  t.after(() => new Promise(resolve => server.close(resolve)));
  await once(server, "listening");
  const url = "http://127.0.0.1:" + server.address().port;
  const call = (route, method = "GET", cookie = "", body) => fetch(url + route, {
    method, headers: { cookie, ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
    body: JSON.stringify(body)
  });
  const signIn = async username => {
    const response = await call("/api/login", "POST", "", { username, password });
    assert.equal(response.status, 200);
    const cookie = response.headers.get("set-cookie");
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Strict/);
    return cookie.split(";")[0];
  };
  assert.equal((await call("/api/requests")).status, 401);
  assert.equal((await call("/api/login", "POST", "", { username: "north", password: "wrong" })).status, 401);
  const north = await signIn("north"), south = await signIn("south");
  assert.deepEqual((await (await call("/api/equipment", "GET", north)).json()).map(a => a.id), ["CAM-001"]);
  const ticket = { equipmentId: "CAM-001", priority: "High", issue: "Camera is not responding.", requester: "Impersonated" };
  assert.equal((await call("/api/requests", "POST", south, ticket)).status, 403);
  assert.equal((await call("/api/requests", "POST", north, { ...ticket, issue: "   " })).status, 400);
  const created = await call("/api/requests", "POST", north, ticket);
  assert.equal(created.status, 201);
  const { id } = await created.json();
  const route = "/api/requests/" + id;
  assert.deepEqual(await (await call("/api/requests", "GET", south)).json(), []);
  assert.equal((await (await call("/api/requests", "GET", north)).json())[0].requester, "North");
  assert.equal((await call(route, "PATCH", south, { status: "Closed" })).status, 404);
  assert.equal((await call(route, "PATCH", north, { status: "In Progress" })).status, 200);
  assert.equal((await call(route + "/notes", "POST", south, { text: "Unauthorized" })).status, 404);
  assert.equal((await call(route + "/notes", "POST", north, { text: "  " })).status, 400);
  assert.equal((await call(route + "/notes", "POST", north, { text: "Investigating", author: "Impersonated" })).status, 201);
  assert.equal((await call(route + "/notes", "GET", south)).status, 404);
  const saved = await (await call(route + "/notes", "GET", north)).json();
  assert.equal(saved[0].author, "North");
  assert.equal(saved[0].text, "Investigating");
  assert.equal((await call("/api/logout", "POST", north, {})).status, 200);
  assert.equal((await call("/api/session", "GET", north)).status, 401);
});
