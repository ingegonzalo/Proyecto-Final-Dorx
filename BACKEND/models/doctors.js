const fs = require('fs');
const path = require('path');
const doctorsPath = path.join(__dirname, '../database/doctors.json');

function getNextDoctorID(){
    const DoctorsD = JSON.parse(fs.readFileSync(doctorsPath, 'utf-8'));
    return DoctorsD.length > 0 ? DoctorsD[DoctorsD.length - 1].id + 1 : 1;
}

class DoctorException {
    constructor(errorMessage){
        this.errorMessage = errorMessage;
    }
}

class Doctor {
    #id;
    #name;
    #patients;
    #appointments;

    constructor(name, patients = [], appointments = []){
        this.#id = getNextDoctorID();
        this.#name = name;
        if (Array.isArray(patients)) {
            this.#patients = patients;
        } else {
            throw new DoctorException("Patients debe ser un arreglo");
        }
        if (Array.isArray(appointments)) {
            this.#appointments = appointments;
        } else {
            throw new DoctorException("Appointments debe ser un arreglo");
        }
    }
    toObj(){
        return {
            id: this.getid(),
            name: this.getname(),
            patients: this.getpatients(),
            appointments: this.getappointments()
        };
    }
    getid(){
        return this.#id;
    }
    getname(){
        return this.#name;
    }
    getpatients(){
        return this.#patients;
    }
    getappointments(){
        return this.#appointments;
    }
}

module.exports = {
    Doctor,
    DoctorException
};