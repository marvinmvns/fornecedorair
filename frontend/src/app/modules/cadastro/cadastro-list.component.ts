import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface CadastroOption {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-cadastro-list',
  standalone: false,
  templateUrl: './cadastro-list.component.html',
  styleUrls: ['./cadastro-list.component.scss']
})
export class CadastroListComponent {
  cadastroOptions: CadastroOption[] = [
    {
      title: 'Usuários',
      description: 'Gerenciar usuários do sistema',
      icon: 'people',
      route: '/cadastro/users',
      color: '#3f51b5'
    },
    {
      title: 'Fornecedores',
      description: 'Gerenciar fornecedores de equipamentos',
      icon: 'store',
      route: '/cadastro/suppliers',
      color: '#ff9800'
    },
    {
      title: 'Instaladores',
      description: 'Gerenciar instaladores parceiros',
      icon: 'build',
      route: '/cadastro/installers',
      color: '#4caf50'
    },
    {
      title: 'Modelos de Ar-Condicionado',
      description: 'Gerenciar catálogo de produtos',
      icon: 'ac_unit',
      route: '/cadastro/models',
      color: '#2196f3'
    }
  ];

  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
