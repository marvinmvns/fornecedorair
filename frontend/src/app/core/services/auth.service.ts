import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  User,
  LoginRequest,
  LoginResponse,
  ChangePasswordRequest,
  ResetPasswordRequest
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'fornecedorair_token';
  private readonly USER_KEY = 'fornecedorair_user';

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = this.getStoredUser();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();

    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(!!storedUser && !!this.getToken());
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  }

  /**
   * Realizar login
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setSession(response);
        })
      );
  }

  /**
   * Realizar logout
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Obter perfil do usuário autenticado
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/auth/profile`)
      .pipe(
        tap(user => {
          this.setUser(user);
        })
      );
  }

  /**
   * Alterar senha
   */
  changePassword(request: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/change-password`,
      request
    );
  }

  /**
   * Solicitar reset de senha
   */
  resetPassword(request: ResetPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/reset-password`,
      request
    );
  }

  /**
   * Verificar se usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUserSubject.value;
  }

  /**
   * Obter token JWT
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obter usuário atual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar se usuário tem uma determinada role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Verificar se usuário tem qualquer uma das roles especificadas
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Armazenar sessão após login
   */
  private setSession(authResult: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.accessToken);
    this.setUser(authResult.user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Armazenar dados do usuário
   */
  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Recuperar usuário do localStorage
   */
  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}
