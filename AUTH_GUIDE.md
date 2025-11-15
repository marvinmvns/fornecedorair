# 🔐 Guia de Autenticação e Controle de Acesso

## Visão Geral

O FornecedorAir implementa um sistema completo de autenticação e autorização baseado em:

- **JWT (JSON Web Tokens)** para autenticação stateless
- **RBAC (Role-Based Access Control)** para controle de acesso
- **Multi-tenant** com isolamento de dados por tenant
- **Bcrypt** para hash de senhas

---

## Perfis de Usuário (Roles)

### 1. ADMIN
**Permissões:**
- ✅ Acesso total ao sistema
- ✅ Gerenciar usuários e tenants
- ✅ Gerenciar fornecedores e catálogo
- ✅ Ver todas analytics
- ✅ Configurar sistema

**Uso típico:** Administrador geral da plataforma

### 2. SALES_MANAGER
**Permissões:**
- ✅ Gerenciar cotações e pedidos
- ✅ Ver analytics de vendas
- ✅ Configurar regras de precificação
- ✅ Gerenciar fornecedores
- ❌ Não pode gerenciar usuários

**Uso típico:** Gerente comercial

### 3. ATTENDANT
**Permissões:**
- ✅ Criar e gerenciar cotações
- ✅ Disparar para fornecedores
- ✅ Enviar propostas
- ✅ Agendar instalações
- ❌ Não pode acessar analytics
- ❌ Não pode gerenciar configurações

**Uso típico:** Atendente operacional

### 4. VIEW_ONLY
**Permissões:**
- ✅ Ver cotações
- ✅ Ver analytics (leitura)
- ❌ Não pode criar/editar/deletar nada

**Uso típico:** Auditores, consultores

---

## Endpoints de Autenticação

### 1. Login

```bash
POST /api/v1/auth/login

Body:
{
  "email": "admin@alpha.com",
  "password": "password123"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@alpha.com",
    "name": "Administrador",
    "role": "ADMIN",
    "tenantId": "tenant-uuid",
    "tenant": {
      "id": "tenant-uuid",
      "name": "Distribuidor Alpha",
      "slug": "alpha",
      "primaryColor": "#4361ee",
      "secondaryColor": "#3a0ca3",
      "logoUrl": null
    }
  }
}
```

### 2. Registro

```bash
POST /api/v1/auth/register

Body:
{
  "email": "novo@alpha.com",
  "password": "senha-segura-123",
  "name": "Novo Usuário",
  "tenantId": "tenant-uuid"
}

Response:
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "userId": "new-user-uuid"
}
```

### 3. Perfil do Usuário

```bash
GET /api/v1/auth/profile

Headers:
Authorization: Bearer <access-token>

Response:
{
  "id": "uuid",
  "email": "admin@alpha.com",
  "tenantId": "tenant-uuid",
  "role": "ADMIN"
}
```

### 4. Alterar Senha

```bash
PUT /api/v1/auth/change-password

Headers:
Authorization: Bearer <access-token>

Body:
{
  "oldPassword": "senha-atual",
  "newPassword": "nova-senha-segura"
}

Response:
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

### 5. Reset de Senha

```bash
POST /api/v1/auth/reset-password

Body:
{
  "email": "user@alpha.com"
}

Response:
{
  "success": true,
  "message": "Se o email existir, você receberá instruções para reset de senha"
}
```

---

## Uso no Frontend

### Interceptor HTTP

```typescript
// frontend/src/app/core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = localStorage.getItem('access_token');

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req);
  }
}
```

### Serviço de Autenticação

```typescript
// frontend/src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load user from localStorage
    const user = localStorage.getItem('current_user');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post('/api/v1/auth/login', { email, password }).pipe(
      tap((response: any) => {
        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('current_user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user && user.role === role;
  }
}
```

### Guard de Autenticação

```typescript
// frontend/src/app/core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
```

### Guard de Roles

```typescript
// frontend/src/app/core/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'];

    if (this.authService.hasRole(requiredRole)) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
```

---

## Uso no Backend

### Decorators

#### @Public()
Marca um endpoint como público (sem autenticação)

```typescript
@Public()
@Post('login')
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto.email, loginDto.password);
}
```

#### @Roles()
Requer roles específicos

```typescript
@Roles(UserRole.ADMIN, UserRole.SALES_MANAGER)
@Get('analytics')
async getAnalytics() {
  return this.analyticsService.getAll();
}
```

#### @CurrentUser()
Obtém o usuário autenticado

```typescript
@Get('profile')
async getProfile(@CurrentUser() user: any) {
  return user;
}
```

### Exemplo Completo

```typescript
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../infrastructure/decorators/public.decorator';
import { Roles } from '../../infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator';
import { UserRole } from '../../domain/entities/user.entity';

@Controller('quotations')
@ApiBearerAuth() // Swagger documentation
export class QuotationsController {

  // Público (não requer autenticação)
  @Public()
  @Get('public/stats')
  async getPublicStats() {
    return { total: 1000 };
  }

  // Requer autenticação (qualquer role)
  @Get()
  async getAllQuotations(@CurrentUser() user: any) {
    // user.tenantId é automaticamente disponível
    return this.quotationsService.findAll(user.tenantId);
  }

  // Apenas ADMIN e SALES_MANAGER
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER)
  @Post('bulk-import')
  async bulkImport(@Body() data: any) {
    return this.quotationsService.bulkImport(data);
  }

  // Apenas ADMIN
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.quotationsService.delete(id);
  }
}
```

---

## Multi-tenant Isolation

Todos os dados são automaticamente filtrados por `tenantId`:

```typescript
// Exemplo: Repository com filtro automático por tenant
async findAll(tenantId: string): Promise<Quotation[]> {
  return this.quotationRepo.find({
    where: { tenantId },
    relations: ['installer', 'items']
  });
}
```

**Importante:** SEMPRE use o `tenantId` do usuário autenticado para queries!

---

## Usuários Padrão (Mock Data)

Após rodar o gerador de mock data, você terá os seguintes usuários:

### Tenant: Alpha

| Email | Senha | Role |
|-------|-------|------|
| admin@alpha.com | password123 | ADMIN |
| sales_manager@alpha.com | password123 | SALES_MANAGER |
| attendant@alpha.com | password123 | ATTENDANT |
| view_only@alpha.com | password123 | VIEW_ONLY |

### Tenant: Beta

| Email | Senha | Role |
|-------|-------|------|
| admin@beta.com | password123 | ADMIN |
| sales_manager@beta.com | password123 | SALES_MANAGER |
| attendant@beta.com | password123 | ATTENDANT |
| view_only@beta.com | password123 | VIEW_ONLY |

### Tenant: Gamma

| Email | Senha | Role |
|-------|-------|------|
| admin@gamma.com | password123 | ADMIN |
| sales_manager@gamma.com | password123 | SALES_MANAGER |
| attendant@gamma.com | password123 | ATTENDANT |
| view_only@gamma.com | password123 | VIEW_ONLY |

---

## Segurança

### Boas Práticas Implementadas

✅ **Senhas hash com bcrypt** (10 rounds)
✅ **JWT com expiração** (7 dias)
✅ **Guards automáticos** em todas as rotas
✅ **Validação de tenant** ativo
✅ **Isolamento de dados** por tenant
✅ **Tokens não renováveis** (stateless)

### Melhorias Futuras

- [ ] Refresh tokens
- [ ] Rate limiting por usuário
- [ ] 2FA (Two-Factor Authentication)
- [ ] Audit log de acessos
- [ ] Session management
- [ ] Password policies (complexidade, expiração)
- [ ] Email verification
- [ ] OAuth2 / SSO

---

## Troubleshooting

### Token Expirado
```json
{
  "statusCode": 401,
  "message": "Token inválido ou expirado"
}
```
**Solução:** Faça login novamente

### Acesso Negado
```json
{
  "statusCode": 403,
  "message": "Você não tem permissão para acessar este recurso"
}
```
**Solução:** Verifique se seu role tem permissão

### Tenant Inativo
```json
{
  "statusCode": 401,
  "message": "Tenant inativo"
}
```
**Solução:** Contate o administrador

---

**Documentação atualizada:** 2024-01-15
