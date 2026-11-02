const db = require('../db');

const getItems = (tableName) => async (req, res) => {
    try {
        const [rows] = await db.query(SELECT * FROM ${ tableName } ORDER BY id DESC);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createItem = (tableName) => async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
        const [result] = await db.query(INSERT INTO ${ tableName }(name) VALUES(?), [name]);
        res.status(201).json({ id: result.insertId, name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateItem = (tableName) => async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        await db.query(UPDATE ${ tableName } SET name = ? WHERE id = ?, [name, id]);
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteItem = (tableName) => async (req, res) => {
    const { id } = req.params;
    try {
        await db.query(DELETE FROM ${ tableName } WHERE id = ?, [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

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