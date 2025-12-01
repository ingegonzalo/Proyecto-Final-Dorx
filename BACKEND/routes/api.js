const express = require('express');
const path = require('path');
const routerApi = express.Router();

const routerPatient = require('./patient.js');
const routerDoctor = require('./doctor.js');
const doctorController = require('../controllers/doctors_api_controller.js');
const routerAppointment = require('./appointment.js');
const routerMeds = require('./med.js');

routerApi.use('/patients', routerPatient);
routerApi.use('/doctors', routerDoctor);
routerApi.use('/appointments', routerAppointment);
routerApi.use('/meds', routerMeds);

routerApi.get('/', (req, res) => {
    const auth = req.headers['authorization'];
    console.log(auth);
    if (auth) {
        res.sendFile(path.resolve(__dirname + '/../../FRONTEND/html/home.html'));
    } else {
        res.sendFile(path.resolve(__dirname + '/../../FRONTEND/html/login.html'));
    }
});

routerApi.get('/login.html', (req, res) => {
    res.sendFile(path.resolve(__dirname + '/../../FRONTEND/html/login.html'));
});

routerApi.get('/home.html', (req, res) => {
    res.sendFile(path.resolve(__dirname + '/../../FRONTEND/html/home.html'));
});

routerApi.get('/patients.html', (req, res) => {
    res.sendFile(path.resolve(__dirname + '/../../FRONTEND/html/patients.html'));
});

routerApi.get('/appointment.html', (req, res) => {
    res.sendFile(path.resolve(__dirname + '/../../FRONTEND/html/appointment.html'));
});

routerApi.get('/meds.html', (req, res) => {
    res.sendFile(path.resolve(__dirname + '/../../FRONTEND/html/meds.html'));
});

// Authentication endpoints for frontend compatibility (/login,/register)
routerApi.post('/register', doctorController.registerDoctor);
routerApi.post('/login', doctorController.loginDoctor);

module.exports = routerApi;