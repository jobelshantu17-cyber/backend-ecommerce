const bcrypt = require('bcrypt');
const User = require('../models/userModel');

/* ========================================
   REGISTER USER
======================================== */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: false,
      isActive: true   // ⭐ NEW — users are active by default
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/* ========================================
   LOGIN USER
======================================== */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'User not found' });

    // ⭐ BLOCK INACTIVE USERS
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account is inactive. Please contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid password' });

    // Save session
    req.session.userId = user._id;
    req.session.name = user.name;
    req.session.email = user.email;
    req.session.isAdmin = user.isAdmin;

    res.json({
      message: 'Login successful',
      user: { name: user.name, email: user.email, isAdmin: user.isAdmin }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/* ========================================
   ADMIN LOGIN
======================================== */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email, isAdmin: true });
    if (!admin)
      return res.status(400).json({ message: 'Admin not found' });

    // ⭐ Admin must also be active
    if (!admin.isActive) {
      return res.status(403).json({ message: 'Admin account is inactive' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid password' });

    req.session.userId = admin._id;
    req.session.name = admin.name;
    req.session.email = admin.email;
    req.session.isAdmin = true;

    res.json({
      message: 'Admin login successful',
      user: { name: admin.name, email: admin.email, isAdmin: true }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
};

/* ========================================
   CREATE ADMIN
======================================== */
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin)
      return res.status(400).json({ message: 'Admin already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: true,
      isActive: true  // ⭐ NEW
    });

    await admin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating admin' });
  }
};

/* ========================================
   LOGOUT
======================================== */
exports.logoutUser = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Error logging out' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
};
