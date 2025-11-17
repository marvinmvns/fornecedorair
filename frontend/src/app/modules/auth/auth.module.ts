import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
<<<<<<< HEAD
import { LoginComponent } from './components/login.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
=======

import { LoginComponent } from './login/login.component';
import { AccessDeniedComponent } from './access-denied/access-denied.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent
>>>>>>> 214a1b9e45700bde4bdfe756f4b36b06e1ff278d
  }
];

@NgModule({
  declarations: [
<<<<<<< HEAD
    LoginComponent
=======
    LoginComponent,
    AccessDeniedComponent
>>>>>>> 214a1b9e45700bde4bdfe756f4b36b06e1ff278d
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class AuthModule { }
