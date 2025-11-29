const fs = require('fs');
const path = require('path');
const { Med } = require('../models/meds');
const medsPath = path.join(__dirname, '../database/meds.json');

class MedsControllerException {
    constructor(errorMessage){
        this.errorMessage = errorMessage;
    }
}

// Helper function to read meds from file
function readMedsFromFile() {
    try {
        const data = fs.readFileSync(medsPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading meds file:', error);
        return [];
    }
}

// Helper function to write meds to file
function writeMedsToFile(meds) {
    try {
        fs.writeFileSync(medsPath, JSON.stringify(meds, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('Error writing meds file:', error);
        return false;
    }
}

// CREATE - Register a new medication
function registerMed(req, res) {
    try {
        const { name, dosage, frequency, inventory, riesgo, duration } = req.body;
        
        // Validate required fields
        if (!name || !dosage || !frequency || inventory === undefined) {
            return res.status(400).json({ 
                error: "Faltan campos obligatorios: name, dosage, frequency, inventory" 
            });
        }

        // Validate inventory is a number
        if (typeof inventory !== 'number' || inventory < 0) {
            return res.status(400).json({ 
                error: "El campo 'inventory' debe ser un número mayor o igual a 0" 
            });
        }

        // Validate riesgo if provided
        const validRiesgo = ['Sano', 'Precaucion', 'Peligroso'];
        if (riesgo && !validRiesgo.includes(riesgo)) {
            return res.status(400).json({ 
                error: "El campo 'riesgo' debe ser: Sano, Precaucion o Peligroso" 
            });
        }

        // Create new med instance
        const newMed = new Med(name, dosage, frequency, inventory, duration, riesgo);
        
        // Read current meds
        const meds = readMedsFromFile();
        
        // Add new med
        meds.push(newMed.toObj());
        
        // Write to file
        if (!writeMedsToFile(meds)) {
            return res.status(500).json({ error: "Error al guardar el medicamento" });
        }

        return res.status(201).json({
            message: "Medicamento registrado exitosamente",
            med: newMed.toObj()
        });
    } catch (error) {
        console.error('Error in registerMed:', error);
        if (error.errorMessage) {
            return res.status(400).json({ error: error.errorMessage });
        }
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

// READ - Get all meds with pagination
function getAllMedsPaginated(req, res) {
    try {
        const meds = readMedsFromFile();
        
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        // Paginate results
        const paginatedMeds = meds.slice(startIndex, endIndex);

        return res.status(200).json({
            page: page,
            limit: limit,
            total: meds.length,
            totalPages: Math.ceil(meds.length / limit),
            data: paginatedMeds
        });
    } catch (error) {
        console.error('Error in getAllMedsPaginated:', error);
        return res.status(500).json({ error: "Error al obtener los medicamentos" });
    }
}

// READ - Get all meds (no pagination)
function getAllMeds(req, res) {
    try {
        const meds = readMedsFromFile();
        return res.status(200).json(meds);
    } catch (error) {
        console.error('Error in getAllMeds:', error);
        return res.status(500).json({ error: "Error al obtener los medicamentos" });
    }
}

// READ - Get med by ID
function getMedByID(req, res) {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID de medicamento inválido" });
        }

        const meds = readMedsFromFile();
        const med = meds.find(m => m.id === id);

        if (!med) {
            return res.status(404).json({ error: `Medicamento con ID ${id} no encontrado` });
        }

        return res.status(200).json(med);
    } catch (error) {
        console.error('Error in getMedByID:', error);
        return res.status(500).json({ error: "Error al obtener el medicamento" });
    }
}

// UPDATE - Update med by ID
function updateMed(req, res) {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID de medicamento inválido" });
        }

        const { name, dosage, frequency, inventory } = req.body;

        // Read current meds
        const meds = readMedsFromFile();
        const medIndex = meds.findIndex(m => m.id === id);

        if (medIndex === -1) {
            return res.status(404).json({ error: `Medicamento con ID ${id} no encontrado` });
        }

        // Get existing med data
        const existingMed = meds[medIndex];

        // Validate inventory if provided
        if (inventory !== undefined && (typeof inventory !== 'number' || inventory < 0)) {
            return res.status(400).json({ 
                error: "El campo 'inventory' debe ser un número mayor o igual a 0" 
            });
        }

        // Update med data (keep existing values if not provided)
        meds[medIndex] = {
            id: existingMed.id, // ID never changes
            name: name !== undefined ? name : existingMed.name,
            dosage: dosage !== undefined ? dosage : existingMed.dosage,
            frequency: frequency !== undefined ? frequency : existingMed.frequency,
            inventory: inventory !== undefined ? inventory : existingMed.inventory
        };

        // Write to file
        if (!writeMedsToFile(meds)) {
            return res.status(500).json({ error: "Error al actualizar el medicamento" });
        }

        return res.status(200).json({
            message: "Medicamento actualizado exitosamente",
            med: meds[medIndex]
        });
    } catch (error) {
        console.error('Error in updateMed:', error);
        if (error.errorMessage) {
            return res.status(400).json({ error: error.errorMessage });
        }
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

// DELETE - Delete med by ID
function deleteMed(req, res) {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID de medicamento inválido" });
        }

        // Read current meds
        const meds = readMedsFromFile();
        const medIndex = meds.findIndex(m => m.id === id);

        if (medIndex === -1) {
            return res.status(404).json({ error: `Medicamento con ID ${id} no encontrado` });
        }

        // Remove med
        const deletedMed = meds.splice(medIndex, 1)[0];

        // Write to file
        if (!writeMedsToFile(meds)) {
            return res.status(500).json({ error: "Error al eliminar el medicamento" });
        }

        return res.status(200).json({
            message: "Medicamento eliminado exitosamente",
            med: deletedMed
        });
    } catch (error) {
        console.error('Error in deleteMed:', error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

// PATCH - Partial update
function patchMed(req, res) {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID de medicamento inválido" });
        }

        const updates = req.body;

        // Don't allow ID updates
        if (updates.id !== undefined) {
            return res.status(400).json({ error: "No se puede modificar el ID del medicamento" });
        }

        // Read current meds
        const meds = readMedsFromFile();
        const medIndex = meds.findIndex(m => m.id === id);

        if (medIndex === -1) {
            return res.status(404).json({ error: `Medicamento con ID ${id} no encontrado` });
        }

        // Validate inventory if provided
        if (updates.inventory !== undefined && (typeof updates.inventory !== 'number' || updates.inventory < 0)) {
            return res.status(400).json({ 
                error: "El campo 'inventory' debe ser un número mayor o igual a 0" 
            });
        }

        // Apply updates
        meds[medIndex] = {
            ...meds[medIndex],
            ...updates,
            id: meds[medIndex].id // Ensure ID doesn't change
        };

        // Write to file
        if (!writeMedsToFile(meds)) {
            return res.status(500).json({ error: "Error al actualizar el medicamento" });
        }

        return res.status(200).json({
            message: "Medicamento actualizado exitosamente",
            med: meds[medIndex]
        });
    } catch (error) {
        console.error('Error in patchMed:', error);
        if (error.errorMessage) {
            return res.status(400).json({ error: error.errorMessage });
        }
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

// SEARCH - Filter meds by criteria
function searchMeds(req, res) {
    try {
        const { name, dosage } = req.query;
        let meds = readMedsFromFile();

        // Apply filters
        if (name) {
            meds = meds.filter(m => 
                m.name.toLowerCase().includes(name.toLowerCase())
            );
        }

        if (dosage) {
            meds = meds.filter(m => 
                m.dosage.toLowerCase().includes(dosage.toLowerCase())
            );
        }

        return res.status(200).json({
            total: meds.length,
            data: meds
        });
    } catch (error) {
        console.error('Error in searchMeds:', error);
        return res.status(500).json({ error: "Error al buscar medicamentos" });
    }
}

module.exports = {
    registerMed,
    getAllMedsPaginated,
    getAllMeds,
    getMedByID,
    updateMed,
    deleteMed,
    patchMed,
    searchMeds
};
