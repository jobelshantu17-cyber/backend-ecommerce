

exports.protect = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Please login first' });
  }
  next(); // continue to the controller
};


// Middleware to check if user is admin
exports.adminOnly = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    next(); // Allow access
  } else {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
};
