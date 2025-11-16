import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  error = '';
  returnUrl = '/';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Se já estiver autenticado, redirecionar para dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }

    // Criar formulário
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Obter URL de retorno dos query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  /**
   * Getter para facilitar acesso aos campos do formulário
   */
  get f() {
    return this.loginForm.controls;
  }

  /**
   * Submeter formulário de login
   */
  onSubmit(): void {
    // Parar se formulário for inválido
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        // Login bem sucedido, redirecionar
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        // Tratar erro
        this.error = error.error?.message || 'Erro ao fazer login. Verifique suas credenciais.';
        this.loading = false;
      }
    });
  }
}
