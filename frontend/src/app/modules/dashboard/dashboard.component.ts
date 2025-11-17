import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  template: `
    <div class="container-fluid">
      <div class="row">
        <!-- KPI Cards -->
        <div class="col-md-3">
          <div class="card">
            <div class="card-body text-center">
              <h3 class="text-primary">{{ stats.open }}</h3>
              <p class="text-muted mb-0">Cotações Abertas</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card">
            <div class="card-body text-center">
              <h3 class="text-warning">{{ stats.waiting }}</h3>
              <p class="text-muted mb-0">Aguardando Fornecedores</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card">
            <div class="card-body text-center">
              <h3 class="text-success">{{ stats.completed }}</h3>
              <p class="text-muted mb-0">Propostas Enviadas</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card">
            <div class="card-body text-center">
              <h3 class="text-info">{{ stats.total }}</h3>
              <p class="text-muted mb-0">Total do Mês</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Quotations -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Últimas Cotações</h5>
            </div>
            <div class="card-body">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Origem</th>
                    <th>Status</th>
                    <th>Data</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let q of recentQuotations">
                    <td>#{{ q.id?.substring(0, 8) }}</td>
                    <td>{{ q.installer?.name }}</td>
                    <td><span class="badge bg-secondary">{{ q.originChannel }}</span></td>
                    <td><span class="badge" [ngClass]="getStatusClass(q.status)">{{ getStatusLabel(q.status) }}</span></td>
                    <td>{{ q.createdAt | date:'short' }}</td>
                    <td>
                      <a [routerLink]="['/quotations', q.id]" class="btn btn-sm btn-primary">Ver detalhes</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      transition: transform 0.2s;
    }
    .card:hover {
      transform: translateY(-5px);
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats = {
    open: 0,
    waiting: 0,
    completed: 0,
    total: 0
  };

  recentQuotations: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.api.getQuotations().subscribe(quotations => {
      this.recentQuotations = quotations.slice(0, 10);
      this.stats.total = quotations.length;
      this.stats.open = quotations.filter(q => q.status === 'OPEN').length;
      this.stats.waiting = quotations.filter(q => q.status === 'WAITING_SUPPLIERS').length;
      this.stats.completed = quotations.filter(q => q.status === 'PROPOSAL_SENT').length;
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
      'WAITING_SUPPLIERS': 'Aguardando',
      'RECEIVED_SUPPLIERS': 'Recebido',
      'PROPOSAL_SENT': 'Enviado',
      'CLOSED': 'Fechado'
    };
    return map[status] || status;
  }
}
