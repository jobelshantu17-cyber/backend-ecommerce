const User = require("../models/userModel");

// GET ALL USERS (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// TOGGLE ACTIVE / INACTIVE
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Toggle the boolean
    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User is now ${user.isActive ? "Active" : "Inactive"}`,
      user
    });

  } catch (err) {
    res.status(500).json({ message: "Error updating user status" });
  }
};
