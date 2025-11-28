const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const cors = require("cors");
const MongoStore = require('connect-mongo');

// Load environment variables
dotenv.config();

// Connect DB
const connectDB = require('./config/db');
connectDB();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminOrderRoutes = require('./routes/adminOrderRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');

const app = express();

// -------------------------------------
// CORS FIX – Allows Render + Vercel
// -------------------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://your-frontend.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------------------
// SESSION FIX – Use Mongo Store
// -------------------------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'mysecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI
    })
  })
);

// Static folder
app.use("/uploads", express.static("uploads"));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Admin
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminOrderRoutes);
app.use('/api/admin', adminUserRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running on Render!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
