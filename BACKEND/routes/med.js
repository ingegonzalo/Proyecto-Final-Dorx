const express = require('express');
const routerMed = express.Router();
const medController = require('../controllers/meds_api_controller.js');

// CREATE - Register new medication
routerMed.post('/', medController.registerMed);

// READ - Get all meds with pagination
routerMed.get('/meds/all', medController.getAllMedsPaginated);

// READ - Get all meds (no pagination)
routerMed.get('/all', medController.getAllMeds);

// READ - Search meds by criteria
routerMed.get('/search', medController.searchMeds);

// READ - Get med by ID (must be after /search to avoid conflicts)
routerMed.get('/:id', medController.getMedByID);

// UPDATE - Full update of med
routerMed.put('/:id', medController.updateMed);

// PATCH - Partial update of med
routerMed.patch('/:id', medController.patchMed);

// DELETE - Delete med
routerMed.delete('/:id', medController.deleteMed);

module.exports = routerMed;
