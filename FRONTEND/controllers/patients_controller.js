document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('all-patients-container');
    let patientsList = []; // 1. Variable para guardar los datos actuales

    function loadPatients() {
        // Obtener el ID del doctor desde sessionStorage
        const doctorId = parseInt(sessionStorage.getItem('doctorId'));
        
        if (!doctorId) {
            container.innerHTML = '<div class="alert alert-warning">No se pudo identificar al doctor.</div>';
            return;
        }

        fetch('/api/patients/all')
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

    // 2. Función de editar mejorada (Edita Nombre, Habitación y Estado)
    window.editPatient = function(id) {
        // Buscamos al paciente actual en nuestra lista guardada
        const currentPatient = patientsList.find(p => p.id === id);
        
        if (!currentPatient) return;

        // Pedimos los datos uno por uno, mostrando el valor actual por defecto
        const newName = prompt("Editar Nombre:", currentPatient.name);
        if (newName === null) return; // Si cancela, salimos

        const newRoom = prompt("Editar Habitación:", currentPatient.room_number);
        if (newRoom === null) return;

        const newStatus = prompt("Editar Estado (Amigable, Inestable, Peligroso):", currentPatient.status);
        if (newStatus === null) return;

        // Creamos el objeto con los nuevos datos
        const updatedData = {
            name: newName,
            room_number: newRoom,
            status: newStatus
        };

        fetch(`/api/patients/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        })
        .then(res => {
            if(res.ok) {
                loadPatients();
            } else {
                alert('Error al actualizar el paciente');
            }
        })
        .catch(err => console.error(err));
    };

    window.deletePatient = function(id) {
        if(confirm('¿Estás seguro de eliminar este paciente?')) {
            fetch(`/api/patients/${id}`, { method: 'DELETE' })
                .then(res => {
                    if(res.ok) loadPatients();
                    else alert('Error al eliminar');
                });
        }
    };

    loadPatients();
});