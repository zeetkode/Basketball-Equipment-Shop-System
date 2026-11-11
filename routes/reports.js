const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. INNER JOIN: Sales by Category and Brand
router.get('/inner-join', async (req, res) => {
    try {
        const query = `
            SELECT b.name AS brand, c.name AS category, SUM(e.stock_quantity) AS total_sold
            FROM equipment e
            INNER JOIN brands b ON e.brand_id = b.id
            INNER JOIN categories c ON e.category_id = c.id
            GROUP BY b.name, c.name;
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. LEFT JOIN: Inactive Customers (Users with zero orders)
router.get('/left-join-customers', async (req, res) => {
    try {
        const query = `
            SELECT u.full_name AS customer_name
            FROM users u
            LEFT JOIN orders o ON u.user_id = o.user_id
            WHERE o.order_id IS NULL AND u.role_id = 2; 
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2b. LEFT JOIN: Unsold Products
router.get('/left-join-products', async (req, res) => {
    try {
        const query = `
            SELECT e.product_name
            FROM equipment e
            LEFT JOIN orders o ON e.equipment_id = o.order_id 
            WHERE o.order_id IS NULL;
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. FULL OUTER JOIN (via UNION): Inventory vs Supplier Supply
router.get('/full-outer-join', async (req, res) => {
    try {
        const query = `
            SELECT e.product_name, e.stock_quantity AS store_stock, IFNULL(SUM(soi.quantity), 0) AS pending_supply
            FROM equipment e
            LEFT JOIN supplier_order_items soi ON e.equipment_id = soi.equipment_id
            GROUP BY e.equipment_id
            UNION
            SELECT e.product_name, 0 AS store_stock, SUM(soi.quantity) AS pending_supply
            FROM equipment e
            RIGHT JOIN supplier_order_items soi ON e.equipment_id = soi.equipment_id
            GROUP BY e.equipment_id;
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

