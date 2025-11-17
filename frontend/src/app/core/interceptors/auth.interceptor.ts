import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Obter token do AuthService
    const token = this.authService.getToken();

    // Clonar request e adicionar header de autenticação se token existir
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Processar request e tratar erros
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Se erro 401 (Unauthorized), fazer logout
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: this.router.url }
          });
        }

        // Se erro 403 (Forbidden), redirecionar para página de acesso negado
        if (error.status === 403) {
          this.router.navigate(['/access-denied']);
        }

        return throwError(() => error);
      })
    );
  }
}
