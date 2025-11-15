.PHONY: help setup dev stop reset test install clean

help: ## Exibir ajuda
	@echo "FornecedorAir - Sistema de Cotação de Ar-Condicionado"
	@echo ""
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

setup: ## Executar setup completo do projeto
	@echo "🚀 Executando setup..."
	@./scripts/setup.sh

install: ## Instalar dependências de todos os serviços
	@echo "📦 Instalando dependências..."
	@cd backend && npm install
	@cd services/whatsapp && npm install
	@cd frontend && npm install

dev: ## Iniciar todos os serviços em modo desenvolvimento (tmux)
	@./scripts/dev.sh

stop: ## Parar todos os serviços
	@./scripts/stop.sh

reset: ## Resetar banco de dados
	@./scripts/reset-db.sh

test: ## Testar API
	@./scripts/test-api.sh

clean: ## Limpar node_modules e builds
	@echo "🧹 Limpando projeto..."
	@rm -rf backend/node_modules backend/dist
	@rm -rf services/whatsapp/node_modules services/whatsapp/dist
	@rm -rf frontend/node_modules frontend/dist frontend/.angular
	@echo "✅ Projeto limpo!"

docker-up: ## Iniciar containers Docker
	@docker-compose up -d

docker-down: ## Parar containers Docker
	@docker-compose down

docker-logs: ## Ver logs do Docker
	@docker-compose logs -f

backend-dev: ## Iniciar apenas backend
	@cd backend && npm run start:dev

frontend-dev: ## Iniciar apenas frontend
	@cd frontend && npm start

whatsapp-dev: ## Iniciar apenas WhatsApp service
	@cd services/whatsapp && npm run dev
