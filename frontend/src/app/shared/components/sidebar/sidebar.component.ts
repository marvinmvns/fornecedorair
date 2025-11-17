import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  template: `
    <div class="sidebar p-3" style="width: 250px;">
      <div class="text-center mb-4">
        <h4 class="text-white mb-0">FornecedorAir</h4>
        <small class="text-white-50">Sistema de Cotações</small>
      </div>

      <nav class="nav flex-column">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link text-white">
          <i class="bi bi-speedometer2 me-2"></i> Dashboard
        </a>
        <a routerLink="/quotations" routerLinkActive="active" class="nav-link text-white">
          <i class="bi bi-file-earmark-text me-2"></i> Cotações
        </a>
        <a routerLink="/catalog" routerLinkActive="active" class="nav-link text-white">
          <i class="bi bi-box me-2"></i> Catálogo
        </a>
        <a routerLink="/suppliers" routerLinkActive="active" class="nav-link text-white">
          <i class="bi bi-building me-2"></i> Fornecedores
        </a>
        <a routerLink="/cadastro" routerLinkActive="active" class="nav-link text-white">
          <i class="bi bi-database me-2"></i> Cadastros
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .nav-link {
      border-radius: 8px;
      margin-bottom: 0.5rem;
      transition: all 0.3s;
    }
    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.2);
      font-weight: 600;
    }
  `]
})
export class SidebarComponent {}
