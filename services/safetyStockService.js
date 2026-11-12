const db = require("../db");

class SafetyStockService {
  static async evaluateInventory() {
    // Query the main equipment table instead of a duplicate inventory table
    const query = `
            SELECT equipment_id, product_name, stock_quantity, 
                   min_safety_level, daily_sales_rate, supplier_lead_time_days
            FROM equipment
        `;
    const [equipment] = await db.query(query);

    return equipment.map((item) => {
      // Reorder Point = (Lead Time * Daily Sales) + Safety Stock
      const reorderPoint =
        Number(item.daily_sales_rate) * Number(item.supplier_lead_time_days) +
        Number(item.min_safety_level);

      const reorderNeeded = Number(item.stock_quantity) < reorderPoint;

      return {
        equipment_id: item.equipment_id,
        product_name: item.product_name,
        current_quantity: item.stock_quantity,
        reorder_point: reorderPoint,
        status: reorderNeeded ? "CRITICAL" : "OK",
      };
    });
  }
}

module.exports = SafetyStockService;
