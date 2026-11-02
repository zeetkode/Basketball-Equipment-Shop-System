const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "admin",
  password: "bAl.20051025",
  database: "basketball_shop",
  port: 3306,
});

module.exports = pool.promise();
