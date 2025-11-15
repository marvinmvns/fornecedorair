import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  template: `
    <header class="bg-white border-bottom px-4 py-3">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0">{{ getPageTitle() }}</h5>
        <div>
          <span class="badge bg-primary me-2">Atendente</span>
          <span class="text-muted">Admin</span>
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent {
  getPageTitle(): string {
    const path = window.location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('quotations')) return 'Cotações';
    if (path.includes('catalog')) return 'Catálogo de Produtos';
    if (path.includes('suppliers')) return 'Fornecedores';
    return 'FornecedorAir';
  }
}
