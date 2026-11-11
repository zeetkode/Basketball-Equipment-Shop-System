const express = require("express");
const cors = require("cors");
const path = require("path");

const masterDataRoutes = require("./routes/masterDataRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "Frontend")));
app.use(express.static(__dirname));
app.use("/api", masterDataRoutes);

app.get("/test", (_req, res) => {
  res.json({ message: "The server is alive!" });
});

app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/supplier-orders", require("./routes/supplierOrderRoutes"));
app.use("/api/shipments", require("./routes/shipmentRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));

// Keep the DB startup check only.
db.query("SELECT 1")
  .then(() => console.log("Database connected successfully!"))
  .catch((err) => console.error("Database connection failed:", err.message));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
