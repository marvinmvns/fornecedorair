import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-installers-form',
  standalone: false,
  templateUrl: './installers-form.component.html',
  styleUrls: ['./installers-form.component.scss']
})
export class InstallersFormComponent implements OnInit {
  installerForm: FormGroup;
  isEditMode = false;
  installerId: string | null = null;
  loading = false;
  error: string | null = null;

  brazilianStates = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.installerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      whatsappNumber: ['', [Validators.required]],
      companyName: [''],
      city: [''],
      state: [''],
      zipCode: ['']
    });
  }

  ngOnInit(): void {
    this.installerId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.installerId;

    if (this.isEditMode) {
      this.loadInstaller();
    }
  }

  loadInstaller(): void {
    if (!this.installerId) return;

    this.loading = true;
    this.http.get(`${environment.apiUrl}/installers/${this.installerId}`)
      .subscribe({
        next: (installer: any) => {
          this.installerForm.patchValue({
            name: installer.name,
            whatsappNumber: installer.whatsappNumber,
            companyName: installer.companyName || '',
            city: installer.city || '',
            state: installer.state || '',
            zipCode: installer.zipCode || ''
          });
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erro ao carregar instalador';
          this.loading = false;
          console.error(err);
        }
      });
  }

  onSubmit(): void {
    if (this.installerForm.invalid) {
      Object.keys(this.installerForm.controls).forEach(key => {
        this.installerForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formData = {
      name: this.installerForm.get('name')?.value,
      whatsappNumber: this.installerForm.get('whatsappNumber')?.value,
      companyName: this.installerForm.get('companyName')?.value || null,
      city: this.installerForm.get('city')?.value || null,
      state: this.installerForm.get('state')?.value || null,
      zipCode: this.installerForm.get('zipCode')?.value || null
    };

    this.loading = true;
    this.error = null;

    const request = this.isEditMode
      ? this.http.put(`${environment.apiUrl}/installers/${this.installerId}`, formData)
      : this.http.post(`${environment.apiUrl}/installers`, formData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/cadastro/installers']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erro ao salvar instalador';
        this.loading = false;
        console.error(err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/cadastro/installers']);
  }

  hasError(field: string, error: string): boolean {
    const control = this.installerForm.get(field);
    return !!(control?.hasError(error) && control?.touched);
  }
}
