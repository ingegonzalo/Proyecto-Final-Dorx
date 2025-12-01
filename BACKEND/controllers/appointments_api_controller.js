const fs = require('fs');
const path = require('path');
const { Appointment } = require('../models/appointments');
let AppointmentModel = null;
let PatientModel = null;
let DoctorModel = null;
try {
    AppointmentModel = require('../models/mongoose/appointment.model');
    PatientModel = require('../models/mongoose/patient.model');
    DoctorModel = require('../models/mongoose/doctor.model');
    console.log('⚡️ Using Mongoose models for Appointments/Patients/Doctors');
} catch (err) {
    console.log('Mongoose models not available for appointments - falling back to JSON files');
}
const appointmentsPath = path.join(__dirname, '../database/appointments.json');
const patientsPath = path.join(__dirname, '../database/patients.json');
const doctorsPath = path.join(__dirname, '../database/doctors.json');
    
class AppointmentsControllerException {
    constructor(errorMessage){
        this.errorMessage = errorMessage;
    }
}

// Helper function to read appointments from file
function readAppointmentsFromFile() {
    try {
        const data = fs.readFileSync(appointmentsPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading appointments file:', error);
        return [];
    }
}

// Helper function to write appointments to file
function writeAppointmentsToFile(appointments) {
    try {
        fs.writeFileSync(appointmentsPath, JSON.stringify(appointments, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('Error writing appointments file:', error);
        return false;
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

// Validate if patient exists
function validatePatientExists(patient_id) {
    const patients = readPatientsFromFile();
    return patients.some(p => p.id === patient_id);
}

// Validate if doctor exists
function validateDoctorExists(doctor_id) {
    const doctors = readDoctorsFromFile();
    return doctors.some(d => d.id === doctor_id);
}

// CREATE - Register a new appointment
async function registerAppointment(req, res) {
    try {
        const { patient_id, doctor_id, date, reason } = req.body;
        
        // Validate required fields
        if (!patient_id || !doctor_id || !date) {
            return res.status(400).json({ 
                error: "Faltan campos obligatorios: patient_id, doctor_id, date" 
            });
        }

        // Validate patient exists
        if (PatientModel) {
            const patientExists = await PatientModel.findOne({ id: patient_id }).lean().exec();
            if (!patientExists) {
                return res.status(404).json({ error: `Paciente con ID ${patient_id} no encontrado` });
            }
        } else {
            if (!validatePatientExists(patient_id)) {
                return res.status(404).json({ 
                    error: `Paciente con ID ${patient_id} no encontrado` 
                });
            }
        }

        // Validate doctor exists
        if (DoctorModel) {
            const doctorExists = await DoctorModel.findOne({ id: doctor_id }).lean().exec();
            if (!doctorExists) {
                return res.status(404).json({ error: `Doctor con ID ${doctor_id} no encontrado` });
            }
        } else {
            if (!validateDoctorExists(doctor_id)) {
                return res.status(404).json({ 
                    error: `Doctor con ID ${doctor_id} no encontrado` 
                });
            }
        }

        // If Mongoose is available, use it to create and check conflicts
        if (AppointmentModel) {
            const newDateISO = new Date(date);
            const conflict = await AppointmentModel.findOne({ doctor_id: doctor_id, date: newDateISO }).lean().exec();
            if (conflict) {
                return res.status(409).json({ error: 'Horario no disponible. Ya existe una cita a esta hora.' });
            }
            // Compute next numeric ID to keep compatibility with JSON DB (incremental)
            const last = await AppointmentModel.findOne().sort({ id: -1 }).lean().exec();
            const nextId = last && last.id ? last.id + 1 : 1;
            const created = await AppointmentModel.create({ id: nextId, patient_id, doctor_id, date: newDateISO, reason });
            return res.status(201).json({ message: 'Cita registrada exitosamente', appointment: created });
        }

        // Fallback to file-based storage
        const appointments = readAppointmentsFromFile();
        const newDate = new Date(date).getTime();

        // Buscar si ya existe una cita para ese doctor a la misma hora exacta
        const conflict = appointments.find(app => {
            const existingDate = new Date(app.date).getTime();
            return app.doctor_id === doctor_id && existingDate === newDate;
        });

        if (conflict) {
            return res.status(409).json({ error: 'Horario no disponible. Ya existe una cita a esta hora.' });
        }

        // Create new appointment instance
        const newAppointment = new Appointment(patient_id, doctor_id, date, reason);
        
        // Add new appointment
        appointments.push(newAppointment.toObj());
        
        // Write to file
        if (!writeAppointmentsToFile(appointments)) {
            return res.status(500).json({ error: "Error al guardar la cita" });
        }

        return res.status(201).json({
            message: "Cita registrada exitosamente",
            appointment: newAppointment.toObj()
        });
    } catch (error) {
        console.error('Error in registerAppointment:', error);
        if (error.errorMessage) {
            return res.status(400).json({ error: error.errorMessage });
        }
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

// READ - Get all appointments with pagination
async function getAllAppointmentsPaginated(req, res) {
    try {
        if (AppointmentModel) {
            const total = await AppointmentModel.countDocuments();
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const startIndex = (page - 1) * limit;
            const data = await AppointmentModel.find().skip(startIndex).limit(limit).lean().exec();
            return res.status(200).json({ page, limit, total, totalPages: Math.ceil(total/limit), data });
        }

        const appointments = readAppointmentsFromFile();
        
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        // Paginate results
        const paginatedAppointments = appointments.slice(startIndex, endIndex);

        return res.status(200).json({
            page: page,
            limit: limit,
            total: appointments.length,
            totalPages: Math.ceil(appointments.length / limit),
            data: paginatedAppointments
        });
    } catch (error) {
        console.error('Error in getAllAppointmentsPaginated:', error);
        return res.status(500).json({ error: "Error al obtener las citas" });
    }
}

// READ - Get all appointments (no pagination)
async function getAllAppointments(req, res) {
    try {
        if (AppointmentModel) {
            const data = await AppointmentModel.find().lean().exec();
            return res.status(200).json(data);
        }
        const appointments = readAppointmentsFromFile();
        return res.status(200).json(appointments);
    } catch (error) {
        console.error('Error in getAllAppointments:', error);
        return res.status(500).json({ error: "Error al obtener las citas" });
    }
}

// READ - Get appointment by ID
async function getAppointmentByID(req, res) {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID de cita inválido" });
        }

        if (AppointmentModel) {
            const appointment = await AppointmentModel.findOne({ id: id }).lean().exec();
            if (!appointment) return res.status(404).json({ error: `Cita con ID ${id} no encontrada` });
            return res.status(200).json(appointment);
        }
        const appointments = readAppointmentsFromFile();
        const appointment = appointments.find(a => a.id === id);

        if (!appointment) {
            return res.status(404).json({ error: `Cita con ID ${id} no encontrada` });
        }

        return res.status(200).json(appointment);
    } catch (error) {
        console.error('Error in getAppointmentByID:', error);
        return res.status(500).json({ error: "Error al obtener la cita" });
    }
}

// UPDATE - Update appointment by ID
async function updateAppointment(req, res) {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID de cita inválido" });
        }

        const { patient_id, doctor_id, date, reason } = req.body;

        // Read current appointments
        if (AppointmentModel) {
            // Using Mongoose for full update (PUT) - replace fields
            const { patient_id, doctor_id, date, reason } = req.body;
            if (patient_id !== undefined && PatientModel) {
                const patientExists = await PatientModel.findOne({ id: patient_id }).lean().exec();
                if (!patientExists) return res.status(404).json({ error: `Paciente con ID ${patient_id} no encontrado` });
            }
            if (doctor_id !== undefined && DoctorModel) {
                const doctorExists = await DoctorModel.findOne({ id: doctor_id }).lean().exec();
                if (!doctorExists) return res.status(404).json({ error: `Doctor con ID ${doctor_id} no encontrado` });
            }
            const updateObj = {
                patient_id: patient_id !== undefined ? patient_id : undefined,
                doctor_id: doctor_id !== undefined ? doctor_id : undefined,
                date: date !== undefined ? new Date(date) : undefined,
                reason: reason !== undefined ? reason : undefined
            };
            // Remove undefined fields
            Object.keys(updateObj).forEach(k => updateObj[k] === undefined && delete updateObj[k]);
            const updated = await AppointmentModel.findOneAndUpdate({ id: id }, updateObj, { new: true }).lean().exec();
            if (!updated) return res.status(404).json({ error: `Cita con ID ${id} no encontrada` });
            return res.status(200).json({ message: 'Cita actualizada exitosamente', appointment: updated });
        }

        const appointments = readAppointmentsFromFile();
        const appointmentIndex = appointments.findIndex(a => a.id === id);

        if (appointmentIndex === -1) {
            return res.status(404).json({ error: `Cita con ID ${id} no encontrada` });
        }

        // Get existing appointment data
        const existingAppointment = appointments[appointmentIndex];

        // Validate patient if provided
        if (patient_id !== undefined && !validatePatientExists(patient_id)) {
            return res.status(404).json({ 
                error: `Paciente con ID ${patient_id} no encontrado` 
            });
        }

        // Validate doctor if provided
        if (doctor_id !== undefined && !validateDoctorExists(doctor_id)) {
            return res.status(404).json({ 
                error: `Doctor con ID ${doctor_id} no encontrado` 
            });
        }

        // Update appointment data (keep existing values if not provided)
        appointments[appointmentIndex] = {
            id: existingAppointment.id, // ID never changes
            patient_id: patient_id !== undefined ? patient_id : existingAppointment.patient_id,
            doctor_id: doctor_id !== undefined ? doctor_id : existingAppointment.doctor_id,
            date: date !== undefined ? date : existingAppointment.date,
            reason: reason !== undefined ? reason : existingAppointment.reason
        };

        // Write to file
        if (!writeAppointmentsToFile(appointments)) {
            return res.status(500).json({ error: "Error al actualizar la cita" });
        }

        return res.status(200).json({
            message: "Cita actualizada exitosamente",
            appointment: appointments[appointmentIndex]
        });
    } catch (error) {
        console.error('Error in updateAppointment:', error);
        if (error.errorMessage) {
            return res.status(400).json({ error: error.errorMessage });
        }
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

// DELETE - Delete appointment by ID
async function deleteAppointment(req, res) {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID de cita inválido" });
        }

        if (AppointmentModel) {
            const deleted = await AppointmentModel.findOneAndDelete({ id: id }).lean().exec();
            if (!deleted) return res.status(404).json({ error: `Cita con ID ${id} no encontrada` });
            return res.status(200).json({ message: 'Cita eliminada exitosamente', appointment: deleted });
        }

        // Read current appointments
        const appointments = readAppointmentsFromFile();
        const appointmentIndex = appointments.findIndex(a => a.id === id);

        if (appointmentIndex === -1) {
            return res.status(404).json({ error: `Cita con ID ${id} no encontrada` });
        }

        // Remove appointment
        const deletedAppointment = appointments.splice(appointmentIndex, 1)[0];

        // Write to file
        if (!writeAppointmentsToFile(appointments)) {
            return res.status(500).json({ error: "Error al eliminar la cita" });
        }

        return res.status(200).json({
            message: "Cita eliminada exitosamente",
            appointment: deletedAppointment
        });
    } catch (error) {
        console.error('Error in deleteAppointment:', error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

// PATCH - Partial update
async function patchAppointment(req, res) {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID de cita inválido" });
        }

        const updates = req.body;

        // Don't allow ID updates
        if (updates.id !== undefined) {
            return res.status(400).json({ error: "No se puede modificar el ID de la cita" });
        }

        // Read current appointments
        if (AppointmentModel) {
            const updates = req.body;
            if (updates.patient_id !== undefined && PatientModel) {
                const patientExists = await PatientModel.findOne({ id: updates.patient_id }).lean().exec();
                if (!patientExists) return res.status(404).json({ error: `Paciente con ID ${updates.patient_id} no encontrado` });
            }
            if (updates.doctor_id !== undefined && DoctorModel) {
                const doctorExists = await DoctorModel.findOne({ id: updates.doctor_id }).lean().exec();
                if (!doctorExists) return res.status(404).json({ error: `Doctor con ID ${updates.doctor_id} no encontrado` });
            }
            if (updates.date) updates.date = new Date(updates.date);
            const updated = await AppointmentModel.findOneAndUpdate({ id: id }, updates, { new: true }).lean().exec();
            if (!updated) return res.status(404).json({ error: `Cita con ID ${id} no encontrada` });
            return res.status(200).json({ message: 'Cita actualizada exitosamente', appointment: updated });
        }

        const appointments = readAppointmentsFromFile();
        const appointmentIndex = appointments.findIndex(a => a.id === id);

        if (appointmentIndex === -1) {
            return res.status(404).json({ error: `Cita con ID ${id} no encontrada` });
        }

        // Validate patient if provided
        if (updates.patient_id !== undefined && !validatePatientExists(updates.patient_id)) {
            return res.status(404).json({ 
                error: `Paciente con ID ${updates.patient_id} no encontrado` 
            });
        }

        // Validate doctor if provided
        if (updates.doctor_id !== undefined && !validateDoctorExists(updates.doctor_id)) {
            return res.status(404).json({ 
                error: `Doctor con ID ${updates.doctor_id} no encontrado` 
            });
        }

        // Apply updates
        appointments[appointmentIndex] = {
            ...appointments[appointmentIndex],
            ...updates,
            id: appointments[appointmentIndex].id // Ensure ID doesn't change
        };

        // Write to file
        if (!writeAppointmentsToFile(appointments)) {
            return res.status(500).json({ error: "Error al actualizar la cita" });
        }

        return res.status(200).json({
            message: "Cita actualizada exitosamente",
            appointment: appointments[appointmentIndex]
        });
    } catch (error) {
        console.error('Error in patchAppointment:', error);
        if (error.errorMessage) {
            return res.status(400).json({ error: error.errorMessage });
        }
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

// SEARCH - Filter appointments by criteria
async function searchAppointments(req, res) {
    try {
        const { patient_id, doctor_id, date } = req.query;
        if (AppointmentModel) {
            const query = {};
            if (patient_id) query.patient_id = parseInt(patient_id);
            if (doctor_id) query.doctor_id = parseInt(doctor_id);
            if (date) {
                const start = new Date(date);
                const end = new Date(date);
                end.setDate(end.getDate() + 1);
                query.date = { $gte: start, $lt: end };
            }
            const data = await AppointmentModel.find(query).lean().exec();
            return res.status(200).json({ total: data.length, data });
        }

        let appointments = readAppointmentsFromFile();

        // Apply filters
        if (patient_id) {
            const pid = parseInt(patient_id);
            appointments = appointments.filter(a => a.patient_id === pid);
        }

        if (doctor_id) {
            const did = parseInt(doctor_id);
            appointments = appointments.filter(a => a.doctor_id === did);
        }

        if (date) {
            appointments = appointments.filter(a => 
                a.date.startsWith(date)
            );
        }

        return res.status(200).json({
            total: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error('Error in searchAppointments:', error);
        return res.status(500).json({ error: "Error al buscar citas" });
    }
}

module.exports = {
    registerAppointment,
    getAllAppointmentsPaginated,
    getAllAppointments,
    getAppointmentByID,
    updateAppointment,
    deleteAppointment,
    patchAppointment,
    searchAppointments
};