const fs = require('fs');
const path = require('path');
const {Patient} = require('../models/patient');
const { get } = require('http');
const patientsPath = path.join(__dirname, '../database/patients.json');

class PatientControllerException{
    constructor(errorMessage){
        this.errorMessage = errorMessage;
    }
}

function createPatient (name, room_number, status, doctor, meds = [], next_checkup){
    const patient =  {
        id: getNextPatientID(),
        name: name,
        room_number: room_number,
        status: status,
        doctor: doctor,
        meds: insertMeds(meds),
        next_checkup: next_checkup
    }
    data.patients.push(patient);
}
function insertMeds(meds){
    if (!Array.isArray(meds)) {
        throw new PatientControllerException("Meds debe ser un arreglo");
    }
    let foundMeds = [];
    for(id of meds){
        let existingMed = data.meds.find(med => med.id === id);
        if(existingMed){
            foundMeds.push(existingMed);
        } else {
            throw new PatientControllerException(`Medicina con ID ${id} no encontrada`);
        }
    }
    return foundMeds;
}

function getPatientByID(id){
    const patient = data.patients.find(p => p.id === id);
    if(!patient){
        throw new PatientControllerException(`Paciente con ID ${id} no encontrado`);
    } else {
        return patient;
    }
}

function registerPatient(req, res){
    try {
        const { name, room_number, status, doctor, meds, next_checkup } = req.body;
        const auth = req.headers['authorization'];
        if(!auth){
            return res.status(401).json({error: "No autorizado"});
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
}

module.exports = {
    registerPatient,
    getPatientByID,
    createPatient
};