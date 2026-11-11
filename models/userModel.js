const db = require("../db");

class UserModel {
  // Required Join Report: INNER JOIN to get Users with their Role Names
  static async getAllUsersWithRoles() {
    const [rows] = await db.execute(
      `SELECT users.user_id, users.username, roles.role_name 
             FROM users 
             INNER JOIN roles ON users.role_id = roles.role_id`,
    );
    return rows;
  }

  // Create (POST)
  static async createUser(username, password, role_id) {
    const [result] = await db.execute(
      "INSERT INTO users (username, password, role_id) VALUES (?, ?, ?)",
      [username, password, role_id],
    );
    return result.insertId;
  }

  // Delete (DELETE)
  static async deleteUser(user_id) {
    const [result] = await db.execute("DELETE FROM users WHERE user_id = ?", [
      user_id,
    ]);
    return result.affectedRows;
  }
}

module.exports = UserModel;
