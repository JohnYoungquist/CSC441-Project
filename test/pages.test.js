const { test } = require("node:test");
const assert = require("node:assert/strict");
const { scryptSync } = require("node:crypto");
const { once } = require("node:events");
const { createApp } = require("../server");

test("page routes serve HTML and /summary renders database results on the server", async t => {
  const password = "test-only-demo-password";
  const hash = "testsalt:" + scryptSync(password, "testsalt", 64).toString("hex");
  const pool = {
    async execute(query) {
      if (query.includes("password_hash")) return [[{ id: 1, name: "North", password_hash: hash }]];
      if (query.includes("AS inProgress")) return [[{ site: "Demo North", equipment: 2, open: 1, inProgress: 0, closed: 0 }]];
      if (query.includes("AS activeRequests")) return [[{ id: "CAM-001", name: "Camera <script>", site: "Demo North", activeRequests: 1 }]];
      return [[{ id: 7 }]];
    }
  };
  const notes = {
    find(filter) {
      assert.deepEqual(filter, { requestId: { $in: [7] } });
      return { sort: () => ({ limit: () => ({ toArray: async () => [{ requestId: 7, author: "North", text: "Lens cleaned", createdAt: new Date() }] }) }) };
    }
  };
  const server = createApp(pool, notes).listen(0, "127.0.0.1");
  t.after(() => new Promise(resolve => server.close(resolve)));
  await once(server, "listening");
  const url = "http://127.0.0.1:" + server.address().port;

  for (const [route, heading] of [["/", "Welcome"], ["/about", "About Us"], ["/equipment", "Equipment Inventory"],
    ["/requests", "Service Requests"], ["/submit", "Submit Service Request"], ["/login", "Sign In"]]) {
    const res = await fetch(url + route);
    assert.equal(res.status, 200, route);
    assert.match(await res.text(), new RegExp(heading), route);
  }
  const signedOut = await fetch(url + "/summary", { redirect: "manual" });
  assert.equal(signedOut.status, 302);
  assert.equal(signedOut.headers.get("location"), "/login");

  const login = await fetch(url + "/api/login", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "north", password }) });
  const cookie = login.headers.get("set-cookie").split(";")[0];
  const page = await fetch(url + "/summary", { headers: { cookie } });
  assert.equal(page.status, 200);
  assert.match(page.headers.get("content-type"), /text\/html/);
  const html = await page.text();
  assert.match(html, /Demo North/);
  assert.match(html, /Lens cleaned/);
  assert.match(html, /Camera &lt;script&gt;/, "database values are escaped");
});
