import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-suppliers-list',
  standalone: false,
  templateUrl: './suppliers-list.component.html',
  styleUrls: ['./suppliers-list.component.scss']
})
export class SuppliersListComponent implements OnInit {
  suppliers: any[] = [];

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.api.getSuppliers().subscribe(data => {
      this.suppliers = data;
    });
  }

  getActiveSuppliers(): number {
    return this.suppliers.filter(s => s.isActive).length;
  }

  getAverageLeadTime(): number {
    if (this.suppliers.length === 0) return 0;
    const total = this.suppliers.reduce((sum, s) => sum + (s.averageLeadTimeDays || 0), 0);
    return Math.round(total / this.suppliers.length);
  }

  getSuppliersWithAPI(): number {
    return this.suppliers.filter(s => s.apiUrl).length;
  }

  viewDetails(supplier: any) {
    // Navigate to supplier detail view
    this.router.navigate(['/suppliers', supplier.id]);
  }

  editSupplier(supplier: any) {
    // Navigate to supplier edit form
    this.router.navigate(['/suppliers', supplier.id, 'edit']);
  }
}
