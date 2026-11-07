const mysql = require("mysql2/promise");
function createPool() {
  return mysql.createPool({
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || "security_tracker",
    timezone: "Z"
  });
}
module.exports = { createPool };
