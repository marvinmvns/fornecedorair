import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <!-- AdminLTE Wrapper -->
    <div class="wrapper">
      <!-- Navbar -->
      <app-header (sidebarToggle)="toggleSidebar()"></app-header>

      <!-- Main Sidebar Container -->
      <app-sidebar [isCollapsed]="sidebarCollapsed"></app-sidebar>

      <!-- Content Wrapper -->
      <div class="content-wrapper">
        <!-- Main content -->
        <section class="content">
          <div class="container-fluid">
            <router-outlet></router-outlet>
          </div>
        </section>
      </div>

      <!-- Main Footer -->
      <footer class="main-footer">
        <strong>Copyright &copy; 2024-2025 <a href="https://fornecedorair.com.br" target="_blank">FornecedorAir</a>.</strong>
        Todos os direitos reservados.
        <div class="float-right d-none d-sm-inline-block">
          <b>Versão</b> 1.1.0
        </div>
      </footer>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'FornecedorAir';
  sidebarCollapsed = false;

  ngOnInit(): void {
    // Initialize sidebar state from localStorage if needed
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      this.sidebarCollapsed = savedState === 'true';
      this.updateBodyClass();
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.updateBodyClass();
    // Save state to localStorage
    localStorage.setItem('sidebar-collapsed', this.sidebarCollapsed.toString());
  }

  private updateBodyClass(): void {
    if (this.sidebarCollapsed) {
      document.body.classList.add('sidebar-collapse');
    } else {
      document.body.classList.remove('sidebar-collapse');
    }
  }
}
