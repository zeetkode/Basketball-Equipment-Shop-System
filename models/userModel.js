const db = require("../db");

class UserModel {
  // Required Join Report: INNER JOIN to get Users with their Role Names
  static async getAllUsersWithRoles() {
    const [rows] = await db.execute(
      `SELECT Users.user_id, Users.username, Roles.role_name 
             FROM Users 
             INNER JOIN Roles ON Users.role_id = Roles.role_id`,
    );
    return rows;
  }

  // Create (POST)
  static async createUser(username, password, role_id) {
    const [result] = await db.execute(
      "INSERT INTO Users (username, password, role_id) VALUES (?, ?, ?)",
      [username, password, role_id],
    );
    return result.insertId;
  }

  // Delete (DELETE)
  static async deleteUser(user_id) {
    const [result] = await db.execute("DELETE FROM Users WHERE user_id = ?", [
      user_id,
    ]);
    return result.affectedRows;
  }
}

module.exports = UserModel;
