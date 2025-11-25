const fs = require('fs');
const path = require('path');
const patientsPath = path.join(__dirname, '../database/patients.json');
const medsPath = path.join(__dirname, '../database/meds.json');
const doctorsPath = path.join(__dirname, '../database/doctors.json');

function getNextPatientID(){
    const patientsD = JSON.parse(fs.readFileSync(patientsPath, 'utf-8'));
    return patientsD.length > 0 ? patientsD[patientsD.length - 1].id + 1 : 1;
}

function getMedsData(){
    try {
        return JSON.parse(fs.readFileSync(medsPath, 'utf-8'));
    } catch (error) {
        console.error('Error reading meds.json:', error);
        return [];
    }
}

function getDoctorsData(){
    try {
        return JSON.parse(fs.readFileSync(doctorsPath, 'utf-8'));
    } catch (error) {
        console.error('Error reading doctors.json:', error);
        return [];
    }
}

class PatientException {
    constructor(errorMessage){
        this.errorMessage = errorMessage;
    }
}

class Patient {
    #id;
    #name
    #room_number;
    #status;
    #doctor;
    #meds;
    #next_checkup;

    constructor(name, room_number, status, doctor, meds = [], next_checkup){
        this.#id = getNextPatientID();
        this.#name = name;
        this.#room_number = room_number;
        this.#doctor = doctor;
        if(status == "Amigable" || status == "Peligroso" || status == "Inestable"){
            this.#status = status;
        } else {
            throw new PatientException("Status No Valido");
        }
        if (Array.isArray(meds)) {
            this.#meds = meds;
        } else {
            throw new PatientException("Meds debe ser un arreglo");
        }
        this.#next_checkup = next_checkup;
    }
    toObj() {
        return {
            id: this.getid(),
            name: this.getname(),
            room_number: this.getroom_number(),
            status: this.getstatus(),
            doctor: this.getdoctor(),
            meds: this.getmeds(),
            next_checkup: this.getnext_checkup()
        };
    }
    getid(){
        return this.#id;
    }
    //No SetID porque es auto-generado
    getname(){
        return this.#name;
    }
    setname(newName){
        this.#name = newName;
    }
    getroom_number(){
        return this.#room_number;
    }
    setroom_number(newRoomNumber){
        this.#room_number = newRoomNumber;
    }
    getstatus(){
        return this.#status;
    }
    setstatus(newStatus){
        if(newStatus == "Amigable" || newStatus == "Peligroso" || newStatus == "Inestable"){
            this.#status = newStatus;
        } else {
            throw new PatientException("Status No Valido");
        }
    }
    getmeds(){
        return this.#meds;
    }
    setmeds(newMeds){
        if (!Array.isArray(newMeds)) {
            throw new PatientException("Meds debe ser un arreglo");
        }
        const medsD = getMedsData();
        for(let id of newMeds){
            let medsFound = medsD.some(med => med.id === id);
            if (!medsFound) {
                throw new PatientException(`Med con ID ${id} no existe`);
            }
        }
        this.#meds = newMeds;
    }
    getdoctor(){
        return this.#doctor;
    }
    setdoctor(newDoctor){
        const doctorsD = getDoctorsData();
        let doctorsFound = doctorsD.some(doctor => doctor.id === newDoctor);
        if (!doctorsFound) {
            throw new PatientException(`Doctor con ID ${newDoctor} no existe`);
        }
        this.#doctor = newDoctor;
    }
    getnext_checkup(){
        return this.#next_checkup;
    }
    setnext_checkup(newNextCheckup){
        // Accept both Date objects and ISO strings
        this.#next_checkup = newNextCheckup;
    }
}

module.exports = {
    Patient,
    PatientException
};