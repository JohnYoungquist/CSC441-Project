const { randomBytes, scryptSync } = require("node:crypto");
const { createPool } = require("./mysql");

async function seed() {
  const password = process.env.DEMO_PASSWORD;
  if (!password || password.length < 12 || password.length > 256) throw new Error("Set DEMO_PASSWORD to a demo password of 12–256 characters.");
  const pool = createPool();
  const conn = await pool.getConnection().catch(async error => { await pool.end(); throw error; });
  try {
    await conn.beginTransaction();
    await conn.execute("INSERT IGNORE INTO sites (id,name) VALUES (1,'Demo North'),(2,'Demo South')");
    await conn.execute(`INSERT IGNORE INTO equipment (id,site_id,name) VALUES
      ('CAM-001',1,'Main Entrance Camera'),('CAM-002',1,'Loading Dock Camera'),
      ('ACS-001',2,'Office Card Reader'),('IDS-001',2,'Warehouse Motion Detector')`);
    for (const [username, name, site] of [["north.demo","North Demo User",1], ["south.demo","South Demo User",2]]) {
      const salt = randomBytes(16).toString("hex");
      const hash = scryptSync(password, salt, 64).toString("hex");
      await conn.execute(`INSERT INTO users (username,name,password_hash) VALUES (?,?,?)
        ON DUPLICATE KEY UPDATE password_hash=?`, [username,name,salt+":"+hash,salt+":"+hash]);
      await conn.execute("INSERT IGNORE INTO user_sites SELECT id, ? FROM users WHERE username=?", [site,username]);
    }
    await conn.commit();
    console.log("Demo accounts ready: north.demo and south.demo.");
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
    await pool.end();
  }
}
seed().catch(error => { console.error(error.message); process.exitCode = 1; });
