import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HasRoleDirective } from './directives/has-role.directive';

/**
 * Core Module
 * Contém serviços singleton, guards, interceptors e diretivas globais
 */
@NgModule({
  imports: [
    CommonModule,
    HasRoleDirective
  ],
  exports: [
    HasRoleDirective
  ]
})
export class CoreModule { }
