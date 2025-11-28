const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  isAdmin: {
    type: Boolean,
    default: false
  },

  // ⭐ NEW FIELD — active or inactive user
  isActive: {
    type: Boolean,
    default: true   // by default every user is active
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
