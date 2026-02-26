const Diagnosis = require('../models/Diagnosis');

class DiagnosisRepository {
  async create(data) {
    return await Diagnosis.create(data);
  }

  async findByUserId(userId) {
    return await Diagnosis.find({ userId }).sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Diagnosis.findById(id);
  }
}

module.exports = new DiagnosisRepository();
