const fs = require('fs');
const path = require('path');
const connectDB = require('./database');

async function migrate() {
  try {
    await connectDB();
    const AppointmentModel = require('../models/mongoose/appointment.model');
    const PatientModel = require('../models/mongoose/patient.model');
    const DoctorModel = require('../models/mongoose/doctor.model');
    const MedModel = require('../models/mongoose/med.model');

    const apptsPath = path.join(__dirname, 'appointments.json');
    const patientsPath = path.join(__dirname, 'patients.json');
    const doctorsPath = path.join(__dirname, 'doctors.json');
    const medsPath = path.join(__dirname, 'meds.json');

    const appts = JSON.parse(fs.readFileSync(apptsPath, 'utf-8')) || [];
    const patients = JSON.parse(fs.readFileSync(patientsPath, 'utf-8')) || [];
    const doctors = JSON.parse(fs.readFileSync(doctorsPath, 'utf-8')) || [];
    const meds = JSON.parse(fs.readFileSync(medsPath, 'utf-8')) || [];

    // Upsert doctors
    for (const doc of doctors) {
      await DoctorModel.updateOne({ id: doc.id }, { $set: doc }, { upsert: true });
    }

    // Upsert meds
    for (const m of meds) {
      await MedModel.updateOne({ id: m.id }, { $set: m }, { upsert: true });
    }

    // Upsert patients
    for (const p of patients) {
      await PatientModel.updateOne({ id: p.id }, { $set: p }, { upsert: true });
    }

    // Upsert appointments (ensure Date objects)
    for (const a of appts) {
      const appt = { ...a, date: new Date(a.date) };
      await AppointmentModel.updateOne({ id: a.id }, { $set: appt }, { upsert: true });
    }

    console.log('✅ Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
