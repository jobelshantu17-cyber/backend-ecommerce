const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const MongoStore = require("connect-mongo");

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

// --------------------------------------------
// ⭐ CORRECT CORS — FINAL FIX
// --------------------------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://shoe-store-frontend-a25dtlvrf-jobelshantu17-gmailcoms-projects.vercel.app"
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

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ❌ Remove this completely (you had this earlier)
// app.use(cors());

// --------------------------------------------
// Body parsers
// --------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------
// Sessions
// --------------------------------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax"
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions"
    })
  })
);

// Static
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminOrderRoutes);
app.use("/api/admin", adminUserRoutes);

// Test
app.get("/", (req, res) => {
  res.send("Backend is running on Render!");
});

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
