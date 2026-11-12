const db = require("../db");

const SupplierOrderModel = {
  // All supplier orders with supplier details (INNER JOIN)
  getAll: async () => {
    const query = `
      SELECT
        so.supplier_order_id,
        so.order_date,
        so.expected_date,
        so.order_status,
        s.supplier_id,
        s.supplier_name,
        s.contact_person,
        s.email,
        s.phone
      FROM supplier_orders so
      INNER JOIN suppliers s ON s.supplier_id = so.supplier_id
      ORDER BY so.order_date DESC;
    `;
    const [rows] = await db.query(query);
    return rows;
  },

  // One order with all of its items and product names
  getById: async (id) => {
    const orderQuery = `
      SELECT
        so.supplier_order_id,
        so.order_date,
        so.expected_date,
        so.order_status,
        s.supplier_id,
        s.supplier_name,
        s.contact_person,
        s.email,
        s.phone
      FROM supplier_orders so
      INNER JOIN suppliers s ON s.supplier_id = so.supplier_id
      WHERE so.supplier_order_id = ?;
    `;
    const [orderRows] = await db.query(orderQuery, [id]);

    if (orderRows.length === 0) return null;

    const itemQuery = `
      SELECT
        i.supplier_order_item_id,
        i.equipment_id,
        i.quantity,
        e.product_name,
        e.sku
      FROM supplier_order_items i
      INNER JOIN equipment e ON e.equipment_id = i.equipment_id
      WHERE i.supplier_order_id = ?
      ORDER BY e.product_name;
    `;
    const [itemRows] = await db.query(itemQuery, [id]);

    return { ...orderRows[0], items: itemRows };
  },

  // Create an order and all of its items together.
  create: async (supplierId, expectedDate, items) => {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [orderResult] = await connection.query(
        `INSERT INTO supplier_orders (supplier_id, expected_date, order_status)
         VALUES (?, ?, 'draft')`,
        [supplierId, expectedDate || null]
      );

      const orderId = orderResult.insertId;

      for (const item of items) {
        await connection.query(
          `INSERT INTO supplier_order_items
             (supplier_order_id, equipment_id, quantity)
           VALUES (?, ?, ?)`,
          [orderId, item.equipment_id, item.quantity]
        );
      }

      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Update order status. If marked as 'received', automatically increment equipment stock.
  updateStatus: async (id, status) => {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Update the status of the supplier order
      const [result] = await connection.query(
        "UPDATE supplier_orders SET order_status = ? WHERE supplier_order_id = ?",
        [status, id]
      );
      
      // If the status is changed to 'received', we must add the items to the inventory
      if (status === 'received' && result.affectedRows > 0) {
        // First, get all the items for this specific order
        const [items] = await connection.query(
          "SELECT equipment_id, quantity FROM supplier_order_items WHERE supplier_order_id = ?",
          [id]
        );
        
        // Loop through the items and add their quantities to the main equipment table
        for (const item of items) {
          await connection.query(
            "UPDATE equipment SET stock_quantity = stock_quantity + ? WHERE equipment_id = ?",
            [item.quantity, item.equipment_id]
          );
        }
      }
      
      await connection.commit();
      return result.affectedRows;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Replace the items belonging to an order
  replaceItems: async (orderId, items) => {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      await connection.query(
        "DELETE FROM supplier_order_items WHERE supplier_order_id = ?",
        [orderId]
      );

      for (const item of items) {
        await connection.query(
          `INSERT INTO supplier_order_items
             (supplier_order_id, equipment_id, quantity)
           VALUES (?, ?, ?)`,
          [orderId, item.equipment_id, item.quantity]
        );
      }

      await connection.commit();
      return items.length;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Suppliers for the create form's dropdown
  getAllSuppliers: async () => {
    const [rows] = await db.query(
      "SELECT supplier_id, supplier_name FROM suppliers ORDER BY supplier_name"
    );
    return rows;
  },

  // Equipment for the item lines' dropdowns
  getAllEquipment: async () => {
    const [rows] = await db.query(
      "SELECT equipment_id, product_name FROM equipment ORDER BY product_name"
    );
    return rows;
  }
};

module.exports = SupplierOrderModel;
