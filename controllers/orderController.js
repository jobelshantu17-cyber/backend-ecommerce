const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// ===========================
// CREATE ORDER FROM CART
// ===========================
const createOrder = async (req, res) => {
  try {
    const userId = req.session.userId;

    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock (supports sizes)
    for (let item of cart.items) {
      const product = await Product.findById(item.productId._id);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      if (Array.isArray(product.sizes) && product.sizes.length > 0) {
        const sizeObj = product.sizes.find(s => s.size === item.size);
        if (!sizeObj)
          return res.status(400).json({ message: `Size ${item.size} not found for ${product.name}` });

        if (sizeObj.stock < item.quantity)
          return res.status(400).json({
            message: `Only ${sizeObj.stock} left for size ${item.size} of ${product.name}`
          });

      } else {
        if (product.stock < item.quantity)
          return res.status(400).json({
            message: `Only ${product.stock} left for ${product.name}`
          });
      }
    }

    // Reduce stock
    for (let item of cart.items) {
      const product = await Product.findById(item.productId._id);

      if (Array.isArray(product.sizes) && product.sizes.length > 0) {
        product.sizes = product.sizes.map(s => {
          if (s.size === item.size) {
            return { ...s, stock: Math.max(0, s.stock - item.quantity) };
          }
          return s;
        });

        const totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
        product.stock = totalStock;
        product.inStock = totalStock > 0;

      } else {
        product.stock = Math.max(0, product.stock - item.quantity);
        product.inStock = product.stock > 0;
      }

      await product.save();
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.productId.price * item.quantity,
      0
    );

    const newOrder = new Order({
      userId,
      items: cart.items.map(item => ({
        productId: item.productId._id,
        size: item.size,
        quantity: item.quantity,
      })),
      totalAmount,
      status: "Pending"
    });

    await newOrder.save();

    cart.items = [];
    await cart.save();

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });

  } catch (error) {
    console.log("Order Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===========================
// GET USER ORDERS
// ===========================
const getUserOrders = async (req, res) => {
  try {
    const userId = req.session.userId;
    const orders = await Order.find({ userId }).populate('items.productId');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===========================
// GET ORDER BY ID
// ===========================
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('items.productId');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===========================
// CANCEL ORDER + RESTORE STOCK
// ===========================
const cancelOrder = async (req, res) => {
  try {

    // ⭐ REQUIRED — block unauthorized cancel
    if (!req.session.userId) {
      return res.status(401).json({ message: "Login required" });
    }

    const userId = req.session.userId;
    const { orderId } = req.params;

    console.log("CANCEL ROUTE HIT → OrderId:", orderId);

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "Cancelled")
      return res.status(400).json({ message: "Order already cancelled" });

    // Restore stock
    for (let item of order.items) {
      const product = await Product.findById(item.productId);

      if (Array.isArray(product.sizes) && product.sizes.length > 0) {
        product.sizes = product.sizes.map(s => {
          if (s.size === item.size) return { ...s, stock: s.stock + item.quantity };
          return s;
        });

        product.stock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
        product.inStock = product.stock > 0;

      } else {
        product.stock += item.quantity;
        product.inStock = product.stock > 0;
      }

      await product.save();
    }

    order.status = "Cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully", order });

  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({ message: "Error cancelling order" });
  }
};

module.exports = { createOrder, getUserOrders, getOrderById, cancelOrder };
