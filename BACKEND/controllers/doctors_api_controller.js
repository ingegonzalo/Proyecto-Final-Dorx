const fs = require('fs');
const path = require('path');
const { Doctor } = require('../models/doctors');
const doctorsPath = path.join(__dirname, '../database/doctors.json');

class DoctorsControllerException {
    constructor(errorMessage){
        this.errorMessage = errorMessage;
    }
}

// Helper function to read doctors from file
function readDoctorsFromFile() {
    try {
        const data = fs.readFileSync(doctorsPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading doctors file:', error);
        return [];
    }
}

// Helper function to write doctors to file
function writeDoctorsToFile(doctors) {
    try {
        fs.writeFileSync(doctorsPath, JSON.stringify(doctors, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('Error writing doctors file:', error);
        return false;
    }
}

// CREATE - Register a new doctor
function registerDoctor(req, res) {
    try {
        const { name, email, password, confirm_password, patients = [], appointments = [] } = req.body;
        
        // Validate required fields
        if (!name) {
            return res.status(400).json({ 
                error: "Campo obligatorio faltante: name" 
            });
        }

        if (!email) {
            return res.status(400).json({ 
                error: "Campo obligatorio faltante: email" 
            });
        }

        if (!password) {
            return res.status(400).json({ 
                error: "Campo obligatorio faltante: password" 
            });
        }

        if (!confirm_password) {
            return res.status(400).json({ 
                error: "Campo obligatorio faltante: confirm_password" 
            });
        }

        // Validate password confirmation
        if (password !== confirm_password) {
            return res.status(400).json({ 
                error: "Las contraseñas no coinciden" 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: "Formato de email inválido" 
            });
        }

        // Check if email already exists
        const doctors = readDoctorsFromFile();
        const emailExists = doctors.some(doc => doc.email === email);
        if (emailExists) {
            return res.status(400).json({ 
                error: "El email ya está registrado" 
            });
        }

        // Validate patients is an array
        if (!Array.isArray(patients)) {
            return res.status(400).json({ 
                error: "El campo 'patients' debe ser un arreglo de IDs de pacientes" 
            });
        }

        // Validate appointments is an array
        if (!Array.isArray(appointments)) {
            return res.status(400).json({ 
                error: "El campo 'appointments' debe ser un arreglo de IDs de citas" 
            });
        }

        // Create new doctor instance
        const newDoctor = new Doctor(name, email, password, patients, appointments);
        
        // Add new doctor
        doctors.push(newDoctor.toObj());
        
        // Write to file
        if (!writeDoctorsToFile(doctors)) {
            return res.status(500).json({ error: "Error al guardar el doctor" });
        }

        return res.status(201).json({
            message: "Doctor registrado exitosamente",
            doctor: newDoctor.toObj()
        });
    } catch (error) {
        console.error('Error in registerDoctor:', error);
        if (error.errorMessage) {
            return res.status(400).json({ error: error.errorMessage });
        }
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

// READ - Get all doctors with pagination
function getAllDoctorsPaginated(req, res) {
    try {
        const doctors = readDoctorsFromFile();
        
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        // Paginate results
        const paginatedDoctors = doctors.slice(startIndex, endIndex);

        return res.status(200).json({
            page: page,
            limit: limit,
            total: doctors.length,
            totalPages: Math.ceil(doctors.length / limit),
            data: paginatedDoctors
        });
    } catch (error) {
        console.error('Error in getAllDoctorsPaginated:', error);
        return res.status(500).json({ error: "Error al obtener los doctores" });
    }
}

// READ - Get all doctors (no pagination)
function getAllDoctors(req, res) {
    try {
        const doctors = readDoctorsFromFile();
        return res.status(200).json(doctors);
    } catch (error) {
        console.error('Error in getAllDoctors:', error);
        return res.status(500).json({ error: "Error al obtener los doctores" });
    }
}

// READ - Get doctor by ID
function getDoctorByID(req, res) {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID de doctor inválido" });
        }

        const doctors = readDoctorsFromFile();
        const doctor = doctors.find(d => d.id === id);

        if (!doctor) {
            return res.status(404).json({ error: `Doctor con ID ${id} no encontrado` });
        }

        return res.status(200).json(doctor);
    } catch (error) {
        console.error('Error in getDoctorByID:', error);
        return res.status(500).json({ error: "Error al obtener el doctor" });
    }
}

// UPDATE - Update doctor by ID
function updateDoctor(req, res) {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID de doctor inválido" });
        }

        const { name, patients, appointments } = req.body;

        // Read current doctors
        const doctors = readDoctorsFromFile();
        const doctorIndex = doctors.findIndex(d => d.id === id);

        if (doctorIndex === -1) {
            return res.status(404).json({ error: `Doctor con ID ${id} no encontrado` });
        }

        // Get existing doctor data
        const existingDoctor = doctors[doctorIndex];

        // Validate patients is an array if provided
        if (patients !== undefined && !Array.isArray(patients)) {
            return res.status(400).json({ 
                error: "El campo 'patients' debe ser un arreglo de IDs de pacientes" 
            });
        }

        // Validate appointments is an array if provided
        if (appointments !== undefined && !Array.isArray(appointments)) {
            return res.status(400).json({ 
                error: "El campo 'appointments' debe ser un arreglo de IDs de citas" 
            });
        }

        // Update doctor data (keep existing values if not provided)
        doctors[doctorIndex] = {
            id: existingDoctor.id, // ID never changes
            name: name !== undefined ? name : existingDoctor.name,
            patients: patients !== undefined ? patients : existingDoctor.patients,
            appointments: appointments !== undefined ? appointments : existingDoctor.appointments
        };

        // Write to file
        if (!writeDoctorsToFile(doctors)) {
            return res.status(500).json({ error: "Error al actualizar el doctor" });
        }

        return res.status(200).json({
            message: "Doctor actualizado exitosamente",
            doctor: doctors[doctorIndex]
        });
    } catch (error) {
        console.error('Error in updateDoctor:', error);
        if (error.errorMessage) {
            return res.status(400).json({ error: error.errorMessage });
        }
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

// DELETE - Delete doctor by ID
function deleteDoctor(req, res) {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID de doctor inválido" });
        }

        // Read current doctors
        const doctors = readDoctorsFromFile();
        const doctorIndex = doctors.findIndex(d => d.id === id);

        if (doctorIndex === -1) {
            return res.status(404).json({ error: `Doctor con ID ${id} no encontrado` });
        }

        // Remove doctor
        const deletedDoctor = doctors.splice(doctorIndex, 1)[0];

        // Write to file
        if (!writeDoctorsToFile(doctors)) {
            return res.status(500).json({ error: "Error al eliminar el doctor" });
        }

        return res.status(200).json({
            message: "Doctor eliminado exitosamente",
            doctor: deletedDoctor
        });
    } catch (error) {
        console.error('Error in deleteDoctor:', error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

// PATCH - Partial update
function patchDoctor(req, res) {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID de doctor inválido" });
        }

        const updates = req.body;

        // Don't allow ID updates
        if (updates.id !== undefined) {
            return res.status(400).json({ error: "No se puede modificar el ID del doctor" });
        }

        // Read current doctors
        const doctors = readDoctorsFromFile();
        const doctorIndex = doctors.findIndex(d => d.id === id);

        if (doctorIndex === -1) {
            return res.status(404).json({ error: `Doctor con ID ${id} no encontrado` });
        }

        // Validate patients is an array if provided
        if (updates.patients !== undefined && !Array.isArray(updates.patients)) {
            return res.status(400).json({ 
                error: "El campo 'patients' debe ser un arreglo de IDs de pacientes" 
            });
        }

        // Validate appointments is an array if provided
        if (updates.appointments !== undefined && !Array.isArray(updates.appointments)) {
            return res.status(400).json({ 
                error: "El campo 'appointments' debe ser un arreglo de IDs de citas" 
            });
        }

        // Apply updates
        doctors[doctorIndex] = {
            ...doctors[doctorIndex],
            ...updates,
            id: doctors[doctorIndex].id // Ensure ID doesn't change
        };

        // Write to file
        if (!writeDoctorsToFile(doctors)) {
            return res.status(500).json({ error: "Error al actualizar el doctor" });
        }

        return res.status(200).json({
            message: "Doctor actualizado exitosamente",
            doctor: doctors[doctorIndex]
        });
    } catch (error) {
        console.error('Error in patchDoctor:', error);
        if (error.errorMessage) {
            return res.status(400).json({ error: error.errorMessage });
        }
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

// SEARCH - Filter doctors by criteria
function searchDoctors(req, res) {
    try {
        const { name } = req.query;
        let doctors = readDoctorsFromFile();

        // Apply filters
        if (name) {
            doctors = doctors.filter(d => 
                d.name.toLowerCase().includes(name.toLowerCase())
            );
        }

        return res.status(200).json({
            total: doctors.length,
            data: doctors
        });
    } catch (error) {
        console.error('Error in searchDoctors:', error);
        return res.status(500).json({ error: "Error al buscar doctores" });
    }
}

module.exports = {
    registerDoctor,
    getAllDoctorsPaginated,
    getAllDoctors,
    getDoctorByID,
    updateDoctor,
    deleteDoctor,
    patchDoctor,
    searchDoctors
};
