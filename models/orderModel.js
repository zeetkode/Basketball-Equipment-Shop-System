const db = require('../db');

const orderModel = {
// Fetch all orders with customer information and item count
  async getAllOrders() {
    const query = `
      SELECT o.order_id, o.order_date, o.total_amount, o.order_status,
             COALESCE(NULLIF(u.full_name, ''), u.username, 'Customer') AS customer_name,
             COUNT(oi.order_item_id) AS items_count
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      GROUP BY o.order_id
      ORDER BY o.order_date DESC
    `;
    const [rows] = await db.query(query);
    return rows;
  },

  // Fetch single order details
  async getOrderById(orderId) {
    const query = `
      SELECT o.order_id, o.order_date, o.total_amount, o.order_status,
             u.full_name AS customer_name, u.email AS customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = ?
    `;
    const [rows] = await db.query(query, [orderId]);
    return rows[0] || null;
  },

  // Atomic checkout: orders + order_items + stock deduction
  async createOrder(userId, items) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      let grandTotal = 0;
      const validatedItems = [];

      for (const item of items) {
        const targetId = item.equipment_id || item.product_id;
        const [rows] = await connection.query(
          'SELECT equipment_id, product_name, price, stock_quantity FROM equipment WHERE equipment_id = ? FOR UPDATE',
          [targetId]
        );

        if (rows.length === 0) {
          throw new Error(`Equipment item #${targetId} not found.`);
        }

        const product = rows[0];
        const qty = parseInt(item.quantity, 10);

        if (product.stock_quantity < qty) {
          throw new Error(`Insufficient stock for "${product.product_name}". Only ${product.stock_quantity} available.`);
        }

        const unitPrice = Number(product.price);
        grandTotal += unitPrice * qty;

        validatedItems.push({
          equipment_id: product.equipment_id,
          quantity: qty,
          unit_price: unitPrice
        });
      }

      // Insert header
      const [orderResult] = await connection.query(
        'INSERT INTO orders (user_id, total_amount, order_status) VALUES (?, ?, ?)',
        [userId, grandTotal.toFixed(2), 'completed']
      );
      const newOrderId = orderResult.insertId;

      // Insert line-items & deduct stock
      for (const validItem of validatedItems) {
        await connection.query(
          'INSERT INTO order_items (order_id, equipment_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
          [newOrderId, validItem.equipment_id, validItem.quantity, validItem.unit_price]
        );

        await connection.query(
          'UPDATE equipment SET stock_quantity = stock_quantity - ? WHERE equipment_id = ?',
          [validItem.quantity, validItem.equipment_id]
        );
      }

      await connection.commit();
      return { orderId: newOrderId, totalAmount: grandTotal.toFixed(2) };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Update order status (pending, completed, cancelled)
  async updateOrderStatus(orderId, status) {
    const query = 'UPDATE orders SET order_status = ? WHERE order_id = ?';
    const [result] = await db.query(query, [status, orderId]);
    return result;
  },

  // Delete order
  async deleteOrder(orderId) {
    const query = 'DELETE FROM orders WHERE order_id = ?';
    const [result] = await db.query(query, [orderId]);
    return result;
  }
};

module.exports = orderModel;