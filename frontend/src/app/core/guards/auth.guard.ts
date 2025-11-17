import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
=======
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
>>>>>>> 214a1b9e45700bde4bdfe756f4b36b06e1ff278d
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
<<<<<<< HEAD
  ): boolean {
    if (this.authService.isAuthenticated()) {
      // Check if route requires specific roles
      const requiredRoles = route.data['roles'] as string[];

      if (requiredRoles && !this.authService.hasRole(requiredRoles)) {
        // User doesn't have required role, redirect to dashboard
        this.router.navigate(['/dashboard']);
        return false;
      }

      return true;
    }

    // Not authenticated, redirect to login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
=======
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Verificar se usuário está autenticado
    if (this.authService.isAuthenticated()) {
      // Verificar se rota requer roles específicas
      const requiredRoles = route.data['roles'] as string[];

      if (requiredRoles && requiredRoles.length > 0) {
        // Verificar se usuário tem alguma das roles necessárias
        if (this.authService.hasAnyRole(requiredRoles)) {
          return true;
        } else {
          // Usuário autenticado mas sem permissão
          this.router.navigate(['/access-denied']);
          return false;
        }
      }

      // Rota não requer roles específicas, permitir acesso
      return true;
    }

    // Não autenticado, redirecionar para login
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
>>>>>>> 214a1b9e45700bde4bdfe756f4b36b06e1ff278d
    return false;
  }
}
