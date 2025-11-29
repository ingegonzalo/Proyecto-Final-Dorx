const fs = require('fs');
const path = require('path');
const medsPath = path.join(__dirname, '../database/meds.json');

function getNextMedID(){
    const MedsD = JSON.parse(fs.readFileSync(medsPath, 'utf-8'));
    return MedsD.length > 0 ? MedsD[MedsD.length - 1].id + 1 : 1;
}

class MedException {
    constructor(errorMessage){
        this.errorMessage = errorMessage;
    }
}

class Med {
    #id;
    #name;
    #dosage;
    #frequency;
    #inventory;
    #riesgo;
    #duration;

    constructor(name, dosage, frequency, inventory, duration, riesgo = 'Sano'){
        this.#id = getNextMedID();
        this.#name = name;
        this.#dosage = dosage;
        this.#frequency = frequency;
        this.#inventory = inventory;
        this.#duration = duration || 'N/A';
        this.#riesgo = riesgo;
    }

    toObj(){
        return {
            id: this.#id,
            name: this.#name,
            dosage: this.#dosage,
            frequency: this.#frequency,
            inventory: this.#inventory,
            duration: this.#duration,
            riesgo: this.#riesgo
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
    getdosage(){
        return this.#dosage;
    }
    setdosage(newDosage){
        this.#dosage = newDosage;
    }
    getfrequency(){
        return this.#frequency;
    }
    setfrequency(newFrequency){
        this.#frequency = newFrequency;
    }
    getinventory(){
        return this.#inventory;
    }
    setinventory(newInventory){
        this.#inventory = newInventory;
    }
    getriesgo(){
        return this.#riesgo;
    }
    setriesgo(newRiesgo){
        // Validar que sea una opción válida
        const validOptions = ['Sano', 'Precaucion', 'Peligroso'];
        if (validOptions.includes(newRiesgo)) {
            this.#riesgo = newRiesgo;
        }
    }
    getduration() { 
        return this.#duration; }
    setduration(newDuration) { 
        this.#duration = newDuration; }
}

module.exports = {
    Med,
    MedException
};