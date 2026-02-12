import { db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, storage, ref, uploadBytes, getDownloadURL, isDbReady } from './firebase-config.js';

export const recetasView = {
    render: async () => {
        return `
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                <h2 class="mb-0"><i class="bi bi-journal-text me-2"></i>Recetas / Platos</h2>
                <button class="btn btn-primary w-100 w-md-auto" id="btn-show-create-recipe">
                    <i class="bi bi-plus-lg me-1"></i> Nueva Receta
                </button>
            </div>

            <!-- Filter Bar -->
            <div class="card shadow-sm mb-4">
                <div class="card-body py-2">
                    <div class="row g-2 align-items-center">
                        <div class="col-auto fw-bold text-muted small"><i class="bi bi-funnel"></i> Filtrar:</div>
                        <div class="col-auto">
                            <select class="form-select form-select-sm" id="filter-meal-type">
                                <option value="">Todos los Tipos</option>
                                <option value="Desayuno">Desayuno</option>
                                <option value="Almuerzo">Almuerzo</option>
                                <option value="Cena">Cena</option>
                                <option value="Piqueo">Piqueo</option>
                                <option value="Postre">Postre</option>
                                <option value="Bebida">Bebida</option>
                                <option value="Cremas y Salsas">Cremas y Salsas</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                        <div class="col-auto">
                            <select class="form-select form-select-sm" id="filter-cuisine-style">
                                <option value="">Todos los Estilos</option>
                                <option value="Criollo">Criollo</option>
                                <option value="Internacional">Internacional</option>
                                <option value="Italiano">Italiano</option>
                                <option value="Americano">Americano</option>
                                <option value="Asiático">Asiático</option>
                                <option value="Fusión">Fusión</option>
                                <option value="Parrilla">Parrilla</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recipe List -->
            <div class="row g-4" id="recipe-cards-container">
                <!-- Cards injected here -->
            </div>

            <!-- Create/Edit Modal -->
            <!-- Create/Edit Modal -->
             <div class="modal fade" id="recipeModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="recipeModalLabel">Nueva Receta</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="recipe-form">
                                <input type="hidden" id="recipe-id">
                                <div class="row">
                                    <div class="col-md-8">
                                        <div class="mb-3">
                                            <label class="form-label">Nombre del Plato</label>
                                            <input type="text" class="form-control" id="recipe-name" required placeholder="Ej. Lomo Saltado">
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Precio de Venta (S/.) (Por Persona)</label>
                                            <input type="number" class="form-control" id="recipe-sale-price" placeholder="0.00" step="0.01">
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Rendimiento Base (Porciones)</label>
                                            <input type="number" class="form-control" id="recipe-base-yield" value="1" min="1" required>
                                            <div class="form-text small">Indica para cuántas personas es esta lista de ingredientes.</div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Descripción (Para la Propuesta)</label>
                                            <textarea class="form-control" id="recipe-description" rows="2" placeholder="Ej. Trozos de lomo fino salteados al wok con cebolla y tomate..."></textarea>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">Imagen (Opcional)</label>
                                            <input type="file" class="form-control" id="recipe-image" accept="image/*">
                                            <input type="hidden" id="recipe-image-url">
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Tipo de Comida</label>
                                            <select class="form-select" id="recipe-meal-type">
                                                <option value="">Selecciona...</option>
                                                <option value="Desayuno">Desayuno</option>
                                                <option value="Almuerzo">Almuerzo</option>
                                                <option value="Cena">Cena</option>
                                                <option value="Piqueo">Piqueo</option>
                                                <option value="Postre">Postre</option>
                                                <option value="Bebida">Bebida</option>
                                                <option value="Cremas y Salsas">Cremas y Salsas</option>
                                                <option value="Otro">Otro</option>
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Estilo de Cocina</label>
                                            <select class="form-select" id="recipe-cuisine-style">
                                                <option value="">Selecciona...</option>
                                                <option value="Criollo">Criollo</option>
                                                <option value="Internacional">Internacional</option>
                                                <option value="Italiano">Italiano</option>
                                                <option value="Americano">Americano</option>
                                                <option value="Asiático">Asiático</option>
                                                <option value="Fusión">Fusión</option>
                                                <option value="Parrilla">Parrilla</option>
                                                <option value="Otro">Otro</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label d-flex justify-content-between">
                                        Ingredientes
                                        <div>
                                            <button type="button" class="btn btn-sm btn-outline-success" id="btn-add-recipe-row">
                                                <i class="bi bi-journal-text"></i> Incluir Receta
                                            </button>
                                            <button type="button" class="btn btn-sm btn-outline-secondary" id="btn-add-ingredient-row">
                                                <i class="bi bi-plus"></i> Agregar Insumo
                                            </button>
                                        </div>
                                    </label>
                                    <div id="ingredients-list" class="bg-light p-3 rounded">
                                        <!-- Rows injected here -->
                                    </div>
                                </div>
                            </form>
                             <div id="upload-progress" class="progress d-none mb-3">
                                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 100%">Subiendo imagen...</div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="btn-save-recipe">Guardar Receta</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Add Insumo Modal (Nested) -->
            <div class="modal fade" id="quickAddInsumoModal" tabindex="-1" style="z-index: 1060;">
                <div class="modal-dialog modal-sm">
                    <div class="modal-content">
                        <div class="modal-header bg-light">
                            <h6 class="modal-title">Nuevo Insumo Rápido</h6>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="quick-insumo-form">
                                <div class="mb-2">
                                    <label class="form-label small">Nombre</label>
                                    <input type="text" class="form-control form-control-sm" id="quick-insumo-name" required>
                                </div>
                                <div class="mb-2">
                                    <label class="form-label small">Categoría</label>
                                    <select class="form-select form-select-sm" id="quick-insumo-cat" required>
                                        <option value="Verdura">Verdura</option>
                                        <option value="Fruta">Fruta</option>
                                        <option value="Carne">Carne</option>
                                        <option value="Abarrote">Abarrote</option>
                                        <option value="Lacteo">Lacteo</option>
                                        <option value="Embutido">Embutido</option>
                                        <option value="Licor">Licor</option>
                                        <option value="Menaje">Menaje</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div class="row g-2">
                                    <div class="col-6">
                                        <label class="form-label small">Unidad</label>
                                        <select class="form-select form-select-sm" id="quick-insumo-unit" required>
                                            <option value="kg">kg</option>
                                            <option value="g">g</option>
                                            <option value="l">l</option>
                                            <option value="ml">ml</option>
                                            <option value="und">und</option>
                                        </select>
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small">Costo</label>
                                        <input type="number" class="form-control form-control-sm" id="quick-insumo-cost" placeholder="0.00" step="0.01" required>
                                    </div>
                                </div>
                                <div class="mt-3 d-grid">
                                    <button type="submit" class="btn btn-sm btn-success">Guardar e Insertar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    postRender: async () => {
        const container = document.getElementById('recipe-cards-container');
        const modalEl = document.getElementById('recipeModal');
        const modal = new bootstrap.Modal(modalEl);
        const form = document.getElementById('recipe-form');
        const ingredientsList = document.getElementById('ingredients-list');

        let insumosDB = []; // Cache for selector
        let recetasDB = []; // Cache for recipe-as-ingredient

        const init = async () => {
            if (!isDbReady()) return;

            // Load Insumos and Recetas for Selector
            const [iSnap, rSnap] = await Promise.all([
                getDocs(collection(db, "insumos")),
                getDocs(collection(db, "recetas"))
            ]);
            iSnap.forEach(doc => insumosDB.push({ id: doc.id, ...doc.data() }));
            rSnap.forEach(doc => recetasDB.push({ id: doc.id, ...doc.data() }));

            loadRecipes();
        };

        let allRecipes = []; // Local cache for filtering

        const loadRecipes = async () => {
            container.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary"></div></div>';
            try {
                const snap = await getDocs(collection(db, "recetas"));
                allRecipes = [];

                if (snap.empty) {
                    container.innerHTML = '<div class="col-12 text-center text-muted">No hay recetas creadas.</div>';
                    return;
                }

                snap.forEach(docSnap => {
                    allRecipes.push({ id: docSnap.id, ...docSnap.data() });
                });

                renderRecipes(allRecipes);
            } catch (e) {
                console.error(e);
                container.innerHTML = '<div class="alert alert-danger">Error cargando recetas.</div>';
            }
        };

        const renderRecipes = (recipes) => {
            container.innerHTML = '';

            if (recipes.length === 0) {
                container.innerHTML = '<div class="col-12 text-center text-muted py-5">No se encontraron recetas con estos filtros.</div>';
                return;
            }

            recipes.forEach(data => {
                let cost = 0;
                if (data.ingredientes) {
                    const totalCost = calcRecipeCost(data.ingredientes);
                    const baseYield = data.baseYield || 1;
                    cost = totalCost / baseYield;
                }

                const imgHtml = data.imageUrl
                    ? `<img src="${data.imageUrl}" class="card-img-top" alt="${data.nombre}" style="height: 180px; object-fit: cover;">`
                    : `<div class="card-img-top bg-secondary text-white d-flex align-items-center justify-content-center" style="height: 180px;"><i class="bi bi-camera fs-1"></i></div>`;

                const div = document.createElement('div');
                div.className = 'col-md-4 col-sm-6';
                div.innerHTML = `
                    <div class="card h-100 shadow-sm recipe-card">
                        ${imgHtml}
                        <div class="card-body">
                            <h5 class="card-title fw-bold">${data.nombre}</h5>
                            <div class="mb-2">
                                ${data.tipoComida ? `<span class="badge bg-info text-dark me-1">${data.tipoComida}</span>` : ''}
                                ${data.estiloCocina ? `<span class="badge bg-secondary me-1">${data.estiloCocina}</span>` : ''}
                            </div>
                            <p class="card-text text-muted small">Costo Est: S/. ${cost.toFixed(2)} / porción</p>
                        </div>
                        <div class="card-footer bg-white border-top-0 text-end">
                            <button class="btn btn-sm btn-outline-primary edit-recipe" data-id="${data.id}">Editar</button>
                            <button class="btn btn-sm btn-outline-danger delete-recipe" data-id="${data.id}">Eliminar</button>
                        </div>
                    </div>
                `;
                container.appendChild(div);
            });

            attachCardListeners();
        };

        const attachListeners = () => {
            // Filter Listeners
            const filterMeal = document.getElementById('filter-meal-type');
            const filterCuisine = document.getElementById('filter-cuisine-style');

            const applyFilters = () => {
                const meal = filterMeal.value;
                const cuisine = filterCuisine.value;

                const filtered = allRecipes.filter(r => {
                    const matchMeal = meal ? r.tipoComida === meal : true;
                    const matchCuisine = cuisine ? r.estiloCocina === cuisine : true;
                    return matchMeal && matchCuisine;
                });
                renderRecipes(filtered);
            };

            filterMeal.addEventListener('change', applyFilters);
            filterCuisine.addEventListener('change', applyFilters);
        };

        const attachCardListeners = () => {
            document.querySelectorAll('.delete-recipe').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if (confirm('¿Eliminar receta?')) {
                        const id = e.target.dataset.id;
                        await deleteDoc(doc(db, "recetas", id));
                        loadRecipes();
                    }
                });
            });

            document.querySelectorAll('.edit-recipe').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.dataset.id;
                    openEdit(id);
                });
            });
        };

        // Helper: build options HTML for ingredient selects
        // mode: 'all' = both, 'insumo' = only insumos, 'receta' = only recipes
        const buildIngredientOptions = (selectedId, selectedType, mode = 'all') => {
            const placeholder = mode === 'receta' ? 'Selecciona receta...' : mode === 'insumo' ? 'Selecciona insumo...' : 'Selecciona insumo o receta...';
            let options = `<option value="">${placeholder}</option>`;

            // --- Recetas optgroup ---
            if (mode === 'all' || mode === 'receta') {
                const editingId = document.getElementById('recipe-id').value;
                const availableRecetas = recetasDB.filter(r => r.id !== editingId);
                if (availableRecetas.length > 0) {
                    options += `<optgroup label="📋 Recetas">`;
                    availableRecetas.sort((a, b) => a.nombre.localeCompare(b.nombre));
                    availableRecetas.forEach(r => {
                        const sel = (selectedType === 'receta' && selectedId === r.id) ? 'selected' : '';
                        const costEst = r.ingredientes ? calcRecipeCost(r.ingredientes) : 0;
                        options += `<option value="receta:${r.id}" ${sel}>${r.nombre} (S/. ${costEst.toFixed(2)}/receta)</option>`;
                    });
                    options += `</optgroup>`;
                }
            }

            // --- Insumos optgroups ---
            if (mode === 'all' || mode === 'insumo') {
                insumosDB.sort((a, b) => {
                    const catA = a.categoria || 'Otro';
                    const catB = b.categoria || 'Otro';
                    if (catA !== catB) return catA.localeCompare(catB);
                    return a.nombre.localeCompare(b.nombre);
                });

                const grouped = {};
                insumosDB.forEach(i => {
                    const cat = i.categoria || 'Otro';
                    if (!grouped[cat]) grouped[cat] = [];
                    grouped[cat].push(i);
                });

                const catOrder = ['Verdura', 'Fruta', 'Carne', 'Abarrote', 'Lacteo', 'Embutido', 'Licor', 'Menaje', 'Otro'];
                const allCats = [...new Set([...catOrder, ...Object.keys(grouped)])];

                allCats.forEach(cat => {
                    if (grouped[cat] && grouped[cat].length > 0) {
                        options += `<optgroup label="${cat}">`;
                        grouped[cat].forEach(i => {
                            const sel = (!selectedType || selectedType === 'insumo') && selectedId === i.id ? 'selected' : '';
                            options += `<option value="insumo:${i.id}" ${sel}>${i.nombre} (S/. ${i.costo}/${i.unidad})</option>`;
                        });
                        options += `</optgroup>`;
                    }
                });
            }

            return options;
        };

        // Helper: calculate recipe cost recursively from ingredients
        const calcRecipeCost = (ingredientes, visited = new Set()) => {
            let cost = 0;
            ingredientes.forEach(ing => {
                if (ing.type === 'receta') {
                    const subReceta = recetasDB.find(r => r.id === ing.recetaId);
                    if (subReceta && subReceta.ingredientes && !visited.has(ing.recetaId)) {
                        visited.add(ing.recetaId);
                        const subYield = subReceta.baseYield || 1;
                        cost += ing.quantity * (calcRecipeCost(subReceta.ingredientes, visited) / subYield);
                    }
                } else {
                    const ins = insumosDB.find(i => i.id === ing.insumoId);
                    if (ins) cost += (ing.quantity * ins.costo);
                }
            });
            return cost;
        };

        const addIngredientRow = (data = null, mode = 'all') => {
            const row = document.createElement('div');
            row.className = 'row g-2 mb-2 ingredient-row align-items-center';

            const selectedId = data ? (data.type === 'receta' ? data.recetaId : data.insumoId) : null;
            const selectedType = data ? (data.type || 'insumo') : null;
            const options = buildIngredientOptions(selectedId, selectedType, mode);

            row.innerHTML = `
                <div class="col-7 d-flex">
                    <select class="form-select form-select-sm insumo-select me-1" required>
                        ${options}
                    </select>
                    ${mode !== 'receta' ? '<button type="button" class="btn btn-sm btn-outline-success btn-quick-add" title="Crear Insumo">+</button>' : ''}
                </div>
                <div class="col-3">
                    <input type="number" class="form-control form-control-sm quantity-input" placeholder="Cant." step="0.01" value="${data ? data.quantity : ''}" required>
                </div>
                <div class="col-2 text-end">
                    <button type="button" class="btn btn-sm text-danger btn-remove-row"><i class="bi bi-trash"></i></button>
                </div>
             `;

            row.querySelector('.btn-remove-row').addEventListener('click', () => row.remove());

            // Attach Quick Add (only for non-recipe rows)
            const qaBtn = row.querySelector('.btn-quick-add');
            if (qaBtn) {
                const sel = row.querySelector('.insumo-select');
                attachQuickAddListener(qaBtn, sel);
            }

            ingredientsList.appendChild(row);
        };

        document.getElementById('btn-show-create-recipe').addEventListener('click', () => {
            document.getElementById('recipe-form').reset();
            document.getElementById('recipe-sale-price').value = '';
            document.getElementById('recipe-id').value = '';
            document.getElementById('recipe-image-url').value = '';
            document.getElementById('recipe-base-yield').value = '1';
            document.getElementById('recipe-description').value = ''; // Reset desc
            document.getElementById('recipe-meal-type').value = '';
            document.getElementById('recipe-cuisine-style').value = '';
            ingredientsList.innerHTML = '';
            addIngredientRow();
            document.getElementById('recipeModalLabel').innerText = "Nueva Receta";
            modal.show();
        });

        document.getElementById('btn-add-ingredient-row').addEventListener('click', () => addIngredientRow(null, 'insumo'));
        document.getElementById('btn-add-recipe-row').addEventListener('click', () => addIngredientRow(null, 'receta'));

        const openEdit = async (id) => {
            const snap = await getDocs(collection(db, "recetas")); // Optimizable
            let data;
            snap.forEach(d => { if (d.id === id) data = d.data(); });

            if (!data) return;

            document.getElementById('recipe-id').value = id;
            document.getElementById('recipe-name').value = data.nombre;
            document.getElementById('recipe-sale-price').value = data.precioVenta || '';
            document.getElementById('recipe-base-yield').value = data.baseYield || 1;
            document.getElementById('recipe-image-url').value = data.imageUrl || '';
            document.getElementById('recipe-description').value = data.descripcion || ''; // Load desc
            document.getElementById('recipe-meal-type').value = data.tipoComida || '';
            document.getElementById('recipe-cuisine-style').value = data.estiloCocina || '';
            document.getElementById('recipeModalLabel').innerText = "Editar Receta";

            ingredientsList.innerHTML = '';
            if (data.ingredientes && data.ingredientes.length > 0) {
                data.ingredientes.forEach(ing => addIngredientRow(ing, ing.type === 'receta' ? 'receta' : 'insumo'));
            } else {
                addIngredientRow();
            }
            modal.show();
        };

        document.getElementById('btn-save-recipe').addEventListener('click', async () => {
            const id = document.getElementById('recipe-id').value;
            const name = document.getElementById('recipe-name').value;
            const imageFile = document.getElementById('recipe-image').files[0];
            let imageUrl = document.getElementById('recipe-image-url').value;

            // Gather Ingredients
            const rows = document.querySelectorAll('.ingredient-row');
            const ingredients = [];
            rows.forEach(r => {
                const rawVal = r.querySelector('.insumo-select').value;
                const quantity = parseFloat(r.querySelector('.quantity-input').value);
                if (rawVal && quantity > 0) {
                    if (rawVal.startsWith('receta:')) {
                        ingredients.push({ type: 'receta', recetaId: rawVal.replace('receta:', ''), quantity });
                    } else {
                        const id = rawVal.startsWith('insumo:') ? rawVal.replace('insumo:', '') : rawVal;
                        ingredients.push({ type: 'insumo', insumoId: id, quantity });
                    }
                }
            });

            if (!name) { alert("Nombre requerido"); return; }

            const btn = document.getElementById('btn-save-recipe');
            btn.disabled = true;
            btn.textContent = "Guardando...";

            try {
                // Upload Image if present
                if (imageFile) {
                    if (!storage) {
                        alert("Error: Firebase Storage no está configurado.");
                        throw new Error("Storage missing");
                    }
                    const progressDiv = document.getElementById('upload-progress');
                    progressDiv.classList.remove('d-none');

                    const storageRef = ref(storage, 'recipes/' + Date.now() + '_' + imageFile.name);
                    const snapshot = await uploadBytes(storageRef, imageFile);
                    imageUrl = await getDownloadURL(snapshot.ref);

                    progressDiv.classList.add('d-none');
                }

                const docData = {
                    nombre: name,
                    precioVenta: parseFloat(document.getElementById('recipe-sale-price').value) || 0,
                    baseYield: parseFloat(document.getElementById('recipe-base-yield').value) || 1,
                    descripcion: document.getElementById('recipe-description').value.trim(), // Save desc
                    tipoComida: document.getElementById('recipe-meal-type').value,
                    estiloCocina: document.getElementById('recipe-cuisine-style').value,
                    imageUrl: imageUrl,
                    ingredientes: ingredients,
                    updatedAt: new Date()
                };

                if (id) {
                    await updateDoc(doc(db, "recetas", id), docData);
                    // Update linked budgets (only for Updates)
                    await updateLinkedBudgets(id, docData);
                } else {
                    docData.createdAt = new Date();
                    await addDoc(collection(db, "recetas"), docData);
                }

                modal.hide();
                loadRecipes();
            } catch (e) {
                console.error(e);
                alert("Error al guardar: " + e.message);
            } finally {
                btn.disabled = false;
                btn.textContent = "Guardar Receta";
            }
        });

        const updateLinkedBudgets = async (recipeId, newRecipeData) => {
            try {
                // 1. Fetch 'Creado' budgets (Client-side filter for now)
                const snap = await getDocs(collection(db, "presupuestos"));
                if (snap.empty) return;

                const batchUpdates = [];

                snap.forEach(d => {
                    const b = d.data();
                    if (b.status && b.status !== 'Creado') return; // Only update Created
                    if (!b.items || !b.items.find(i => i.recipeId === recipeId)) return; // Not affected

                    // Recalculate Totals
                    let totalClient = 0;
                    let totalInternal = 0;

                    b.items.forEach(item => {
                        // Use new data for target, cache for others
                        let r = (item.recipeId === recipeId) ? newRecipeData : allRecipes.find(x => x.id === item.recipeId);

                        if (r) {
                            // Client Price
                            totalClient += ((r.precioVenta || 0) * item.pax);

                            // Internal Cost (Ingredients * (Pax / Yield))
                            const yieldVal = r.baseYield || 1;
                            const scaleFactor = item.pax / yieldVal;

                            if (r.ingredientes) {
                                const batchCost = calcRecipeCost(r.ingredientes);
                                totalInternal += (batchCost * scaleFactor);
                            }
                        }
                    });

                    // Update if changed
                    if (Math.abs(totalClient - b.totalClient) > 0.01 || Math.abs(totalInternal - b.totalCost) > 0.01) {
                        batchUpdates.push(updateDoc(doc(db, "presupuestos", d.id), {
                            totalClient: totalClient,
                            totalCost: totalInternal,
                            updatedAt: new Date()
                        }));
                    }
                });

                if (batchUpdates.length > 0) {
                    await Promise.all(batchUpdates);
                    console.log(`Updated ${batchUpdates.length} linked budgets.`);
                }

            } catch (e) {
                console.error("Error updating linked budgets:", e);
            }
        };

        // --- Quick Add Insumo Logic ---
        let triggeringSelect = null;
        let quickModal = null; // Initialize later to be safe

        const openQuickAdd = (selectEl) => {
            if (!quickModal) {
                const qEl = document.getElementById('quickAddInsumoModal');
                if (qEl) quickModal = new bootstrap.Modal(qEl);
            }
            triggeringSelect = selectEl;
            document.getElementById('quick-insumo-form').reset();
            if (quickModal) quickModal.show();
        };

        const attachQuickAddListener = (btn, select) => {
            btn.addEventListener('click', () => openQuickAdd(select));
        };

        // Helper to rebuild options (reuse shared builder)
        const refreshSelectOptions = (selectElement) => {
            selectElement.innerHTML = buildIngredientOptions(null, null);
        };

        const formQuick = document.getElementById('quick-insumo-form');
        if (formQuick) {
            formQuick.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = e.target.querySelector('button[type="submit"]');
                btn.disabled = true;

                const nameRaw = document.getElementById('quick-insumo-name').value;
                const normalized = nameRaw.trim().toLowerCase();

                // Duplicate Check
                const isDupe = insumosDB.some(i => i.nombre.trim().toLowerCase() === normalized);
                if (isDupe) {
                    alert(`El insumo "${nameRaw}" ya existe.`);
                    btn.disabled = false;
                    return;
                }

                const newData = {
                    nombre: nameRaw,
                    categoria: document.getElementById('quick-insumo-cat').value,
                    unidad: document.getElementById('quick-insumo-unit').value,
                    costo: parseFloat(document.getElementById('quick-insumo-cost').value) || 0
                };

                try {
                    const ref = await addDoc(collection(db, "insumos"), newData);

                    // Add to local Cache
                    const newOption = { id: ref.id, ...newData };
                    insumosDB.push(newOption);

                    // Refresh All Dropdowns
                    const allSelects = document.querySelectorAll('.insumo-select');
                    allSelects.forEach(sel => {
                        const currentVal = sel.value; // Preserve selection
                        refreshSelectOptions(sel);
                        sel.value = currentVal;
                    });

                    // Auto Select in Triggering Element
                    if (triggeringSelect) {
                        refreshSelectOptions(triggeringSelect);
                        triggeringSelect.value = 'insumo:' + ref.id;
                    }

                    if (quickModal) quickModal.hide();
                } catch (err) {
                    console.error(err);
                    alert("Error creando insumo: " + err.message);
                } finally {
                    btn.disabled = false;
                }
            });
        }

        init();
    }
};
