const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  patient_id: { type: Number, required: true },
  doctor_id: { type: Number, required: true },
  date: { type: Date, required: true },
  reason: { type: String, default: 'Consulta médica' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
