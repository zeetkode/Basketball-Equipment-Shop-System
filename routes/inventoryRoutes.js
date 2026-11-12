const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");

// This explicitly handles the GET request to /api/inventory/evaluate
router.get("/evaluate", inventoryController.checkSafetyStock);

module.exports = router;
