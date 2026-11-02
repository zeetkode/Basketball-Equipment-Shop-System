const OrderModel = require('../models/orderModel');

exports.getOrders = async (req, res) => {
  try {
    const orders = await OrderModel.getAllWithUsers();
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await OrderModel.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { user_id, total_amount } = req.body;
    if (!user_id || total_amount === undefined || total_amount < 0) {
      return res.status(400).json({ success: false, message: 'Invalid user ID or amount' });
    }
    const orderId = await OrderModel.create(user_id, total_amount);
    return res.status(201).json({ success: true, message: 'Order created', orderId });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_status } = req.body;
    const allowed = ['pending', 'processing', 'completed', 'cancelled'];
    if (!allowed.includes(order_status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    const affected = await OrderModel.updateStatus(req.params.id, order_status);
    if (affected === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    return res.status(200).json({ success: true, message: 'Order updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const affected = await OrderModel.delete(req.params.id);
    if (affected === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    return res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
