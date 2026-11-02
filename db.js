const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "",
  password: "",
  database: "basketball_shop",
  port: 3306,
});

module.exports = pool.promise();
