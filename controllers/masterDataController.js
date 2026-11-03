const db = require('../db');

// Generic helper function to fetch items from any table
const getItems = (tableName) => async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM ${tableName} ORDER BY id DESC`);
        res.json(rows);
    } catch (err) {
        console.error(`❌ Error fetching from ${tableName}:`, err.message);
        res.status(500).json({ error: err.message });
    }
};

// Generic helper function to create an item in any table
const createItem = (tableName) => async (req, res) => {
    console.log(`📥 Incoming POST request to /${tableName}:`, req.body);
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const [result] = await db.query(`INSERT INTO ${tableName} (name) VALUES (?)`, [name]);
        res.status(201).json({ id: result.insertId, name });
    } catch (err) {
        console.error(`❌ Error inserting into ${tableName}:`, err.message);
        res.status(500).json({ error: err.message });
    }
};

// Generic helper function to update an item in any table
const updateItem = (tableName) => async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required for update' });
    }

    try {
        await db.query(`UPDATE ${tableName} SET name = ? WHERE id = ?`, [name, id]);
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        console.error(`❌ Error updating ${tableName}:`, err.message);
        res.status(500).json({ error: err.message });
    }
};

// Generic helper function to delete an item from any table
const deleteItem = (tableName) => async (req, res) => {
    const { id } = req.params;
    try {
        await db.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(`❌ Error deleting from ${tableName}:`, err.message);
        res.status(500).json({ error: err.message });
    }
};

// Export pre-configured functions for both Categories and Brands
module.exports = {
    getCategories: getItems('categories'),
    createCategory: createItem('categories'),
    updateCategory: updateItem('categories'),
    deleteCategory: deleteItem('categories'),
    getBrands: getItems('brands'),
    createBrand: createItem('brands'),
    updateBrand: updateItem('brands'),
    deleteBrand: deleteItem('brands'),
};