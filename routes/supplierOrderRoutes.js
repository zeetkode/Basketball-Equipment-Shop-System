const express = require("express");
const router = express.Router();
const supplierOrderController = require("../controllers/supplierOrderController");

router.get("/", supplierOrderController.getSupplierOrders);
router.get("/suppliers", supplierOrderController.getSupplierList);
router.get("/equipment", supplierOrderController.getEquipmentList);
router.get("/:id", supplierOrderController.getSupplierOrderById);
router.post("/", supplierOrderController.createSupplierOrder);
router.patch("/:id/status", supplierOrderController.updateSupplierOrderStatus);
router.put("/:id/items", supplierOrderController.replaceSupplierOrderItems);

module.exports = router;
