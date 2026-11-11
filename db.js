const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "localhost",
    user: "basketball_app",
    password: "MyNewPassword123!",
    database: "basketball_shop",
    port: 3306,
});

module.exports = pool.promise();