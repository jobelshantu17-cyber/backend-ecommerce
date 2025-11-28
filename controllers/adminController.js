const User = require("../models/userModel");

// 📌 Get all users (Admin Only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // remove password from response
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 📌 Toggle User Active / Inactive
exports.toggleUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle isActive
    user.isActive = !user.isActive;

    await user.save();

    res.json({
      message: "User status updated",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Toggle user error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
