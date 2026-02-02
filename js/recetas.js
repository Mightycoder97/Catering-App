import { db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, storage, ref, uploadBytes, getDownloadURL, isDbReady } from './firebase-config.js';

export const recetasView = {
    render: async () => {
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2><i class="bi bi-journal-text me-2"></i>Recetas / Platos</h2>
                <button class="btn btn-primary" id="btn-show-create-recipe">
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
                                            <label class="form-label">Precio de Venta (S/.)</label>
                                            <input type="number" class="form-control" id="recipe-sale-price" placeholder="0.00" step="0.01">
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
                                                <option value="Otro">Otro</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label d-flex justify-content-between">
                                        Ingredientes
                                        <button type="button" class="btn btn-sm btn-outline-secondary" id="btn-add-ingredient-row">
                                            <i class="bi bi-plus"></i> Agregar Insumo
                                        </button>
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
        `;
    },

    postRender: async () => {
        const container = document.getElementById('recipe-cards-container');
        const modalEl = document.getElementById('recipeModal');
        const modal = new bootstrap.Modal(modalEl);
        const form = document.getElementById('recipe-form');
        const ingredientsList = document.getElementById('ingredients-list');

        let insumosDB = []; // Cache for selector

        const init = async () => {
            if (!isDbReady()) return;

            // Load Insumos for Selector
            const iSnap = await getDocs(collection(db, "insumos"));
            iSnap.forEach(doc => insumosDB.push({ id: doc.id, ...doc.data() }));

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
                    data.ingredientes.forEach(ing => {
                        const ins = insumosDB.find(i => i.id === ing.insumoId);
                        if (ins) cost += (ing.quantity * ins.costo);
                    });
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
                            <p class="card-text text-muted small">Costo Est: S/. ${cost.toFixed(2)}</p>
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

        const addIngredientRow = (data = null) => {
            const row = document.createElement('div');
            row.className = 'row g-2 mb-2 ingredient-row align-items-center';

            let options = `<option value="">Selecciona insumo...</option>`;
            insumosDB.forEach(i => {
                const selected = (data && data.insumoId === i.id) ? 'selected' : '';
                options += `<option value="${i.id}" ${selected}>${i.nombre} (S/. ${i.costo}/${i.unidad})</option>`;
            });

            row.innerHTML = `
                <div class="col-7">
                    <select class="form-select form-select-sm insumo-select" required>
                        ${options}
                    </select>
                </div>
                <div class="col-3">
                    <input type="number" class="form-control form-control-sm quantity-input" placeholder="Cant." step="0.01" value="${data ? data.quantity : ''}" required>
                </div>
                <div class="col-2 text-end">
                    <button type="button" class="btn btn-sm text-danger btn-remove-row"><i class="bi bi-trash"></i></button>
                </div>
             `;

            row.querySelector('.btn-remove-row').addEventListener('click', () => row.remove());
            ingredientsList.appendChild(row);
        };

        document.getElementById('btn-show-create-recipe').addEventListener('click', () => {
            document.getElementById('recipe-form').reset();
            document.getElementById('recipe-sale-price').value = '';
            document.getElementById('recipe-id').value = '';
            document.getElementById('recipe-image-url').value = '';
            document.getElementById('recipe-image-url').value = '';
            document.getElementById('recipe-description').value = ''; // Reset desc
            document.getElementById('recipe-meal-type').value = '';
            document.getElementById('recipe-cuisine-style').value = '';
            ingredientsList.innerHTML = '';
            addIngredientRow();
            document.getElementById('recipeModalLabel').innerText = "Nueva Receta";
            modal.show();
        });

        document.getElementById('btn-add-ingredient-row').addEventListener('click', () => addIngredientRow());

        const openEdit = async (id) => {
            const snap = await getDocs(collection(db, "recetas")); // Optimizable
            let data;
            snap.forEach(d => { if (d.id === id) data = d.data(); });

            if (!data) return;

            document.getElementById('recipe-id').value = id;
            document.getElementById('recipe-name').value = data.nombre;
            document.getElementById('recipe-sale-price').value = data.precioVenta || '';
            document.getElementById('recipe-image-url').value = data.imageUrl || '';
            document.getElementById('recipe-description').value = data.descripcion || ''; // Load desc
            document.getElementById('recipe-meal-type').value = data.tipoComida || '';
            document.getElementById('recipe-cuisine-style').value = data.estiloCocina || '';
            document.getElementById('recipeModalLabel').innerText = "Editar Receta";

            ingredientsList.innerHTML = '';
            if (data.ingredientes && data.ingredientes.length > 0) {
                data.ingredientes.forEach(ing => addIngredientRow(ing));
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
                const insumoId = r.querySelector('.insumo-select').value;
                const quantity = parseFloat(r.querySelector('.quantity-input').value);
                if (insumoId && quantity > 0) {
                    ingredients.push({ insumoId, quantity });
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
                    descripcion: document.getElementById('recipe-description').value.trim(), // Save desc
                    tipoComida: document.getElementById('recipe-meal-type').value,
                    estiloCocina: document.getElementById('recipe-cuisine-style').value,
                    imageUrl: imageUrl,
                    ingredientes: ingredients,
                    updatedAt: new Date()
                };

                if (id) {
                    await updateDoc(doc(db, "recetas", id), docData);
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

        init();
    }
};
