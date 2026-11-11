const db = require("../db");

const ShipmentModel = {
  // All shipments with their supplier order and supplier details (INNER JOIN)
  getAll: async () => {
    const query = `
      SELECT
        sh.shipment_id,
        sh.supplier_order_id,
        sh.tracking_number,
        sh.carrier,
        sh.shipment_status,
        so.order_date,
        so.order_status,
        s.supplier_id,
        s.supplier_name
      FROM shipments sh
      INNER JOIN supplier_orders so ON so.supplier_order_id = sh.supplier_order_id
      INNER JOIN suppliers s ON s.supplier_id = so.supplier_id
      ORDER BY sh.shipment_id DESC;
    `;
    const [rows] = await db.query(query);
    return rows;
  },

  // One shipment
  getById: async (id) => {
    const query = `
      SELECT
        sh.shipment_id,
        sh.supplier_order_id,
        sh.tracking_number,
        sh.shipment_status,
        sh.supplier_order_id,
        so.order_date,
        s.supplier_name
      FROM shipments sh
      INNER JOIN supplier_orders so ON so.supplier_order_id = sh.supplier_order_id
      INNER JOIN suppliers s ON s.supplier_id = so.supplier_id
      WHERE sh.shipment_id = ?;
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  },

  // Supplier orders that can be shipped, for the create form's dropdown.
  // A LEFT JOIN shows every order, with the shipment ID when one exists,
  // so orders that already have a shipment can be filtered out.
  getOrdersForDropdown: async () => {
    const query = `
      SELECT
        so.supplier_order_id,
        so.order_status,
        s.supplier_name,
        sh.shipment_id
      FROM supplier_orders so
      INNER JOIN suppliers s ON s.supplier_id = so.supplier_id
      LEFT JOIN shipments sh ON sh.supplier_order_id = so.supplier_order_id
      ORDER BY so.supplier_order_id DESC;
    `;
    const [rows] = await db.query(query);
    return rows;
  },

  // Record a new shipment against a supplier order
  create: async (supplierOrderId, trackingNumber, carrier, status) => {
    const [result] = await db.query(
      `INSERT INTO shipments
         (supplier_order_id, tracking_number, carrier, shipment_status)
       VALUES (?, ?, ?, ?)`,
      [supplierOrderId, trackingNumber || null, carrier || null, status]
    );
    return result.insertId;
  },

  // Update the shipment's status or tracking details
  update: async (id, status, trackingNumber, carrier) => {
    const [result] = await db.query(
      `UPDATE shipments
       SET shipment_status = ?, tracking_number = ?, carrier = ?
       WHERE shipment_id = ?`,
      [status, trackingNumber || null, carrier || null, id]
    );
    return result.affectedRows;
  },

  // Update only the status, used by the quick status buttons
  updateStatus: async (id, status) => {
    const [result] = await db.query(
      "UPDATE shipments SET shipment_status = ? WHERE shipment_id = ?",
      [status, id]
    );
    return result.affectedRows;
  }
};

module.exports = ShipmentModel;
