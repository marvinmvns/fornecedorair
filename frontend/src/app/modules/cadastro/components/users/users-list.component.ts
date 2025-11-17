import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-users-list',
  standalone: false,
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.http.get<User[]>(`${environment.apiUrl}/users`)
      .subscribe({
        next: (users) => {
          this.users = users;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erro ao carregar usuários';
          this.loading = false;
          console.error(err);
        }
      });
  }

  get filteredUsers(): User[] {
    if (!this.searchTerm) {
      return this.users;
    }

    const term = this.searchTerm.toLowerCase();
    return this.users.filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  }

  createUser(): void {
    this.router.navigate(['/cadastro/users/new']);
  }

  editUser(id: string): void {
    this.router.navigate(['/cadastro/users', id]);
  }

  toggleUserStatus(user: User): void {
    if (!confirm(`Deseja ${user.isActive ? 'desativar' : 'ativar'} o usuário ${user.name}?`)) {
      return;
    }

    this.http.patch(`${environment.apiUrl}/users/${user.id}/status`, {
      isActive: !user.isActive
    }).subscribe({
      next: () => {
        user.isActive = !user.isActive;
      },
      error: (err) => {
        alert('Erro ao alterar status do usuário');
        console.error(err);
      }
    });
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

  back(): void {
    this.router.navigate(['/cadastro']);
  }
}
