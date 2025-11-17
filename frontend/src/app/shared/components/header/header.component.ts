import { Component, OnInit } from '@angular/core';
<<<<<<< HEAD
import { AuthService, User } from '../../../core/services/auth.service';
=======
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../core/models/user.model';
>>>>>>> 214a1b9e45700bde4bdfe756f4b36b06e1ff278d
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
<<<<<<< HEAD
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
=======
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  currentUser$!: Observable<User | null>;
  showDropdown = false;
>>>>>>> 214a1b9e45700bde4bdfe756f4b36b06e1ff278d

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

<<<<<<< HEAD
  getRoleLabel(role: string): string {
    const roles: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'SALES_MANAGER': 'Gerente de Vendas',
      'ATTENDANT': 'Atendente',
      'VIEW_ONLY': 'Visualização'
    };
    return roles[role] || role;
=======
  getRoleBadgeClass(role: UserRole): string {
    const roleClasses: { [key in UserRole]: string } = {
      [UserRole.ADMIN]: 'bg-danger',
      [UserRole.SALES_MANAGER]: 'bg-success',
      [UserRole.ATTENDANT]: 'bg-primary',
      [UserRole.VIEW_ONLY]: 'bg-secondary'
    };
    return roleClasses[role] || 'bg-secondary';
  }

  getRoleLabel(role: UserRole): string {
    const roleLabels: { [key in UserRole]: string } = {
      [UserRole.ADMIN]: 'Administrador',
      [UserRole.SALES_MANAGER]: 'Gerente de Vendas',
      [UserRole.ATTENDANT]: 'Atendente',
      [UserRole.VIEW_ONLY]: 'Visualização'
    };
    return roleLabels[role] || role;
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
>>>>>>> 214a1b9e45700bde4bdfe756f4b36b06e1ff278d
  }

  logout(): void {
    this.authService.logout();
  }
}
