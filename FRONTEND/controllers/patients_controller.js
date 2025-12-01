document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('all-patients-container');
    let patientsList = []; // 1. Variable para guardar los datos actuales
    let medsList = []; // Lista de medicamentos disponibles
    let currentPatientId = null;

    // Bootstrap modals
    const addModal = new bootstrap.Modal(document.getElementById('addPatientModal'));
    const editModal = new bootstrap.Modal(document.getElementById('editPatientModal'));
    const deleteModal = new bootstrap.Modal(document.getElementById('deletePatientModal'));
    const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));

    // Helper function to show message modal
    function showMessage(message) {
        document.getElementById('messageModalText').textContent = message;
        messageModal.show();
    }

    // Cargar todos los medicamentos disponibles
    function loadMedsList() {
        fetch('/api/meds/all')
            .then(response => response.json())
            .then(meds => {
                medsList = meds;
            })
            .catch(error => console.error('Error cargando medicamentos:', error));
    }

    function loadPatients() {
        // Obtener el ID del doctor desde sessionStorage
        const doctorId = parseInt(sessionStorage.getItem('doctorId'));
        
        if (!doctorId) {
            container.innerHTML = '<div class="alert alert-warning">No se pudo identificar al doctor.</div>';
            return;
        }

        fetch(`/api/patients/all?doctor=${doctorId}`)
            .then(response => response.json())
            .then(patients => {
                // Filtrar solo los pacientes del doctor actual
                const doctorPatients = patients.filter(p => p.doctor === doctorId);
                
                patientsList = doctorPatients; // Guardamos los datos filtrados en la variable global
                container.innerHTML = '';
                
                if (doctorPatients.length === 0) {
                    container.innerHTML = '<div class="alert alert-info">No tienes pacientes asignados.</div>';
                    return;
                }
                
                doctorPatients.forEach(patient => {
                    const patientCard = document.createElement('div');
                    patientCard.className = 'alert alert-info mb-1 py-2';
                    patientCard.innerHTML = `
                        <div class="patients-row">
                            <div class="patient-cell checkbox-cell">
                                <input type="checkbox" class="form-check-input">
                            </div>
                            <div class="patient-cell"><p class="patient-name mb-0">${patient.name}</p></div>
                            <div class="patient-cell"><p class="patient-id mb-0">${patient.id}</p></div>
                            <div class="patient-cell"><span class="badge rounded-pill bg-${getStatusColor(patient.status)}">${patient.status}</span></div>
                            <div class="patient-cell">${patient.room_number}</div>
                            <div class="patient-cell">${patient.meds.length} meds</div>
                            <div class="patient-cell">${new Date(patient.next_checkup).toLocaleDateString()}</div>
                            <div class="patient-cell actions-cell">
                                <button class="btn btn-primary btn-sm me-1" onclick="editPatient(${patient.id})"><i class="fa-solid fa-pen"></i></button>
                                <button class="btn btn-danger btn-sm" onclick="deletePatient(${patient.id})"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    `;
                    container.appendChild(patientCard);
                });
            })
            .catch(error => console.error('Error cargando pacientes:', error));
    }

    function getStatusColor(status) {
        if (status === 'Inestable') return 'warning';
        if (status === 'Peligroso') return 'danger';
        return 'success';
    }

    // Función para abrir modal de edición
    window.editPatient = function(id) {
        const currentPatient = patientsList.find(p => p.id === id);
        if (!currentPatient) return;

        currentPatientId = id;
        
        // Llenar el formulario con los datos actuales
        document.getElementById('editPatientId').value = id;
        document.getElementById('editPatientName').value = currentPatient.name;
        document.getElementById('editPatientStatus').value = currentPatient.status;
        document.getElementById('editPatientRoom').value = currentPatient.room_number;
        
        // Convertir la fecha a formato datetime-local
        const checkupDate = new Date(currentPatient.next_checkup);
        const localDateTime = new Date(checkupDate.getTime() - (checkupDate.getTimezoneOffset() * 60000))
            .toISOString()
            .slice(0, 16);
        document.getElementById('editPatientCheckup').value = localDateTime;
        
        // Cargar checkboxes de medicamentos
        const medsContainer = document.getElementById('editPatientMeds');
        medsContainer.innerHTML = '';
        
        medsList.forEach(med => {
            const isChecked = currentPatient.meds.includes(med.id);
            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'form-check';
            checkboxDiv.innerHTML = `
                <input class="form-check-input" type="checkbox" value="${med.id}" id="med-${med.id}" ${isChecked ? 'checked' : ''}>
                <label class="form-check-label" for="med-${med.id}">
                    ${med.name} (${med.dosage})
                </label>
            `;
            medsContainer.appendChild(checkboxDiv);
        });
        
        editModal.show();
    };

    // Guardar cambios de edición
    document.getElementById('saveEditPatient').addEventListener('click', function() {
        const id = currentPatientId;
        const newName = document.getElementById('editPatientName').value.trim();
        const newStatus = document.getElementById('editPatientStatus').value;
        const newRoom = parseInt(document.getElementById('editPatientRoom').value);
        const newCheckup = document.getElementById('editPatientCheckup').value;

        if (!newName || !newStatus || isNaN(newRoom) || !newCheckup) {
            showMessage("Por favor completa todos los campos correctamente");
            return;
        }

        // Obtener medicamentos seleccionados
        const selectedMeds = Array.from(document.querySelectorAll('#editPatientMeds input[type="checkbox"]:checked'))
            .map(cb => parseInt(cb.value));

        const updatedData = {
            name: newName,
            status: newStatus,
            room_number: newRoom,
            meds: selectedMeds,
            next_checkup: new Date(newCheckup).toISOString()
        };

        console.log('Actualizando paciente:', id, updatedData);

        fetch(`/api/patients/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        })
        .then(res => {
            console.log('Respuesta del servidor:', res.status);
            if(res.ok) {
                return res.json();
            } else {
                return res.json().then(data => {
                    throw new Error(data.error || 'Error al actualizar');
                });
            }
        })
        .then(data => {
            console.log('Paciente actualizado:', data);
            editModal.hide();
            loadPatients();
        })
        .catch(err => {
            console.error('Error:', err);
            showMessage(err.message || 'Error al actualizar');
        })
        .catch(err => console.error(err));
    });

    // Función para abrir modal de borrado
    window.deletePatient = function(id) {
        const currentPatient = patientsList.find(p => p.id === id);
        if (!currentPatient) return;

        currentPatientId = id;
        
        // Mostrar el nombre del paciente a eliminar
        document.getElementById('deletePatientName').textContent = currentPatient.name;
        
        deleteModal.show();
    };

    // Confirmar borrado
    document.getElementById('confirmDeletePatient').addEventListener('click', function() {
        const id = currentPatientId;
        
        fetch(`/api/patients/${id}`, { method: 'DELETE' })
            .then(res => {
                if(res.ok) {
                    deleteModal.hide();
                    loadPatients();
                } else {
                    showMessage('Error al eliminar');
                }
            })
            .catch(err => console.error(err));
    });

    // Función para abrir modal de agregar paciente
    document.getElementById('addPatientBtn').addEventListener('click', function() {
        // Cargar checkboxes de medicamentos
        const medsContainer = document.getElementById('addPatientMeds');
        medsContainer.innerHTML = '';
        
        medsList.forEach(med => {
            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'form-check';
            checkboxDiv.innerHTML = `
                <input class="form-check-input" type="checkbox" value="${med.id}" id="add-med-${med.id}">
                <label class="form-check-label" for="add-med-${med.id}">
                    ${med.name} (${med.dosage})
                </label>
            `;
            medsContainer.appendChild(checkboxDiv);
        });
        
        addModal.show();
    });

    // Guardar nuevo paciente
    document.getElementById('saveAddPatient').addEventListener('click', function() {
        const doctorId = parseInt(sessionStorage.getItem('doctorId'));
        
        if (!doctorId) {
            showMessage("No se pudo identificar al doctor. Por favor inicia sesión nuevamente.");
            return;
        }

        const newName = document.getElementById('addPatientName').value.trim();
        const newStatus = document.getElementById('addPatientStatus').value;
        const newRoom = parseInt(document.getElementById('addPatientRoom').value);
        const newCheckup = document.getElementById('addPatientCheckup').value;

        if (!newName || !newStatus || isNaN(newRoom) || !newCheckup) {
            showMessage("Por favor completa todos los campos correctamente");
            return;
        }

        // Obtener medicamentos seleccionados
        const selectedMeds = Array.from(document.querySelectorAll('#addPatientMeds input[type="checkbox"]:checked'))
            .map(cb => parseInt(cb.value));

        const newPatientData = {
            name: newName,
            status: newStatus,
            room_number: newRoom,
            doctor: doctorId,
            meds: selectedMeds,
            next_checkup: new Date(newCheckup).toISOString()
        };

        // Creating patient (request will be sent to the backend)

        fetch('/api/patients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPatientData)
        })
            .then(res => {
            if(res.ok) {
                return res.json();
            } else {
                return res.json().then(data => {
                    throw new Error(data.error || 'Error al crear paciente');
                });
            }
        })
        .then(data => {
            addModal.hide();
            // Limpiar formulario
            document.getElementById('addPatientForm').reset();
            loadPatients();
        })
        .catch(err => {
            console.error('Error:', err);
            showMessage(err.message || 'Error al crear paciente');
        });
    });

    // Inicializar
    loadMedsList();
    loadPatients();
});