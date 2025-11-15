import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'quotations',
    loadChildren: () => import('./modules/quotations/quotations.module').then(m => m.QuotationsModule)
  },
  {
    path: 'catalog',
    loadChildren: () => import('./modules/catalog/catalog.module').then(m => m.CatalogModule)
  },
  {
    path: 'suppliers',
    loadChildren: () => import('./modules/suppliers/suppliers.module').then(m => m.SuppliersModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
