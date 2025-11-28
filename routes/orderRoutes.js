const express = require("express");
const router = express.Router();

const {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
} = require("../controllers/orderController");

// ORDER OF ROUTES MATTERS!!!
// PUT cancel must come BEFORE /:id
router.put("/cancel/:orderId", cancelOrder);

router.post("/", createOrder);
router.get("/", getUserOrders);
router.get("/:id", getOrderById);

module.exports = router;
