
const db = require("../db");

class InventoryModel {
    static async getAllInventory() {
        const [rows] = await db.execute(`
            SELECT
                inventory_id,
                product_name,
                sku,
                stock_quantity,
                min_safety_level,
                daily_sales_rate,
                supplier_lead_time_days
            FROM inventory
        `);

        return rows;
    }
}

module.exports = InventoryModel;
