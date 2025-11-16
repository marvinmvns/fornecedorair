import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HasRoleDirective } from './directives/has-role.directive';

/**
 * Core Module
 * Contém serviços singleton, guards, interceptors e diretivas globais
 */
@NgModule({
  declarations: [
    HasRoleDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    HasRoleDirective
  ]
})
export class CoreModule { }
