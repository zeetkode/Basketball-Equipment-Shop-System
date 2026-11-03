const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Bandoquillo123",
  database: "basketball_shop",
  port: 3306,
});

module.exports = pool.promise();
