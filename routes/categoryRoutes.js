const express = require('express');
const router = express.Router();
const { 
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { adminOnly } = require('../middleware/authMiddleware');

// ✅ Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// ✅ Admin-only routes
router.post('/', adminOnly, createCategory);
router.put('/:id', adminOnly, updateCategory);
router.delete('/:id', adminOnly, deleteCategory);

module.exports = router;
