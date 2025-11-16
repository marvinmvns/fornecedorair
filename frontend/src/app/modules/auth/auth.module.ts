import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

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
  }
];

@NgModule({
  declarations: [
    LoginComponent,
    AccessDeniedComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class AuthModule { }
