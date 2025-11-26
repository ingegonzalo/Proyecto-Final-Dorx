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
    #email;
    #password;
    #patients;
    #appointments;

    constructor(name, email, password, patients = [], appointments = []){
        this.#id = getNextDoctorID();
        this.#name = name;
        this.#email = email;
        this.#password = password;
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
            email: this.getemail(),
            password: this.getpassword(),
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
    setname(newName){
        this.#name = newName;
    }
    getemail(){
        return this.#email;
    }
    setemail(newEmail){
        this.#email = newEmail;
    }
    getpassword(){
        return this.#password;
    }
    setpassword(newPassword){
        this.#password = newPassword;
    }
    getpatients(){
        return this.#patients;
    }
    setpatients(newPatients){
        if (Array.isArray(newPatients)) {
            this.#patients = newPatients;
        } else {
            throw new DoctorException("Patients debe ser un arreglo");
        }
    }
    getappointments(){
        return this.#appointments;
    }
    setappointments(newAppointments){
        if (Array.isArray(newAppointments)) {
            this.#appointments = newAppointments;
        } else {
            throw new DoctorException("Appointments debe ser un arreglo");
        }
    }
}

module.exports = {
    Doctor,
    DoctorException
};