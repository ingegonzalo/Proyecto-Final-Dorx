const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  room_number: { type: String },
  status: { type: String },
  doctor: { type: Number },
  meds: { type: [Number], default: [] },
  next_checkup: { type: Date }
});

module.exports = mongoose.model('Patient', PatientSchema);
