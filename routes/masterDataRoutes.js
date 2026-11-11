const express = require('express');
const router = express.Router();
const controller = require('../controllers/masterDataController');

// --- Category Endpoints ---
router.get('/categories', controller.getCategories);
router.post('/categories', controller.createCategory);
router.put('/categories/:id', controller.updateCategory);
router.delete('/categories/:id', controller.deleteCategory);

// --- Brand Endpoints ---
router.get('/brands', controller.getBrands);
router.post('/brands', controller.createBrand);
router.put('/brands/:id', controller.updateBrand);
router.delete('/brands/:id', controller.deleteBrand);

module.exports = router;