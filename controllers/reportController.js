const reportModel = require('../models/reportModel');

exports.getInnerJoin = async (req, res) => {
    try {
        const rows = await reportModel.getInnerJoin();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLeftJoinCustomers = async (req, res) => {
    try {
        const rows = await reportModel.getLeftJoinCustomers();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLeftJoinProducts = async (req, res) => {
    try {
        const rows = await reportModel.getLeftJoinProducts();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getFullOuterJoin = async (req, res) => {
    try {
        const rows = await reportModel.getFullOuterJoin();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

