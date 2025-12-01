document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('all-patients-container') || document.getElementById('all-meds-container');
    let medsList = [];
    let currentEditId = null; // Para guardar el ID del medicamento que se está editando

    // Modal de Agregar
    const addModalEl = document.getElementById('addMedModal');
    let addModal = null;
    if (addModalEl) {
        addModal = new bootstrap.Modal(addModalEl);
    }

    // Modal de Editar
    const editModalEl = document.getElementById('editMedModal');
    let editModal = null;
    if (editModalEl) {
        editModal = new bootstrap.Modal(editModalEl);
    }

    // Modal de Eliminar
    const deleteModalEl = document.getElementById('deleteMedModal');
    let deleteModal = null;
    if (deleteModalEl) {
        deleteModal = new bootstrap.Modal(deleteModalEl);
    }
    
    const addMedBtn = document.getElementById('addMedBtn');
    const saveAddMedBtn = document.getElementById('saveAddMed');
    const saveEditMedBtn = document.getElementById('saveEditMed');
    const confirmDeleteMedBtn = document.getElementById('confirmDeleteMed');

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

        currentEditId = id; // Guardamos el ID para usarlo al guardar

        // Llenar los campos del modal con los datos actuales
        document.getElementById('editMedId').value = id;
        document.getElementById('editMedName').value = currentMed.name || '';
        document.getElementById('editMedDosage').value = currentMed.dosage || '';
        document.getElementById('editMedFrequency').value = currentMed.frequency || '';
        document.getElementById('editMedStock').value = currentMed.inventory || 0;
        document.getElementById('editMedRiesgo').value = currentMed.riesgo || 'Sano';

        // Mostrar el modal
        if (editModal) {
            editModal.show();
        }
    };

    // Guardar cambios del modal de edición
    if (saveEditMedBtn) {
        saveEditMedBtn.addEventListener('click', () => {
            const id = currentEditId;
            const name = document.getElementById('editMedName').value;
            const dosage = document.getElementById('editMedDosage').value;
            const frequency = document.getElementById('editMedFrequency').value;
            const inventory = parseInt(document.getElementById('editMedStock').value);
            const riesgo = document.getElementById('editMedRiesgo').value;

            if (!name || !dosage || !frequency || isNaN(inventory)) {
                alert("Por favor completa los campos obligatorios");
                return;
            }

            const updatedData = { name, dosage, frequency, inventory, riesgo };

            fetch(`/api/meds/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            })
            .then(res => {
                if (res.ok) {
                    editModal.hide();
                    loadMeds();
                } else {
                    res.json().then(data => alert(data.error || 'Error al actualizar'));
                }
            })
            .catch(err => console.error(err));
        });
    }

    window.deleteMed = function(id) {
        const currentMed = medsList.find(m => m.id === id);
        if (!currentMed) return;

        currentEditId = id; // Reutilizamos la variable para el ID a eliminar
        
        // Mostrar nombre del medicamento en el modal de confirmación
        const deleteNameEl = document.getElementById('deleteMedName');
        if (deleteNameEl) {
            deleteNameEl.textContent = `Medicamento: ${currentMed.name}`;
        }

        if (deleteModal) {
            deleteModal.show();
        }
    };

    // Confirmar eliminación desde el modal
    if (confirmDeleteMedBtn) {
        confirmDeleteMedBtn.addEventListener('click', () => {
            const id = currentEditId;

            fetch(`/api/meds/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (res.ok) {
                        deleteModal.hide();
                        loadMeds();
                    } else {
                        res.json().then(data => alert(data.error || 'Error al eliminar'));
                    }
                })
                .catch(error => console.error('Error de red:', error));
        });
    }

    loadMeds();
});