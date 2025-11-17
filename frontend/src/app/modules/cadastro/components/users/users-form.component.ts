import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-users-form',
  standalone: false,
  templateUrl: './users-form.component.html',
  styleUrls: ['./users-form.component.scss']
})
export class UsersFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  loading = false;
  error: string | null = null;

  roles = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'SALES_MANAGER', label: 'Gerente de Vendas' },
    { value: 'ATTENDANT', label: 'Atendente' },
    { value: 'VIEW_ONLY', label: 'Visualização' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['ATTENDANT', Validators.required],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId;

    if (this.isEditMode) {
      this.loadUser();
      // Em modo de edição, a senha é opcional
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      // Em modo de criação, a senha é obrigatória
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  loadUser(): void {
    if (!this.userId) return;

    this.loading = true;
    this.http.get(`${environment.apiUrl}/users/${this.userId}`)
      .subscribe({
        next: (user: any) => {
          this.userForm.patchValue({
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive
          });
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erro ao carregar usuário';
          this.loading = false;
          console.error(err);
        }
      });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    const password = this.userForm.get('password')?.value;
    const confirmPassword = this.userForm.get('confirmPassword')?.value;

    if (password && password !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    const formData = {
      name: this.userForm.get('name')?.value,
      email: this.userForm.get('email')?.value,
      role: this.userForm.get('role')?.value,
      isActive: this.userForm.get('isActive')?.value
    };

    // Adicionar senha apenas se foi preenchida
    if (password) {
      (formData as any).password = password;
    }

    this.loading = true;
    this.error = null;

    const request = this.isEditMode
      ? this.http.put(`${environment.apiUrl}/users/${this.userId}`, formData)
      : this.http.post(`${environment.apiUrl}/users`, formData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/cadastro/users']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erro ao salvar usuário';
        this.loading = false;
        console.error(err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/cadastro/users']);
  }

  hasError(field: string, error: string): boolean {
    const control = this.userForm.get(field);
    return !!(control?.hasError(error) && control?.touched);
  }
}
