const mongoose = require('mongoose');

const MedSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  dosage: { type: String },
  frequency: { type: String },
  inventory: { type: Number },
  duration: { type: String },
  riesgo: { type: String }
});

module.exports = mongoose.model('Med', MedSchema);
