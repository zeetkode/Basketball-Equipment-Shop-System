
const express = require("express");
const router = express.Router();

const controller = require("../controllers/inventoryController");

router.get("/safety-stock-check", controller.checkSafetyStock);

module.exports = router;
