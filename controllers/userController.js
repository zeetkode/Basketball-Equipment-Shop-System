const UserModel = require("../models/userModel");

// GET all users (with roles)
exports.getUsers = async (_req, res) => {
  try {
    const users = await UserModel.getAllUsersWithRoles();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Server failed to fetch users" });
  }
};

// POST a new user
exports.createUser = async (req, res) => {
  try {
    const { username, password, role_id } = req.body;
    const newUserId = await UserModel.createUser(username, password, role_id);
    res.status(201).json({ message: "User created!", id: newUserId });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

// DELETE a user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await UserModel.deleteUser(id);
    if (deleted === 0) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};
