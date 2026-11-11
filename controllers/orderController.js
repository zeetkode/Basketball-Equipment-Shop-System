const orderModel = require('../models/orderModel');

const orderController = {
  // GET /api/orders
  async getOrders(req, res) {
    try {
      const orders = await orderModel.getAllOrders();
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /api/orders/:id
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await orderModel.getOrderById(id);
      if (!order) {
        return res.status(404).json({ error: `Order #${id} not found.` });
      }
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // POST /api/orders (Multi-item atomic checkout)
  async createOrder(req, res) {
    try {
      const { user_id, items } = req.body;
      if (!user_id || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Customer ID and at least one line-item are required.' });
      }

      const result = await orderModel.createOrder(user_id, items);
      res.status(201).json({
        message: 'Order processed and saved to database successfully!',
        order_id: result.order_id,
        total_amount: result.total_amount
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // PATCH /api/orders/:id
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { order_status } = req.body;
      if (!order_status) {
        return res.status(400).json({ error: 'order_status is required.' });
      }
      await orderModel.updateOrderStatus(id, order_status);
      res.json({ message: `Order #${id} updated to ${order_status}.` });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // DELETE /api/orders/:id
  async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      const deleted = await orderModel.deleteOrder(id);
      if (!deleted) {
        return res.status(404).json({ error: `Order #${id} not found.` });
      }
      res.json({ message: `Order #${id} deleted successfully.` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = orderController;
