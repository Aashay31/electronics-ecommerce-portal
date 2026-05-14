const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/database");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());


// Routes
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);


const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Backend server is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});