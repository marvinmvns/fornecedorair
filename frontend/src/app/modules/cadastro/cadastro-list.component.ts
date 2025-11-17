import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface CadastroOption {
  title: string;
  description: string;
  icon: string;
  route: string;
  iconBgClass: string;
  cardClass: string;
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
      description: 'Gerenciar usuários',
      icon: 'fas fa-users',
      route: '/cadastro/users',
      iconBgClass: 'bg-info',
      cardClass: 'card-info'
    },
    {
      title: 'Fornecedores',
      description: 'Gerenciar fornecedores',
      icon: 'fas fa-store',
      route: '/cadastro/suppliers',
      iconBgClass: 'bg-warning',
      cardClass: 'card-warning'
    },
    {
      title: 'Instaladores',
      description: 'Gerenciar instaladores',
      icon: 'fas fa-tools',
      route: '/cadastro/installers',
      iconBgClass: 'bg-success',
      cardClass: 'card-success'
    },
    {
      title: 'Modelos',
      description: 'Gerenciar catálogo',
      icon: 'fas fa-wind',
      route: '/cadastro/models',
      iconBgClass: 'bg-primary',
      cardClass: 'card-primary'
    }
  ];

  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
