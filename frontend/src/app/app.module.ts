import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

// Importar interceptor de autenticação
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

// Importar CoreModule com diretivas e serviços globais
import { CoreModule } from './core/core.module';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule
  ],
  providers: [
    // Registrar HTTP Interceptor para adicionar JWT automaticamente
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
<<<<<<< HEAD
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
=======
>>>>>>> 214a1b9e45700bde4bdfe756f4b36b06e1ff278d
  bootstrap: [AppComponent]
})
export class AppModule { }
