const express = require('express');
const routerAppointment = express.Router();
const appointmentController = require('../controllers/appointments_api_controller.js');

// CREATE - Register new appointment
routerAppointment.post('/', appointmentController.registerAppointment);

// READ - Get all appointments with pagination
routerAppointment.get('/appointments/all', appointmentController.getAllAppointmentsPaginated);

// READ - Get all appointments (no pagination)
routerAppointment.get('/all', appointmentController.getAllAppointments);

// READ - Search appointments by criteria
routerAppointment.get('/search', appointmentController.searchAppointments);

// READ - Get appointment by ID (must be after /search to avoid conflicts)
routerAppointment.get('/:id', appointmentController.getAppointmentByID);

// UPDATE - Full update of appointment
routerAppointment.put('/:id', appointmentController.updateAppointment);

// PATCH - Partial update of appointment
routerAppointment.patch('/:id', appointmentController.patchAppointment);

// DELETE - Delete appointment
routerAppointment.delete('/:id', appointmentController.deleteAppointment);

module.exports = routerAppointment;
