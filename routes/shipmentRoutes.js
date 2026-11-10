const express = require("express");
const router = express.Router();
const shipmentController = require("../controllers/shipmentController");

router.get("/", shipmentController.getShipments);
router.get("/orders", shipmentController.getOrdersForDropdown);
router.get("/:id", shipmentController.getShipmentById);
router.post("/", shipmentController.createShipment);
router.patch("/:id/status", shipmentController.updateShipmentStatus);
router.put("/:id", shipmentController.updateShipment);

module.exports = router;