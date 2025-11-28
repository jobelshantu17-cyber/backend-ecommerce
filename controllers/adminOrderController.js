const Order = require('../models/orderModel');

// ✅ GET all orders (Admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.productId', 'name price image');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// ✅ GET single order by ID (Admin)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('items.productId', 'name price image');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// ✅ UPDATE order (Admin) — full edit (status, address, phone, items, totalAmount)
const updateOrder = async (req, res) => {
  try {
    const { status, shippingAddress, phone, items, totalAmount } = req.body;
    const { id } = req.params;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updateData = {};

    if (status) updateData.status = status;
    if (shippingAddress !== undefined) updateData.shippingAddress = shippingAddress;
    if (phone !== undefined) updateData.phone = phone;

    // If items array is provided, replace items
    if (Array.isArray(items)) {
      updateData.items = items;
    }

    // If totalAmount is provided (frontend live calculated)
    if (typeof totalAmount === 'number') {
      updateData.totalAmount = totalAmount;
    }

    const order = await Order.findByIdAndUpdate(id, updateData, { new: true })
      .populate('userId', 'name email')
      .populate('items.productId', 'name price image');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.status(200).json({ message: 'Order updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

// ✅ DELETE an order (Admin)
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
};

module.exports = { getAllOrders, getOrderById, updateOrder, deleteOrder };
