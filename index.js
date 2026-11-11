const express = require("express");
const cors = require("cors");

// Your database connection for Addresses, Suppliers, and Payments
const db = require("./config/db");

// Group's User routes
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows Express to read JSON body

app.get("/test", (req, res) => {
    res.json({ message: "The server is alive!" });
});

// Connect routes
app.use("/api/users", userRoutes);
app.use("/api/supplier-orders", require("./routes/supplierOrderRoutes"));
app.use("/api/shipments", require("./routes/shipmentRoutes"));

// ===============================
// SUPPLIERS
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
    const {
        SUPPLIER_NAME,
        CONTACT_PERSON,
        PHONE,
        EMAIL,
        ADDRESS
    } = req.body;

    const sql = `
        INSERT INTO SUPPLIERS
        (SUPPLIER_NAME, CONTACT_PERSON, PHONE, EMAIL, ADDRESS)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        SUPPLIER_NAME,
        CONTACT_PERSON,
        PHONE,
        EMAIL,
        ADDRESS
    ], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            message: "Supplier added successfully!",
            supplierID: result.insertId
        });
    });
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
    const {
        CUSTOMER_ID,
        ADDRESS_TYPE,
        STREET,
        CITY,
        PROVINCE,
        ZIP_CODE
    } = req.body;

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
                addressID: result.insertId
            });
        }
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
    const {
        ORDER_ID,
        AMOUNT,
        PAYMENT_METHOD,
        PAYMENT_STATUS,
        TRANSACTION_ID
    } = req.body;

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
                paymentID: result.insertId
            });
        }
    );
});

// Check group's database connection
pool.query("SELECT 1")
    .then(() => console.log("Database connected successfully!"))
    .catch((err) => console.error("Group database connection failed:", err.message));

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});