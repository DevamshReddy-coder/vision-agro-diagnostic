const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const diagnosisRepository = require('../repositories/diagnoseRepository');

class DiagnosisService {
  async processImage(userId, cropType, filePath, fileName) {
    const mlFormData = new FormData();
    mlFormData.append('file', fs.createReadStream(filePath));

    let mlData;
    try {
      const response = await axios.post('http://localhost:8000/predict', mlFormData, {
        headers: { ...mlFormData.getHeaders() }
      });
      mlData = response.data.data;
    } catch (error) {
      console.error("ML Service unreachable, using fallback logic.");
      mlData = this._getFallbackData();
    }

    const diagnosisStore = {
      userId,
      cropType,
      imageUrl: `/uploads/${fileName}`,
      disease: mlData.disease,
      scientificName: mlData.scientific_name,
      confidence: mlData.confidence * 100,
      severity: mlData.severity,
      treatment: {
        immediateActions: mlData.recommendations.treatment,
        preventionSteps: mlData.recommendations.prevention
      }
    };

    return await diagnosisRepository.create(diagnosisStore);
  }

  async getUserHistory(userId) {
    const history = await diagnosisRepository.findByUserId(userId);
    return history.map(item => this._flattenDiagnosis(item));
  }

  _flattenDiagnosis(item) {
    const obj = item.toObject();
    return {
      ...obj,
      treatment: obj.treatment.immediateActions,
      prevention: obj.treatment.preventionSteps
    };
  }

  _getFallbackData() {
    return {
      disease: "Healthy Specimen (Fallback)",
      scientific_name: "N/A",
      confidence: 0.95,
      severity: "Low",
      recommendations: {
        treatment: ["No active treatment needed"],
        prevention: ["Continue standard irrigation", "Monitor weekly"]
      }
    };
  }
}

module.exports = new DiagnosisService();
