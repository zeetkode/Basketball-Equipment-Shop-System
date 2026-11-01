
const express = require("express");
const db = require("./config/db");

const app = express();
const port = 3000;

app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Basketball Equipment Shop API is running!");
});

// GET all suppliers
app.get("/suppliers", (req, res) => {
  db.query("SELECT * FROM SUPPLIERS", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});
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
// Start server LAST
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
