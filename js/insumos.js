// js/insumos.js
import { db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, isDbReady } from './firebase-config.js';

export const insumosView = {
    render: async () => {
        return `
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                <h2 class="mb-0"><i class="bi bi-basket me-2"></i>Insumos</h2>
                <button class="btn btn-primary w-100 w-md-auto" data-bs-toggle="modal" data-bs-target="#addInsumoModal">
                    <i class="bi bi-plus-lg me-1"></i> Nuevo Insumo
                </button>
            </div>

            <div class="card p-3 mb-4">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Unidad</th>
                                <th>Costo</th>
                                <th class="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="insumos-table-body">
                            <!-- Rows loaded via JS -->
                            <tr><td colspan="4" class="text-center text-muted">Cargando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal Add Insumo -->
            <div class="modal fade" id="addInsumoModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Agregar Insumo</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="add-insumo-form">
                                <div class="mb-3">
                                    <label class="form-label">Nombre del Insumo</label>
                                    <input type="text" class="form-control" name="nombre" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Categoría</label>
                                    <select class="form-select" name="categoria" required>
                                        <option value="" selected disabled>Seleccione...</option>
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
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Unidad de Medida</label>
                                        <select class="form-select" name="unidad" required>
                                            <option value="kg">Kilogramo (kg)</option>
                                            <option value="g">Gramo (g)</option>
                                            <option value="l">Litro (l)</option>
                                            <option value="ml">Mililitro (ml)</option>
                                            <option value="und">Unidad (und)</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Costo por Unidad (S/.)</label>
                                        <input type="number" step="0.01" class="form-control" name="costo" required>
                                    </div>
                                </div>
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-primary">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    postRender: async () => {
        const tableBody = document.getElementById('insumos-table-body');
        const form = document.getElementById('add-insumo-form');

        // Load Data
        const loadInsumos = async () => {
            if (!isDbReady()) {
                tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-warning">Firebase no configurado. <br>Edita js/firebase-config.js</td></tr>`;
                return;
            }

            try {
                const querySnapshot = await getDocs(collection(db, "insumos"));
                tableBody.innerHTML = '';

                if (querySnapshot.empty) {
                    tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No hay insumos registrados.</td></tr>`;
                    return;
                }

                const insumos = [];
                querySnapshot.forEach(doc => insumos.push({ id: doc.id, ...doc.data() }));

                // Sort Alphabetically
                insumos.sort((a, b) => a.nombre.localeCompare(b.nombre));

                // Group by Category
                const grouped = {};
                const categoriesOrder = ['Verdura', 'Fruta', 'Carne', 'Abarrote', 'Lacteo', 'Embutido', 'Licor', 'Menaje', 'Otro'];

                insumos.forEach(item => {
                    const cat = item.categoria || 'Otro';
                    if (!grouped[cat]) grouped[cat] = [];
                    grouped[cat].push(item);
                });

                // Render Groups
                categoriesOrder.forEach(cat => {
                    if (grouped[cat] && grouped[cat].length > 0) {
                        // Category Header
                        const headerTr = document.createElement('tr');
                        headerTr.className = 'table-secondary fw-bold';
                        headerTr.innerHTML = `<td colspan="5">${cat}</td>`;
                        tableBody.appendChild(headerTr);

                        // Items
                        grouped[cat].forEach(data => {
                            const tr = document.createElement('tr');
                            tr.innerHTML = `
                                <td class="ps-4">${data.nombre}</td>
                                <td>${data.categoria || '-'}</td>
                                <td>${data.unidad}</td>
                                <td>S/. ${parseFloat(data.costo).toFixed(2)}</td>
                                <td class="text-end">
                                    <button class="btn btn-sm btn-outline-primary me-1 edit-btn" 
                                        data-id="${data.id}"
                                        data-nombre="${data.nombre}"
                                        data-categoria="${data.categoria || ''}"
                                        data-unidad="${data.unidad}"
                                        data-costo="${data.costo}">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${data.id}">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            `;
                            tableBody.appendChild(tr);
                        });
                    }
                });

                // Render "Others" not in list if any (fallback)
                Object.keys(grouped).forEach(cat => {
                    if (!categoriesOrder.includes(cat)) {
                        const headerTr = document.createElement('tr');
                        headerTr.className = 'table-secondary fw-bold';
                        headerTr.innerHTML = `<td colspan="5">${cat}</td>`;
                        tableBody.appendChild(headerTr);

                        grouped[cat].forEach(data => {
                            const tr = document.createElement('tr');
                            tr.innerHTML = `
                                <td class="ps-4">${data.nombre}</td>
                                <td>${data.categoria || '-'}</td>
                                <td>${data.unidad}</td>
                                <td>S/. ${parseFloat(data.costo).toFixed(2)}</td>
                                <td class="text-end">
                                    <button class="btn btn-sm btn-outline-primary me-1 edit-btn" 
                                        data-id="${data.id}"
                                        data-nombre="${data.nombre}"
                                        data-categoria="${data.categoria || ''}"
                                        data-unidad="${data.unidad}"
                                        data-costo="${data.costo}">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${data.id}">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            `;
                            tableBody.appendChild(tr);
                        });
                    }
                });

                // Attach delete listeners
                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        if (confirm('¿Seguro de eliminar este insumo?')) {
                            const id = e.target.closest('button').dataset.id;
                            await deleteDoc(doc(db, "insumos", id));
                            loadInsumos();
                        }
                    });
                });

                // Attach edit listeners
                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const btn = e.target.closest('button');
                        const dataset = btn.dataset;

                        form.elements['nombre'].value = dataset.nombre;
                        form.elements['categoria'].value = dataset.categoria;
                        form.elements['unidad'].value = dataset.unidad;
                        form.elements['costo'].value = dataset.costo;
                        form.dataset.editingId = dataset.id; // Store ID on form

                        document.querySelector('#addInsumoModal .modal-title').textContent = "Editar Insumo";
                        const modal = new bootstrap.Modal(document.getElementById('addInsumoModal'));
                        modal.show();
                    });
                });

            } catch (error) {
                console.error(error);
                tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error cargando datos: ${error.message}</td></tr>`;
            }
        };

        // Reset form on modal close
        const addInsumoModal = document.getElementById('addInsumoModal');
        addInsumoModal.addEventListener('hidden.bs.modal', () => {
            form.reset();
            delete form.dataset.editingId;
            document.querySelector('#addInsumoModal .modal-title').textContent = "Agregar Insumo";
        });

        // Save Data (Create or Update)
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const itemData = {
                nombre: formData.get('nombre'),
                categoria: formData.get('categoria'),
                unidad: formData.get('unidad'),
                costo: parseFloat(formData.get('costo'))
            };

            if (!isDbReady()) {
                alert("Firebase no está configurado. No se puede guardar.");
                return;
            }

            try {
                const editingId = form.dataset.editingId;
                if (editingId) {
                    // Update
                    await updateDoc(doc(db, "insumos", editingId), itemData);
                } else {
                    // Create
                    await addDoc(collection(db, "insumos"), itemData);
                }

                form.reset();
                delete form.dataset.editingId;
                const modal = bootstrap.Modal.getInstance(document.getElementById('addInsumoModal'));
                modal.hide();
                loadInsumos();
            } catch (error) {
                alert("Error guardando: " + error.message);
            }
        });

        // Fix ARIA focus issue: Auto-focus the first input when modal opens
        addInsumoModal.addEventListener('shown.bs.modal', () => {
            const inputNombre = form.querySelector('input[name="nombre"]');
            if (inputNombre) inputNombre.focus();
        });

        await loadInsumos();
    }
};
