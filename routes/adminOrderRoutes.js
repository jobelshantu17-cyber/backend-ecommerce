const express = require('express');
const router = express.Router();
const { getAllOrders, getOrderById, updateOrder, deleteOrder } = require('../controllers/adminOrderController');
const { adminOnly } = require('../middleware/authMiddleware');

// ✅ GET all orders (Admin)
router.get('/orders', adminOnly, getAllOrders);

// ✅ GET single order (Admin)
router.get('/orders/:id', adminOnly, getOrderById);

// ✅ UPDATE order (Admin) — full edit
router.put('/orders/:id', adminOnly, updateOrder);

// ✅ DELETE order (Admin)
router.delete('/orders/:id', adminOnly, deleteOrder);

module.exports = router;
