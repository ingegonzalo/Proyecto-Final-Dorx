document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('all-patients-container') || document.getElementById('all-meds-container');
    let medsList = [];

    const addModalEl = document.getElementById('addMedModal');
    let addModal = null;
    if (addModalEl) {
        addModal = new bootstrap.Modal(addModalEl);
    }
    
    const addMedBtn = document.getElementById('addMedBtn');
    const saveAddMedBtn = document.getElementById('saveAddMed');

    function loadMeds() {
        if (!container) return; 

        fetch('/api/meds/all')
            .then(response => response.json())
            .then(meds => {
                medsList = meds; 
                container.innerHTML = '';
                
                meds.forEach(med => {
                    console.log('MED LOADED ->', med);

                    const row = document.createElement('div');
                    row.className = 'alert alert-info mb-1 py-2';
                    
                    let badgeColor = 'primary';
                    if (med.inventory < 50) badgeColor = 'danger';
                    else if (med.inventory < 100) badgeColor = 'warning';
                    else badgeColor = 'success';

                    const durationValue = med.duration || 'Indefinido';
                    const frequencyValue = med.frequency || 'N/A';

                    row.innerHTML = `
                        <div class="meds-row">
                            <div class="meds-cell checkbox-cell cell-checkbox">
                                <input type="checkbox" class="form-check-input">
                            </div>

                            <div class="meds-cell cell-name"><p class="patient-name mb-0">${med.name}</p></div>

                            <div class="meds-cell cell-id"><p class="patient-id mb-0">${med.id}</p></div>

                            <div class="meds-cell cell-frequency"><small>${frequencyValue}</small></div>

                            <div class="meds-cell cell-dosage"><span class="badge rounded-pill bg-secondary">${med.dosage || 'N/A'}</span></div>

                            <div class="meds-cell cell-duration"><small><b>${durationValue}</b></small></div>

                            <div class="meds-cell cell-stock"><span class="badge rounded-pill bg-${badgeColor}">${med.inventory} u.</span></div>

                            <div class="meds-cell cell-actions actions-cell">
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

    if (addMedBtn && addModal) {
        addMedBtn.addEventListener('click', () => {
            const form = document.getElementById('addMedForm');
            if(form) form.reset();
            addModal.show();
        });
    }

    if (saveAddMedBtn) {
        saveAddMedBtn.addEventListener('click', () => {
            const name = document.getElementById('addMedName').value;
            const dosage = document.getElementById('addMedDosage').value;
            const duration = document.getElementById('addMedDuration').value; 
            const frequency = document.getElementById('addMedFrequency').value;
            const inventory = parseInt(document.getElementById('addMedStock').value);
            const riesgo = document.getElementById('addMedRiesgo').value;

            if(!name || !dosage || !frequency || isNaN(inventory)) {
                alert("Por favor completa los campos obligatorios");
                return;
            }

            const newMed = { name, dosage, frequency, inventory, riesgo, duration };

            fetch('/api/meds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMed)
            })
            .then(res => {
                if(res.ok) {
                    addModal.hide();
                    loadMeds(); 
                } else {
                    res.json().then(d => alert(d.error || "Error al guardar"));
                }
            })
            .catch(err => console.error(err));
        });
    }

    window.editMed = function(id) {
        const currentMed = medsList.find(m => m.id === id);
        if (!currentMed) return;

        const newName = prompt("Editar Nombre del Medicamento:", currentMed.name);
        if (newName === null) return;

        const newDosage = prompt("Editar Dosis (ej: 500mg):", currentMed.dosage);
        if (newDosage === null) return;

        const newDuration = prompt("Editar Duración (ej: 7 días, 20 tomas):", currentMed.duration);
        if (newDuration === null) return;

        let newInventory = prompt("Editar Stock (Cantidad):", currentMed.inventory);
        if (newInventory === null) return;
        
        newInventory = parseInt(newInventory);
        if (isNaN(newInventory) || newInventory < 0) {
            alert("El stock debe ser un número válido mayor o igual a 0");
            return;
        }

        const updatedData = { name: newName, dosage: newDosage, duration: newDuration, inventory: newInventory };

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

    window.deleteMed = function(id) {
        if(confirm('¿Estás seguro de eliminar este medicamento del inventario?')) {
            fetch(`/api/meds/${id}`, { method: 'DELETE' })
                .then(res => {
                    if(res.ok) {
                        loadMeds();
                    } else {
                        res.json().then(data => alert(data.error || 'Error al eliminar'));
                    }
                })
                .catch(error => console.error('Error de red:', error));
        }
    };

    loadMeds();
});