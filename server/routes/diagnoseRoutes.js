const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const Diagnosis = require('../models/Diagnosis');
const { protect } = require('../middleware/auth');
const FormData = require('form-data');
const fs = require('fs');

const diagnoseController = require('../controllers/diagnoseController');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// @route   POST /api/v1/diagnose
// @desc    Process leaf image and store result
// @access  Private (Farmer)
router.post('/', protect, upload.single('image'), diagnoseController.runDiagnostics);

// @route   GET /api/v1/diagnose/history
// @desc    Get diagnosis history for logged in user
// @access  Private
router.get('/history', protect, diagnoseController.getHistory);

module.exports = router;

