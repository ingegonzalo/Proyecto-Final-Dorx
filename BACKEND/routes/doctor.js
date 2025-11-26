const express = require('express');
const routerDoctor = express.Router();
const doctorController = require('../controllers/doctors_api_controller.js');

// CREATE - Register new doctor
routerDoctor.post('/', doctorController.registerDoctor);

// READ - Get all doctors (root path for easy access)
routerDoctor.get('/', doctorController.getAllDoctors);

// READ - Get all doctors with pagination
routerDoctor.get('/doctors/all', doctorController.getAllDoctorsPaginated);

// READ - Get all doctors (no pagination)
routerDoctor.get('/all', doctorController.getAllDoctors);

// READ - Search doctors by criteria
routerDoctor.get('/search', doctorController.searchDoctors);

// READ - Get doctor by ID (must be after /search to avoid conflicts)
routerDoctor.get('/:id', doctorController.getDoctorByID);

// UPDATE - Full update of doctor
routerDoctor.put('/:id', doctorController.updateDoctor);

// PATCH - Partial update of doctor
routerDoctor.patch('/:id', doctorController.patchDoctor);

// DELETE - Delete doctor
routerDoctor.delete('/:id', doctorController.deleteDoctor);

module.exports = routerDoctor;
