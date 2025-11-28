const express = require('express');
const router = express.Router();
const { addToCart, getCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');

router.post('/add', addToCart);
router.get('/', getCart);
router.put('/update', updateCartItem);

// 🔥 MUST BE POST (because body contains productId + size)
router.post('/remove', removeFromCart);

// clear cart
router.delete('/clear', clearCart);

module.exports = router;
