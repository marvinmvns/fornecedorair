import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-quotations-list',
  standalone: false,
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0">Cotações</h4>
        <div>
          <select class="form-select d-inline-block w-auto me-2" [(ngModel)]="statusFilter" (change)="loadQuotations()">
            <option value="">Todos os status</option>
            <option value="OPEN">Aberto</option>
            <option value="WAITING_SUPPLIERS">Aguardando</option>
            <option value="RECEIVED_SUPPLIERS">Recebido</option>
            <option value="PROPOSAL_SENT">Enviado</option>
          </select>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Descrição</th>
                <th>Área (m²)</th>
                <th>Cidade</th>
                <th>Origem</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let q of quotations">
                <td class="text-muted">#{{ q.id?.substring(0, 8) }}</td>
                <td>
                  <strong>{{ q.installer?.name }}</strong><br>
                  <small class="text-muted">{{ q.installer?.whatsappNumber }}</small>
                </td>
                <td>{{ q.description?.substring(0, 50) }}...</td>
                <td>{{ q.environmentAreaM2 || '-' }}</td>
                <td>{{ q.locationCity || '-' }}</td>
                <td><span class="badge bg-info">{{ q.originChannel }}</span></td>
                <td><span class="badge" [ngClass]="getStatusClass(q.status)">{{ getStatusLabel(q.status) }}</span></td>
                <td>{{ q.createdAt | date:'dd/MM/yy HH:mm' }}</td>
                <td>
                  <a [routerLink]="['/quotations', q.id]" class="btn btn-sm btn-primary">Detalhes</a>
                </td>
              </tr>
              <tr *ngIf="quotations.length === 0">
                <td colspan="9" class="text-center text-muted py-4">Nenhuma cotação encontrada</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class QuotationsListComponent implements OnInit {
  quotations: any[] = [];
  statusFilter = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadQuotations();
  }

  loadQuotations() {
    const filters: any = {};
    if (this.statusFilter) filters.status = this.statusFilter;

    this.api.getQuotations(filters).subscribe(data => {
      this.quotations = data;
    });
  }

  getStatusClass(status: string): string {
    const map: any = {
      'OPEN': 'status-open',
      'WAITING_SUPPLIERS': 'status-waiting',
      'RECEIVED_SUPPLIERS': 'status-received',
      'PROPOSAL_SENT': 'status-sent',
      'CLOSED': 'status-closed'
    };
    return map[status] || 'bg-secondary';
  }

  getStatusLabel(status: string): string {
    const map: any = {
      'OPEN': 'Aberto',
      'WAITING_SUPPLIERS': 'Aguardando Fornecedores',
      'RECEIVED_SUPPLIERS': 'Cotações Recebidas',
      'PROPOSAL_SENT': 'Proposta Enviada',
      'CLOSED': 'Fechado'
    };
    return map[status] || status;
  }
}
