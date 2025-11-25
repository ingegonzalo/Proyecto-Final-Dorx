const express = require('express');
const routerPatient = express.Router();
const patientController = require('../controllers/patients_api_controller.js');

// CREATE - Register new patient
routerPatient.post('/', patientController.registerPatient);

// READ - Get all patients with pagination
routerPatient.get('/patients/all', patientController.getAllPatientsPaginated);

// READ - Get all patients (no pagination)
routerPatient.get('/all', patientController.getAllPatients);

// READ - Search patients by criteria
routerPatient.get('/search', patientController.searchPatients);

// READ - Get patient by ID (must be after /search to avoid conflicts)
routerPatient.get('/:id', patientController.getPatientByID);

// UPDATE - Full update of patient
routerPatient.put('/:id', patientController.updatePatient);

// PATCH - Partial update of patient
routerPatient.patch('/:id', patientController.patchPatient);

// DELETE - Delete patient
routerPatient.delete('/:id', patientController.deletePatient);

module.exports = routerPatient;