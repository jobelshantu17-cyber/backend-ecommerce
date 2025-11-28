const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const cors = require("cors");

// Load environment variables
dotenv.config();

// Connect DB
const connectDB = require('./config/db');
connectDB();

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminOrderRoutes = require('./routes/adminOrderRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');


const app = express();

// CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions
app.use(
  session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  })
);

// Static folder
app.use("/uploads", express.static("uploads"));

// ===============================
//  🚀 API ROUTES
// ===============================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// ADMIN ROUTES
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminOrderRoutes);
app.use('/api/admin', adminUserRoutes);


// ===============================
// app.use("/api/admin", require("./routes/adminRoutes"));
// app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
