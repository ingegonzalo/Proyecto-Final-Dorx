document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    const modal = new bootstrap.Modal(document.getElementById('addEventModal'));
    const form = document.getElementById('eventForm');
    const eventDateInput = document.getElementById('eventDate');
    let selectedDate = null;

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
            fetch('/api/appointments/all')
                .then(response => response.json())
                .then(data => {
                    // Mapeamos los datos de tu BD al formato de FullCalendar
                    const events = data.map(app => ({
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
            
            const confirmDelete = confirm(`¿Eliminar la cita: "${info.event.title}"?`);
            
            if (confirmDelete) {
                fetch(`/api/appointments/${info.event.id}`, {
                    method: 'DELETE'
                })
                .then(res => {
                    if (res.ok) {
                        info.event.remove(); // Quitar del calendario visualmente
                        alert('Cita eliminada correctamente');
                    } else {
                        alert('Error al eliminar la cita');
                    }
                })
                .catch(err => console.error(err));
            }
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
        const name = document.getElementById('patientName').value.trim();
        const date = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value;
        const reasonInput = document.getElementById('eventReason').value.trim();

        if (name && date && time) {
            // Construimos el objeto para el Backend
            // NOTA: Para el prototipo, usaremos IDs fijos (1) para doctor y paciente
            // ya que el formulario HTML actual no tiene selectores de IDs.
            // Concatenamos el nombre del paciente en la "razón" para verlo en el calendario.
            const newAppointment = {
                patient_id: 1, // ID existente en tu patients.json
                doctor_id: 1,  // ID existente en tu doctors.json
                date: `${date}T${time}`,
                reason: `${name} - ${reasonInput}` 
            };

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