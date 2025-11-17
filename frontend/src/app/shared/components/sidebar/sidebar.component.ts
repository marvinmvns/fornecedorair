import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed = false;

  currentUser: User | null = null;
  cadastrosExpanded = false;
  searchQuery = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleCadastros(): void {
    this.cadastrosExpanded = !this.cadastrosExpanded;
  }

  onSearch(): void {
    // Implementar busca no menu se necessário
    if (this.searchQuery) {
      console.log('Buscando:', this.searchQuery);
    }
  }

  getUserInitials(): string {
    if (!this.currentUser?.name) {
      return 'U';
    }
    const names = this.currentUser.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  getUserDisplayName(): string {
    return this.currentUser?.name || 'Usuário';
  }

  getUserRole(): string {
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'SALES_MANAGER': 'Gerente de Vendas',
      'ATTENDANT': 'Atendente',
      'VIEW_ONLY': 'Visualizador'
    };
    return roleMap[this.currentUser?.role || ''] || 'Usuário';
  }
}
