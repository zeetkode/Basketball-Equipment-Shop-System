
const SafetyStockService = require("../services/safetyStockService");

exports.checkSafetyStock = async (req, res) => {
    try {
        const result = await SafetyStockService.evaluateInventory();

        res.json({
            message: "Safety-stock evaluation completed successfully",
            inventory: result
        });
    } catch (error) {
        console.error("Safety-stock error:", error.message);

        res.status(500).json({
            error: "Failed to evaluate inventory",
            details: error.message
        });
    }
};
