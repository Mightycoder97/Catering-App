// js/app.js
import { insumosView } from './insumos.js';
import { clientesView } from './clientes.js';
import { recetasView } from './recetas.js';
import { presupuestoView } from './presupuesto.js';

class App {
    constructor() {
        this.appContent = document.getElementById('app-content');
        this.routes = {
            'insumos': insumosView,
            'recetas': recetasView,
            'presupuesto': presupuestoView,
            'clientes': clientesView
        };
        this.currentRoute = null;
    }

    init() {
        // Default route
        this.navigate('insumos');
    }

    async navigate(route) {
        if (!this.routes[route]) {
            console.error(`Route ${route} not found`);
            return;
        }

        // Update UI active state
        document.querySelectorAll('.nav-link').forEach(el => {
            el.classList.remove('active');
            if (el.getAttribute('onclick')?.includes(route)) {
                el.classList.add('active');
            }
        });

        this.currentRoute = route;

        // Show loading
        this.appContent.innerHTML = `
            <div class="text-center mt-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p>Cargando...</p>
            </div>`;

        try {
            const viewContent = await this.routes[route].render();
            this.appContent.innerHTML = viewContent;

            // Execute post-render logic (event listeners, etc)
            if (this.routes[route].postRender) {
                await this.routes[route].postRender();
            }

            // Add fade-in animation
            this.appContent.firstChild?.classList?.add('fade-in');

        } catch (error) {
            console.error('Error rendering view:', error);
            this.appContent.innerHTML = `<div class="alert alert-danger">Error cargando la vista: ${error.message}</div>`;
        }
    }
}

// Initialize App
window.app = {
    router: new App()
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    window.app.router.init();
});
