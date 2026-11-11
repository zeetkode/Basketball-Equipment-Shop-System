const express = require("express");
const cors = require("cors");
const path = require("path");

// Database connections
const db = require("./config/db"); // Teammate's callback-based DB for Addresses/Suppliers
const pool = require("./db"); // Group's promise-based DB for core features

// Modular Routes
const masterDataRoutes = require("./routes/masterDataRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "Frontend")));
app.use(express.static(__dirname));

// Sanity Check Route
app.get("/test", (req, res) => {
  res.json({ message: "The server is alive!" });
});

// Mount Modular API Routes
app.use("/api", masterDataRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", require("./routes/reports"));
app.use("/api/users", userRoutes);
app.use("/api/supplier-orders", require("./routes/supplierOrderRoutes"));
app.use("/api/shipments", require("./routes/shipmentRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));

// ===============================
// SUPPLIERS (Teammate's Routes)
// ===============================

// GET all suppliers
app.get("/suppliers", (req, res) => {
  db.query("SELECT * FROM SUPPLIERS", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// POST a new supplier
app.post("/suppliers", (req, res) => {
  const { SUPPLIER_NAME, CONTACT_PERSON, PHONE, EMAIL, ADDRESS } = req.body;
  const sql = `
        INSERT INTO SUPPLIERS
        (SUPPLIER_NAME, CONTACT_PERSON, PHONE, EMAIL, ADDRESS)
        VALUES (?, ?, ?, ?, ?)
    `;
  db.query(
    sql,
    [SUPPLIER_NAME, CONTACT_PERSON, PHONE, EMAIL, ADDRESS],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: "Supplier added successfully!",
        supplierID: result.insertId,
      });
    },
  );
});

// ===============================
// ADDRESSES
// ===============================

// GET all addresses
app.get("/addresses", (req, res) => {
  db.query("SELECT * FROM ADDRESSES", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// POST a new address
app.post("/addresses", (req, res) => {
  const { CUSTOMER_ID, ADDRESS_TYPE, STREET, CITY, PROVINCE, ZIP_CODE } =
    req.body;
  const sql = `
        INSERT INTO ADDRESSES
        (CUSTOMER_ID, ADDRESS_TYPE, STREET, CITY, PROVINCE, ZIP_CODE)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
  db.query(
    sql,
    [CUSTOMER_ID, ADDRESS_TYPE, STREET, CITY, PROVINCE, ZIP_CODE],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: "Address added successfully!",
        addressID: result.insertId,
      });
    },
  );
});

// ===============================
// PAYMENTS
// ===============================

// GET all payments
app.get("/payments", (req, res) => {
  db.query("SELECT * FROM PAYMENTS", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// POST a new payment
app.post("/payments", (req, res) => {
  const { ORDER_ID, AMOUNT, PAYMENT_METHOD, PAYMENT_STATUS, TRANSACTION_ID } =
    req.body;
  const sql = `
        INSERT INTO PAYMENTS
        (ORDER_ID, AMOUNT, PAYMENT_METHOD, PAYMENT_STATUS, TRANSACTION_ID)
        VALUES (?, ?, ?, ?, ?)
    `;
  db.query(
    sql,
    [ORDER_ID, AMOUNT, PAYMENT_METHOD, PAYMENT_STATUS, TRANSACTION_ID],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: "Payment added successfully!",
        paymentID: result.insertId,
      });
    },
  );
});

// Check group's database connection
pool
  .query("SELECT 1")
  .then(() => console.log("Database connected successfully!"))
  .catch((err) => console.error("Group database connection failed:", err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
