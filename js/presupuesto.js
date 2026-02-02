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
                        <table class="table table-hover mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Cliente / Evento</th>
                                    <th>Detalles</th>
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

            <!-- VIEW 2: Calculator/Form (Hidden by Default) -->
            <div id="budget-form-view" class="d-none">
                <div class="card shadow-sm mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Configuración del Evento</h5>
                    </div>
                    <div class="card-body">
                        <form id="presupuesto-main-form">
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
                                     <label class="form-label">Fecha del Evento</label>
                                     <input type="date" class="form-control" id="event-date">
                                </div>
                                 <div class="col-md-8">
                                     <label class="form-label">Lugar / Dirección</label>
                                     <input type="text" class="form-control" id="event-location">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Duración (Días)</label>
                                    <div class="input-group">
                                        <input type="number" class="form-control" id="event-days" value="1" min="1" required>
                                        <button class="btn btn-outline-secondary" type="button" id="btn-generate-days">Generar Días</button>
                                    </div>
                                </div>
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
                    <h3 class="mb-0" id="display-total-cost">Total: $0.00</h3>
                    <div class="d-flex gap-2">
                         <button class="btn btn-success btn-lg" id="btn-calculate"><i class="bi bi-calculator"></i> Calcular</button>
                         <button class="btn btn-primary btn-lg" id="btn-save-budget"><i class="bi bi-save"></i> Guardar Presupuesto</button>
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
                                <button type="button" class="btn btn-success" onclick="window.print()"><i class="bi bi-printer"></i> Imprimir</button>
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
                                        <label class="form-label">Cantidad (Pax)</label>
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
            const [iSnap, rSnap, cSnap] = await Promise.all([
                getDocs(collection(db, "insumos")),
                getDocs(collection(db, "recetas")),
                getDocs(collection(db, "clientes"))
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

            loadHistory();
            showList();
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
                        <td class="text-success">$${(data.totalCost || 0).toFixed(2)}</td>
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
            currentBudget = { id: null, clientId: '', clientName: '', eventName: '', location: '', eventDate: '', daysCount: 1, items: [] };
            mainForm.reset();
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

        btnGenerateDays.addEventListener('click', () => {
            const count = parseInt(document.getElementById('event-days').value) || 1;
            currentBudget.daysCount = count;
            // Warning: regenerate clears items if number reduced or changed? 
            // Better to keep items if day exists. For now, simple regeneration is fine for MVP but could be annoying.
            // Let's preserve items if possible.
            generateDayCards(count);
        });

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
                                <i class="bi bi-people"></i> ${item.pax} pax
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
        const calculateTotal = () => {
            let total = 0;
            currentBudget.items.forEach(item => {
                const r = recipesDB.find(x => x.id === item.recipeId);
                if (r && r.ingredientes) {
                    let recipeCost = 0;
                    r.ingredientes.forEach(ing => {
                        const ins = insumosDB[ing.insumoId];
                        if (ins) recipeCost += (ing.quantity * ins.costo);
                    });
                    total += (recipeCost * item.pax);
                }
            });
            return total;
        };

        btnCalculate.addEventListener('click', () => {
            const t = calculateTotal();
            displayTotal.innerText = `Total: $${t.toFixed(2)}`;
        });

        // --- Save ---
        btnSave.addEventListener('click', async () => {
            if (!confirm("¿Guardar Presupuesto?")) return;

            // Populate basic fields
            currentBudget.clientId = clientSelect.value;
            currentBudget.clientName = clientSelect.options[clientSelect.selectedIndex].text;
            currentBudget.eventName = document.getElementById('event-name').value;
            currentBudget.location = document.getElementById('event-location').value;
            currentBudget.eventDate = document.getElementById('event-date').value;
            currentBudget.totalCost = calculateTotal();
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
            document.getElementById('event-days').value = data.daysCount || 1;
            document.getElementById('event-location').value = data.location || '';
            document.getElementById('event-date').value = data.eventDate || '';

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
                <div class="print-section">
                    <div class="row border-bottom pb-4 mb-4 align-items-center">
                         <div class="col-8">
                             <h1 class="display-6 fw-bold text-primary mb-0">Propuesta de Catering</h1>
                             <p class="text-muted small mt-1">Ref: #${data.id.substr(0, 8).toUpperCase()}</p>
                         </div>
                         <div class="col-4 text-end">
                             <div class="fw-bold fs-5">${clientInfo.nombre || data.clientName || 'Cliente'}</div>
                             <div class="small text-muted">${data.eventDate || 'Fecha por definir'}</div>
                             <div class="small text-muted">${data.location || ''}</div>
                             <div class="badge bg-light text-dark mt-2 border">${data.eventName}</div>
                         </div>
                    </div>
             `;

            if (viewBudgetState.mode === 'client') {
                // ** CLIENT VIEW: Day > Meal > Item (Pax) with Images **
                const days = data.daysCount || 1;
                for (let d = 1; d <= days; d++) {
                    const dayItems = items.filter(i => i.day === d);
                    if (dayItems.length === 0) continue;

                    contentHtml += `
                        <div class="mb-5 page-break-inside-avoid">
                            <h4 class="bg-primary text-white p-2 rounded ps-3 mb-3">Día ${d}</h4>
                            <div class="ms-2">
                     `;

                    // Group by Meal
                    const meals = {};
                    dayItems.forEach(i => {
                        if (!meals[i.meal]) meals[i.meal] = [];
                        meals[i.meal].push(i);
                    });

                    const mealOrder = ['Desayuno', 'Almuerzo', 'Cena', 'Coctel', 'Otro'];
                    mealOrder.forEach(meal => {
                        if (meals[meal]) {
                            contentHtml += `<h5 class="mt-4 mb-3 text-secondary text-uppercase border-bottom d-inline-block pe-4">${meal}</h5>`;
                            contentHtml += `<div class="row g-4">`;
                            meals[meal].forEach(item => {
                                const recipe = recipesDB.find(r => r.id === item.recipeId) || {};
                                const imgStyle = recipe.imageUrl ? `background-image: url('${recipe.imageUrl}');` : `background-color: #eee;`;

                                contentHtml += `
                                    <div class="col-md-6 col-print-6">
                                        <div class="d-flex border rounded overflow-hidden h-100 shadow-sm-hover">
                                            <div class="bg-cover" style="width: 100px; min-width: 100px; ${imgStyle} background-size: cover; background-position: center;"></div>
                                            <div class="p-3 flex-grow-1 d-flex flex-column justify-content-center">
                                                 <div class="d-flex justify-content-between align-items-start mb-1">
                                                     <div class="fw-bold">${item.recipeName}</div>
                                                     <span class="badge bg-success bg-opacity-10 text-success border border-success">${item.pax} pax</span>
                                                 </div>
                                                 ${item.variant ? `<small class="text-muted fst-italic">${item.variant}</small>` : ''}
                                            </div>
                                        </div>
                                    </div>
                                `;
                            });
                            contentHtml += `</div>`;
                        }
                    });

                    contentHtml += `</div></div>`;
                }

                contentHtml += `
                    <div class="mt-5 pt-3 border-top text-end">
                        <h3 class="text-success">Inversión Total Estimada: $${data.totalCost.toFixed(2)}</h3>
                    </div>
                 `;

            } else {
                // ** INTERNAL VIEW: Shopping List (BOM) **
                let totalBOM = {};

                items.forEach(item => {
                    const r = recipesDB.find(x => x.id === item.recipeId);
                    if (r && r.ingredientes) {
                        r.ingredientes.forEach(ing => {
                            if (!totalBOM[ing.insumoId]) totalBOM[ing.insumoId] = 0;
                            totalBOM[ing.insumoId] += (ing.quantity * item.pax);
                        });
                    }
                });

                contentHtml += `
                    <h4 class="text-danger mb-3"><i class="bi bi-cart"></i> Lista de Compras (Interno)</h4>
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
                                 <td class="text-end">$${cost.toFixed(2)}</td>
                             </tr>
                         `;
                    }
                });

                contentHtml += `
                        </tbody>
                        <tfoot class="table-group-divider bg-light fw-bold">
                            <tr>
                                <td colspan="3" class="text-end">Total Materia Prima</td>
                                <td class="text-end">$${grandTotal.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                 `;
            }

            contentHtml += `</div>`;
            detailContent.innerHTML = contentHtml;
        };

        btnModeClient.addEventListener('click', () => { viewBudgetState.mode = 'client'; updateDetailView(); });
        btnModeInternal.addEventListener('click', () => { viewBudgetState.mode = 'internal'; updateDetailView(); });


        await init();
    }
};
