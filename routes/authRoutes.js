const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  adminLogin,
  createAdmin,
  logoutUser
} = require('../controllers/authController');

// ⭐ IMPORT THESE (missing earlier)
const { adminOnly } = require('../middleware/authMiddleware');

// ==========================
// AUTH ROUTES
// ==========================
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/login', adminLogin);
router.post('/create-admin', createAdmin);
router.post('/logout', logoutUser);

// ==========================
// SESSION CHECK
// ==========================
router.get("/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not logged in" });
  }

  res.json({
    user: {
      name: req.session.name,
      email: req.session.email,
      isAdmin: req.session.isAdmin
    }
  });
});

// ==========================
// ⭐ ADMIN ROUTES ⭐
// ==========================


module.exports = router;
