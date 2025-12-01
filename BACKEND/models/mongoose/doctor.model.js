const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  password: { type: String },
  patients: { type: [Number], default: [] },
  appointments: { type: [Number], default: [] }
});

module.exports = mongoose.model('Doctor', DoctorSchema);
