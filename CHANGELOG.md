# Changelog

Todas as mudanças notáveis do projeto FornecedorAir serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2024-01-15

### Adicionado

#### Backend
- Sistema completo de cotações com Clean Architecture
- 9 entidades principais (TypeORM + PostgreSQL)
- API REST com documentação Swagger/OpenAPI
- Integração WhatsApp via whatsapp-web.js
- Integração LLM (Ollama) para chat automático
- Sistema de parsing automático de mensagens
- Geração automática de perguntas complementares
- Geração automática de propostas personalizadas
- Mock de APIs de fornecedores com respostas assíncronas
- Cálculo automático de margens de lucro
- Sistema de cotações comparativas
- Webhook para receber mensagens WhatsApp
- Seeds com catálogo inicial (10 modelos + 4 fornecedores)
- Migrations completas do banco de dados

#### Frontend
- Dashboard com KPIs e métricas em tempo real
- Módulo de Cotações (lista e detalhe)
- Tela de detalhe com comparativo visual de fornecedores
- Sistema de seleção de cotações com cards clicáveis
- Editor de margem de lucro com cálculo em tempo real
- Editor de mensagem de proposta (com sugestão do LLM)
- Módulo de Catálogo de Produtos
- Módulo de Fornecedores
- UI moderna baseada em Bootstrap 5 (inspirado em Bsinx)
- Histórico de chat com LLM visível
- Lazy loading de módulos
- Interceptor HTTP global

#### Serviços
- Serviço WhatsApp standalone (whatsapp-web.js)
- Adapter Ollama com sistema de fallback
- Suporte a múltiplos fornecedores simultâneos

#### Infraestrutura
- Docker Compose (PostgreSQL + pgAdmin)
- Scripts de setup automatizado
- Scripts de desenvolvimento (tmux)
- Scripts de reset de banco
- Script de teste de API
- Makefile com comandos úteis

#### Documentação
- README.md completo com visão geral
- QUICK_START.md para início em 5 minutos
- TECHNICAL_SPEC.md com especificação técnica detalhada
- EXAMPLES.md com exemplos práticos de uso
- CHANGELOG.md para controle de versões

#### Recursos
- Chat 100% automático com LLM
- Extração automática de dados estruturados
- Sistema de confiança (confidence) para validação
- Comparativo visual de fornecedores
- Cálculo automático de preços e margens
- Propostas editáveis geradas por IA
- Mock realista de fornecedores
- Dados pré-cadastrados para teste

### Tecnologias

- **Backend**: NestJS 10, TypeORM, PostgreSQL 14, Swagger
- **Frontend**: Angular 16, Bootstrap 5, RxJS 7
- **Integrações**: whatsapp-web.js 1.23, Ollama (llama2)
- **Infraestrutura**: Docker, Docker Compose
- **Linguagem**: TypeScript 5.1+

### Fluxo Implementado

1. Instalador envia mensagem WhatsApp
2. LLM processa e extrai dados automaticamente
3. Sistema faz perguntas complementares se necessário
4. Cotação criada automaticamente
5. Atendente visualiza e seleciona fornecedores
6. Sistema dispara cotações
7. Fornecedores respondem (mock automático 2-5s)
8. Atendente compara cotações visualmente
9. Atendente seleciona melhor opção e ajusta margem
10. LLM gera proposta personalizada
11. Atendente edita e confirma
12. Sistema envia via WhatsApp automaticamente

---

## [Não Lançado]

### Planejado para v1.1.0

- [ ] Autenticação JWT
- [ ] Controle de permissões (RBAC)
- [ ] Múltiplas sessões WhatsApp
- [ ] Dashboard com gráficos (Chart.js)
- [ ] Relatórios em PDF
- [ ] Sistema de aprovação de propostas
- [ ] Histórico de preços
- [ ] Notificações push
- [ ] Integração real com APIs de fornecedores
- [ ] Cache Redis
- [ ] Queue system (Bull/BullMQ)
- [ ] Monitoramento (Prometheus + Grafana)
- [ ] Error tracking (Sentry)
- [ ] Testes automatizados (>80% coverage)
- [ ] CI/CD pipeline
- [ ] Backup automático

### Ideias Futuras

- [ ] Multi-tenancy
- [ ] App mobile (React Native)
- [ ] Sistema de comissões
- [ ] Integração com sistemas de pagamento
- [ ] Chatbot avançado com NLP
- [ ] Recomendações por IA
- [ ] Análise preditiva de preços
- [ ] API GraphQL
- [ ] Webhooks customizáveis
- [ ] Integrações marketplace (Mercado Livre, etc)

---

## Convenções de Versionamento

- **Major** (X.0.0): Mudanças incompatíveis com versões anteriores
- **Minor** (0.X.0): Novas funcionalidades compatíveis
- **Patch** (0.0.X): Correções de bugs e melhorias

## Tipos de Mudança

- **Adicionado**: Novas funcionalidades
- **Modificado**: Mudanças em funcionalidades existentes
- **Descontinuado**: Funcionalidades que serão removidas
- **Removido**: Funcionalidades removidas
- **Corrigido**: Correções de bugs
- **Segurança**: Correções de vulnerabilidades
