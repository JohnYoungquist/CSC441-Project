const mysql = require("mysql2/promise");
function createPool() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || "security_tracker",
    timezone: "Z"
  });
  // Read and write TIMESTAMP columns in UTC so times match the "Z" setting above,
  // whatever time zone the MySQL server uses (otherwise times shift by the UTC offset).
  pool.pool.on("connection", conn => conn.query("SET time_zone = '+00:00'"));
  return pool;
}
module.exports = { createPool };
