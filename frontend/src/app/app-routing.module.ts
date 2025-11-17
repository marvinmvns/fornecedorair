import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { UserRole } from './core/models/user.model';

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
    canActivate: [AuthGuard],
    data: { roles: [UserRole.ADMIN, UserRole.SALES_MANAGER] }
  },

  // Fornecedores - requer autenticação (ADMIN ou SALES_MANAGER)
  {
    path: 'suppliers',
    loadChildren: () => import('./modules/suppliers/suppliers.module').then(m => m.SuppliersModule),
    canActivate: [AuthGuard],
    data: { roles: [UserRole.ADMIN, UserRole.SALES_MANAGER] }
  },

  // Cadastros - requer autenticação (ADMIN)
  {
    path: 'cadastro',
    loadChildren: () => import('./modules/cadastro/cadastro.module').then(m => m.CadastroModule),
    canActivate: [AuthGuard],
    data: { roles: [UserRole.ADMIN] }
  },

  // Chat WhatsApp - requer autenticação (ADMIN, SALES_MANAGER, ATTENDANT)
  {
    path: 'chat',
    loadChildren: () => import('./modules/chat/chat.module').then(m => m.ChatModule),
    canActivate: [AuthGuard],
    data: { roles: [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.ATTENDANT] }
  },

  // Configurações - requer autenticação
  {
    path: 'settings',
    loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule),
    canActivate: [AuthGuard]
  },

  // Rota wildcard - redireciona para dashboard
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
