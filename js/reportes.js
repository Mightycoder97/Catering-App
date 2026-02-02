import { db, collection, getDocs } from './firebase-config.js';

export const reportesView = {
    render: async () => {
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2><i class="bi bi-graph-up-arrow me-2"></i>Reporte Financiero</h2>
                <div class="btn-group">
                    <button class="btn btn-outline-secondary active filter-btn" data-filter="week">Esta Semana</button>
                    <button class="btn btn-outline-secondary filter-btn" data-filter="month">Este Mes</button>
                    <button class="btn btn-outline-secondary filter-btn" data-filter="year">Este Año</button>
                    <button class="btn btn-outline-secondary filter-btn" data-filter="all">Todo</button>
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="row g-4 mb-4">
                <div class="col-md-4">
                    <div class="card shadow-sm border-success h-100">
                        <div class="card-body text-center">
                            <h6 class="text-muted text-uppercase mb-2">Ingresos (Ventas)</h6>
                            <h2 class="text-success fw-bold" id="kpi-revenue">S/. 0.00</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card shadow-sm border-danger h-100">
                        <div class="card-body text-center">
                            <h6 class="text-muted text-uppercase mb-2">Costos Totales (Insumos + Ops)</h6>
                            <h2 class="text-danger fw-bold" id="kpi-cost">S/. 0.00</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card shadow-sm border-primary h-100">
                        <div class="card-body text-center">
                            <h6 class="text-muted text-uppercase mb-2">Ganancia Neta</h6>
                            <h2 class="text-primary fw-bold" id="kpi-profit">S/. 0.00</h2>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Detail Table -->
            <div class="card shadow-sm">
                <div class="card-header bg-white">
                    <h5 class="mb-0">Desglose por Evento</h5>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>Fecha</th>
                                <th>Evento</th>
                                <th class="text-end">Venta</th>
                                <th class="text-end">Costo</th>
                                <th class="text-end">Margen</th>
                            </tr>
                        </thead>
                        <tbody id="report-table-body">
                            <!-- Rows -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    postRender: async () => {
        const kpiRevenue = document.getElementById('kpi-revenue');
        const kpiCost = document.getElementById('kpi-cost');
        const kpiProfit = document.getElementById('kpi-profit');
        const tableBody = document.getElementById('report-table-body');
        const filterBtns = document.querySelectorAll('.filter-btn');

        let allBudgets = [];

        const loadData = async () => {
            const snap = await getDocs(collection(db, "presupuestos"));
            allBudgets = [];
            snap.forEach(d => {
                const b = d.data();
                // Ensure date object
                let dateObj = null;
                if (b.startDate) dateObj = new Date(b.startDate);
                else if (b.createdAt && b.createdAt.seconds) dateObj = new Date(b.createdAt.seconds * 1000);

                // Costs Logic
                const revenue = b.totalClient || 0;
                // Cost = Ingredients (totalCost) + Ops (transport, etc)
                const ops = b.costs ? (b.costs.transport || 0) + (b.costs.lodging || 0) + (b.costs.staff || 0) + (b.costs.supplies || 0) : 0;
                const cost = (b.totalCost || 0) + ops; // totalCost stored is internal ingredients cost

                allBudgets.push({
                    eventName: b.eventName,
                    clientName: b.clientName,
                    date: dateObj,
                    revenue: revenue,
                    cost: cost,
                    profit: revenue - cost
                });
            });

            // Sort by date desc
            allBudgets.sort((a, b) => (b.date || 0) - (a.date || 0));

            applyFilter('week');
        };

        const applyFilter = (filter) => {
            const now = new Date();
            let filtered = [];

            filtered = allBudgets.filter(b => {
                if (!b.date) return false;
                if (filter === 'all') return true;

                const bDate = b.date;
                if (filter === 'year') {
                    return bDate.getFullYear() === now.getFullYear();
                }
                if (filter === 'month') {
                    return bDate.getMonth() === now.getMonth() && bDate.getFullYear() === now.getFullYear();
                }
                if (filter === 'week') {
                    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return bDate >= oneWeekAgo && bDate <= now;
                }
                return true;
            });

            renderDashboard(filtered);
        };

        const renderDashboard = (data) => {
            let totalRev = 0;
            let totalCost = 0;
            let totalProfit = 0;

            tableBody.innerHTML = '';

            if (data.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No hay datos en este periodo.</td></tr>`;
            } else {
                data.forEach(item => {
                    totalRev += item.revenue;
                    totalCost += item.cost;
                    totalProfit += item.profit;

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${item.date ? item.date.toLocaleDateString() : '-'}</td>
                        <td>
                            <div class="fw-bold">${item.eventName}</div>
                            <div class="small text-muted">${item.clientName || ''}</div>
                        </td>
                        <td class="text-end text-success">S/. ${item.revenue.toFixed(2)}</td>
                        <td class="text-end text-danger">S/. ${item.cost.toFixed(2)}</td>
                        <td class="text-end fw-bold ${item.profit >= 0 ? 'text-primary' : 'text-danger'}">S/. ${item.profit.toFixed(2)}</td>
                    `;
                    tableBody.appendChild(tr);
                });
            }

            // Update KPIs
            kpiRevenue.innerText = `S/. ${totalRev.toFixed(2)}`;
            kpiCost.innerText = `S/. ${totalCost.toFixed(2)}`;
            kpiProfit.innerText = `S/. ${totalProfit.toFixed(2)}`;
            if (totalProfit < 0) kpiProfit.classList.replace('text-primary', 'text-danger');
            else kpiProfit.classList.replace('text-danger', 'text-primary');
        };

        // Listeners
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                applyFilter(e.target.dataset.filter);
            });
        });

        await loadData();
    }
};
