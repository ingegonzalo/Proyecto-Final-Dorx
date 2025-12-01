const connectDB = require('./database');
//revision de datos iniciales
async function seed() {
  try {
    await connectDB();
    console.log('Connected to DB');

    const Doctor = require('../models/mongoose/doctor.model');
    const Patient = require('../models/mongoose/patient.model');
    const Med = require('../models/mongoose/med.model');
    const Appointment = require('../models/mongoose/appointment.model');

    // Example med
    const medData = {
      id: 1,
      name: 'Paracetamol',
      dosage: '500mg',
      frequency: 'cada 8 horas',
      inventory: 100,
      duration: 'N/A',
      riesgo: 'Sano'
    };
    await Med.updateOne({ id: medData.id }, { $set: medData }, { upsert: true });
    console.log('Med seeded');

    // Example doctor
    const doctorData = {
      id: 1,
      name: 'Dr. Gonzalo',
      email: 'gonzalo@clinic.com',
      password: 'secret123',
      patients: [],
      appointments: []
    };
    await Doctor.updateOne({ id: doctorData.id }, { $set: doctorData }, { upsert: true });
    console.log('Doctor seeded');

    // Example patient
    const patientData = {
      id: 1,
      name: 'Juan Pérez',
      room_number: '101',
      status: 'Amigable',
      doctor: doctorData.id,
      meds: [medData.id],
      next_checkup: new Date()
    };
    await Patient.updateOne({ id: patientData.id }, { $set: patientData }, { upsert: true });
    console.log('Patient seeded');

    // Example appointment
    const appointmentData = {
      id: 1,
      patient_id: patientData.id,
      doctor_id: doctorData.id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      reason: 'Consulta inicial'
    };
    await Appointment.updateOne({ id: appointmentData.id }, { $set: appointmentData }, { upsert: true });
    console.log('Appointment seeded');

    console.log('✅ Seeding completed');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
