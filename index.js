const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json()); // Allows Express to read JSON body
app.use(express.static(path.join(__dirname, "Frontend")));
app.use(express.static(__dirname));

app.get("/test", (req, res) => {
  res.json({ message: "The server is alive!" });
});

// Connect routes
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

const PORT = 3000;
const db = require("./db");

db.query("SELECT 1")
  .then(() => console.log("✅ Database connected successfully!"))
  .catch((err) => console.error("❌ Database connection failed:", err.message));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
