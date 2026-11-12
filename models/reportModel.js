const db = require('../db');

const getInnerJoin = async () => {
    const query = `
        SELECT b.name AS brand, c.name AS category, SUM(e.stock_quantity) AS total_sold
        FROM equipment e
        INNER JOIN brands b ON e.brand_id = b.id
        INNER JOIN categories c ON e.category_id = c.id
        GROUP BY b.name, c.name;
    `;
    const [rows] = await db.query(query);
    return rows;
};

const getLeftJoinCustomers = async () => {
    const query = `
        SELECT u.full_name AS customer_name
        FROM users u
        LEFT JOIN orders o ON u.user_id = o.user_id
        WHERE o.order_id IS NULL AND u.role_id = 2;
    `;
    const [rows] = await db.query(query);
    return rows;
};

const getLeftJoinProducts = async () => {
    const query = `
        SELECT e.product_name
        FROM equipment e
        LEFT JOIN order_items oi ON e.equipment_id = oi.equipment_id
        WHERE oi.order_id IS NULL;
    `;
    const [rows] = await db.query(query);
    return rows;
};

const getFullOuterJoin = async () => {
    const query = `
        SELECT e.product_name, e.stock_quantity AS store_stock, IFNULL(SUM(soi.quantity), 0) AS pending_supply
        FROM equipment e
        LEFT JOIN supplier_order_items soi ON e.equipment_id = soi.equipment_id
        GROUP BY e.equipment_id
        UNION
        SELECT e.product_name, 0 AS store_stock, SUM(soi.quantity) AS pending_supply
        FROM equipment e
        RIGHT JOIN supplier_order_items soi ON e.equipment_id = soi.equipment_id
        GROUP BY e.equipment_id;
    `;
    const [rows] = await db.query(query);
    return rows;
};

module.exports = {
    getInnerJoin,
    getLeftJoinCustomers,
    getLeftJoinProducts,
    getFullOuterJoin
};
