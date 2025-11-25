const fs = require('fs');
const path = require('path');
const { Patient } = require('../models/patients');
const patientsPath = path.join(__dirname, '../database/patients.json');

class PatientControllerException {
    constructor(errorMessage) {
        this.errorMessage = errorMessage;
    }
}

// Helper function to read patients from file
function readPatientsFromFile() {
    try {
        const data = fs.readFileSync(patientsPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading patients file:', error);
        return [];
    }
}

// Helper function to write patients to file
function writePatientToFile(patients) {
    try {
        fs.writeFileSync(patientsPath, JSON.stringify(patients, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('Error writing patients file:', error);
        return false;
    }
}

// CREATE - Register a new patient
function registerPatient(req, res) {
    try {
        const { name, room_number, status, doctor, meds = [], next_checkup } = req.body;
        
        // Validate required fields
        if (!name || !room_number || !status || !doctor) {
            return res.status(400).json({ 
                error: "Faltan campos obligatorios: name, room_number, status, doctor" 
            });
        }

        // Validate status
        const validStatuses = ["Amigable", "Peligroso", "Inestable"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: `Status inválido. Valores permitidos: ${validStatuses.join(', ')}` 
            });
        }

        // Validate meds is an array
        if (!Array.isArray(meds)) {
            return res.status(400).json({ 
                error: "El campo 'meds' debe ser un arreglo de IDs de medicamentos" 
            });
        }

        // Create new patient instance
        const newPatient = new Patient(name, room_number, status, doctor, meds, next_checkup);
        
        // Read current patients
        const patients = readPatientsFromFile();
        
        // Add new patient
        patients.push(newPatient.toObj());
        
        // Write to file
        if (!writePatientToFile(patients)) {
            return res.status(500).json({ error: "Error al guardar el paciente" });
        }

        return res.status(201).json({
            message: "Paciente registrado exitosamente",
            patient: newPatient.toObj()
        });
    } catch (error) {
        console.error('Error in registerPatient:', error);
        if (error.errorMessage) {
            return res.status(400).json({ error: error.errorMessage });
        }
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

// READ - Get all patients with pagination
function getAllPatientsPaginated(req, res) {
    try {
        const patients = readPatientsFromFile();
        
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        // Paginate results
        const paginatedPatients = patients.slice(startIndex, endIndex);

        return res.status(200).json({
            page: page,
            limit: limit,
            total: patients.length,
            totalPages: Math.ceil(patients.length / limit),
            data: paginatedPatients
        });
    } catch (error) {
        console.error('Error in getAllPatientsPaginated:', error);
        return res.status(500).json({ error: "Error al obtener los pacientes" });
    }
}

// READ - Get all patients (no pagination)
function getAllPatients(req, res) {
    try {
        const patients = readPatientsFromFile();
        return res.status(200).json(patients);
    } catch (error) {
        console.error('Error in getAllPatients:', error);
        return res.status(500).json({ error: "Error al obtener los pacientes" });
    }
}

// READ - Get patient by ID
function getPatientByID(req, res) {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID de paciente inválido" });
        }

        const patients = readPatientsFromFile();
        const patient = patients.find(p => p.id === id);

        if (!patient) {
            return res.status(404).json({ error: `Paciente con ID ${id} no encontrado` });
        }

        return res.status(200).json(patient);
    } catch (error) {
        console.error('Error in getPatientByID:', error);
        return res.status(500).json({ error: "Error al obtener el paciente" });
    }
}

// UPDATE - Update patient by ID
function updatePatient(req, res) {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID de paciente inválido" });
        }

        const { name, room_number, status, doctor, meds, next_checkup } = req.body;

        // Read current patients
        const patients = readPatientsFromFile();
        const patientIndex = patients.findIndex(p => p.id === id);

        if (patientIndex === -1) {
            return res.status(404).json({ error: `Paciente con ID ${id} no encontrado` });
        }

        // Get existing patient data
        const existingPatient = patients[patientIndex];

        // Validate status if provided
        if (status) {
            const validStatuses = ["Amigable", "Peligroso", "Inestable"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ 
                    error: `Status inválido. Valores permitidos: ${validStatuses.join(', ')}` 
                });
            }
        }

        // Validate meds is an array if provided
        if (meds !== undefined && !Array.isArray(meds)) {
            return res.status(400).json({ 
                error: "El campo 'meds' debe ser un arreglo de IDs de medicamentos" 
            });
        }

        // Update patient data (keep existing values if not provided)
        patients[patientIndex] = {
            id: existingPatient.id, // ID never changes
            name: name !== undefined ? name : existingPatient.name,
            room_number: room_number !== undefined ? room_number : existingPatient.room_number,
            status: status !== undefined ? status : existingPatient.status,
            doctor: doctor !== undefined ? doctor : existingPatient.doctor,
            meds: meds !== undefined ? meds : existingPatient.meds,
            next_checkup: next_checkup !== undefined ? next_checkup : existingPatient.next_checkup
        };

        // Write to file
        if (!writePatientToFile(patients)) {
            return res.status(500).json({ error: "Error al actualizar el paciente" });
        }

        return res.status(200).json({
            message: "Paciente actualizado exitosamente",
            patient: patients[patientIndex]
        });
    } catch (error) {
        console.error('Error in updatePatient:', error);
        if (error.errorMessage) {
            return res.status(400).json({ error: error.errorMessage });
        }
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

// DELETE - Delete patient by ID
function deletePatient(req, res) {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID de paciente inválido" });
        }

        // Read current patients
        const patients = readPatientsFromFile();
        const patientIndex = patients.findIndex(p => p.id === id);

        if (patientIndex === -1) {
            return res.status(404).json({ error: `Paciente con ID ${id} no encontrado` });
        }

        // Remove patient
        const deletedPatient = patients.splice(patientIndex, 1)[0];

        // Write to file
        if (!writePatientToFile(patients)) {
            return res.status(500).json({ error: "Error al eliminar el paciente" });
        }

        return res.status(200).json({
            message: "Paciente eliminado exitosamente",
            patient: deletedPatient
        });
    } catch (error) {
        console.error('Error in deletePatient:', error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

// PATCH - Partial update (similar to PUT but explicitly for partial updates)
function patchPatient(req, res) {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID de paciente inválido" });
        }

        const updates = req.body;

        // Don't allow ID updates
        if (updates.id !== undefined) {
            return res.status(400).json({ error: "No se puede modificar el ID del paciente" });
        }

        // Read current patients
        const patients = readPatientsFromFile();
        const patientIndex = patients.findIndex(p => p.id === id);

        if (patientIndex === -1) {
            return res.status(404).json({ error: `Paciente con ID ${id} no encontrado` });
        }

        // Validate status if provided
        if (updates.status) {
            const validStatuses = ["Amigable", "Peligroso", "Inestable"];
            if (!validStatuses.includes(updates.status)) {
                return res.status(400).json({ 
                    error: `Status inválido. Valores permitidos: ${validStatuses.join(', ')}` 
                });
            }
        }

        // Validate meds is an array if provided
        if (updates.meds !== undefined && !Array.isArray(updates.meds)) {
            return res.status(400).json({ 
                error: "El campo 'meds' debe ser un arreglo de IDs de medicamentos" 
            });
        }

        // Apply updates
        patients[patientIndex] = {
            ...patients[patientIndex],
            ...updates,
            id: patients[patientIndex].id // Ensure ID doesn't change
        };

        // Write to file
        if (!writePatientToFile(patients)) {
            return res.status(500).json({ error: "Error al actualizar el paciente" });
        }

        return res.status(200).json({
            message: "Paciente actualizado exitosamente",
            patient: patients[patientIndex]
        });
    } catch (error) {
        console.error('Error in patchPatient:', error);
        if (error.errorMessage) {
            return res.status(400).json({ error: error.errorMessage });
        }
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

// SEARCH - Filter patients by criteria
function searchPatients(req, res) {
    try {
        const { name, status, doctor, room_number } = req.query;
        let patients = readPatientsFromFile();

        // Apply filters
        if (name) {
            patients = patients.filter(p => 
                p.name.toLowerCase().includes(name.toLowerCase())
            );
        }

        if (status) {
            patients = patients.filter(p => p.status === status);
        }

        if (doctor) {
            patients = patients.filter(p => 
                p.doctor.toLowerCase().includes(doctor.toLowerCase())
            );
        }

        if (room_number) {
            patients = patients.filter(p => 
                p.room_number.toString() === room_number.toString()
            );
        }

        return res.status(200).json({
            total: patients.length,
            data: patients
        });
    } catch (error) {
        console.error('Error in searchPatients:', error);
        return res.status(500).json({ error: "Error al buscar pacientes" });
    }
}

module.exports = {
    registerPatient,
    getAllPatientsPaginated,
    getAllPatients,
    getPatientByID,
    updatePatient,
    deletePatient,
    patchPatient,
    searchPatients
};