import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
=======
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
>>>>>>> 214a1b9e45700bde4bdfe756f4b36b06e1ff278d
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

<<<<<<< HEAD
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get token from auth service
    const token = this.authService.getToken();

    // Clone request and add authorization header if token exists
=======
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Obter token do AuthService
    const token = this.authService.getToken();

    // Clonar request e adicionar header de autenticação se token existir
>>>>>>> 214a1b9e45700bde4bdfe756f4b36b06e1ff278d
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

<<<<<<< HEAD
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Unauthorized - token expired or invalid
          this.authService.logout();
        }
=======
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

>>>>>>> 214a1b9e45700bde4bdfe756f4b36b06e1ff278d
        return throwError(() => error);
      })
    );
  }
}
