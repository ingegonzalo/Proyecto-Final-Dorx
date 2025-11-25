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

    constructor(name, dosage, frequency, inventory){
        this.#id = getNextMedID();
        this.#name = name;
        this.#dosage = dosage;
        this.#frequency = frequency;
        this.#inventory = inventory;
    }
    toObj(){
        return {
            id: this.getid(),
            name: this.getname(),
            dosage: this.getdosage(),
            frequency: this.getfrequency(),
            inventory: this.getinventory()
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
}

module.exports = {
    Med,
    MedException
};