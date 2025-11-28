const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// ===========================
// ADD TO CART (size + stock check)
// ===========================
async function addToCart(req, res) {
  try {
    const { productId, size, quantity } = req.body;
    const userId = req.session.userId;

    if (!userId) return res.status(401).json({ message: 'Login required' });
    if (!size) return res.status(400).json({ message: "Size is required" });

    // Fetch product
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Find stock for that size
    const sizeObj = product.sizes.find(s => s.size === size);
    if (!sizeObj) {
      return res.status(400).json({ message: `Size ${size} not available` });
    }

    const maxStock = sizeObj.stock;

    if (maxStock <= 0) {
      return res.status(400).json({ message: `${product.name} (Size ${size}) is Out of Stock` });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // New cart
      if (quantity > maxStock) {
        return res.status(400).json({
          message: `Only ${maxStock} items available for size ${size}`,
          maxStock
        });
      }

      cart = new Cart({
        userId,
        items: [{ productId, size, quantity }]
      });
    } else {
      // Cart exists
      const itemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId && item.size === size
      );

      if (itemIndex > -1) {
        const currentQty = cart.items[itemIndex].quantity;

        if (currentQty + quantity > maxStock) {
          return res.status(400).json({
            message: `Only ${maxStock} available for size ${size}`,
            maxStock
          });
        }

        cart.items[itemIndex].quantity += quantity;
      } else {
        // New size variant
        if (quantity > maxStock) {
          return res.status(400).json({
            message: `Only ${maxStock} available for size ${size}`,
            maxStock
          });
        }

        cart.items.push({ productId, size, quantity });
      }
    }

    await cart.save();
    res.json({ message: "Item added to cart", cart });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding to cart" });
  }
}


// ===========================
// GET CART
// ===========================
async function getCart(req, res) {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Login required" });

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    res.json(cart || { items: [] });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching cart" });
  }
}


// ===========================
// UPDATE CART ITEM (size-safe)
// ===========================
async function updateCartItem(req, res) {
  try {
    const userId = req.session.userId;
    const { productId, size, quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      i => i.productId.toString() === productId && i.size === size
    );

    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    // Validate stock for that size
    const product = await Product.findById(productId);
    const sizeObj = product.sizes.find(s => s.size === size);

    if (!sizeObj) return res.status(400).json({ message: "Invalid size" });

    if (quantity > sizeObj.stock) {
      return res.status(400).json({
        message: `Only ${sizeObj.stock} available`,
        maxStock: sizeObj.stock
      });
    }

    item.quantity = quantity;
    await cart.save();

    res.json(cart);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating cart item" });
  }
}


// ===========================
// REMOVE ITEM (size-specific)
// ===========================
async function removeFromCart(req, res) {
  try {
    const userId = req.session.userId;
    const { productId, size } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      item => !(item.productId.toString() === productId && item.size === size)
    );

    await cart.save();

    res.json({ message: "Item removed", cart });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error removing item" });
  }
}


// ===========================
// CLEAR CART
// ===========================
async function clearCart(req, res) {
  try {
    const userId = req.session.userId;

    await Cart.findOneAndDelete({ userId });

    res.json({ message: "Cart cleared" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error clearing cart" });
  }
}


module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
