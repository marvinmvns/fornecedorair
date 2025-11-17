import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Diretiva estrutural para controlar visibilidade baseada em roles
 *
 * Uso:
 * <div *appHasRole="'ADMIN'">Apenas admins veem isso</div>
 * <div *appHasRole="['ADMIN', 'SALES_MANAGER']">Admins e gerentes veem isso</div>
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private requiredRoles: UserRole[] = [];

  @Input() set appHasRole(roles: UserRole | UserRole[]) {
    this.requiredRoles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Observar mudanças no usuário atual
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    const user = this.authService.getCurrentUser();

    // Limpar view
    this.viewContainer.clear();

    // Se usuário tem uma das roles requeridas, mostrar elemento
    if (user && this.requiredRoles.includes(user.role)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
