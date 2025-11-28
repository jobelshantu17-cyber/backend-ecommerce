const express = require('express');
const router = express.Router();

const { adminOnly } = require('../middleware/authMiddleware');
const { getAllUsers, toggleUserStatus } = require('../controllers/userController');

// GET ALL USERS
router.get("/users", adminOnly, getAllUsers);

// TOGGLE USER ACTIVE/INACTIVE
router.put("/users/toggle/:userId", adminOnly, toggleUserStatus);

module.exports = router;
