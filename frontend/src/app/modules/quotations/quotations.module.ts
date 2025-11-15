import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuotationsListComponent } from './quotations-list.component';
import { QuotationDetailComponent } from './quotation-detail.component';

const routes: Routes = [
  { path: '', component: QuotationsListComponent },
  { path: ':id', component: QuotationDetailComponent }
];

@NgModule({
  declarations: [
    QuotationsListComponent,
    QuotationDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class QuotationsModule { }
