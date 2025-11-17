import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: false,
  template: `
    <header class="bg-white border-bottom px-4 py-3">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0">{{ getPageTitle() }}</h5>
        <div *ngIf="currentUser$ | async as user" class="d-flex align-items-center gap-3">
          <div>
            <span class="badge bg-primary me-2">{{ getRoleLabel(user.role) }}</span>
            <span class="text-muted">{{ user.name }}</span>
          </div>
          <button class="btn btn-sm btn-outline-danger" (click)="logout()">Sair</button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .gap-3 {
      gap: 1rem;
    }
  `]
})
export class HeaderComponent implements OnInit {
  currentUser$!: Observable<User | null>;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
  }

  getPageTitle(): string {
    const path = window.location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('quotations')) return 'Cotações';
    if (path.includes('catalog')) return 'Catálogo de Produtos';
    if (path.includes('suppliers')) return 'Fornecedores';
    return 'FornecedorAir';
  }

  getRoleLabel(role: string): string {
    const roles: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'SALES_MANAGER': 'Gerente de Vendas',
      'ATTENDANT': 'Atendente',
      'VIEW_ONLY': 'Visualização'
    };
    return roles[role] || role;
  }

  logout(): void {
    this.authService.logout();
  }
}
