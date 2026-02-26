const mongoose = require('mongoose');

const DiagnosisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropType: { type: String, required: true },
  imageUrl: { type: String, required: true },
  disease: { type: String, required: true },
  scientificName: String,
  confidence: { type: Number, required: true },
  severity: { 
    type: String, 
    enum: ['Low', 'Moderate', 'High', 'Critical'], 
    default: 'Moderate' 
  },
  location: {
    region: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  treatment: {
    immediateActions: [String],
    fungicides: [String],
    preventionSteps: [String]
  },
  status: { type: String, enum: ['Active', 'Resolved'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Diagnosis', DiagnosisSchema);
