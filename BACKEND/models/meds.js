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

    constructor(name, dosage, frequency, inventory, riesgo = 'Sano'){
        this.#id = getNextMedID();
        this.#name = name;
        this.#dosage = dosage;
        this.#frequency = frequency;
        this.#inventory = inventory;
        this.#riesgo = riesgo;
    }
    toObj(){
        return {
            id: this.getid(),
            name: this.getname(),
            dosage: this.getdosage(),
            frequency: this.getfrequency(),
            inventory: this.getinventory(),
            riesgo: this.getriesgo()
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
}

module.exports = {
    Med,
    MedException
};