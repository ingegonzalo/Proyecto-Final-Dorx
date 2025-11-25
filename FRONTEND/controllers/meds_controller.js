document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('all-patients-container');
    let medsList = []; // Variable para guardar los datos actuales

    function loadMeds() {
        fetch('/api/meds/all')
            .then(response => response.json())
            .then(meds => {
                medsList = meds; // Guardamos referencia global
                container.innerHTML = '';
                
                meds.forEach(med => {
                    const row = document.createElement('div');
                    row.className = 'alert alert-info mb-1 py-2';
                    
                    // Determinamos color del badge según stock (visual)
                    let badgeColor = 'primary';
                    if (med.inventory < 50) badgeColor = 'danger';
                    else if (med.inventory < 100) badgeColor = 'warning';
                    else badgeColor = 'success';

                    row.innerHTML = `
                        <div class="meds-row">
                            <div class="meds-cell checkbox-cell">
                                <input type="checkbox" class="form-check-input">
                            </div>
                            <div class="meds-cell"><p class="patient-name mb-0">${med.name}</p></div>
                            <div class="meds-cell"><p class="patient-id mb-0">${med.id}</p></div>
                            <div class="meds-cell"><span class="badge rounded-pill bg-secondary">${med.dosage || 'N/A'}</span></div>
                            <div class="meds-cell"><span class="badge rounded-pill bg-${badgeColor}">${med.inventory} u.</span></div>
                            <div class="meds-cell actions-cell">
                                <button class="btn btn-primary btn-sm me-1" onclick="editMed(${med.id})"><i class="fa-solid fa-pen"></i></button>
                                <button class="btn btn-danger btn-sm" onclick="deleteMed(${med.id})"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    `;
                    container.appendChild(row);
                });
            })
            .catch(error => console.error('Error cargando medicamentos:', error));
    }

    // Función para editar Medicamento
    window.editMed = function(id) {
        const currentMed = medsList.find(m => m.id === id);
        if (!currentMed) return;

        // 1. Editar Nombre
        const newName = prompt("Editar Nombre del Medicamento:", currentMed.name);
        if (newName === null) return;

        // 2. Editar Dosis
        const newDosage = prompt("Editar Dosis (ej: 500mg):", currentMed.dosage);
        if (newDosage === null) return;

        // 3. Editar Inventario (Debe ser número)
        let newInventory = prompt("Editar Stock (Cantidad):", currentMed.inventory);
        if (newInventory === null) return;
        
        // Convertir a entero
        newInventory = parseInt(newInventory);
        if (isNaN(newInventory) || newInventory < 0) {
            alert("El stock debe ser un número válido mayor o igual a 0");
            return;
        }

        const updatedData = {
            name: newName,
            dosage: newDosage,
            inventory: newInventory
        };

        fetch(`/api/meds/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        })
        .then(res => {
            if(res.ok) {
                loadMeds();
            } else {
                res.json().then(data => alert(data.error || 'Error al actualizar'));
            }
        })
        .catch(err => console.error(err));
    };

    // Función para borrar Medicamento
    window.deleteMed = function(id) {
        if(confirm('¿Estás seguro de eliminar este medicamento del inventario?')) {
            fetch(`/api/meds/${id}`, { method: 'DELETE' })
                .then(res => {
                    if(res.ok) loadMeds();
                    else alert('Error al eliminar');
                });
        }
    };

    loadMeds();
});