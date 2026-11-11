const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const path = require("path");
const masterDataRoutes = require('./routes/masterDataRoutes');

const app = express();
app.use(cors());
app.use(express.json()); // Allows Express to read JSON body
app.use(express.urlencoded({ extended: true })); // 👈 Added to parse URL-encoded body data safely
app.use(express.static(path.join(__dirname, "Frontend")));
app.use(express.static(__dirname));
app.use('/api', masterDataRoutes);

app.get("/test", (req, res) => {
  res.json({ message: "The server is alive!" });
});

// Connect routes
app.use("/api/orders", orderRoutes);
app.use("/api/reports", require("./routes/reports"));
app.use("/api/users", userRoutes);
app.use("/api/supplier-orders", require("./routes/supplierOrderRoutes"));
app.use("/api/shipments", require("./routes/shipmentRoutes"));

const PORT = 3000;
const db = require("./db");

db.query("SELECT 1")
  .then(() => console.log("✅ Database connected successfully!"))
  .catch((err) => console.error("❌ Database connection failed:", err.message));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
