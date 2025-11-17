import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SuppliersListComponent } from './suppliers-list.component';
import { SupplierDetailComponent } from './supplier-detail.component';

const routes: Routes = [
  { path: '', component: SuppliersListComponent },
  { path: ':id', component: SupplierDetailComponent }
];

@NgModule({
  declarations: [
    SuppliersListComponent,
    SupplierDetailComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class SuppliersModule { }
