import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../core/models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  currentUser$!: Observable<User | null>;
  showDropdown = false;

  @Output() sidebarToggle = new EventEmitter<void>();

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
    if (path.includes('cadastro')) return 'Cadastros';
    return 'FornecedorAir';
  }

  getRoleBadgeClass(role: UserRole): string {
    const roleClasses: { [key in UserRole]: string } = {
      [UserRole.ADMIN]: 'badge-danger',
      [UserRole.SALES_MANAGER]: 'badge-success',
      [UserRole.ATTENDANT]: 'badge-primary',
      [UserRole.VIEW_ONLY]: 'badge-info'
    };
    return roleClasses[role] || 'badge-info';
  }

  getRoleLabel(role: UserRole): string {
    const roleLabels: { [key in UserRole]: string } = {
      [UserRole.ADMIN]: 'Admin',
      [UserRole.SALES_MANAGER]: 'Gerente',
      [UserRole.ATTENDANT]: 'Atendente',
      [UserRole.VIEW_ONLY]: 'Visualização'
    };
    return roleLabels[role] || role;
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  logout(): void {
    this.authService.logout();
  }

  onImageError(event: any, userName: string): void {
    const firstLetter = userName.charAt(0).toUpperCase();
    const size = event.target.width || 32;
    event.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'%3E%3Ccircle cx='${size/2}' cy='${size/2}' r='${size/2}' fill='%23007bff'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='${size/2}'%3E${firstLetter}%3C/text%3E%3C/svg%3E`;
  }
}
