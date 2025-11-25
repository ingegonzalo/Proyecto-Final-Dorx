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
        editable: true,
        droppable: true,
        expandRows: true,
        height: '100%',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        dateClick: function (info) {
            selectedDate = info.dateStr;
            eventDateInput.value = selectedDate;
            modal.show();
        },
        eventClick: function (info) {
            info.jsEvent.preventDefault();
            alert(`📅 Cita: ${info.event.title}\n🕒 Fecha: ${info.event.start.toLocaleString()}`);
        },
        // Eliminamos alerta al mover una cita
        eventDrop: function (info) {
            // La fecha se actualiza automáticamente; no mostramos alerta
        },
        events: [
            { title: 'Cita con Juan Pérez', start: '2025-11-12T09:00' },
            { title: 'Cita con Ana López', start: '2025-11-13T11:30' }
        ]
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('patientName').value.trim();
        const date = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value;
        const reason = document.getElementById('eventReason').value.trim();

        if (name && date && time) {
            calendar.addEvent({
                title: `${name} - ${reason || 'Cita médica'}`,  
                start: `${date}T${time}`,
                allDay: false
            });
            modal.hide();
            form.reset();
        }
    });

    calendar.render();
});
