const db = require("../db");

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

  // Fetch a single order by ID with details
  async getOrderById(orderId) {
    const query = `
      SELECT o.order_id, o.order_date, o.total_amount, o.order_status,
             COALESCE(NULLIF(u.full_name, ''), u.username, 'Customer') AS customer_name
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = ?
    `;
    const [rows] = await db.query(query, [orderId]);
    return rows[0];
  },

  // Atomic creation of multi-item order with inventory deduction
  async createOrder(userId, items) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      let calculatedTotal = 0;
      const orderLines = [];

      for (const item of items) {
        const requestedQty = Number(item.quantity);
        if (!Number.isInteger(requestedQty) || requestedQty <= 0) {
          throw new Error(
            `Invalid quantity supplied for equipment #${item.equipment_id}.`,
          );
        }

        const [equipmentRows] = await connection.query(
          "SELECT equipment_id, price, stock_quantity FROM equipment WHERE equipment_id = ? FOR UPDATE",
          [item.equipment_id],
        );

        if (equipmentRows.length === 0) {
          throw new Error(`Equipment #${item.equipment_id} not found.`);
        }

        const product = equipmentRows[0];
        if (product.stock_quantity < requestedQty) {
          throw new Error(
            `Insufficient stock for equipment #${item.equipment_id}. Available: ${product.stock_quantity}`,
          );
        }

        const unitPrice = Number(product.price);
        const subtotal = unitPrice * requestedQty;
        calculatedTotal += subtotal;

        orderLines.push({
          equipment_id: item.equipment_id,
          quantity: requestedQty,
          unit_price: unitPrice,
          subtotal: subtotal,
        });
      }

      // Insert order header
      const [orderResult] = await connection.query(
        "INSERT INTO orders (user_id, total_amount, order_status) VALUES (?, ?, ?)",
        [userId, Number(calculatedTotal).toFixed(2), "Completed"],
      );

      const orderId = orderResult.insertId;

      // Insert line items and update inventory
      for (const line of orderLines) {
        await connection.query(
          "INSERT INTO order_items (order_id, equipment_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
          [orderId, line.equipment_id, line.quantity, line.unit_price],
        );

        await connection.query(
          "UPDATE equipment SET stock_quantity = stock_quantity - ? WHERE equipment_id = ?",
          [line.quantity, line.equipment_id],
        );
      }

      await connection.commit();
      return {
        order_id: orderId,
        total_amount: Number(calculatedTotal).toFixed(2),
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    const query = "UPDATE orders SET order_status = ? WHERE order_id = ?";
    const [result] = await db.query(query, [status, orderId]);
    return result;
  },

  // Delete an order, restore equipment stock, and clean up line items
  async deleteOrder(orderId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [items] = await connection.query(
        "SELECT equipment_id, quantity FROM order_items WHERE order_id = ?",
        [orderId],
      );

      for (const item of items) {
        await connection.query(
          "UPDATE equipment SET stock_quantity = stock_quantity + ? WHERE equipment_id = ?",
          [item.quantity, item.equipment_id],
        );
      }

      await connection.query("DELETE FROM order_items WHERE order_id = ?", [
        orderId,
      ]);
      const [result] = await connection.query(
        "DELETE FROM orders WHERE order_id = ?",
        [orderId],
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },
};

module.exports = orderModel;
