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

// --------------------------------------------------
// CORS (REQUIRED FOR RENDER + VERCEL)
// --------------------------------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://shoe-store-i9ykpou0y-jobelshantu17-gmailcoms-projects.vercel.app",
  "https://shoe-store-gn3x7yu6j-jobelshantu17-gmailcoms-projects.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Incoming Origin:", origin);        // 🔥 SHOWS WHICH ORIGIN IS CALLING
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ BLOCKED BY CORS:", origin);   // ❌ SHOWS WHAT IS BLOCKED
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.options("*", cors());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------
// EXPRESS SESSION + MONGO STORE (PRODUCTION SAFE)
// --------------------------------------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // change to true if you use HTTPS + proxy
      httpOnly: true,
      sameSite: "lax",
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
  })
);

// Static files
app.use("/uploads", express.static("uploads"));

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminOrderRoutes);
app.use("/api/admin", adminUserRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running on Render!");
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
