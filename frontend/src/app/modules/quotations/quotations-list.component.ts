import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-quotations-list',
  standalone: false,
  templateUrl: './quotations-list.component.html',
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
