# Migração para AdminLTE 4 - FornecedorAir

## Resumo

Este documento descreve a migração completa do frontend FornecedorAir do template Bsinx para o AdminLTE 4 oficial (https://github.com/ColorlibHQ/AdminLTE).

**Data:** 17 de novembro de 2025
**Versão AdminLTE:** 4.0.0-rc4
**Bootstrap:** 5.3.8
**Angular:** 20.3.12

## Motivação

- Remover completamente o tema Bsinx (dark theme customizado)
- Aplicar o design moderno e acessível do AdminLTE 4 oficial
- Utilizar todos os componentes e widgets que o AdminLTE oferece
- Manter a paleta de cores, usabilidade e acessibilidade do AdminLTE
- Seguir as melhores práticas de UI/UX do template AdminLTE

## Mudanças Realizadas

### 1. Dependências Atualizadas

**package.json:**
```json
{
  "admin-lte": "^4.0.0-rc4",  // Atualizado de rc3
  "bootstrap": "^5.3.8",       // Atualizado de 5.3.0
}
```

### 2. Arquivos Removidos

- `frontend/src/styles/variables-dark.scss` - Variáveis do tema Bsinx (removido)
- `frontend/src/app/modules/dashboard/dashboard.component.scss` - Estilos customizados (removido)

### 3. Arquivos Completamente Refatorados

#### 3.1. Estilos Globais (`styles.scss`)

**Antes:**
- Importava variáveis do Bsinx
- Tema escuro customizado com cores específicas
- Fonte Nunito
- Background escuro (#060818)

**Depois:**
- Estilos AdminLTE 4 puros
- Tema claro padrão do AdminLTE
- Fonte Source Sans Pro
- Background claro (#f4f6f9)
- Widgets AdminLTE (small-box, info-box)
- Componentes AdminLTE (cards, tables, forms, badges)

#### 3.2. Header Component

**Estrutura:**
- Navbar branco AdminLTE (`navbar-white navbar-light`)
- Botão de menu hamburger com `data-widget="pushmenu"`
- Busca integrada com `data-widget="navbar-search"`
- Dropdown de mensagens
- Dropdown de notificações
- Botão fullscreen
- Menu de usuário com avatar e informações

**Classes AdminLTE utilizadas:**
- `.main-header`
- `.navbar`
- `.navbar-nav`
- `.nav-item`
- `.dropdown-menu`
- `.user-menu`

#### 3.3. Sidebar Component

**Estrutura:**
- Sidebar dark AdminLTE (`sidebar-dark-primary`)
- Brand link com logo
- Navegação em árvore com `data-widget="treeview"`
- Suporte a submenus (Cadastros)
- Headers de seção (GESTÃO, SISTEMA)
- Badges de notificação

**Classes AdminLTE utilizadas:**
- `.main-sidebar`
- `.sidebar-dark-primary`
- `.brand-link`
- `.nav-sidebar`
- `.nav-pills`
- `.nav-treeview`
- `.nav-header`

#### 3.4. App Component

**Estrutura:**
- Wrapper AdminLTE (`.wrapper`)
- Content wrapper (`.content-wrapper`)
- Footer principal (`.main-footer`)
- Container fluid para conteúdo

#### 3.5. Dashboard Component

**Widgets utilizados:**
- **Small Box**: 4 cards de estatísticas (Cotações Abertas, Aguardando, Enviadas, Total)
  - `.small-box`
  - Cores: `bg-info`, `bg-warning`, `bg-success`, `bg-primary`

- **Info Box**: 4 cards de informações (WhatsApp, Fornecedores, Instaladores, Produtos)
  - `.info-box`
  - `.info-box-icon`
  - `.info-box-content`

- **Cards**:
  - Gráfico de cotações por período
  - Tabela de cotações recentes
  - Calendário com `bg-gradient-success`
  - Distribuição por status
  - Ações rápidas

- **Tabelas**: Tabela responsiva com `.table` AdminLTE

**Componentes novos:**
- Content header com breadcrumb
- Card tools com botão de collapse
- Badges coloridos para status
- Botões com ícones FontAwesome

## Paleta de Cores AdminLTE 4

### Cores Principais
- **Primary:** #007bff (Azul)
- **Success:** #28a745 (Verde)
- **Info:** #17a2b8 (Ciano)
- **Warning:** #ffc107 (Amarelo)
- **Danger:** #dc3545 (Vermelho)

### Cores de Background
- **Body:** #f4f6f9 (Cinza claro)
- **Card:** #ffffff (Branco)
- **Sidebar:** #343a40 (Cinza escuro)
- **Navbar:** #ffffff (Branco)

### Textos
- **Primary:** #212529 (Preto suave)
- **Secondary:** #6c757d (Cinza médio)
- **Muted:** #6c757d (Cinza)

## Componentes AdminLTE Disponíveis

O FornecedorAir agora tem acesso a todos os componentes do AdminLTE 4:

### Widgets
- ✅ Small Box (implementado)
- ✅ Info Box (implementado)
- ⬜ Direct Chat
- ⬜ Progress Bars
- ⬜ Calendar
- ⬜ Todo List

### Cards
- ✅ Basic Cards (implementado)
- ✅ Card Tools (implementado)
- ⬜ Card with Tabs
- ⬜ Card with Timeline
- ⬜ Collapsible Cards

### UI Elements
- ✅ Badges (implementado)
- ✅ Buttons (implementado)
- ✅ Tables (implementado)
- ✅ Forms (implementado)
- ⬜ Modals
- ⬜ Alerts
- ⬜ Ribbons
- ⬜ Timeline

### Charts
- ⬜ Chart.js (placeholder criado)
- ⬜ Morris Charts
- ⬜ Flot Charts

## Acessibilidade

O AdminLTE 4 inclui recursos de acessibilidade:

- Contraste adequado de cores (WCAG 2.1 AA)
- Navegação por teclado
- Atributos ARIA apropriados
- Responsividade mobile-first
- Focus states visíveis
- Suporte a screen readers

## Responsividade

Breakpoints Bootstrap 5:
- **xs:** < 576px
- **sm:** ≥ 576px
- **md:** ≥ 768px
- **lg:** ≥ 992px
- **xl:** ≥ 1200px
- **xxl:** ≥ 1400px

## Próximos Passos

### Componentes a Refatorar
1. ⬜ Módulo de Quotations (lista e detalhes)
2. ⬜ Módulo de Cadastro (usuários, fornecedores, instaladores, modelos)
3. ⬜ Módulo de Chat WhatsApp
4. ⬜ Módulo de Catálogo
5. ⬜ Módulo de Suppliers
6. ⬜ Páginas de Autenticação (Login, Access Denied)

### Integrações Futuras
1. ⬜ Chart.js para gráficos
2. ⬜ FullCalendar para calendário
3. ⬜ DataTables para tabelas avançadas
4. ⬜ Select2 para selects customizados
5. ⬜ SweetAlert2 para alertas

## Como Usar os Componentes AdminLTE

### Small Box (Stat Card)

```html
<div class="small-box bg-info">
  <div class="inner">
    <h3>150</h3>
    <p>New Orders</p>
  </div>
  <div class="icon">
    <i class="fas fa-shopping-cart"></i>
  </div>
  <a href="#" class="small-box-footer">
    More info <i class="fas fa-arrow-circle-right"></i>
  </a>
</div>
```

### Info Box

```html
<div class="info-box">
  <span class="info-box-icon bg-info"><i class="far fa-envelope"></i></span>
  <div class="info-box-content">
    <span class="info-box-text">Messages</span>
    <span class="info-box-number">1,410</span>
  </div>
</div>
```

### Card com Tools

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <div class="card-tools">
      <button type="button" class="btn btn-tool" data-card-widget="collapse">
        <i class="fas fa-minus"></i>
      </button>
    </div>
  </div>
  <div class="card-body">
    Card content
  </div>
</div>
```

## Documentação Oficial

- **AdminLTE 4:** https://adminlte.io/themes/v3/
- **GitHub:** https://github.com/ColorlibHQ/AdminLTE
- **Bootstrap 5:** https://getbootstrap.com/docs/5.3/
- **FontAwesome:** https://fontawesome.com/v6/icons

## Notas de Desenvolvimento

### Boas Práticas
1. Use as classes do AdminLTE sempre que possível
2. Evite criar CSS customizado que sobrescreva o AdminLTE
3. Mantenha a consistência visual em todos os módulos
4. Teste a responsividade em diferentes tamanhos de tela
5. Valide a acessibilidade com ferramentas como Lighthouse

### Comandos Úteis

```bash
# Instalar dependências
cd frontend && npm install

# Iniciar servidor de desenvolvimento
npm start

# Build de produção
npm run build
```

## Conclusão

A migração para o AdminLTE 4 traz um design moderno, acessível e profissional para o FornecedorAir. O template oferece uma ampla gama de componentes prontos que aceleram o desenvolvimento e garantem uma experiência de usuário consistente e de alta qualidade.
