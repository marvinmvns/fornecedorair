import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-suppliers-form',
  standalone: false,
  templateUrl: './suppliers-form.component.html',
  styleUrls: ['./suppliers-form.component.scss']
})
export class SuppliersFormComponent implements OnInit {
  supplierForm: FormGroup;
  isEditMode = false;
  supplierId: string | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.supplierForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      whatsappNumber: [''],
      apiUrl: [''],
      averageLeadTimeDays: [7, [Validators.required, Validators.min(1)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.supplierId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.supplierId;

    if (this.isEditMode) {
      this.loadSupplier();
    }
  }

  loadSupplier(): void {
    if (!this.supplierId) return;

    this.loading = true;
    this.http.get(`${environment.apiUrl}/suppliers/${this.supplierId}`)
      .subscribe({
        next: (supplier: any) => {
          this.supplierForm.patchValue({
            name: supplier.name,
            whatsappNumber: supplier.whatsappNumber,
            apiUrl: supplier.apiUrl,
            averageLeadTimeDays: supplier.averageLeadTimeDays,
            isActive: supplier.isActive
          });
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erro ao carregar fornecedor';
          this.loading = false;
          console.error(err);
        }
      });
  }

  onSubmit(): void {
    if (this.supplierForm.invalid) {
      Object.keys(this.supplierForm.controls).forEach(key => {
        this.supplierForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formData = {
      name: this.supplierForm.get('name')?.value,
      whatsappNumber: this.supplierForm.get('whatsappNumber')?.value || null,
      apiUrl: this.supplierForm.get('apiUrl')?.value || null,
      averageLeadTimeDays: this.supplierForm.get('averageLeadTimeDays')?.value,
      isActive: this.supplierForm.get('isActive')?.value
    };

    this.loading = true;
    this.error = null;

    const request = this.isEditMode
      ? this.http.put(`${environment.apiUrl}/suppliers/${this.supplierId}`, formData)
      : this.http.post(`${environment.apiUrl}/suppliers`, formData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/cadastro/suppliers']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erro ao salvar fornecedor';
        this.loading = false;
        console.error(err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/cadastro/suppliers']);
  }

  hasError(field: string, error: string): boolean {
    const control = this.supplierForm.get(field);
    return !!(control?.hasError(error) && control?.touched);
  }
}
