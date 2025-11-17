import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-supplier-detail',
  standalone: false,
  templateUrl: './supplier-detail.component.html',
  styleUrls: ['./supplier-detail.component.scss']
})
export class SupplierDetailComponent implements OnInit {
  supplier: any = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSupplier(id);
    }
  }

  loadSupplier(id: string) {
    this.loading = true;
    this.error = null;

    this.api.getSupplier(id).subscribe({
      next: (data) => {
        this.supplier = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar fornecedor';
        this.loading = false;
        console.error(err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/suppliers']);
  }

  editSupplier() {
    this.router.navigate(['/suppliers', this.supplier.id, 'edit']);
  }

  deleteSupplier() {
    if (confirm(`Tem certeza que deseja excluir o fornecedor "${this.supplier.name}"?`)) {
      // TODO: Implementar exclusão
      console.log('Excluindo fornecedor:', this.supplier.id);
      this.router.navigate(['/suppliers']);
    }
  }

  toggleStatus() {
    // TODO: Implementar alteração de status
    this.supplier.isActive = !this.supplier.isActive;
    console.log('Status alterado:', this.supplier.isActive);
  }
}
