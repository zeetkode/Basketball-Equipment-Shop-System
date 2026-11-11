const SupplierOrderModel = require("../models/supplierOrderModel");

// These must match the database enum exactly.
const ALLOWED_STATUSES = [
  "draft",
  "placed",
  "partially_received",
  "received",
  "cancelled"
];

function isValidItems(items) {
  if (!Array.isArray(items) || items.length === 0) return false;

  return items.every(item => {
    const equipmentId = Number(item.equipment_id);
    const quantity = Number(item.quantity);
    return (
      Number.isInteger(equipmentId) && equipmentId > 0 &&
      Number.isInteger(quantity) && quantity > 0
    );
  });
}

// GET /api/supplier-orders
exports.getSupplierOrders = async (req, res) => {
  try {
    const rows = await SupplierOrderModel.getAll();
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to load supplier orders" });
  }
};

// GET /api/supplier-orders/suppliers
exports.getSupplierList = async (req, res) => {
  try {
    const rows = await SupplierOrderModel.getAllSuppliers();
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to load suppliers" });
  }
};

// GET /api/supplier-orders/equipment
exports.getEquipmentList = async (req, res) => {
  try {
    const rows = await SupplierOrderModel.getAllEquipment();
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to load equipment" });
  }
};

// GET /api/supplier-orders/:id
exports.getSupplierOrderById = async (req, res) => {
  try {
    const order = await SupplierOrderModel.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Supplier order not found" });
    }
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to load supplier order" });
  }
};

// POST /api/supplier-orders
exports.createSupplierOrder = async (req, res) => {
  try {
    const { supplier_id, expected_date, items } = req.body;

    if (!Number.isInteger(Number(supplier_id)) || Number(supplier_id) <= 0) {
      return res.status(400).json({ success: false, message: "A valid supplier ID is required" });
    }

    if (!isValidItems(items)) {
      return res.status(400).json({
        success: false,
        message: "At least one item with a valid equipment ID and a quantity above 0 is required"
      });
    }

    const orderId = await SupplierOrderModel.create(supplier_id, expected_date, items);
    return res.status(201).json({ success: true, message: "Supplier order created", orderId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to create supplier order" });
  }
};

// PATCH /api/supplier-orders/:id/status
exports.updateSupplierOrderStatus = async (req, res) => {
  try {
    const { order_status } = req.body;

    if (!ALLOWED_STATUSES.includes(order_status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const affected = await SupplierOrderModel.updateStatus(req.params.id, order_status);
    if (affected === 0) {
      return res.status(404).json({ success: false, message: "Supplier order not found" });
    }

    return res.status(200).json({ success: true, message: "Status updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

// PUT /api/supplier-orders/:id/items
exports.replaceSupplierOrderItems = async (req, res) => {
  try {
    const { items } = req.body;

    if (!isValidItems(items)) {
      return res.status(400).json({
        success: false,
        message: "At least one item with a valid equipment ID and a quantity above 0 is required"
      });
    }

    await SupplierOrderModel.replaceItems(req.params.id, items);
    return res.status(200).json({ success: true, message: "Order items updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update order items" });
  }
};