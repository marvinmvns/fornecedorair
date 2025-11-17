import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
<<<<<<< HEAD
=======
import { UserRole } from './core/models/user.model';
>>>>>>> 214a1b9e45700bde4bdfe756f4b36b06e1ff278d

const routes: Routes = [
  // Rota padrão redireciona para dashboard
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Módulo de autenticação (login, access-denied) - rotas públicas
  {
    path: '',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },

  // Dashboard - requer autenticação
  {
    path: 'login',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },

  // Cotações - requer autenticação (qualquer usuário autenticado)
  {
    path: 'quotations',
    loadChildren: () => import('./modules/quotations/quotations.module').then(m => m.QuotationsModule),
    canActivate: [AuthGuard]
  },

  // Catálogo - requer autenticação (ADMIN ou SALES_MANAGER)
  {
    path: 'catalog',
    loadChildren: () => import('./modules/catalog/catalog.module').then(m => m.CatalogModule),
<<<<<<< HEAD
    canActivate: [AuthGuard]
=======
    canActivate: [AuthGuard],
    data: { roles: [UserRole.ADMIN, UserRole.SALES_MANAGER] }
>>>>>>> 214a1b9e45700bde4bdfe756f4b36b06e1ff278d
  },

  // Fornecedores - requer autenticação (ADMIN ou SALES_MANAGER)
  {
    path: 'suppliers',
    loadChildren: () => import('./modules/suppliers/suppliers.module').then(m => m.SuppliersModule),
    canActivate: [AuthGuard],
<<<<<<< HEAD
    data: { roles: ['ADMIN', 'SALES_MANAGER'] }
  }
=======
    data: { roles: [UserRole.ADMIN, UserRole.SALES_MANAGER] }
  },

  // Rota wildcard - redireciona para dashboard
  { path: '**', redirectTo: '/dashboard' }
>>>>>>> 214a1b9e45700bde4bdfe756f4b36b06e1ff278d
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
