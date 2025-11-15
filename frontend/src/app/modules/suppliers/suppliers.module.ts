import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SuppliersListComponent } from './suppliers-list.component';

const routes: Routes = [
  { path: '', component: SuppliersListComponent }
];

@NgModule({
  declarations: [SuppliersListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class SuppliersModule { }
