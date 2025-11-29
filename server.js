const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo');

// Load env
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

// --------------------------------------------------
// ⭐ FIXED CORS FOR EXPRESS v5 + RENDER + VERCEL
// --------------------------------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://shoe-store-i9ykpou0y-jobelshantu17-gmailcoms-projects.vercel.app",
  "https://shoe-store-gn3x7yu6j-jobelshantu17-gmailcoms-projects.vercel.app"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log("Incoming Origin:", origin);

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // PREVENTS CORS CRASH
  }

  next();
});

// --------------------------------------------------
// BODY PARSERS
// --------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------
// SESSION + MONGO STORE
// --------------------------------------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, 
      httpOnly: true,
      sameSite: "lax",
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
  })
);

// Static uploads
app.use("/uploads", express.static("uploads"));

// --------------------------------------------------
// ROUTES
// --------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminOrderRoutes);
app.use("/api/admin", adminUserRoutes);

// Test endpoint
app.get("/", (req, res) => {
  res.send("Backend is running on Render!");
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
