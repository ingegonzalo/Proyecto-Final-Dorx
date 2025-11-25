document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('all-patients-container');

    function loadPatients() {
        fetch('/api/patients/all')
            .then(response => response.json())
            .then(patients => {
                container.innerHTML = '';
                patients.forEach(patient => {
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