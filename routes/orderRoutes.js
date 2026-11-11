const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const db = require('../db');

// 1. Specific sub-routes MUST come before parameterized :id routes
router.get('/equipment', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT equipment_id, product_name, sku, price, stock_quantity FROM equipment WHERE stock_quantity > 0');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Standard routes
router.get('/', orderController.getOrders);
router.post('/', orderController.createOrder);

// 3. Dynamic :id routes placed at the bottom
router.get('/:id', orderController.getOrderById);
router.patch('/:id', orderController.updateOrderStatus);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;