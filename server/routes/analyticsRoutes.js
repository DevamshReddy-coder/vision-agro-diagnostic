const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

// @desc Get analytics overview (Public statistics)
router.get('/overview', analyticsController.getOverview);

module.exports = router;
