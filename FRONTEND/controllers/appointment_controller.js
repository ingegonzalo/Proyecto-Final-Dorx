document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    const modal = new bootstrap.Modal(document.getElementById('addEventModal'));
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteEventModal'));
    const form = document.getElementById('eventForm');
    const eventDateInput = document.getElementById('eventDate');
    const patientSelect = document.getElementById('patientSelect');
    let selectedDate = null;
    let patientsList = [];
    let eventToDelete = null;

    // Load patients for the current doctor
    function loadDoctorPatients() {
        const doctorId = parseInt(sessionStorage.getItem('doctorId'));
        
        if (!doctorId) return;

        fetch(`/api/patients/all?doctor=${doctorId}`)
            .then(response => response.json())
            .then(patients => {
                // Filter only doctor's patients
                patientsList = patients.filter(p => p.doctor === doctorId);
                
                // Populate select options
                patientSelect.innerHTML = '<option value="">Seleccione un paciente</option>';
                patientsList.forEach(patient => {
                    const option = document.createElement('option');
                    option.value = patient.id;
                    option.textContent = patient.name;
                    patientSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error loading patients:', error));
    }

    // Load patients on init
    loadDoctorPatients();

    // Confirm delete button handler
    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
        if (eventToDelete) {
            fetch(`/api/appointments/${eventToDelete.id}`, {
                method: 'DELETE'
            })
            .then(res => {
                if (res.ok) {
                    eventToDelete.remove(); // Remove from calendar
                    deleteModal.hide();
                    eventToDelete = null;
                } else {
                    alert('Error al eliminar la cita');
                }
            })
            .catch(err => {
                console.error(err);
                alert('Error al eliminar la cita');
            });
        }
    });

    // Plus button click handler
    const addAppointmentBtn = document.getElementById('addAppointmentBtn');
    if (addAppointmentBtn) {
        addAppointmentBtn.addEventListener('click', function() {
            // Set today's date as default
            const today = new Date().toISOString().split('T')[0];
            eventDateInput.value = today;
            modal.show();
        });
    }

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        selectable: true,
        editable: true, // Permite arrastrar y soltar
        droppable: true,
        expandRows: true,
        height: '100%',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        
        // 1. CARGAR EVENTOS DESDE EL BACKEND
        events: function(info, successCallback, failureCallback) {
            const doctorId = parseInt(sessionStorage.getItem('doctorId'));
            
            if (!doctorId) {
                failureCallback('No se pudo identificar al doctor');
                return;
            }
            
            fetch(`/api/appointments/all?doctor_id=${doctorId}`)
                .then(response => response.json())
                .then(data => {
                    // Filtrar solo las citas del doctor actual
                    const doctorAppointments = data.filter(app => app.doctor_id === doctorId);
                    
                    // Mapeamos los datos de tu BD al formato de FullCalendar
                    const events = doctorAppointments.map(app => ({
                        id: app.id,
                        title: app.reason || 'Cita Médica', // Mostramos la razón como título
                        start: app.date, // La fecha ISO guarda hora también
                        allDay: false,
                        // Guardamos datos extra si los necesitamos
                        extendedProps: {
                            patient_id: app.patient_id,
                            doctor_id: app.doctor_id
                        }
                    }));
                    successCallback(events);
                })
                .catch(error => {
                    console.error('Error cargando citas:', error);
                    failureCallback(error);
                });
        },

        dateClick: function (info) {
            selectedDate = info.dateStr;
            eventDateInput.value = selectedDate;
            modal.show();
        },

        // 2. BORRAR CITA AL HACER CLIC
        eventClick: function (info) {
            info.jsEvent.preventDefault(); // Evitar navegación si fuera un link
            
            // Store event to delete
            eventToDelete = info.event;
            
            // Update modal content
            document.getElementById('deleteEventTitle').textContent = info.event.title;
            
            // Show delete modal
            deleteModal.show();
        },

        // 3. ACTUALIZAR FECHA AL ARRASTRAR (Drag & Drop)
        eventDrop: function (info) {
            // info.event.start es la nueva fecha/hora
            const newDate = info.event.start.toISOString(); // Convertir a formato compatible con tu backend

            fetch(`/api/appointments/${info.event.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: newDate })
            })
            .then(res => {
                if (!res.ok) {
                    info.revert(); // Si falla, regresa la cita a su lugar original
                    alert('Error al mover la cita');
                }
            })
            .catch(err => {
                console.error(err);
                info.revert();
            });
        }
    });

    // 4. CREAR NUEVA CITA
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const patientId = parseInt(patientSelect.value);
        const doctorId = parseInt(sessionStorage.getItem('doctorId'));
        const date = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value;
        const reasonInput = document.getElementById('eventReason').value.trim();

        if (!patientId) {
            alert('Por favor selecciona un paciente');
            return;
        }

        if (!doctorId) {
            alert('No se pudo identificar al doctor');
            return;
        }

        if (date && time) {
            const newAppointment = {
                patient_id: patientId,
                doctor_id: doctorId,
                date: `${date}T${time}`,
                reason: reasonInput || 'Consulta médica'
            };

            console.log('Creando cita:', newAppointment);

            fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAppointment)
            })
            .then(response => {
                if (response.ok) {
                    calendar.refetchEvents(); // Recargar eventos del servidor
                    modal.hide();
                    form.reset();
                } else {
                    response.json().then(data => alert(data.error || "Error al guardar"));
                }
            })
            .catch(error => console.error('Error:', error));
        }
    });

    calendar.render();
});

// ============================
// MEDICATIONS MANAGEMENT
// ============================

// Check if we're on meds.html page
if (document.getElementById('all-meds-container')) {
    const container = document.getElementById('all-meds-container');
    let medsList = []; // Variable para guardar los datos actuales
    let currentMedId = null; // ID del medicamento actual en edición/borrado

    // Bootstrap modals
    const addMedModal = new bootstrap.Modal(document.getElementById('addMedModal'));
    const editModal = new bootstrap.Modal(document.getElementById('editMedModal'));
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteMedModal'));

    function loadMeds() {
        fetch('/api/meds/all')
            .then(response => response.json())
            .then(meds => {
                medsList = meds; // Guardamos referencia global
                container.innerHTML = '';
                
                if (meds.length === 0) {
                    container.innerHTML = '<div class="alert alert-secondary">Aún no hay medicamentos</div>';
                    return;
                }
                
                meds.forEach(med => {
                    const row = document.createElement('div');
                    row.className = 'alert alert-info mb-1 py-2';
                    
                    // Determinamos color del badge según riesgo
                    let badgeColor = 'success'; // Sano por defecto
                    if (med.riesgo === 'Precaucion') badgeColor = 'warning';
                    else if (med.riesgo === 'Peligroso') badgeColor = 'danger';
                    else if (med.riesgo === 'Sano') badgeColor = 'success';

                    row.innerHTML = `
                        <div class="meds-row">
                            <div class="meds-cell checkbox-cell">
                                <input type="checkbox" class="form-check-input">
                            </div>
                            <div class="meds-cell"><p class="patient-name mb-0">${med.name}</p></div>
                            <div class="meds-cell"><p class="patient-id mb-0">${med.id}</p></div>
                            <div class="meds-cell"><span class="badge rounded-pill bg-info">${med.frequency || 'N/A'}</span></div>
                            <div class="meds-cell"><span class="badge rounded-pill bg-secondary">${med.dosage || 'N/A'}</span></div>
                            <div class="meds-cell"><span class="badge rounded-pill bg-${badgeColor}">${med.inventory} u.</span></div>
                            <div class="meds-cell actions-cell">
                                <button class="btn btn-primary btn-sm btn-icon me-1" onclick="editMed(${med.id})"><i class="fa-solid fa-pen"></i></button>
                                <button class="btn btn-danger btn-sm btn-icon" onclick="deleteMed(${med.id})"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    `;
                    container.appendChild(row);
                });
            })
            .catch(error => console.error('Error cargando medicamentos:', error));
    }

    // Función para abrir modal de edición
    window.editMed = function(id) {
        const currentMed = medsList.find(m => m.id === id);
        if (!currentMed) return;

        currentMedId = id;
        
        // Llenar el formulario con los datos actuales
        document.getElementById('editMedId').value = id;
        document.getElementById('editMedName').value = currentMed.name;
        document.getElementById('editMedDosage').value = currentMed.dosage;
        document.getElementById('editMedFrequency').value = currentMed.frequency || '';
        document.getElementById('editMedStock').value = currentMed.inventory;
        document.getElementById('editMedRiesgo').value = currentMed.riesgo || 'Sano';
        
        editModal.show();
    };

    // Guardar cambios de edición
    document.getElementById('saveEditMed').addEventListener('click', function() {
        const id = currentMedId;
        const newName = document.getElementById('editMedName').value.trim();
        const newDosage = document.getElementById('editMedDosage').value.trim();
        const newFrequency = document.getElementById('editMedFrequency').value.trim();
        const newInventory = parseInt(document.getElementById('editMedStock').value);
        const newRiesgo = document.getElementById('editMedRiesgo').value;

        if (!newName || !newDosage || !newFrequency || isNaN(newInventory) || newInventory < 0) {
            alert("Por favor completa todos los campos correctamente");
            return;
        }

        const updatedData = {
            name: newName,
            dosage: newDosage,
            frequency: newFrequency,
            inventory: newInventory,
            riesgo: newRiesgo
        };

        fetch(`/api/meds/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        })
        .then(res => {
            if(res.ok) {
                editModal.hide();
                loadMeds();
            } else {
                res.json().then(data => alert(data.error || 'Error al actualizar'));
            }
        })
        .catch(err => console.error(err));
    });

    // Función para abrir modal de borrado
    window.deleteMed = function(id) {
        const currentMed = medsList.find(m => m.id === id);
        if (!currentMed) return;

        currentMedId = id;
        
        // Mostrar el nombre del medicamento a eliminar
        document.getElementById('deleteMedName').textContent = currentMed.name;
        
        deleteModal.show();
    };

    // Confirmar borrado
    document.getElementById('confirmDeleteMed').addEventListener('click', function() {
        const id = currentMedId;
        
        fetch(`/api/meds/${id}`, { method: 'DELETE' })
            .then(res => {
                if(res.ok) {
                    deleteModal.hide();
                    loadMeds();
                } else {
                    alert('Error al eliminar');
                }
            })
            .catch(err => console.error(err));
    });

    // Función para abrir modal de agregar medicamento
    document.getElementById('addMedBtn').addEventListener('click', function() {
        // Limpiar formulario
        document.getElementById('addMedForm').reset();
        document.getElementById('addMedRiesgo').value = 'Sano'; // Default
        addMedModal.show();
    });

    // Guardar nuevo medicamento
    document.getElementById('saveAddMed').addEventListener('click', function() {
        const newName = document.getElementById('addMedName').value.trim();
        const newDosage = document.getElementById('addMedDosage').value.trim();
        const newFrequency = document.getElementById('addMedFrequency').value.trim();
        const newInventory = parseInt(document.getElementById('addMedStock').value);
        const newRiesgo = document.getElementById('addMedRiesgo').value;

        if (!newName || !newDosage || !newFrequency || isNaN(newInventory) || newInventory < 0) {
            alert("Por favor completa todos los campos correctamente");
            return;
        }

        const newMedData = {
            name: newName,
            dosage: newDosage,
            frequency: newFrequency,
            inventory: newInventory,
            riesgo: newRiesgo
        };

        console.log('Creando medicamento:', newMedData);

        fetch('/api/meds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMedData)
        })
        .then(res => {
            console.log('Respuesta del servidor:', res.status);
            if(res.ok) {
                return res.json();
            } else {
                return res.json().then(data => {
                    throw new Error(data.error || 'Error al crear medicamento');
                });
            }
        })
        .then(data => {
            console.log('Medicamento creado:', data);
            addMedModal.hide();
            document.getElementById('addMedForm').reset();
            loadMeds();
        })
        .catch(err => {
            console.error('Error:', err);
            alert(err.message || 'Error al crear medicamento');
        });
    });

    // Cargar medicamentos al iniciar
    loadMeds();
}