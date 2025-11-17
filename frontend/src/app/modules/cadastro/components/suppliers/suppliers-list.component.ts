import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface Supplier {
  id: string;
  name: string;
  whatsappNumber: string;
  apiUrl: string;
  isActive: boolean;
  averageLeadTimeDays: number;
  createdAt: string;
}

@Component({
  selector: 'app-suppliers-list',
  standalone: false,
  templateUrl: './suppliers-list.component.html',
  styleUrls: ['./suppliers-list.component.scss']
})
export class SuppliersListComponent implements OnInit {
  suppliers: Supplier[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.loading = true;
    this.error = null;

    this.http.get<Supplier[]>(`${environment.apiUrl}/suppliers`)
      .subscribe({
        next: (suppliers) => {
          this.suppliers = suppliers;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erro ao carregar fornecedores';
          this.loading = false;
          console.error(err);
        }
      });
  }

  get filteredSuppliers(): Supplier[] {
    if (!this.searchTerm) {
      return this.suppliers;
    }

    const term = this.searchTerm.toLowerCase();
    return this.suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(term) ||
      (supplier.whatsappNumber && supplier.whatsappNumber.toLowerCase().includes(term))
    );
  }

  createSupplier(): void {
    this.router.navigate(['/cadastro/suppliers/new']);
  }

  editSupplier(id: string): void {
    this.router.navigate(['/cadastro/suppliers', id]);
  }

  toggleSupplierStatus(supplier: Supplier): void {
    if (!confirm(`Deseja ${supplier.isActive ? 'desativar' : 'ativar'} o fornecedor ${supplier.name}?`)) {
      return;
    }

    this.http.patch(`${environment.apiUrl}/suppliers/${supplier.id}/status`, {
      isActive: !supplier.isActive
    }).subscribe({
      next: () => {
        supplier.isActive = !supplier.isActive;
      },
      error: (err) => {
        alert('Erro ao alterar status do fornecedor');
        console.error(err);
      }
    });
  }

  back(): void {
    this.router.navigate(['/cadastro']);
  }
}
