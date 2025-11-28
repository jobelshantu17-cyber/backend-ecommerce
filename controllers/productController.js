// controllers/productController.js (fixed)
// Replaces updateProduct so sizes update correctly even when image is NOT re-uploaded.

const Product = require("../models/productModel");
const Category = require("../models/categoryModel");

/* ========================================
   GET ALL PRODUCTS
======================================== */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
};

/* ========================================
   GET PRODUCT BY ID
======================================== */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching product",
      error: error.message,
    });
  }
};

/* ========================================
   CREATE PRODUCT (with sizes)
======================================== */
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, sizes, sku } = req.body;

    // Validate category
    const categoryExists = await Category.findOne({ name: category });
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid category name" });
    }

    // Parse sizes JSON from FormData
    let parsedSizes = [];
    if (sizes) {
      try {
        parsedSizes = JSON.parse(sizes); // [{ size: "8", stock: 5 }]
      } catch (err) {
        return res.status(400).json({ message: "Invalid sizes format" });
      }
    }

    // Image from multer (first file) — if any
    const image = (req.files && req.files.length > 0) ? req.files[0].filename : (req.file ? req.file.filename : null);

    const finalSKU = sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

    // Compute total stock from sizes
    const totalStock = parsedSizes.reduce((sum, s) => sum + Number(s.stock || 0), 0);

    const newProduct = new Product({
      name,
      description,
      price,
      category: categoryExists.name,
      image,
      sku: finalSKU,
      sizes: parsedSizes,
      stock: totalStock,
      inStock: totalStock > 0,
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.log("Product Create Error:", error);
    res.status(500).json({
      message: "Error creating product",
      error: error.message,
    });
  }
};

/* ========================================
   UPDATE PRODUCT (robust: handles FormData w/ or w/o image)
   NOTE: Make sure your route uses upload.any() so multer parses fields even when no file is uploaded.
======================================== */
exports.updateProduct = async (req, res) => {
  try {
    // Log for debugging (remove in production)
    // console.log('req.body:', req.body);
    // console.log('req.files:', req.files);

    const { name, description, price, category, sizes, sku } = req.body;

    // build updateFields only with provided values
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (price !== undefined) updateFields.price = price;

    // CATEGORY
    if (category !== undefined) {
      if (category) {
        const categoryExists = await Category.findOne({ name: category });
        if (!categoryExists) return res.status(400).json({ message: "Invalid category name" });
        updateFields.category = categoryExists.name;
      } else {
        // if empty string was intentionally sent, skip or handle based on your policy
      }
    }

    // IMAGE (optional) — support req.files (upload.any()) and req.file (upload.single())
    if (req.files && req.files.length > 0) {
      updateFields.image = req.files[0].filename;
    } else if (req.file) {
      updateFields.image = req.file.filename;
    }

    // SIZES: sizes expected as JSON string in form-data ("sizes": "[{..}]")
    if (sizes !== undefined) {
      if (sizes && sizes !== "") {
        let parsedSizes;
        try {
          parsedSizes = JSON.parse(sizes);
          if (!Array.isArray(parsedSizes)) throw new Error('sizes must be array');
        } catch (err) {
          return res.status(400).json({ message: 'Invalid sizes format' });
        }

        // normalize each size object
        parsedSizes = parsedSizes.map(s => ({
          size: String(s.size),
          stock: Number(s.stock || 0)
        }));

        updateFields.sizes = parsedSizes;

        // recompute total stock
        const totalStock = parsedSizes.reduce((sum, s) => sum + Number(s.stock || 0), 0);
        updateFields.stock = totalStock;
        updateFields.inStock = totalStock > 0;
      } else {
        // sizes sent as empty string or empty value -> clear sizes
        updateFields.sizes = [];
        updateFields.stock = 0;
        updateFields.inStock = false;
      }
    }

    // SKU
    if (sku !== undefined && sku !== "") updateFields.sku = sku;

    // finally update
    const updated = await Product.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });

    return res.json({ message: 'Product updated successfully', product: updated });
  } catch (error) {
    console.log('Product Update Error:', error);
    return res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

/* ========================================
   DELETE PRODUCT
======================================== */
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Product Delete Error:", error);
    res.status(500).json({
      message: "Error deleting product",
      error: error.message,
    });
  }
};
