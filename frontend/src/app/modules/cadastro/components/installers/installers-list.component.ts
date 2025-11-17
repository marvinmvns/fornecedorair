import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface Installer {
  id: string;
  name: string;
  whatsappNumber: string;
  companyName: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  createdAt: string;
}

@Component({
  selector: 'app-installers-list',
  standalone: false,
  templateUrl: './installers-list.component.html',
  styleUrls: ['./installers-list.component.scss']
})
export class InstallersListComponent implements OnInit {
  installers: Installer[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInstallers();
  }

  loadInstallers(): void {
    this.loading = true;
    this.error = null;

    this.http.get<Installer[]>(`${environment.apiUrl}/installers`)
      .subscribe({
        next: (installers) => {
          this.installers = installers;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erro ao carregar instaladores';
          this.loading = false;
          console.error(err);
        }
      });
  }

  get filteredInstallers(): Installer[] {
    if (!this.searchTerm) {
      return this.installers;
    }

    const term = this.searchTerm.toLowerCase();
    return this.installers.filter(installer =>
      installer.name.toLowerCase().includes(term) ||
      (installer.whatsappNumber && installer.whatsappNumber.toLowerCase().includes(term)) ||
      (installer.companyName && installer.companyName.toLowerCase().includes(term)) ||
      (installer.city && installer.city.toLowerCase().includes(term))
    );
  }

  createInstaller(): void {
    this.router.navigate(['/cadastro/installers/new']);
  }

  editInstaller(id: string): void {
    this.router.navigate(['/cadastro/installers', id]);
  }

  deleteInstaller(installer: Installer): void {
    if (!confirm(`Deseja realmente excluir o instalador ${installer.name}?`)) {
      return;
    }

    this.http.delete(`${environment.apiUrl}/installers/${installer.id}`)
      .subscribe({
        next: () => {
          this.loadInstallers();
        },
        error: (err) => {
          alert('Erro ao excluir instalador');
          console.error(err);
        }
      });
  }

  back(): void {
    this.router.navigate(['/cadastro']);
  }
}
