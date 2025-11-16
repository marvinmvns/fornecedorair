# Guia de Autenticação do Frontend - FornecedorAir

Este documento descreve como a autenticação está implementada no frontend Angular e como utilizá-la.

## Arquitetura

A autenticação no frontend está organizada em:

```
frontend/src/app/
├── core/
│   ├── models/
│   │   └── user.model.ts              # Interfaces e enums de autenticação
│   ├── services/
│   │   └── auth.service.ts            # Serviço de autenticação
│   ├── guards/
│   │   └── auth.guard.ts              # Guard para proteção de rotas
│   ├── interceptors/
│   │   └── auth.interceptor.ts        # Interceptor HTTP para JWT
│   ├── directives/
│   │   └── has-role.directive.ts      # Diretiva para controle de visibilidade
│   └── core.module.ts
└── modules/
    └── auth/
        ├── login/
        │   ├── login.component.ts
        │   ├── login.component.html
        │   └── login.component.scss
        ├── access-denied/
        │   └── ...
        └── auth.module.ts
```

## Componentes Principais

### 1. AuthService

Serviço responsável por gerenciar a autenticação do usuário.

**Localização:** `frontend/src/app/core/services/auth.service.ts`

**Principais métodos:**

```typescript
// Fazer login
login(credentials: LoginRequest): Observable<LoginResponse>

// Fazer logout
logout(): void

// Obter perfil do usuário
getProfile(): Observable<User>

// Verificar se está autenticado
isAuthenticated(): boolean

// Obter token JWT
getToken(): string | null

// Obter usuário atual
getCurrentUser(): User | null

// Verificar se tem uma role específica
hasRole(role: string): boolean

// Verificar se tem alguma das roles
hasAnyRole(roles: string[]): boolean

// Alterar senha
changePassword(request: ChangePasswordRequest): Observable<{message: string}>

// Resetar senha
resetPassword(request: ResetPasswordRequest): Observable<{message: string}>
```

**Observables:**

```typescript
// Observable do usuário atual
currentUser$: Observable<User | null>

// Observable do status de autenticação
isAuthenticated$: Observable<boolean>
```

**Exemplo de uso:**

```typescript
import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';

export class MyComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Observar usuário atual
    this.authService.currentUser$.subscribe(user => {
      console.log('Usuário:', user);
    });

    // Verificar se está autenticado
    if (this.authService.isAuthenticated()) {
      console.log('Usuário autenticado');
    }

    // Verificar role
    if (this.authService.hasRole('ADMIN')) {
      console.log('Usuário é admin');
    }
  }

  login() {
    this.authService.login({
      email: 'admin@alpha.com',
      password: 'password123'
    }).subscribe({
      next: (response) => {
        console.log('Login bem sucedido', response);
      },
      error: (error) => {
        console.error('Erro no login', error);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
```

### 2. AuthGuard

Guard para proteger rotas que requerem autenticação.

**Localização:** `frontend/src/app/core/guards/auth.guard.ts`

**Uso no routing:**

```typescript
import { AuthGuard } from './core/guards/auth.guard';
import { UserRole } from './core/models/user.model';

const routes: Routes = [
  // Rota pública
  { path: 'login', component: LoginComponent },

  // Rota protegida - requer autenticação
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },

  // Rota protegida - requer role específica
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: [UserRole.ADMIN] }
  },

  // Rota protegida - requer uma das roles
  {
    path: 'catalog',
    component: CatalogComponent,
    canActivate: [AuthGuard],
    data: { roles: [UserRole.ADMIN, UserRole.SALES_MANAGER] }
  }
];
```

### 3. AuthInterceptor

Interceptor HTTP que adiciona automaticamente o token JWT a todas as requisições.

**Localização:** `frontend/src/app/core/interceptors/auth.interceptor.ts`

**Funcionalidades:**
- Adiciona header `Authorization: Bearer <token>` automaticamente
- Redireciona para login em caso de erro 401 (Unauthorized)
- Redireciona para página de acesso negado em caso de erro 403 (Forbidden)

**Configuração:**

O interceptor é registrado em `app.module.ts`:

```typescript
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }
]
```

**Uso automático:**

```typescript
// O token é adicionado automaticamente
this.http.get('/api/v1/quotations').subscribe(data => {
  // Request já inclui header Authorization
});
```

### 4. HasRoleDirective

Diretiva estrutural para controlar a visibilidade de elementos baseado nas roles do usuário.

**Localização:** `frontend/src/app/core/directives/has-role.directive.ts`

**Uso:**

```html
<!-- Mostrar apenas para ADMIN -->
<button *appHasRole="'ADMIN'">Deletar</button>

<!-- Mostrar para ADMIN ou SALES_MANAGER -->
<div *appHasRole="['ADMIN', 'SALES_MANAGER']">
  <h3>Relatórios Gerenciais</h3>
</div>

<!-- Exemplo prático no menu -->
<nav>
  <a routerLink="/dashboard">Dashboard</a>
  <a routerLink="/quotations">Cotações</a>
  <a *appHasRole="['ADMIN', 'SALES_MANAGER']" routerLink="/catalog">Catálogo</a>
  <a *appHasRole="'ADMIN'" routerLink="/users">Usuários</a>
</nav>
```

## Fluxo de Autenticação

### 1. Login

```
Usuário acessa /login
       ↓
Preenche credenciais
       ↓
Submete formulário
       ↓
AuthService.login() chama API
       ↓
Backend valida credenciais
       ↓
Backend retorna JWT + dados do usuário
       ↓
AuthService armazena token no localStorage
       ↓
AuthService atualiza currentUser$ Subject
       ↓
Usuário é redirecionado para dashboard
```

### 2. Requisições Autenticadas

```
Component faz requisição HTTP
       ↓
AuthInterceptor captura requisição
       ↓
AuthInterceptor obtém token do localStorage
       ↓
AuthInterceptor adiciona header Authorization
       ↓
Requisição é enviada ao backend com JWT
       ↓
Backend valida JWT
       ↓
Backend processa requisição
       ↓
Response retorna ao component
```

### 3. Proteção de Rotas

```
Usuário tenta acessar rota protegida
       ↓
AuthGuard intercepta navegação
       ↓
AuthGuard verifica se está autenticado
       ↓
Se SIM → Verifica roles (se necessário)
       ↓
Se tem permissão → Permite navegação
Se NÃO tem permissão → Redireciona para /access-denied
       ↓
Se NÃO autenticado → Redireciona para /login
```

### 4. Logout

```
Usuário clica em "Sair"
       ↓
AuthService.logout() é chamado
       ↓
Token é removido do localStorage
       ↓
Dados do usuário são removidos
       ↓
currentUser$ é atualizado para null
       ↓
Usuário é redirecionado para /login
```

## Roles e Permissões

O sistema possui 4 níveis de acesso:

### ADMIN
- **Label:** Administrador
- **Badge:** Vermelho (bg-danger)
- **Permissões:** Acesso total ao sistema
- **Pode acessar:**
  - Dashboard
  - Cotações
  - Catálogo
  - Fornecedores
  - Usuários
  - Configurações

### SALES_MANAGER
- **Label:** Gerente de Vendas
- **Badge:** Verde (bg-success)
- **Permissões:** Gerenciar cotações, fornecedores e relatórios
- **Pode acessar:**
  - Dashboard
  - Cotações
  - Catálogo
  - Fornecedores
  - Relatórios

### ATTENDANT
- **Label:** Atendente
- **Badge:** Azul (bg-primary)
- **Permissões:** Criar e gerenciar cotações
- **Pode acessar:**
  - Dashboard
  - Cotações (criar, editar, visualizar)
  - Catálogo (visualizar)

### VIEW_ONLY
- **Label:** Visualização
- **Badge:** Cinza (bg-secondary)
- **Permissões:** Apenas visualizar dados
- **Pode acessar:**
  - Dashboard (visualizar)
  - Cotações (visualizar)

## Componentes de Autenticação

### LoginComponent

Componente de login do sistema.

**Rota:** `/login`

**Features:**
- Formulário reativo com validação
- Feedback visual de erros
- Loading state durante login
- Credenciais de teste visíveis (remover em produção)
- Redirecionamento após login

**Credenciais de teste:**
```
Admin: admin@alpha.com / password123
Atendente: attendant@alpha.com / password123
Gerente: sales_manager@alpha.com / password123
```

### AccessDeniedComponent

Página exibida quando usuário tenta acessar recurso sem permissão.

**Rota:** `/access-denied`

**Actions:**
- Voltar ao dashboard
- Fazer logout

## Header Component

O header foi atualizado para mostrar informações do usuário autenticado:

**Features:**
- Nome do usuário
- Role com badge colorida
- Dropdown menu com:
  - Email e nome do tenant
  - Link para perfil
  - Link para configurações
  - Botão de logout

## Boas Práticas

### 1. Sempre use o AuthService

```typescript
// ✅ Correto
constructor(private authService: AuthService) {}

// ❌ Errado - não acessar localStorage diretamente
const token = localStorage.getItem('token');
```

### 2. Use Observables para reagir a mudanças

```typescript
// ✅ Correto - reage automaticamente a mudanças
ngOnInit() {
  this.authService.currentUser$.subscribe(user => {
    this.userRole = user?.role;
  });
}

// ❌ Menos ideal - valor estático
ngOnInit() {
  this.userRole = this.authService.getCurrentUser()?.role;
}
```

### 3. Proteja rotas no routing

```typescript
// ✅ Correto - proteção no routing
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [AuthGuard],
  data: { roles: [UserRole.ADMIN] }
}

// ❌ Errado - proteção apenas no component
// Usuário poderia acessar a rota diretamente
```

### 4. Use diretiva *appHasRole para UI

```html
<!-- ✅ Correto - elemento não é renderizado se não tem permissão -->
<button *appHasRole="'ADMIN'" (click)="delete()">Deletar</button>

<!-- ❌ Menos seguro - elemento existe no DOM, apenas oculto -->
<button [hidden]="!isAdmin" (click)="delete()">Deletar</button>
```

### 5. Trate erros de autenticação

```typescript
this.authService.login(credentials).subscribe({
  next: (response) => {
    // Sucesso
    this.router.navigate(['/dashboard']);
  },
  error: (error) => {
    // Erro - mostrar mensagem ao usuário
    this.errorMessage = error.error?.message || 'Erro ao fazer login';
  }
});
```

## Segurança

### Token Storage
- Tokens são armazenados no `localStorage`
- Para maior segurança em produção, considere usar `sessionStorage` ou cookies HTTP-only

### Expiração de Token
- Tokens JWT expiram em 7 dias (configurável no backend)
- AuthInterceptor detecta 401 e faz logout automaticamente

### HTTPS
- **SEMPRE** use HTTPS em produção
- Tokens JWT em HTTP podem ser interceptados

### XSS Protection
- Nunca insira dados do usuário diretamente no DOM
- Use data binding do Angular (`{{ }}`, `[property]`)
- Angular sanitiza automaticamente

## Troubleshooting

### "Token inválido" ou 401 Unauthorized

1. Verifique se o token existe:
```typescript
console.log(this.authService.getToken());
```

2. Verifique se o backend está rodando

3. Verifique se o JWT_SECRET é o mesmo no frontend e backend

### Redirecionamento infinito para /login

1. Verifique se o token está sendo salvo corretamente
2. Verifique se AuthGuard está funcionando
3. Limpe o localStorage: `localStorage.clear()`

### Permissões não funcionam

1. Verifique a role do usuário:
```typescript
console.log(this.authService.getCurrentUser()?.role);
```

2. Verifique se a role está correta nas rotas:
```typescript
data: { roles: [UserRole.ADMIN] }
```

## Exemplos Práticos

### Exemplo 1: Página de Perfil

```typescript
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  changePassword(currentPassword: string, newPassword: string) {
    this.authService.changePassword({
      currentPassword,
      newPassword
    }).subscribe({
      next: (response) => {
        alert(response.message);
      },
      error: (error) => {
        alert('Erro ao alterar senha');
      }
    });
  }
}
```

### Exemplo 2: Menu condicional

```html
<nav class="sidebar">
  <a routerLink="/dashboard">Dashboard</a>
  <a routerLink="/quotations">Cotações</a>

  <!-- Apenas ADMIN e SALES_MANAGER -->
  <div *appHasRole="['ADMIN', 'SALES_MANAGER']">
    <a routerLink="/catalog">Catálogo</a>
    <a routerLink="/suppliers">Fornecedores</a>
  </div>

  <!-- Apenas ADMIN -->
  <a *appHasRole="'ADMIN'" routerLink="/users">Usuários</a>
</nav>
```

### Exemplo 3: Botões condicionais

```html
<div class="quotation-actions">
  <!-- Todos os usuários autenticados podem ver -->
  <button (click)="view()">Ver Detalhes</button>

  <!-- Apenas ATTENDANT, SALES_MANAGER e ADMIN podem editar -->
  <button
    *appHasRole="['ATTENDANT', 'SALES_MANAGER', 'ADMIN']"
    (click)="edit()"
  >
    Editar
  </button>

  <!-- Apenas ADMIN pode deletar -->
  <button
    *appHasRole="'ADMIN'"
    class="btn-danger"
    (click)="delete()"
  >
    Deletar
  </button>
</div>
```

## Próximos Passos

- [ ] Implementar refresh token
- [ ] Adicionar remember me
- [ ] Implementar 2FA (autenticação de dois fatores)
- [ ] Adicionar recuperação de senha por email
- [ ] Implementar sessões concorrentes
- [ ] Adicionar logs de auditoria de login

## Referências

- [Angular Authentication](https://angular.io/guide/security)
- [JWT.io](https://jwt.io/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
