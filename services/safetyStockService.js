
const InventoryModel = require("../models/inventoryModel");

class SafetyStockService {
    static async evaluateInventory() {
        const inventory = await InventoryModel.getAllInventory();

        return inventory.map((item) => {
            const reorderPoint =
                (Number(item.daily_sales_rate) *
                Number(item.supplier_lead_time_days)) +
                Number(item.min_safety_level);

            const reorderNeeded =
                Number(item.stock_quantity) < reorderPoint;

            return {
                ...item,
                reorder_point: reorderPoint,
                reorder_needed: reorderNeeded
            };
        });
    }
}

module.exports = SafetyStockService;
