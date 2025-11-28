// routes/productRoutes.js
const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const upload = require("../middleware/upload");
const { adminOnly } = require("../middleware/authMiddleware");

// =======================
// PUBLIC ROUTES
// =======================
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// =======================
// ADMIN ROUTES (protected)
// =======================

// Create product (image + sizes)
router.post(
  "/",
  adminOnly,
  upload.any("image"),
  createProduct
);

// Update product (image + sizes)
router.put(
  "/:id", 
  adminOnly, 
  upload.any(), 
  updateProduct
);


// Delete product
router.delete(
  "/:id",
  adminOnly,
  deleteProduct
);

module.exports = router;
