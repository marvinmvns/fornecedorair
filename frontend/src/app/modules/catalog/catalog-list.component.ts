import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-catalog-list',
  standalone: false,
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0">Catálogo de Ar-Condicionado</h4>
        <div>
          <input type="text" class="form-control d-inline-block w-auto" placeholder="Buscar marca..." [(ngModel)]="searchBrand" (input)="loadProducts()">
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>BTU</th>
                <th>Tipo</th>
                <th>Inverter</th>
                <th>Voltagem</th>
                <th>Eficiência</th>
                <th>Área (m²)</th>
                <th>Custo Base</th>
                <th>Preço Sugerido</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of products">
                <td>{{ product.sku }}</td>
                <td><strong>{{ product.brand }}</strong></td>
                <td>{{ product.modelName }}</td>
                <td>{{ product.btuCapacity }}</td>
                <td><span class="badge bg-secondary">{{ product.type }}</span></td>
                <td>{{ product.inverter ? '✅' : '❌' }}</td>
                <td>{{ product.voltage }}</td>
                <td><span class="badge bg-success">{{ product.energyEfficiencyClass }}</span></td>
                <td>{{ product.recommendedAreaM2 || '-' }}</td>
                <td>R$ {{ product.baseCost?.toFixed(2) }}</td>
                <td>R$ {{ product.suggestedRetailPrice?.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CatalogListComponent implements OnInit {
  products: any[] = [];
  searchBrand = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    const filters: any = {};
    if (this.searchBrand) filters.brand = this.searchBrand;

    this.api.getAirConditioners(filters).subscribe(data => {
      this.products = data;
    });
  }
}
