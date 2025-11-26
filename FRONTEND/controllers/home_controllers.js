document.addEventListener('DOMContentLoaded', () => {
    loadUpcomingAppointments();
    loadCriticalPatients();
});

function loadUpcomingAppointments() {
    const container = document.getElementById('upcoming-appointments-container');
    
    // Obtener el ID del doctor desde sessionStorage
    const doctorId = parseInt(sessionStorage.getItem('doctorId'));
    
    if (!doctorId) {
        container.innerHTML = '<div class="alert alert-warning">No se pudo identificar al doctor.</div>';
        return;
    }
    
    fetch('/api/appointments/all')
        .then(res => res.json())
        .then(appointments => {
            container.innerHTML = '';
            
            // 1. Filtrar solo citas del doctor actual
            const doctorAppointments = appointments.filter(a => a.doctor_id === doctorId);
            
            // 2. Filtrar solo citas futuras (desde hoy en adelante)
            const now = new Date();
            // Restamos 1 día para incluir las de hoy aunque ya haya pasado la hora exacta
            now.setDate(now.getDate() - 1); 
            
            const upcoming = doctorAppointments.filter(a => new Date(a.date) >= now);

            // 3. Ordenar por fecha (la más cercana primero)
            const sortedAppointments = upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // 4. Tomar solo las próximas 5
            const nextAppointments = sortedAppointments.slice(0, 5);

            if (nextAppointments.length === 0) {
                container.innerHTML = '<div class="alert alert-secondary">No tienes citas próximas programadas.</div>';
                return;
            }

            // 5. Crear tabla dinámica
            let html = `
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Motivo</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            nextAppointments.forEach(app => {
                const dateObj = new Date(app.date);
                html += `
                    <tr>
                        <td>${dateObj.toLocaleDateString()}</td>
                        <td>${dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
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
        container.innerHTML = '<div class="alert alert-warning">No se pudo identificar al doctor.</div>';
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