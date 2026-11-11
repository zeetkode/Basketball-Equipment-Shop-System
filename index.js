const express = require("express");
const cors = require("cors");
const path = require("path");

// The standalone connection is used by the supplier, address, and payment endpoints.
const db = require("./config/db");
const pool = require("./db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "Frontend")));
app.use(express.static(__dirname));

const masterDataRoutes = require("./routes/masterDataRoutes");
app.use("/api", masterDataRoutes);

app.get("/test", (_req, res) => {
  res.json({ message: "The server is alive!" });
});

// API routes from the orders feature and the current main branch.
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/supplier-orders", require("./routes/supplierOrderRoutes"));
app.use("/api/shipments", require("./routes/shipmentRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));

// Supplier endpoints use the callback-style connection in config/db.js.
app.get("/suppliers", (req, res) => {
  db.query("SELECT * FROM SUPPLIERS", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/suppliers", (req, res) => {
  const { SUPPLIER_NAME, CONTACT_PERSON, PHONE, EMAIL, ADDRESS } = req.body;
  const sql = `
    INSERT INTO SUPPLIERS
      (SUPPLIER_NAME, CONTACT_PERSON, PHONE, EMAIL, ADDRESS)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [SUPPLIER_NAME, CONTACT_PERSON, PHONE, EMAIL, ADDRESS], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Supplier added successfully!", supplierID: result.insertId });
  });
});

// Address endpoints.
app.get("/addresses", (req, res) => {
  db.query("SELECT * FROM ADDRESSES", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/addresses", (req, res) => {
  const { CUSTOMER_ID, ADDRESS_TYPE, STREET, CITY, PROVINCE, ZIP_CODE } = req.body;
  const sql = `
    INSERT INTO ADDRESSES
      (CUSTOMER_ID, ADDRESS_TYPE, STREET, CITY, PROVINCE, ZIP_CODE)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [CUSTOMER_ID, ADDRESS_TYPE, STREET, CITY, PROVINCE, ZIP_CODE], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Address added successfully!", addressID: result.insertId });
  });
});

// Payment endpoints.
app.get("/payments", (req, res) => {
  db.query("SELECT * FROM PAYMENTS", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/payments", (req, res) => {
  const { ORDER_ID, AMOUNT, PAYMENT_METHOD, PAYMENT_STATUS, TRANSACTION_ID } = req.body;
  const sql = `
    INSERT INTO PAYMENTS
      (ORDER_ID, AMOUNT, PAYMENT_METHOD, PAYMENT_STATUS, TRANSACTION_ID)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [ORDER_ID, AMOUNT, PAYMENT_METHOD, PAYMENT_STATUS, TRANSACTION_ID], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Payment added successfully!", paymentID: result.insertId });
  });
});

pool.query("SELECT 1")
  .then(() => console.log("Database connected successfully!"))
  .catch((err) => console.error("Database connection failed:", err.message));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
