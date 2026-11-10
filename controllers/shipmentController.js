const ShipmentModel = require("../models/shipmentModel");

// These must match the database enum exactly.
const ALLOWED_STATUSES = [
  "pending",
  "shipped",
  "in_transit",
  "delayed",
  "delivered"
];

// GET /api/shipments
exports.getShipments = async (req, res) => {
  try {
    const rows = await ShipmentModel.getAll();
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to load shipments" });
  }
};

// GET /api/shipments/orders
exports.getOrdersForDropdown = async (req, res) => {
  try {
    const rows = await ShipmentModel.getOrdersForDropdown();
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to load supplier orders" });
  }
};

// GET /api/shipments/:id
exports.getShipmentById = async (req, res) => {
  try {
    const shipment = await ShipmentModel.getById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }
    return res.status(200).json({ success: true, data: shipment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to load shipment" });
  }
};

// POST /api/shipments
exports.createShipment = async (req, res) => {
  try {
    const { supplier_order_id, tracking_number, carrier, shipment_status } = req.body;

    if (!Number.isInteger(Number(supplier_order_id)) || Number(supplier_order_id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid supplier order ID is required"
      });
    }

    const status = shipment_status || "pending";

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const shipmentId = await ShipmentModel.create(
      supplier_order_id,
      tracking_number,
      carrier,
      status
    );

    return res.status(201).json({
      success: true,
      message: "Shipment recorded",
      shipmentId
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to record shipment" });
  }
};

// PATCH /api/shipments/:id/status
exports.updateShipmentStatus = async (req, res) => {
  try {
    const { shipment_status } = req.body;

    if (!ALLOWED_STATUSES.includes(shipment_status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const affected = await ShipmentModel.updateStatus(req.params.id, shipment_status);
    if (affected === 0) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    return res.status(200).json({ success: true, message: "Status updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

// PUT /api/shipments/:id
exports.updateShipment = async (req, res) => {
  try {
    const { shipment_status, tracking_number, carrier } = req.body;

    if (!ALLOWED_STATUSES.includes(shipment_status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const affected = await ShipmentModel.update(
      req.params.id,
      shipment_status,
      tracking_number,
      carrier
    );

    if (affected === 0) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    return res.status(200).json({ success: true, message: "Shipment updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update shipment" });
  }
};