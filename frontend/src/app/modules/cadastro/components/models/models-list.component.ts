import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface AirConditionerModel {
  id: string;
  sku: string;
  brand: string;
  modelName: string;
  btuCapacity: number;
  type: string;
  inverter: boolean;
  voltage: string;
  energyEfficiencyClass: string;
  noiseLevelDb: number | null;
  wifiEnabled: boolean;
  recommendedAreaM2: number | null;
  baseCost: number;
  suggestedRetailPrice: number;
  features: string | null;
  isActive: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-models-list',
  standalone: false,
  templateUrl: './models-list.component.html',
  styleUrls: ['./models-list.component.scss']
})
export class ModelsListComponent implements OnInit {
  models: AirConditionerModel[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadModels();
  }

  loadModels(): void {
    this.loading = true;
    this.error = null;

    this.http.get<AirConditionerModel[]>(`${environment.apiUrl}/air-conditioner-models`)
      .subscribe({
        next: (models) => {
          this.models = models;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erro ao carregar modelos de ar-condicionado';
          this.loading = false;
          console.error(err);
        }
      });
  }

  get filteredModels(): AirConditionerModel[] {
    if (!this.searchTerm) {
      return this.models;
    }

    const term = this.searchTerm.toLowerCase();
    return this.models.filter(model =>
      model.sku.toLowerCase().includes(term) ||
      model.brand.toLowerCase().includes(term) ||
      model.modelName.toLowerCase().includes(term) ||
      model.type.toLowerCase().includes(term)
    );
  }

  createModel(): void {
    this.router.navigate(['/cadastro/models/new']);
  }

  editModel(id: string): void {
    this.router.navigate(['/cadastro/models', id]);
  }

  toggleModelStatus(model: AirConditionerModel): void {
    if (!confirm(`Deseja ${model.isActive ? 'desativar' : 'ativar'} o modelo ${model.modelName}?`)) {
      return;
    }

    this.http.patch(`${environment.apiUrl}/air-conditioner-models/${model.id}/status`, {
      isActive: !model.isActive
    }).subscribe({
      next: () => {
        model.isActive = !model.isActive;
      },
      error: (err) => {
        alert('Erro ao alterar status do modelo');
        console.error(err);
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  getTypeLabel(type: string): string {
    const typeLabels: { [key: string]: string } = {
      'split': 'Split',
      'janela': 'Janela',
      'cassete': 'Cassete',
      'piso-teto': 'Piso Teto',
      'dutado': 'Dutado'
    };
    return typeLabels[type] || type;
  }

  back(): void {
    this.router.navigate(['/cadastro']);
  }
}
