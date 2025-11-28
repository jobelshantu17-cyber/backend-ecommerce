const express = require('express');
const router = express.Router();

const { adminOnly } = require("../middleware/authMiddleware");
const { getAllUsers, toggleUserStatus } = require("../controllers/userController");

// GET all users
router.get("/users", adminOnly, getAllUsers);

// TOGGLE User Active / Inactive
router.put("/users/toggle/:userId", adminOnly, toggleUserStatus);


module.exports = router;
