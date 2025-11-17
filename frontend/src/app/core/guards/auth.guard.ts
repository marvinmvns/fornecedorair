import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
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
    return false;
  }
}
