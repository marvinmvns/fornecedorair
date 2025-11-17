import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CadastroListComponent } from './cadastro-list.component';
import { UsersListComponent } from './components/users/users-list.component';
import { UsersFormComponent } from './components/users/users-form.component';
import { SuppliersListComponent } from './components/suppliers/suppliers-list.component';
import { SuppliersFormComponent } from './components/suppliers/suppliers-form.component';
import { InstallersListComponent } from './components/installers/installers-list.component';
import { InstallersFormComponent } from './components/installers/installers-form.component';
import { ModelsListComponent } from './components/models/models-list.component';
import { ModelsFormComponent } from './components/models/models-form.component';

const routes: Routes = [
  {
    path: '',
    component: CadastroListComponent
  },
  {
    path: 'users',
    component: UsersListComponent
  },
  {
    path: 'users/new',
    component: UsersFormComponent
  },
  {
    path: 'users/:id',
    component: UsersFormComponent
  },
  {
    path: 'suppliers',
    component: SuppliersListComponent
  },
  {
    path: 'suppliers/new',
    component: SuppliersFormComponent
  },
  {
    path: 'suppliers/:id',
    component: SuppliersFormComponent
  },
  {
    path: 'installers',
    component: InstallersListComponent
  },
  {
    path: 'installers/new',
    component: InstallersFormComponent
  },
  {
    path: 'installers/:id',
    component: InstallersFormComponent
  },
  {
    path: 'models',
    component: ModelsListComponent
  },
  {
    path: 'models/new',
    component: ModelsFormComponent
  },
  {
    path: 'models/:id',
    component: ModelsFormComponent
  }
];

@NgModule({
  declarations: [
    CadastroListComponent,
    UsersListComponent,
    UsersFormComponent,
    SuppliersListComponent,
    SuppliersFormComponent,
    InstallersListComponent,
    InstallersFormComponent,
    ModelsListComponent,
    ModelsFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class CadastroModule { }
