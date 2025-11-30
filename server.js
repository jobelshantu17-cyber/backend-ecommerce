const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");

// Load env
dotenv.config();

// DB
const connectDB = require("./config/db");
connectDB();

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");

const app = express();

// --------------------------------------------------
// ⭐ REQUIRED FOR HTTPS COOKIE ON RENDER
// --------------------------------------------------
app.set("trust proxy", 1);

// --------------------------------------------------
// ⭐ CORS — FINAL VERSION (WORKS FOR RENDER + VERCEL)
// --------------------------------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://walkmateofficial.vercel.app",
  "https://shoe-store-frontend-blue-ten.vercel.app"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log("Incoming Origin:", origin);

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.sendStatus(200);

  next();
});

// --------------------------------------------------
// ⭐ BODY PARSERS
// --------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------
// ⭐ SESSION CONFIG — REQUIRED FOR LOGIN TO WORK
// --------------------------------------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // HTTPS required
      httpOnly: true,
      sameSite: "none" // Cross-site cookies allowed
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions"
    })
  })
);

// --------------------------------------------------
// STATIC UPLOADS
// --------------------------------------------------
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

// --------------------------------------------------
// TEST ROUTE
// --------------------------------------------------
app.get("/", (req, res) => {
  res.send("Backend is running on Render!");
});

// --------------------------------------------------
// ⭐ DEBUG ROUTE — CHECK ACTUAL DATA FROM MONGODB
// --------------------------------------------------
app.get("/debug", async (req, res) => {
  try {
    const docs = await mongoose.connection.db
      .collection("products")
      .find({})
      .toArray();

    res.json({
      count: docs.length,
      data: docs
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
