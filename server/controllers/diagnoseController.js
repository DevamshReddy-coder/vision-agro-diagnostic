const diagnosisService = require('../services/diagnoseService');

exports.runDiagnostics = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No specimen image provided.' });
    }

    const result = await diagnosisService.processImage(
      req.user._id,
      req.body.cropType || 'Unknown',
      req.file.path,
      req.file.filename
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const history = await diagnosisService.getUserHistory(req.user._id);
    res.json(history);
  } catch (error) {
    next(error);
  }
};
