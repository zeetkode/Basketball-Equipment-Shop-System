const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/inner-join', reportController.getInnerJoin);
router.get('/left-join-customers', reportController.getLeftJoinCustomers);
router.get('/left-join-products', reportController.getLeftJoinProducts);
router.get('/full-outer-join', reportController.getFullOuterJoin);

module.exports = router;
