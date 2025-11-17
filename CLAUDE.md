# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FornecedorAir is an air conditioning quotation management system with WhatsApp integration and LLM-powered automation. The system enables distributors to receive quotation requests from installers via WhatsApp, automatically process requests using LLM, dispatch to multiple suppliers, and send back optimized proposals.

**Stack:**
- Backend: NestJS 11+ with Clean Architecture
- Frontend: Angular 20+ with AdminLTE template
- Database: PostgreSQL 14+ with TypeORM
- Services: WhatsApp (whatsapp-web.js), Ollama LLM
- Auth: JWT with RBAC (4 roles)
- Multi-tenant support with data isolation

## Development Commands

### Starting the Application

```bash
# Start all services in development mode (recommended)
./scripts/dev.sh

# Or start individually:
cd backend && npm run start:dev          # Backend API on :3010
cd frontend && npm start                 # Frontend on :4200
cd services/whatsapp && npm run dev      # WhatsApp service on :3001
```

### Database Operations

```bash
# Initialize database with basic data
./scripts/init-database.sh

# Initialize with comprehensive mock data (3 tenants, 60 quotations)
./scripts/init-database.sh mock

# Reset database completely
./scripts/reset-db.sh

# Run migrations
cd backend && npm run migration:run

# Revert last migration
cd backend && npm run migration:revert

# Create new migration
cd backend && npm run migration:create -- -n MigrationName
```

### Testing

```bash
# Backend tests
cd backend && npm test
cd backend && npm run test:watch
cd backend && npm run test:cov

# Frontend tests
cd frontend && npm test
```

### Build

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

### Linting & Formatting

```bash
# Backend
cd backend && npm run lint
cd backend && npm run format

# Frontend
cd frontend && ng lint
```

## Architecture

### Clean Architecture (Backend)

The backend follows Clean Architecture with clear separation of concerns:

```
backend/src/
├── domain/              # Entities and business rules (innermost layer)
│   └── entities/        # TypeORM entities with business logic
├── application/         # Use cases and services
│   └── services/        # Business logic implementation
├── infrastructure/      # External interfaces and frameworks
│   ├── adapters/        # WhatsApp, Ollama adapters
│   ├── database/        # Migrations, seeds, data-source
│   ├── guards/          # JWT and roles guards
│   ├── strategies/      # Passport JWT strategy
│   └── decorators/      # Custom decorators (@Public, @Roles, @CurrentUser)
└── interface/           # Controllers, DTOs, modules (outermost layer)
    ├── controllers/     # REST endpoints
    ├── dtos/            # Request/response validation
    └── modules/         # NestJS modules
```

**Key principle:** Dependencies flow inward. Domain knows nothing about infrastructure or interface layers.

### Frontend Architecture (Angular)

```
frontend/src/app/
├── core/                # Singleton services and guards
│   ├── services/        # AuthService, ApiService, ChatService
│   ├── guards/          # AuthGuard (route protection)
│   ├── interceptors/    # AuthInterceptor (adds JWT to requests)
│   ├── directives/      # HasRole directive
│   └── models/          # User model, enums
├── shared/              # Shared components
│   └── components/      # Header, Sidebar
└── modules/             # Feature modules (lazy loaded)
    ├── auth/            # Login, access denied
    ├── dashboard/       # Main dashboard with KPIs
    ├── quotations/      # Quotation list and detail
    ├── catalog/         # Air conditioner models
    ├── suppliers/       # Supplier management
    ├── cadastro/        # Admin CRUD (users, installers, models, suppliers)
    └── chat/            # WhatsApp chat interface with Socket.IO
```

### Multi-tenant Architecture

All entities (except Tenant itself) have a `tenantId` column. Authentication returns the user's tenant, and:
- All queries are automatically filtered by `tenantId`
- Users can only see data from their own tenant
- Tenant isolation is enforced at the database and service layer

### Authentication Flow

1. User logs in via `POST /api/v1/auth/login`
2. Backend validates credentials and returns JWT token with user data and `tenantId`
3. Frontend stores token in localStorage via `AuthService`
4. `AuthInterceptor` adds `Authorization: Bearer <token>` to all requests
5. Backend `JwtAuthGuard` validates token on all routes (except `@Public()`)
6. `RolesGuard` checks user role against route requirements (`@Roles()`)

**Roles:** ADMIN > SALES_MANAGER > ATTENDANT > VIEW_ONLY

### WhatsApp Integration

The WhatsApp service (`services/whatsapp`) runs independently:
- Uses `whatsapp-web.js` with Puppeteer
- Maintains persistent session (`.wwebjs_auth/`)
- Forwards messages to backend webhook: `POST /api/v1/webhooks/whatsapp`
- Backend can send messages via: `POST /api/v1/whatsapp/send`

### LLM Integration

- Backend communicates with Ollama API (typically http://localhost:11434)
- `OllamaAdapter` handles prompt engineering and response parsing
- Used for extracting structured data from WhatsApp conversations
- Generates personalized proposals based on supplier quotes

## Key Entities and Relationships

**Core entities:**
- `Tenant` - Multi-tenant isolation (alpha, beta, gamma in mock data)
- `User` - System users with role-based permissions
- `Installer` - Customers who request quotations
- `Supplier` - Vendors who provide quotes
- `AirConditionerModel` - Product catalog
- `QuotationRequest` - Main quotation entity with items
- `QuotationItem` - Individual items in a quotation
- `SupplierQuote` - Quotes received from suppliers
- `Order` - Finalized orders
- `Conversation` + `Message` - Chat history (v2.0 feature)

**Advanced features (v2.0):**
- `WorkflowEvent` - Timeline tracking for quotations
- `Attachment` - File uploads via WhatsApp
- `PricingScenario` - Economic/Standard/Premium pricing
- `InstallationSchedule` - Installation appointments
- `Notification` - Internal notifications
- `WhatsappQueue` + `WhatsappSession` - Enhanced WhatsApp reliability

## Important Patterns

### Guards and Decorators

```typescript
// Make endpoint public (no auth required)
@Public()

// Restrict to specific roles
@Roles(UserRole.ADMIN, UserRole.SALES_MANAGER)

// Get current user from request
@CurrentUser() user: User
```

### TypeORM Relationships

- Use `@ManyToOne` with `@JoinColumn` and separate FK column:
  ```typescript
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id' })
  tenantId: string;
  ```
- Cascade options on `@OneToMany` for automatic saves
- Always use UUIDs for primary keys

### Frontend Services

- `AuthService` manages login/logout, token storage, current user
- `ApiService` wraps HttpClient with base URL
- All HTTP requests automatically get JWT via `AuthInterceptor`
- Use `AuthGuard` on routes requiring authentication
- Use `data: { roles: [...] }` on routes requiring specific roles

### Mock Data

When testing with `./scripts/init-database.sh mock`:
- 3 tenants: alpha, beta, gamma
- Login: `{role}@{tenant}.com` / `password123`
- Example: `admin@alpha.com` / `password123`

## Common Workflows

### Adding a New Entity

1. Create entity in `backend/src/domain/entities/`
2. Generate migration: `cd backend && npm run migration:generate -- -n AddEntityName`
3. Review and run migration: `npm run migration:run`
4. Create service in `backend/src/application/services/`
5. Create DTOs in `backend/src/interface/dtos/`
6. Create controller in `backend/src/interface/controllers/`
7. Create module in `backend/src/interface/modules/` and import in `app.module.ts`

### Adding a New Frontend Module

1. Generate module: `cd frontend && ng generate module modules/feature-name`
2. Generate components: `ng generate component modules/feature-name/component-name`
3. Add routes to `app-routing.module.ts` with `loadChildren`
4. Add `canActivate: [AuthGuard]` and `data: { roles: [...] }` as needed
5. Add menu item to `sidebar.component.ts`

### Adding New API Endpoints

1. Define DTO in `backend/src/interface/dtos/`
2. Implement business logic in service (`application/services/`)
3. Create controller method in `interface/controllers/`
4. Use `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles()` as needed
5. Document endpoint (Swagger annotations if needed)

## Database Connection

Default PostgreSQL connection:
- Host: localhost
- Port: 5432
- Database: fornecedorair
- User: postgres
- Password: postgres

Start PostgreSQL: `docker-compose up -d postgres`

## Environment Variables

### Backend (.env)
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=fornecedorair
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
WHATSAPP_SERVICE_URL=http://localhost:3001
OLLAMA_API_URL=http://localhost:11434
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=7d
PORT=3010
NODE_ENV=development
```

### WhatsApp Service (.env)
```
PORT=3001
BACKEND_WEBHOOK_URL=http://localhost:3010/api/v1/webhooks/whatsapp
NODE_ENV=development
```

### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3010/api/v1'
};
```

## API Structure

All endpoints are prefixed with `/api/v1/` and require JWT authentication except login/register.

**Main endpoint groups:**
- `/auth` - Authentication (login, register, profile, password)
- `/quotations` - Quotation management
- `/catalog` - Product catalog (air conditioner models)
- `/suppliers` - Supplier management
- `/users` - User management (ADMIN only)
- `/installers` - Installer management
- `/whatsapp` - WhatsApp messaging
- `/webhooks` - External webhooks (WhatsApp incoming)
- `/chat` - Chat module with WebSocket support

## Scripts

- `./scripts/check-dependencies.sh` - Verify Node, npm, Docker, etc.
- `./scripts/init-database.sh [mock]` - Initialize database
- `./scripts/reset-db.sh` - Drop and recreate database
- `./scripts/dev.sh` - Start all services in development mode
- `./scripts/test-api.sh` - Test API endpoints

## Additional Documentation

Comprehensive documentation is in the `Docs/` directory:
- `AUTH_GUIDE.md` - Authentication implementation (backend)
- `FRONTEND_AUTH_GUIDE.md` - Frontend authentication
- `ADVANCED_FEATURES.md` - v2.0 features (SLA, attachments, pricing scenarios)
- `TECHNICAL_SPEC.md` - Detailed technical specifications
- `IMPLEMENTATION_STATUS.md` - Feature roadmap and status
- `CHAT_MODULE.md` - Chat implementation details
- `EXAMPLES.md` - API usage examples

## Important Notes

- **Never disable synchronize in TypeORM config** - Always use migrations for schema changes
- **Multi-tenant**: Always filter by tenantId in queries and service methods
- **Password hashing**: Use bcrypt (already implemented in AuthService)
- **JWT secret**: Change JWT_SECRET in production
- **WhatsApp session**: First run requires QR code scan
- **Ollama**: Optional for full functionality but required for LLM features
- **Git merge conflicts**: The README has merge conflict markers that should be resolved
