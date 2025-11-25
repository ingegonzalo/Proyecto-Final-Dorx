const fs = require('fs');
const path = require('path');
const appointmentsPath = path.join(__dirname, '../database/appointments.json');

function getNextAppointmentID(){
    const AppointmentsD = JSON.parse(fs.readFileSync(appointmentsPath, 'utf-8'));
    return AppointmentsD.length > 0 ? AppointmentsD[AppointmentsD.length - 1].id + 1 : 1;
}

class AppointmentException {
    constructor(errorMessage){
        this.errorMessage = errorMessage;
    }
}

class Appointment {
    #id;
    #patient_id;
    #doctor_id;
    #date;
    #reason;

    constructor(patient_id, doctor_id, date, reason){
        this.#id = getNextAppointmentID();
        this.#patient_id = patient_id;
        this.#doctor_id = doctor_id;
        this.#date = date;
        this.#reason = reason;
    }
    toObj(){
        return {
            id: this.getid(),
            patient_id: this.getpatient_id(),
            doctor_id: this.getdoctor_id(),
            date: this.getdate(),
            reason: this.getreason()
        };
    }
    getid(){
        return this.#id;
    }
    getpatient_id(){
        return this.#patient_id;
    }
    getdoctor_id(){
        return this.#doctor_id;
    }
    getdate(){
        return this.#date;
    }
    getreason(){
        return this.#reason;
    }
}

module.exports = {
    Appointment,
    AppointmentException
};