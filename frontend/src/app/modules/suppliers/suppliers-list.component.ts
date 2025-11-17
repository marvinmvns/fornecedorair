import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-suppliers-list',
  standalone: false,
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0">Fornecedores</h4>
      </div>

      <div class="row">
        <div class="col-md-4" *ngFor="let supplier of suppliers">
          <div class="card mb-3">
            <div class="card-body">
              <h5 class="card-title">{{ supplier.name }}</h5>
              <p class="mb-2"><strong>WhatsApp:</strong> {{ supplier.whatsappNumber || '-' }}</p>
              <p class="mb-2"><strong>API URL:</strong> {{ supplier.apiUrl || '-' }}</p>
              <p class="mb-2"><strong>Lead Time Médio:</strong> {{ supplier.averageLeadTimeDays }} dias</p>
              <span class="badge" [ngClass]="supplier.isActive ? 'bg-success' : 'bg-secondary'">
                {{ supplier.isActive ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="suppliers.length === 0" class="text-center text-muted py-5">
        Nenhum fornecedor cadastrado
      </div>
    </div>
  `,
  styles: []
})
export class SuppliersListComponent implements OnInit {
  suppliers: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.api.getSuppliers().subscribe(data => {
      this.suppliers = data;
    });
  }
}
