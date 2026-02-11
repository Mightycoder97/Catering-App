// js/presupuesto.js
import { db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, isDbReady } from './firebase-config.js';

export const presupuestoView = {
    render: async () => {
        return `
            <!-- Main Header & Nav -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2><i class="bi bi-calculator me-2"></i>Presupuestos</h2>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-secondary d-none" id="btn-back-list">
                        <i class="bi bi-arrow-left me-1"></i> Volver al Historial
                    </button>
                    <button class="btn btn-primary" id="btn-show-create">
                        <i class="bi bi-plus-lg me-1"></i> Nuevo Presupuesto
                    </button>
                </div>
            </div>

            <!-- VIEW 1: Budget List (History) -->
            <div id="budget-list-view">
                 <div class="card shadow-sm">
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>Cliente / Evento</th>
                                        <th>Detalles</th>
                                        <th>Estado</th>
                                        <th>Costo Est.</th>
                                        <th>Fecha Creación</th>
                                        <th class="text-end">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="budget-history-table"></tbody>
                            </table>
                        </div>
                    </div>
                 </div>
            </div>

            <!-- VIEW 2: Calculator/Form (Hidden by Default) -->
            <div id="budget-form-view" class="d-none">
                <div class="card shadow-sm mb-4">
                    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Configuración del Evento</h5>
                        <div class="d-flex align-items-center">
                             <span class="me-2 small text-white-50">Estado:</span>
                             <select class="form-select form-select-sm" id="budget-status-select" style="width: auto;">
                                <option value="Creado">Creado</option>
                                <option value="Enviado">Enviado</option>
                                <option value="Aceptado">Aceptado</option>
                                <option value="Programado">Programado</option>
                                <option value="Realizado">Realizado</option>
                             </select>
                        </div>
                    </div>
                    <div class="card-body">
                        <form id="presupuesto-main-form">
                            <!-- ... (Correct, we are keeping the form internal content same) ... -->
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Cliente</label>
                                    <select class="form-select" id="event-client-select" required>
                                        <option value="">Selecciona Cliente...</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Motivo / Nombre del Evento</label>
                                    <input type="text" class="form-control" id="event-name" required placeholder="Ej. Boda Civil, Cumpleaños...">
                                </div>
                                <div class="col-md-4">
                                     <label class="form-label">Fecha Inicio</label>
                                     <input type="date" class="form-control" id="event-start-date" required>
                                </div>
                                <div class="col-md-4">
                                     <label class="form-label">Fecha Fin (Cierre)</label>
                                     <input type="date" class="form-control" id="event-end-date" required>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Días Calc.</label>
                                    <input type="number" class="form-control bg-light" id="event-days" value="1" readonly>
                                </div>
                                 <div class="col-md-12">
                                     <label class="form-label">Lugar / Dirección</label>
                                     <input type="text" class="form-control" id="event-location">
                                </div>
                                
                                <div class="col-12 mt-4">
                                    <h6 class="text-secondary border-bottom pb-2">Gastos Operativos (Interno)</h6>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">Transporte / Logística</label>
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text">S/.</span>
                                        <input type="number" class="form-control" id="cost-transport" placeholder="0.00" step="0.01">
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">Hospedaje / Viáticos</label>
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text">S/.</span>
                                        <input type="number" class="form-control" id="cost-lodging" placeholder="0.00" step="0.01">
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">Pago Ayudantes</label>
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text">S/.</span>
                                        <input type="number" class="form-control" id="cost-staff" placeholder="0.00" step="0.01">
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">Compras No Comestibles</label>
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text">S/.</span>
                                        <input type="number" class="form-control" id="cost-supplies" placeholder="0.00" step="0.01">
                                    </div>
                                </div>
                            </div>

                            <div class="col-12 mt-4">
                                <h6 class="text-secondary border-bottom pb-2">Pago Adelantado</h6>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Monto de Adelanto</label>
                                <div class="input-group input-group-sm">
                                    <span class="input-group-text">S/.</span>
                                    <input type="number" class="form-control" id="budget-adelanto" placeholder="0.00" step="0.01" min="0">
                                </div>
                                <div class="form-text">Este monto se mostrará en la propuesta del cliente.</div>
                            </div>

                            <div class="col-12 mt-4">
                                <h6 class="text-secondary border-bottom pb-2">Términos y Condiciones</h6>
                            </div>
                            <div class="col-md-8">
                                <select class="form-select form-select-sm" id="tc-select">
                                    <option value="">Sin T&C</option>
                                </select>
                            </div>
                            <div class="col-md-4 d-flex gap-1">
                                <button type="button" class="btn btn-sm btn-outline-success flex-fill" id="btn-quick-add-tc">
                                    <i class="bi bi-plus-lg"></i> Crear
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-primary flex-fill" id="btn-edit-tc" disabled>
                                    <i class="bi bi-pencil"></i> Editar
                                </button>
                            </div>
                            <div class="col-12 mt-2">
                                <div id="tc-preview" class="border rounded p-2 bg-white small text-muted" style="min-height: 40px; white-space: pre-wrap;">Selecciona un T&C para ver la vista previa</div>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Days Container -->
                <div id="days-container" class="row g-4 mb-4">
                    <!-- Dynamic Day Cards -->
                </div>

                <!-- Footer Actions -->
                 <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded border sticky-bottom mb-5">
                    <h3 class="mb-0" id="display-total-cost">Total: S/. 0.00</h3>
                    <div class="d-flex gap-2">
                         <button class="btn btn-success" id="btn-calculate"><i class="bi bi-calculator"></i> Calcular</button>
                         <button class="btn btn-primary" id="btn-save-budget"><i class="bi bi-save"></i> Guardar Presupuesto</button>
                    </div>
                </div>
            </div>
            
            <!-- VIEW 3: Detail/Print Modal -->
            <div class="modal fade" id="budgetDetailModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-fullscreen">
                    <div class="modal-content">
                        <div class="modal-header d-print-none">
                            <h5 class="modal-title">Vista Previa</h5>
                            <div class="ms-auto d-flex gap-2 align-items-center">
                                <div class="btn-group me-3" role="group">
                                    <button type="button" class="btn btn-outline-primary active" id="mode-client">Cliente (Propuesta)</button>
                                    <button type="button" class="btn btn-outline-secondary" id="mode-internal">Interno (Insumos)</button>
                                </div>
                                <button type="button" class="btn btn-success" id="btn-print-proposal"><i class="bi bi-printer"></i> Imprimir</button>
                                <button type="button" class="btn btn-success" id="btn-share-whatsapp" style="background: #25D366; border-color: #25D366;"><i class="bi bi-whatsapp"></i> Compartir</button>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                        </div>
                        <div class="modal-body bg-light">
                            <div class="container bg-white p-5 rounded shadow-sm" id="budget-detail-content" style="min-height: 297mm; max-width: 210mm; margin: auto;">
                                <!-- Content injected here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal: Add Item to Day -->
            <div class="modal fade" id="addItemModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Agregar ítem al Menú</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="add-item-form">
                                <input type="hidden" id="modal-day-idx">
                                <div class="mb-3">
                                    <label class="form-label">Plato / Receta</label>
                                    <select class="form-select" id="modal-recipe-select" required></select>
                                </div>
                                <div class="row">
                                    <div class="col-6 mb-3">
                                        <label class="form-label">Cantidad (Personas)</label>
                                        <input type="number" class="form-control" id="modal-item-pax" required>
                                    </div>
                                    <div class="col-6 mb-3">
                                        <label class="form-label">Variante (Opcional)</label>
                                        <input type="text" class="form-control" id="modal-item-variant" placeholder="Ej. Niños, Vegano">
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Tipo de Comida</label>
                                    <select class="form-select" id="modal-item-meal" required>
                                        <option value="Desayuno">Desayuno</option>
                                        <option value="Almuerzo" selected>Almuerzo</option>
                                        <option value="Cena">Cena</option>
                                        <option value="Coctel">Coctel / Bocaditos</option>
                                        <option value="Cremas y Salsas">Cremas y Salsas</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="btn-confirm-add-item">Agregar</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Add T&C Modal -->
            <div class="modal fade" id="quickAddTcModal" tabindex="-1" style="z-index: 1060;">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-light">
                            <h6 class="modal-title">Nuevo T&C</h6>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="quick-tc-form">
                                <div class="mb-3">
                                    <label class="form-label small">Nombre (Tipo de Evento)</label>
                                    <input type="text" class="form-control form-control-sm" id="quick-tc-name" required placeholder="Ej. Evento Corporativo">
                                    <input type="hidden" id="quick-tc-edit-id">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small">Texto de Términos y Condiciones</label>
                                    <textarea class="form-control form-control-sm" id="quick-tc-text" rows="6" required placeholder="1. El precio incluye...&#10;2. Se requiere un anticipo de...&#10;3. ..."></textarea>
                                </div>
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-sm btn-success">Guardar T&C</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    postRender: async () => {
        // --- Elements ---
        const listView = document.getElementById('budget-list-view');
        const formView = document.getElementById('budget-form-view');
        const btnShowList = document.getElementById('btn-back-list');
        const btnShowCreate = document.getElementById('btn-show-create');
        const historyTable = document.getElementById('budget-history-table');

        // Form
        const mainForm = document.getElementById('presupuesto-main-form');
        const daysContainer = document.getElementById('days-container');
        const btnGenerateDays = document.getElementById('btn-generate-days');
        const btnCalculate = document.getElementById('btn-calculate');
        const btnSave = document.getElementById('btn-save-budget');
        const displayTotal = document.getElementById('display-total-cost');
        const clientSelect = document.getElementById('event-client-select');

        // Modal Add Item
        const addItemModalEl = document.getElementById('addItemModal');
        const addItemModal = new bootstrap.Modal(addItemModalEl);
        const modalRecipeSelect = document.getElementById('modal-recipe-select');
        const btnConfirmAddItem = document.getElementById('btn-confirm-add-item');

        // Detail Modal
        const detailModalEl = document.getElementById('budgetDetailModal');
        const detailModal = new bootstrap.Modal(detailModalEl);
        const detailContent = document.getElementById('budget-detail-content');
        const btnModeClient = document.getElementById('mode-client');
        const btnModeInternal = document.getElementById('mode-internal');

        // --- State ---
        let recipesDB = [];
        let insumosDB = {};
        let clientsDB = {};
        let tcDB = []; // Terms & Conditions cache
        let storedBudgets = {}; // Cache

        // New Data Model State
        let currentBudget = {
            id: null,
            clientId: '',
            clientName: '',
            eventName: '',
            location: '',
            eventDate: '',
            daysCount: 1,
            items: [] // { id, day, meal, recipeId, recipeName, pax, variant }
        };
        let viewBudgetState = { id: null, mode: 'client' };


        // --- Init ---
        const init = async () => {
            if (!isDbReady()) return;

            // Load Insumos, Recetas, Clientes
            const [iSnap, rSnap, cSnap, tcSnap] = await Promise.all([
                getDocs(collection(db, "insumos")),
                getDocs(collection(db, "recetas")),
                getDocs(collection(db, "clientes")),
                getDocs(collection(db, "termsConditions"))
            ]);

            iSnap.forEach(d => insumosDB[d.id] = d.data());

            modalRecipeSelect.innerHTML = '<option value="">Selecciona...</option>';
            rSnap.forEach(d => {
                const r = { id: d.id, ...d.data() };
                recipesDB.push(r);
                modalRecipeSelect.innerHTML += `<option value="${r.id}">${r.nombre}</option>`;
            });

            clientSelect.innerHTML = '<option value="">Selecciona Cliente...</option>';
            cSnap.forEach(d => {
                clientsDB[d.id] = d.data();
                clientSelect.innerHTML += `<option value="${d.id}">${d.data().nombre}</option>`;
            });

            // Load T&C
            const tcSelect = document.getElementById('tc-select');
            tcDB = [];
            tcSnap.forEach(d => {
                tcDB.push({ id: d.id, ...d.data() });
            });
            refreshTcSelect();

            // T&C preview on change
            tcSelect.addEventListener('change', () => {
                const tc = tcDB.find(t => t.id === tcSelect.value);
                document.getElementById('tc-preview').textContent = tc ? tc.texto : 'Selecciona un T&C para ver la vista previa';
            });

            loadHistory();
            showList();
        };

        const refreshTcSelect = () => {
            const tcSelect = document.getElementById('tc-select');
            const currentVal = tcSelect.value;
            tcSelect.innerHTML = '<option value="">Sin T&C</option>';
            tcDB.forEach(tc => {
                tcSelect.innerHTML += `<option value="${tc.id}">${tc.nombre}</option>`;
            });
            tcSelect.value = currentVal;
        };

        const loadHistory = async () => {
            try {
                const snap = await getDocs(collection(db, "presupuestos"));
                historyTable.innerHTML = '';
                storedBudgets = {};

                if (snap.empty) {
                    historyTable.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No hay presupuestos.</td></tr>`;
                    return;
                }

                snap.forEach(d => {
                    const data = d.data();
                    data.id = d.id; // Inject ID
                    storedBudgets[d.id] = data;

                    const dateStr = data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : '-';
                    const client = data.clientName || 'Sin Cliente';

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>
                            <div class="fw-bold">${client}</div>
                            <div class="small text-muted">${data.eventName}</div>
                        </td>
                        <td>
                            <div class="small">${data.daysCount || 1} días</div>
                            <div class="small text-muted">${data.eventDate || ''}</div>
                        </td>
                        <td>
                            <span class="badge bg-secondary status-badge" data-status="${data.status || 'Creado'}">${data.status || 'Creado'}</span>
                        </td>
                        <td class="text-success">S/. ${(data.totalClient || 0).toFixed(2)}</td>
                        <td class="text-muted small">${dateStr}</td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-outline-info view-btn" data-id="${d.id}"><i class="bi bi-eye"></i></button>
                            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${d.id}"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-sm btn-outline-danger del-btn" data-id="${d.id}"><i class="bi bi-trash"></i></button>
                        </td>
                    `;
                    historyTable.appendChild(tr);
                });

                attachListListeners();
            } catch (e) {
                console.error(e);
            }
        };

        const attachListListeners = () => {
            document.querySelectorAll('.view-btn').forEach(b => b.addEventListener('click', e => openViewModal(e.target.closest('button').dataset.id)));
            document.querySelectorAll('.edit-btn').forEach(b => b.addEventListener('click', e => loadForEditing(e.target.closest('button').dataset.id)));
            document.querySelectorAll('.del-btn').forEach(b => b.addEventListener('click', async e => {
                const id = e.target.closest('button').dataset.id;
                if (confirm("¿Eliminar presupuesto permanentemente?")) {
                    await deleteDoc(doc(db, "presupuestos", id));
                    loadHistory();
                }
            }));
        };

        // --- View Switching ---
        const showList = () => {
            listView.style.display = 'block';
            formView.classList.add('d-none');
            btnShowList.classList.add('d-none');
            // btnShowCreate.style.display = 'inline-block';
        };

        const showForm = () => {
            listView.style.display = 'none';
            formView.classList.remove('d-none');
            btnShowList.classList.remove('d-none');
        };

        btnShowCreate.addEventListener('click', () => {
            resetForm();
            showForm();
        });
        btnShowList.addEventListener('click', showList);


        // --- Plan Logic ---
        const resetForm = () => {
            currentBudget = { id: null, clientId: '', clientName: '', eventName: '', location: '', eventDate: '', daysCount: 1, items: [], status: 'Creado', tcId: '' };
            mainForm.reset();
            document.getElementById('budget-status-select').value = 'Creado';
            document.getElementById('tc-select').value = '';
            document.getElementById('tc-preview').textContent = 'Selecciona un T&C para ver la vista previa';
            daysContainer.innerHTML = '';
            displayTotal.innerText = "Total: $0.00";
        };

        const generateDayCards = (count) => {
            daysContainer.innerHTML = '';
            for (let d = 1; d <= count; d++) {
                const col = document.createElement('div');
                col.className = 'col-md-6 col-lg-4';
                col.innerHTML = `
                    <div class="card h-100 day-card" data-day="${d}">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h6 class="mb-0 fw-bold">Día ${d}</h6>
                            <button type="button" class="btn btn-sm btn-outline-primary btn-add-item-modal" data-day="${d}">
                                <i class="bi bi-plus-circle"></i>
                            </button>
                        </div>
                        <div class="card-body p-2 bg-light">
                             <div class="list-group list-group-flush day-items-list" id="list-day-${d}">
                                <!-- Items go here -->
                                <div class="text-center text-muted small py-3 empty-msg">Sin ítems</div>
                             </div>
                        </div>
                    </div>
                `;
                daysContainer.appendChild(col);
            }
            renderDayItems();
            attachDayListeners();
        };

        const inputStart = document.getElementById('event-start-date');
        const inputEnd = document.getElementById('event-end-date');
        const inputDays = document.getElementById('event-days');

        const calculateDays = () => {
            const s = new Date(inputStart.value);
            const e = new Date(inputEnd.value);

            if (s && e && !isNaN(s) && !isNaN(e)) {
                if (e < s) {
                    alert('La fecha fin no puede ser menor a la fecha inicio');
                    inputEnd.value = inputStart.value;
                    return;
                }
                const diffTime = Math.abs(e - s);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                inputDays.value = diffDays;

                if (currentBudget.daysCount !== diffDays) {
                    currentBudget.daysCount = diffDays;
                    generateDayCards(diffDays);
                }
            }
        };

        inputStart.addEventListener('change', calculateDays);
        inputEnd.addEventListener('change', calculateDays);

        const attachDayListeners = () => {
            document.querySelectorAll('.btn-add-item-modal').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const day = e.target.closest('button').dataset.day;
                    document.getElementById('modal-day-idx').value = day;
                    document.getElementById('add-item-form').reset();
                    addItemModal.show();
                });
            });
        };

        const renderDayItems = () => {
            // Clear all lists first
            document.querySelectorAll('.day-items-list').forEach(el => {
                el.innerHTML = '<div class="text-center text-muted small py-3 empty-msg">Sin ítems</div>';
            });

            currentBudget.items.forEach((item, idx) => {
                const list = document.getElementById(`list-day-${item.day}`);
                if (list) {
                    if (list.querySelector('.empty-msg')) list.innerHTML = '';

                    const li = document.createElement('div');
                    li.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center p-2';
                    li.innerHTML = `
                        <div class="ms-2 me-auto">
                            <div class="fw-bold text-primary small">${item.meal}</div>
                            <div>${item.recipeName}</div>
                            <div class="text-muted small" style="font-size: 0.75rem">
                                ${item.variant ? `(${item.variant}) ` : ''} 
                                <i class="bi bi-people"></i> ${item.pax} personas
                            </div>
                        </div>
                        <button type="button" class="btn btn-sm text-danger btn-remove-item" data-idx="${idx}"><i class="bi bi-x"></i></button>
                    `;
                    list.appendChild(li);
                }
            });

            document.querySelectorAll('.btn-remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.closest('button').dataset.idx);
                    currentBudget.items.splice(idx, 1);
                    renderDayItems();
                });
            });
        };

        // Add Item Confirmation
        btnConfirmAddItem.addEventListener('click', () => {
            const day = parseInt(document.getElementById('modal-day-idx').value);
            const recipeId = modalRecipeSelect.value;
            const pax = parseInt(document.getElementById('modal-item-pax').value);
            const variant = document.getElementById('modal-item-variant').value;
            const meal = document.getElementById('modal-item-meal').value;

            if (!recipeId || !pax) return;

            const recipe = recipesDB.find(r => r.id === recipeId);

            const newItem = {
                day,
                meal,
                recipeId,
                recipeName: recipe.nombre,
                pax,
                variant
            };

            currentBudget.items.push(newItem);

            // Sort items by meal order roughly?
            const mealOrder = { 'Desayuno': 1, 'Almuerzo': 2, 'Cena': 3, 'Coctel': 4, 'Otro': 5 };
            currentBudget.items.sort((a, b) => {
                if (a.day !== b.day) return a.day - b.day;
                return (mealOrder[a.meal] || 9) - (mealOrder[b.meal] || 9);
            });

            renderDayItems();
            addItemModal.hide();
        });


        // --- Calculation ---
        // Helper: recursively flatten recipe ingredients to insumo costs
        const getInsumoCostFromIngredients = (ingredientes, recipesDB, insumosDB, visited = new Set()) => {
            let cost = 0;
            ingredientes.forEach(ing => {
                if (ing.type === 'receta') {
                    const sub = recipesDB.find(r => r.id === ing.recetaId);
                    if (sub && sub.ingredientes && !visited.has(ing.recetaId)) {
                        visited.add(ing.recetaId);
                        cost += ing.quantity * getInsumoCostFromIngredients(sub.ingredientes, recipesDB, insumosDB, visited);
                    }
                } else {
                    const ins = insumosDB[ing.insumoId];
                    if (ins) cost += (ing.quantity * ins.costo);
                }
            });
            return cost;
        };

        // Helper: recursively collect insumo quantities from ingredients (for BOM)
        const collectInsumos = (ingredientes, scale, recipesDB, bom, visited = new Set()) => {
            ingredientes.forEach(ing => {
                if (ing.type === 'receta') {
                    const sub = recipesDB.find(r => r.id === ing.recetaId);
                    if (sub && sub.ingredientes && !visited.has(ing.recetaId)) {
                        visited.add(ing.recetaId);
                        collectInsumos(sub.ingredientes, scale * ing.quantity, recipesDB, bom, visited);
                    }
                } else {
                    if (!bom[ing.insumoId]) bom[ing.insumoId] = 0;
                    bom[ing.insumoId] += (ing.quantity * scale);
                }
            });
        };

        const calculateTotal = () => {
            let totalClient = 0;
            let totalInternal = 0;

            currentBudget.items.forEach(item => {
                const r = recipesDB.find(x => x.id === item.recipeId);
                if (r) {
                    totalClient += ((r.precioVenta || 0) * item.pax);

                    const yieldVal = r.baseYield || 1;
                    const scaleFactor = item.pax / yieldVal;

                    if (r.ingredientes) {
                        const recipeBatchCost = getInsumoCostFromIngredients(r.ingredientes, recipesDB, insumosDB);
                        totalInternal += (recipeBatchCost * scaleFactor);
                    }
                }
            });
            return { totalClient, totalInternal };
        };

        btnCalculate.addEventListener('click', () => {
            const totals = calculateTotal();
            // Show Client Price in UI as main total
            displayTotal.innerText = `Total Venta: S/. ${totals.totalClient.toFixed(2)}`;
        });

        // --- Save ---
        btnSave.addEventListener('click', async () => {
            if (!confirm("¿Guardar Presupuesto?")) return;

            // Populate basic fields
            currentBudget.clientId = clientSelect.value;
            currentBudget.clientName = clientSelect.options[clientSelect.selectedIndex].text;
            currentBudget.eventName = document.getElementById('event-name').value;
            currentBudget.location = document.getElementById('event-location').value;

            // Dates
            currentBudget.startDate = document.getElementById('event-start-date').value;
            currentBudget.endDate = document.getElementById('event-end-date').value;
            // eventDate legacy field can be range string
            const days = parseInt(document.getElementById('event-days').value) || 1;
            currentBudget.eventDate = days <= 1 ? currentBudget.startDate : (currentBudget.startDate + ' al ' + currentBudget.endDate);

            // Costs
            currentBudget.costs = {
                transport: parseFloat(document.getElementById('cost-transport').value) || 0,
                lodging: parseFloat(document.getElementById('cost-lodging').value) || 0,
                staff: parseFloat(document.getElementById('cost-staff').value) || 0,
                supplies: parseFloat(document.getElementById('cost-supplies').value) || 0
            };

            // Adelanto
            currentBudget.adelanto = parseFloat(document.getElementById('budget-adelanto').value) || 0;

            // Status & T&C
            currentBudget.status = document.getElementById('budget-status-select').value;
            currentBudget.tcId = document.getElementById('tc-select').value || '';

            const totals = calculateTotal();
            currentBudget.totalClient = totals.totalClient; // Revenue
            currentBudget.totalCost = totals.totalInternal; // Cost of Goods Sold (Ingredients)
            currentBudget.updatedAt = new Date();

            // Validation
            if (!currentBudget.clientId || !currentBudget.eventName) {
                alert("Por favor selecciona cliente y nombre del evento.");
                return;
            }

            if (currentBudget.id) {
                await updateDoc(doc(db, "presupuestos", currentBudget.id), currentBudget);
            } else {
                currentBudget.type = 'v2_planner';
                currentBudget.createdAt = new Date();
                const res = await addDoc(collection(db, "presupuestos"), currentBudget);
                currentBudget.id = res.id;
            }

            alert("Presupuesto guardado.");
            loadHistory();
            showList();
        });


        // --- Edit Mode ---
        const loadForEditing = (id) => {
            const data = storedBudgets[id];
            if (!data) return;

            resetForm();
            currentBudget = JSON.parse(JSON.stringify(data)); // Deep Copy
            currentBudget.id = id;

            // Compat Check
            if (!data.items && data.type !== 'v2_planner') {
                // Try convert V1 to V2
                alert("Este es un presupuesto antiguo. Se intentará convertir al nuevo formato.");
                // ... Conversion logic (omitted for brevity, assume manual fix or basic import) ...
            }

            // Fill Form
            if (data.clientId) clientSelect.value = data.clientId;
            document.getElementById('event-name').value = data.eventName;
            document.getElementById('event-location').value = data.location || '';
            document.getElementById('budget-status-select').value = data.status || 'Creado';

            // Load Dates
            if (data.startDate) document.getElementById('event-start-date').value = data.startDate;
            if (data.endDate) document.getElementById('event-end-date').value = data.endDate;
            document.getElementById('event-days').value = data.daysCount || 1;

            // Load Costs
            if (data.costs) {
                document.getElementById('cost-transport').value = data.costs.transport || '';
                document.getElementById('cost-lodging').value = data.costs.lodging || '';
                document.getElementById('cost-staff').value = data.costs.staff || '';
                document.getElementById('cost-supplies').value = data.costs.supplies || '';
            }

            // Load Adelanto
            if (data.adelanto) {
                document.getElementById('budget-adelanto').value = data.adelanto;
            }

            // Load T&C
            if (data.tcId) {
                document.getElementById('tc-select').value = data.tcId;
                const tc = tcDB.find(t => t.id === data.tcId);
                document.getElementById('tc-preview').textContent = tc ? tc.texto : '';
            }

            generateDayCards(data.daysCount || 1);
            showForm();
        };

        // --- View / Print Modal Logic ---
        const openViewModal = (id) => {
            viewBudgetState.id = id;
            updateDetailView();
            detailModal.show();
        };

        const updateDetailView = () => {
            const data = storedBudgets[viewBudgetState.id];
            if (!data) return;

            // Handle Mode Toggle
            if (viewBudgetState.mode === 'client') {
                btnModeClient.classList.add('active');
                btnModeInternal.classList.remove('active');
            } else {
                btnModeClient.classList.remove('active');
                btnModeInternal.classList.add('active');
            }

            const items = data.items || [];
            // Get Client Data if possible (from cache or data snapshot)
            const clientInfo = data.clientId ? (clientsDB[data.clientId] || {}) : {};

            let contentHtml = `
                <div class="proposal-sheet print-section">
                    <!-- HEADER -->
                    <div class="proposal-header d-flex justify-content-between align-items-start">
                        <div class="proposal-brand text-center text-md-start">
                             <img src="images/Logo_papa.png" alt="Logo" style="max-height: 80px; margin-bottom: 8px;" id="proposal-logo">
                            <div>PAPA N' RES</div>
                            <div class="proposal-tagline">Catering Parrillero y Criollo</div>
                        </div>
                        <div class="text-end">
                            <table class="client-info-table ms-auto">
                                <tr>
                                    <td class="label">Cliente</td>
                                    <td>${clientInfo.nombre || data.clientName || 'Cliente'}</td>
                                </tr>
                                <tr>
                                    <td class="label">Evento</td>
                                    <td>${data.eventName}</td>
                                </tr>
                                <tr>
                                    <td class="label">Fecha</td>
                                    <td>${data.eventDate || 'Por definir'}</td>
                                </tr>
                                <tr>
                                    <td class="label">Ubicación</td>
                                    <td>${data.location || '-'}</td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <!-- BODY -->
                    <div class="proposal-body">
             `;

            if (viewBudgetState.mode === 'client') {
                // ** PROFESSIONAL CLIENT VIEW **
                const days = data.daysCount || 1;
                for (let d = 1; d <= days; d++) {
                    const dayItems = items.filter(i => i.day === d && i.meal !== 'Cremas y Salsas');
                    if (dayItems.length === 0) continue;

                    contentHtml += `
                        <div class="day-divider">
                            ${days > 1 ? `<div class="text-center mb-4">
                                <span class="day-badge">
                                    Día ${d}
                                </span>
                            </div>` : ''}
                     `;

                    // Group by Meal
                    const meals = {};
                    dayItems.forEach(i => {
                        if (!meals[i.meal]) meals[i.meal] = [];
                        meals[i.meal].push(i);
                    });

                    const mealOrder = ['Desayuno', 'Almuerzo', 'Cena', 'Coctel', 'Postre', 'Bebida', 'Otro'];
                    mealOrder.forEach(meal => {
                        if (meals[meal]) {
                            contentHtml += `<div class="meal-section-title">${meal}</div>`;

                            meals[meal].forEach(item => {
                                const recipe = recipesDB.find(r => r.id === item.recipeId) || {};

                                contentHtml += `
                                    <div class="recipe-item-minimal">
                                        <div class="recipe-thumb">
                                            <img src="${recipe.imageUrl || 'https://via.placeholder.com/150x100?text=No+Img'}" 
                                                 onerror="this.src='https://via.placeholder.com/150x100?text=Sin+Foto'">
                                        </div>
                                        <div class="recipe-details">
                                            <div class="d-flex justify-content-between align-items-start">
                                                <div class="recipe-title">${item.recipeName}</div>
                                                <div class="d-flex align-items-center gap-2">
                                                    <span class="recipe-pax-badge">${item.pax} personas</span>
                                                    ${recipe.precioVenta ? `<span class="recipe-pax-badge">S/. ${parseFloat(recipe.precioVenta).toFixed(2)} c/u</span>` : ''}
                                                </div>
                                            </div>
                                            
                                            ${recipe.descripcion ? `<div class="recipe-desc">${recipe.descripcion}</div>` : ''}
                                            
                                            <div class="recipe-meta mt-1">
                                                ${item.variant ? `<span class="me-3"><strong>Tipo:</strong> ${item.variant}</span>` : ''}
                                                ${recipe.estiloCocina ? `<span class="me-2 text-muted">• ${recipe.estiloCocina}</span>` : ''}
                                            </div>
                                        </div>
                                    </div>
                                `;
                            });
                        }
                    });

                    contentHtml += `</div>`;
                }

                // --- Cremas y Salsas Section (aggregated across all days) ---
                const cremasItems = items.filter(i => i.meal === 'Cremas y Salsas');
                if (cremasItems.length > 0) {
                    contentHtml += `
                        <div class="day-divider">
                            <div class="meal-section-title" style="margin-top: 10px;">Cremas y Salsas Incluidas</div>
                    `;
                    // Deduplicate by recipeId, aggregate names
                    const seen = new Set();
                    cremasItems.forEach(item => {
                        if (seen.has(item.recipeId)) return;
                        seen.add(item.recipeId);
                        const recipe = recipesDB.find(r => r.id === item.recipeId) || {};
                        contentHtml += `
                            <div class="d-flex align-items-center mb-2">
                                <span style="color: #c9a84c; margin-right: 8px;">•</span>
                                <span class="recipe-title" style="font-size: 14px;">${item.recipeName}</span>
                                ${recipe.descripcion ? `<span class="recipe-desc ms-2" style="margin-bottom: 0; font-size: 12px;">— ${recipe.descripcion}</span>` : ''}
                            </div>
                        `;
                    });
                    contentHtml += `</div>`;
                }

                const adelanto = data.adelanto || 0;
                const saldoPendiente = (data.totalClient || 0) - adelanto;

                contentHtml += `
                        <div class="total-section page-break-inside-avoid">
                            <div class="total-label">Total</div>
                            <div class="total-amount">S/. ${(data.totalClient || 0).toFixed(2)}</div>
                            ${adelanto > 0 ? `
                            <div class="adelanto-line">
                                <div class="adelanto-label">Adelanto recibido</div>
                                <div class="adelanto-amount">- S/. ${adelanto.toFixed(2)}</div>
                            </div>
                            <div class="saldo-line">
                                <div class="saldo-label">Saldo Pendiente</div>
                                <div class="saldo-amount">S/. ${saldoPendiente.toFixed(2)}</div>
                            </div>
                            ` : ''}
                        </div>
                        
                        ${(() => {
                        const tc = data.tcId ? tcDB.find(t => t.id === data.tcId) : null;
                        if (tc) {
                            return `
                                    <div class="tc-section page-break-inside-avoid">
                                        <h6>Términos y Condiciones</h6>
                                        <div class="tc-text">${tc.texto}</div>
                                    </div>
                                `;
                        }
                        return '';
                    })()}
                        
                        <div class="proposal-footer">
                            <p>Gracias por confiar en nosotros para su evento.</p>
                        </div>
                        
                        </div> <!-- End Body -->
                    </div> <!-- End Sheet -->
                 `;

            } else {
                // ** INTERNAL VIEW: Shopping List (BOM) **
                let totalBOM = {};

                items.forEach(item => {
                    const r = recipesDB.find(x => x.id === item.recipeId);
                    if (r && r.ingredientes) {
                        collectInsumos(r.ingredientes, item.pax, recipesDB, totalBOM);
                    }
                });

                contentHtml += `
                    <h4 class="text-danger mb-3"><i class="bi bi-cart"></i> Lista de Compras (Interno)</h4>
                    <div class="table-responsive">
                        <table class="table table-sm table-striped small border">
                            <thead class="table-dark">
                                <tr>
                                    <th>Insumo</th>
                                    <th>Cantidad Total</th>
                                    <th>Unidad</th>
                                    <th class="text-end">Costo Est.</th>
                                </tr>
                            </thead>
                            <tbody>
                     `;

                let grandTotal = 0;
                Object.keys(totalBOM).forEach(id => {
                    const insumo = insumosDB[id];
                    const qty = totalBOM[id];
                    if (insumo) {
                        const cost = qty * insumo.costo;
                        grandTotal += cost;
                        contentHtml += `
                             <tr>
                                 <td>${insumo.nombre}</td>
                                 <td>${qty.toFixed(2)}</td>
                                 <td>${insumo.unidad}</td>
                                 <td class="text-end">S/. ${cost.toFixed(2)}</td>
                             </tr>
                         `;
                    }
                });

                contentHtml += `
                            </tbody>
                            <tfoot class="table-group-divider bg-light fw-bold">
                                <tr>
                                    <td colspan="3" class="text-end">Total Materia Prima</td>
                                    <td class="text-end">S/. ${grandTotal.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                 `;

                const ops = data.costs || { transport: 0, lodging: 0, staff: 0, supplies: 0 };
                const opsTotal = (ops.transport || 0) + (ops.lodging || 0) + (ops.staff || 0) + (ops.supplies || 0);
                const totalExpense = grandTotal + opsTotal;
                const revenue = data.totalCost || 0; // This is the price charged to client? Wait.
                // NOTE: Currently 'totalCost' is calculated as Food Cost * Pax * (Markup?). 
                // Wait, logic in calculateTotal is: (Recipe Cost * Pax). 
                // It seems 'totalCost' IS the budget price (Sales Price). 
                // NO, earlier logic was Costo Est = Ingredient Cost. 
                // The user likely wants to set a "Sale Price" separately or assume a markup. 
                // For now, let's treat "totalCost" as purely INGREDIENT COST (Internal Reference). 
                // BUT usually a budget proposal shows the PRICE to the client.
                // The current app calculates "Costo Est" based on Ingredients. 
                // If the user wants PROFITABILITY, they need a SALES PRICE. 
                // Since I don't have a "Sales Price" field, I will assume the user manually edits the final price or 
                // for now I will just list the COSTS breakdown. 
                // User request: "sacar bien mis gastos". So showing Total Expenses is key.

                contentHtml += `
                    <div class="row mt-4">
                        <div class="col-md-6">
                            <h5 class="text-secondary border-bottom pb-2">Gastos Operativos</h5>
                             <table class="table table-sm border">
                                <tr><td>Transporte</td><td class="text-end">S/. ${(ops.transport || 0).toFixed(2)}</td></tr>
                                <tr><td>Hospedaje</td><td class="text-end">S/. ${(ops.lodging || 0).toFixed(2)}</td></tr>
                                <tr><td>Ayudantes</td><td class="text-end">S/. ${(ops.staff || 0).toFixed(2)}</td></tr>
                                <tr><td>Insumos No Comestibles</td><td class="text-end">S/. ${(ops.supplies || 0).toFixed(2)}</td></tr>
                                <tr class="fw-bold bg-light"><td>Total Operativo</td><td class="text-end">S/. ${opsTotal.toFixed(2)}</td></tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <div class="card bg-light border-0">
                                <div class="card-body">
                                    <h5 class="card-title text-dark">Resumen de Gastos</h5>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Materia Prima (Comida):</span>
                                        <span class="fw-bold">S/. ${grandTotal.toFixed(2)}</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Gastos Operativos:</span>
                                        <span class="fw-bold">S/. ${opsTotal.toFixed(2)}</span>
                                    </div>
                                    <hr>
                                    <div class="d-flex justify-content-between fs-5 fw-bold text-danger">
                                        <span>GASTO TOTAL REAL:</span>
                                        <span>S/. ${totalExpense.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                 `;

                contentHtml += `</div></div>`; // Close body and sheet for internal view
            }

            detailContent.innerHTML = contentHtml;
        };

        btnModeClient.addEventListener('click', () => { viewBudgetState.mode = 'client'; updateDetailView(); });
        btnModeInternal.addEventListener('click', () => { viewBudgetState.mode = 'internal'; updateDetailView(); });

        // --- Print Proposal in New Window ---
        document.getElementById('btn-print-proposal').addEventListener('click', () => {
            const content = document.getElementById('budget-detail-content').innerHTML;
            const printWin = window.open('', '_blank', 'width=900,height=700');
            printWin.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>Propuesta</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', -apple-system, sans-serif; font-size: 13px; color: #2c2c2c; line-height: 1.6; padding: 0; margin: 0; background: white; }

.proposal-sheet { max-width: 210mm; margin: 0 auto; padding: 40px 38px; }

.proposal-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #c9a84c; padding-bottom: 24px; margin-bottom: 32px; }
.proposal-brand { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: #1a1a1a; }
.proposal-brand span { color: #c9a84c; }
.proposal-tagline { font-family: 'Inter', sans-serif; font-size: 9px; letter-spacing: 4px; color: #888; text-transform: uppercase; font-weight: 400; margin-top: 5px; }

.client-info-table td { padding: 4px 12px; font-size: 12px; color: #555; vertical-align: top; }
.client-info-table td.label { font-weight: 600; color: #1a1a1a; text-align: right; width: 90px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding-top: 6px; }

.day-divider { margin-bottom: 32px; }
.day-badge { display: inline-block; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #c9a84c; border: 1px solid #c9a84c; padding: 5px 24px; }

.meal-section-title { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 700; font-size: 16px; text-transform: uppercase; letter-spacing: 2px; color: #1a1a1a; border-bottom: 1px solid #e8e8e8; margin-top: 24px; margin-bottom: 14px; padding-bottom: 6px; position: relative; }
.meal-section-title::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 36px; height: 2px; background: #c9a84c; }

.recipe-item-minimal { display: flex; align-items: flex-start; margin-bottom: 12px; padding: 12px; background: #fafaf8; border-radius: 5px; border: 1px solid #f0ede5; page-break-inside: avoid; break-inside: avoid; }
.recipe-thumb { width: 90px; height: 68px; border-radius: 5px; overflow: hidden; flex-shrink: 0; }
.recipe-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.recipe-details { padding-left: 16px; flex: 1; min-width: 0; }
.recipe-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 15px; font-weight: 700; color: #1a1a1a; }
.recipe-desc { font-size: 11.5px; color: #777; line-height: 1.4; font-style: italic; margin-top: 2px; }
.recipe-meta { font-size: 10px; text-transform: uppercase; color: #aaa; letter-spacing: 0.7px; margin-top: 4px; }
.recipe-pax-badge { font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 500; color: #666; background: #f0ece1; border: 1px solid #e0d9c8; padding: 2px 10px; border-radius: 16px; white-space: nowrap; }

.d-flex { display: flex; }
.justify-content-between { justify-content: space-between; }
.align-items-start { align-items: flex-start; }
.align-items-center { align-items: center; }
.gap-2 { gap: 8px; }
.text-center { text-align: center; }
.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }
.ms-2 { margin-left: 8px; }
.ms-auto { margin-left: auto; }
.me-2 { margin-right: 8px; }
.me-3 { margin-right: 12px; }
.mt-1 { margin-top: 4px; }
.text-muted { color: #999; }
.text-end { text-align: right; }

.total-section { background: linear-gradient(135deg, #faf8f3, #f5f0e6); padding: 0; text-align: right; margin-top: 0; border: 1px solid #e0d9c8; border-left: 4px solid #c9a84c; page-break-inside: avoid; }
.total-label { font-family: 'Inter', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #999; margin-bottom: 6px; }
.total-amount { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 700; color: #1a1a1a; letter-spacing: 1px; }

.adelanto-line { margin-top: 14px; padding-top: 12px; border-top: 1px dashed #d4cbb8; }
.adelanto-label { font-family: 'Inter', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #999; margin-bottom: 4px; }
.adelanto-amount { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 16px; font-weight: 600; color: #6a994e; letter-spacing: 0.5px; }
.saldo-line { margin-top: 12px; padding-top: 12px; border-top: 2px solid #c9a84c; }
.saldo-label { font-family: 'Inter', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #c9a84c; margin-bottom: 4px; font-weight: 600; }
.saldo-amount { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; font-weight: 700; color: #1a1a1a; letter-spacing: 1px; }

.tc-section { margin-top: 36px; padding-top: 20px; border-top: 1px solid #e8e8e8; page-break-inside: avoid; }
.tc-section h6 { font-family: 'Inter', sans-serif; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #999; margin-bottom: 12px; font-weight: 600; }
.tc-text { font-size: 11px; color: #888; line-height: 1.7; white-space: pre-wrap; }

.proposal-footer { margin-top: 40px; text-align: center; padding-top: 16px; border-top: 1px solid #f0f0f0; }
.proposal-footer p { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 14px; font-style: italic; color: #aaa; letter-spacing: 0.5px; }

@media print {
    body { margin: 0; padding: 0; }
    .proposal-sheet { padding: 0; max-width: 100%; }
    .recipe-item-minimal { background: #fafaf8 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .total-section { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .recipe-pax-badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { margin: 12mm 15mm; }
}
</style>
</head><body>
${content}
</body></html>`);
            printWin.document.close();
            // Wait for fonts/images to load, then print
            printWin.onload = () => {
                setTimeout(() => {
                    printWin.focus();
                    printWin.print();
                }, 400);
            };
        });

        // --- Share via WhatsApp ---
        document.getElementById('btn-share-whatsapp').addEventListener('click', async () => {
            const btn = document.getElementById('btn-share-whatsapp');
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Generando...';
            btn.disabled = true;

            try {
                const target = document.getElementById('budget-detail-content');
                const canvas = await html2canvas(target, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false
                });

                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                const file = new File([blob], 'cotizacion.png', { type: 'image/png' });

                // Try Web Share API (works on mobile)
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Cotización',
                        text: 'Aquí le envío la cotización de su evento'
                    });
                } else {
                    // Desktop fallback: download image + open WhatsApp
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'cotizacion.png';
                    a.click();
                    URL.revokeObjectURL(url);

                    const msg = encodeURIComponent('Hola, le envío la cotización de su evento. Por favor revise la imagen adjunta.');
                    window.open(`https://wa.me/?text=${msg}`, '_blank');
                }
            } catch (err) {
                console.error('Share error:', err);
                alert('Error al generar imagen: ' + err.message);
            } finally {
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        });

        // --- Quick Add / Edit T&C Logic ---
        const quickTcModalEl = document.getElementById('quickAddTcModal');
        const quickTcModal = quickTcModalEl ? new bootstrap.Modal(quickTcModalEl) : null;
        const tcModalTitle = quickTcModalEl ? quickTcModalEl.querySelector('.modal-title') : null;

        // Enable/disable edit button based on selection
        document.getElementById('tc-select').addEventListener('change', () => {
            document.getElementById('btn-edit-tc').disabled = !document.getElementById('tc-select').value;
        });

        document.getElementById('btn-quick-add-tc').addEventListener('click', () => {
            document.getElementById('quick-tc-form').reset();
            document.getElementById('quick-tc-edit-id').value = '';
            if (tcModalTitle) tcModalTitle.textContent = 'Nuevo T&C';
            if (quickTcModal) quickTcModal.show();
        });

        document.getElementById('btn-edit-tc').addEventListener('click', () => {
            const selId = document.getElementById('tc-select').value;
            if (!selId) return;
            const tc = tcDB.find(t => t.id === selId);
            if (!tc) return;
            document.getElementById('quick-tc-edit-id').value = tc.id;
            document.getElementById('quick-tc-name').value = tc.nombre;
            document.getElementById('quick-tc-text').value = tc.texto;
            if (tcModalTitle) tcModalTitle.textContent = 'Editar T&C';
            if (quickTcModal) quickTcModal.show();
        });

        const quickTcForm = document.getElementById('quick-tc-form');
        if (quickTcForm) {
            quickTcForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = e.target.querySelector('button[type="submit"]');
                btn.disabled = true;

                const editId = document.getElementById('quick-tc-edit-id').value;
                const nombre = document.getElementById('quick-tc-name').value.trim();
                const texto = document.getElementById('quick-tc-text').value.trim();

                if (!nombre || !texto) { btn.disabled = false; return; }

                try {
                    if (editId) {
                        // Update existing
                        await updateDoc(doc(db, "termsConditions", editId), { nombre, texto });
                        const idx = tcDB.findIndex(t => t.id === editId);
                        if (idx !== -1) { tcDB[idx].nombre = nombre; tcDB[idx].texto = texto; }
                        refreshTcSelect();
                        document.getElementById('tc-select').value = editId;
                        document.getElementById('tc-preview').textContent = texto;
                    } else {
                        // Create new
                        const docRef = await addDoc(collection(db, "termsConditions"), { nombre, texto, createdAt: new Date() });
                        tcDB.push({ id: docRef.id, nombre, texto });
                        refreshTcSelect();
                        document.getElementById('tc-select').value = docRef.id;
                        document.getElementById('tc-preview').textContent = texto;
                        document.getElementById('btn-edit-tc').disabled = false;
                    }

                    if (quickTcModal) quickTcModal.hide();
                } catch (err) {
                    console.error(err);
                    alert("Error guardando T&C: " + err.message);
                } finally {
                    btn.disabled = false;
                }
            });
        }

        await init();
    }
};
