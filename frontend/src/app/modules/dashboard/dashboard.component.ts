import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  stats = {
    open: 0,
    waiting: 0,
    completed: 0,
    total: 0
  };

  recentQuotations: any[] = [];

  // Gráfico de Linha - Cotações por Período
  lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [65, 59, 80, 81, 56, 55, 40],
        label: 'Cotações',
        backgroundColor: 'rgba(23, 162, 184, 0.2)',
        borderColor: 'rgba(23, 162, 184, 1)',
        pointBackgroundColor: 'rgba(23, 162, 184, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(23, 162, 184, 0.8)',
        fill: 'origin',
        tension: 0.4
      }
    ],
    labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho']
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10
        }
      }
    }
  };

  lineChartType: ChartType = 'line';

  // Gráfico de Pizza - Distribuição por Status
  pieChartData: ChartData<'pie'> = {
    labels: ['Aberto', 'Aguardando', 'Recebido', 'Enviado', 'Fechado'],
    datasets: [{
      data: [30, 25, 15, 20, 10],
      backgroundColor: [
        'rgba(23, 162, 184, 0.8)',   // Info - Cyan
        'rgba(255, 193, 7, 0.8)',    // Warning - Yellow
        'rgba(40, 167, 69, 0.8)',    // Success - Green
        'rgba(0, 123, 255, 0.8)',    // Primary - Blue
        'rgba(108, 117, 125, 0.8)'   // Secondary - Gray
      ],
      borderColor: [
        'rgba(23, 162, 184, 1)',
        'rgba(255, 193, 7, 1)',
        'rgba(40, 167, 69, 1)',
        'rgba(0, 123, 255, 1)',
        'rgba(108, 117, 125, 1)'
      ],
      borderWidth: 1
    }]
  };

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      tooltip: {
        enabled: true
      }
    }
  };

  pieChartType: ChartType = 'pie';

  infoBoxes = {
    whatsappMessages: 0,
    activeSuppliers: 0,
    installers: 0,
    products: 0
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    // Load stats from API
    this.api.getDashboardStats().subscribe(stats => {
      this.stats = stats;
    });

    // Load info boxes from API
    this.api.getDashboardInfoBoxes().subscribe(infoBoxes => {
      this.infoBoxes = infoBoxes;
    });

    // Load quotations timeline
    this.api.getDashboardQuotationsTimeline('monthly', 7).subscribe(timeline => {
      this.lineChartData = {
        datasets: [{
          data: timeline.data,
          label: 'Cotações',
          backgroundColor: 'rgba(23, 162, 184, 0.2)',
          borderColor: 'rgba(23, 162, 184, 1)',
          pointBackgroundColor: 'rgba(23, 162, 184, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(23, 162, 184, 0.8)',
          fill: 'origin',
          tension: 0.4
        }],
        labels: timeline.labels
      };
    });

    // Load quotations by status
    this.api.getDashboardQuotationsByStatus().subscribe(statusData => {
      this.pieChartData = {
        labels: statusData.labels,
        datasets: [{
          data: statusData.data,
          backgroundColor: statusData.backgroundColor,
          borderColor: statusData.backgroundColor.map((color: string) =>
            color.replace('0.8', '1')
          ),
          borderWidth: 1
        }]
      };
    });

    // Load recent quotations
    this.api.getQuotations().subscribe(quotations => {
      this.recentQuotations = quotations.slice(0, 10);
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
    return map[status] || 'badge-info';
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
