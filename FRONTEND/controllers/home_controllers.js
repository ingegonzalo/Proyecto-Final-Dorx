document.addEventListener('DOMContentLoaded', () => {
    loadUpcomingAppointments();
    loadCriticalPatients();
});

function loadUpcomingAppointments() {
    const container = document.getElementById('upcoming-appointments-container');
    
    // Cargar AMBOS: Citas y Pacientes
    Promise.all([
        fetch('/api/appointments/all').then(res => res.json()),
        fetch('/api/patients/all').then(res => res.json())
    ])
    .then(([appointments, patients]) => {
        container.innerHTML = '';
        
        // ... lógica de filtrado de fecha existente ...
        const now = new Date();
        now.setDate(now.getDate() - 1);
        
        const upcoming = appointments.filter(a => new Date(a.date) >= now);
        const sortedAppointments = upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
        const nextAppointments = sortedAppointments.slice(0, 5);

        if (nextAppointments.length === 0) {
            container.innerHTML = '<div class="alert alert-secondary">No hay citas próximas.</div>';
            return;
        }

        let html = `
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Paciente</th> <!-- Nueva columna -->
                        <th>Motivo</th>
                    </tr>
                </thead>
                <tbody>
        `;

        nextAppointments.forEach(app => {
            const dateObj = new Date(app.date);
            // Buscar el nombre del paciente usando el ID
            const patientObj = patients.find(p => p.id === app.patient_id);
            const patientName = patientObj ? patientObj.name : 'Desconocido';

            html += `
                <tr>
                    <td>
                        ${dateObj.toLocaleDateString()} <br>
                        <small class="text-muted">${dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                    </td>
                    <td><b>${patientName}</b></td>
                    <td>${app.reason}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    })
    .catch(err => console.error(err));
}

function loadCriticalPatients() {
    const container = document.getElementById('critical-patients-container');
    
    // Obtener el ID del doctor desde sessionStorage
    const doctorId = parseInt(sessionStorage.getItem('doctorId'));
    
    if (!doctorId) {
        container.innerHTML = '<div class="alert alert-warning">No se pudo identificar al paciente.</div>';
        return;
    }

    fetch('/api/patients/all')
        .then(res => res.json())
        .then(patients => {
            container.innerHTML = '';

            // Filtrar pacientes que NO sean "Amigable" (Inestables o Peligrosos) Y que pertenezcan al doctor actual
            const criticalPatients = patients.filter(p => 
                p.status !== 'Amigable' && p.doctor === doctorId
            );

            if (criticalPatients.length === 0) {
                container.innerHTML = '<div class="alert alert-success">Todos tus pacientes están estables.</div>';
                return;
            }

            criticalPatients.forEach(p => {
                const badgeColor = p.status === 'Peligroso' ? 'danger' : 'warning';
                
                const item = document.createElement('li');
                item.className = 'list-group-item d-flex justify-content-between align-items-center';
                item.innerHTML = `
                    <div>
                        <strong>${p.name}</strong>
                        <br>
                        <small class="text-muted">Hab: ${p.room_number}</small>
                    </div>
                    <span class="badge bg-${badgeColor} rounded-pill">${p.status}</span>
                `;
                container.appendChild(item);
            });
        })
        .catch(err => console.error(err));
}