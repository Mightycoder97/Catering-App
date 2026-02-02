// js/clientes.js
import { db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, isDbReady } from './firebase-config.js';

export const clientesView = {
    render: async () => {
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2><i class="bi bi-people me-2"></i>Gestión de Clientes</h2>
                <button class="btn btn-primary" id="btn-add-client" data-bs-toggle="modal" data-bs-target="#clientModal">
                    <i class="bi bi-plus-lg me-1"></i> Nuevo Cliente
                </button>
            </div>

            <!-- Client List -->
            <div class="card shadow-sm">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Empresa / Nombre</th>
                                    <th>Contacto</th>
                                    <th>Email / Teléfono</th>
                                    <th>Ubicación</th>
                                    <th class="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="clients-table-body">
                                <!-- JS Injection -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Add/Edit Modal -->
            <div class="modal fade" id="clientModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="clientModalLabel">Nuevo Cliente</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="client-form">
                                <input type="hidden" id="client-id">
                                <div class="mb-3">
                                    <label class="form-label">Nombre Empresa / Cliente</label>
                                    <input type="text" class="form-control" id="client-name" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Persona de Contacto</label>
                                    <input type="text" class="form-control" id="client-contact">
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Email</label>
                                        <input type="email" class="form-control" id="client-email">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Teléfono</label>
                                        <input type="text" class="form-control" id="client-phone">
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Dirección</label>
                                    <textarea class="form-control" id="client-address" rows="2"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="btn-save-client">Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    postRender: async () => {
        const tableBody = document.getElementById('clients-table-body');
        const form = document.getElementById('client-form');
        const btnSave = document.getElementById('btn-save-client');
        const modalEl = document.getElementById('clientModal');
        const modal = new bootstrap.Modal(modalEl);

        let editingId = null;

        const loadClients = async () => {
            if (!isDbReady()) return;
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Cargando...</td></tr>';
            try {
                const snap = await getDocs(collection(db, "clientes"));
                if (snap.empty) {
                    tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay clientes registrados.</td></tr>';
                    return;
                }

                tableBody.innerHTML = '';
                snap.forEach(docSnap => {
                    const data = docSnap.data();
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td class="fw-bold">${data.nombre}</td>
                        <td>${data.contacto || '-'}</td>
                        <td>
                            <div class="small">${data.email || ''}</div>
                            <div class="small text-muted">${data.telefono || ''}</div>
                        </td>
                        <td class="small text-truncate" style="max-width: 150px;">${data.direccion || '-'}</td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-outline-primary me-1 edit-client" data-id="${docSnap.id}">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-client" data-id="${docSnap.id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                     `;
                    tableBody.appendChild(tr);
                });

                attachListeners();
            } catch (e) {
                console.error(e);
                tableBody.innerHTML = `<tr><td colspan="5" class="text-danger">Error: ${e.message}</td></tr>`;
            }
        };

        const attachListeners = () => {
            document.querySelectorAll('.edit-client').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.closest('button').dataset.id;
                    await openEdit(id);
                });
            });

            document.querySelectorAll('.delete-client').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.closest('button').dataset.id;
                    if (confirm("¿Eliminar este cliente?")) {
                        await deleteDoc(doc(db, "clientes", id));
                        loadClients();
                    }
                });
            });
        };

        const openEdit = async (id) => {
            editingId = id;
            document.getElementById('clientModalLabel').innerText = "Editar Cliente";
            // In a real app we might fetch specific doc, or use cache. 
            // For now, let's just cheat and grab from UI or cache if we implemented it.
            // Let's implement simple fetch for correctness.
            // TODO: Optimize with cache if list is large.

            // Actually, let's keep it simple and just re-fetch or iterate rows?
            // Re-fetch is safer.
            // Or better, let's use the row data if we had it but we didn't store it in a comprehensive global cache yet.
            // Let's use a quick fetch.

            // To be efficient, let's just loop the current DOM/Table? No, that's messy.
            // Let's just fetch the doc.
            // Actually, let's rely on standard practice: getDoc. But I didn't import getDoc singular.
            // I'll skip getDoc and just iterate the table snapshot logic if I cached it.
            // Okay, let's just make it work. I'll simply reload all clients if I have to, or just find it.
            // Wait, I didn't import `getDoc`. I only have `getDocs` (plural).
            // Creating a new util function overhead.
            // I will add `getDoc` to imports later or just filter client-side since the list is small.

            // Workaround without editing imports in this file yet:
            // I'll cache data in `loadClients`.
            editClientFromCache(id);
        };

        let clientsCache = {};
        // Monkey-patch loadClients to cache
        const originalLoad = loadClients;
        // Actually, let's just rewrite loadClients body cleanly.

        btnSave.addEventListener('click', async () => {
            const nombre = document.getElementById('client-name').value.trim();
            if (!nombre) { alert("El nombre es obligatorio"); return; }

            const data = {
                nombre,
                contacto: document.getElementById('client-contact').value.trim(),
                email: document.getElementById('client-email').value.trim(),
                telefono: document.getElementById('client-phone').value.trim(),
                direccion: document.getElementById('client-address').value.trim()
            };

            try {
                if (editingId) {
                    await updateDoc(doc(db, "clientes", editingId), data);
                } else {
                    await addDoc(collection(db, "clientes"), data);
                }
                modal.hide();
                resetForm();
                loadClients();
            } catch (e) {
                alert("Error: " + e.message);
            }
        });

        const resetForm = () => {
            editingId = null;
            form.reset();
            document.getElementById('clientModalLabel').innerText = "Nuevo Cliente";
        };

        // Modal reset on close
        modalEl.addEventListener('hidden.bs.modal', resetForm);

        // Override loadClients for Caching
        const robustLoadClients = async () => {
            if (!isDbReady()) return;
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Cargando...</td></tr>';
            try {
                const snap = await getDocs(collection(db, "clientes"));
                clientsCache = {};

                if (snap.empty) {
                    tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay clientes.</td></tr>';
                    return;
                }

                tableBody.innerHTML = '';
                snap.forEach(docSnap => {
                    const data = docSnap.data();
                    clientsCache[docSnap.id] = data;

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td class="fw-bold">${data.nombre}</td>
                        <td>${data.contacto || '-'}</td>
                        <td>
                            <div class="small">${data.email || ''}</div>
                            <div class="small text-muted">${data.telefono || ''}</div>
                        </td>
                        <td class="small text-truncate" style="max-width: 150px;">${data.direccion || '-'}</td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-outline-primary me-1 edit-client" data-id="${docSnap.id}">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-client" data-id="${docSnap.id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                     `;
                    tableBody.appendChild(tr);
                });
                attachListeners();
            } catch (e) { console.error(e); }
        };

        const editClientFromCache = (id) => {
            const data = clientsCache[id];
            if (!data) return;
            editingId = id;
            document.getElementById('client-name').value = data.nombre;
            document.getElementById('client-contact').value = data.contacto || '';
            document.getElementById('client-email').value = data.email || '';
            document.getElementById('client-phone').value = data.telefono || '';
            document.getElementById('client-address').value = data.direccion || '';
            document.getElementById('clientModalLabel').innerText = "Editar Cliente";
            modal.show();
        };

        // Start
        robustLoadClients();
    }
};
