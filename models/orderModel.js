const db = require('../db');

const OrderModel = {
  // Join Report: INNER JOIN orders and users
  getAllWithUsers: async () => {
    const query = `
      SELECT 
        orders.order_id,
        orders.total_amount,
        orders.order_status,
        orders.order_date,
        users.full_name AS customer_name,
        users.email AS customer_email
      FROM orders
      INNER JOIN users ON orders.user_id = users.user_id
      ORDER BY orders.order_date DESC;
    `;
    const [rows] = await db.query(query);
    return rows;
  },

  // Get single order by ID
  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM orders WHERE order_id = ?', [id]);
    return rows[0];
  },

  // Create order
  create: async (userId, totalAmount) => {
    const [result] = await db.query(
      'INSERT INTO orders (user_id, total_amount, order_status) VALUES (?, ?, ?)',
      [userId, totalAmount, 'pending']
    );
    return result.insertId;
  },

  // Update order status
  updateStatus: async (id, status) => {
    const [result] = await db.query(
      'UPDATE orders SET order_status = ? WHERE order_id = ?',
      [status, id]
    );
    return result.affectedRows;
  },

  // Delete order
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM orders WHERE order_id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = OrderModel;
