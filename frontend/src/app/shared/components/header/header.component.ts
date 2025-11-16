import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../core/models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  currentUser$!: Observable<User | null>;
  showDropdown = false;

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
  }

  logout(): void {
    this.authService.logout();
  }
}
