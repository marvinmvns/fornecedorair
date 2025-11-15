import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogListComponent } from './catalog-list.component';

const routes: Routes = [
  { path: '', component: CatalogListComponent }
];

@NgModule({
  declarations: [CatalogListComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class CatalogModule { }
