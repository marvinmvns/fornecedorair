#!/bin/bash

# Script para iniciar todos os serviços em modo desenvolvimento
# Usa tmux para gerenciar múltiplos terminais

echo "🚀 Iniciando FornecedorAir em modo desenvolvimento..."

# Verificar se tmux está instalado
if ! command -v tmux &> /dev/null; then
    echo "❌ tmux não está instalado. Instale com:"
    echo "   Ubuntu/Debian: sudo apt-get install tmux"
    echo "   macOS: brew install tmux"
    exit 1
fi

# Nome da sessão
SESSION="fornecedorair"

# Matar sessão anterior se existir
tmux kill-session -t $SESSION 2>/dev/null

# Criar nova sessão e janelas
tmux new-session -d -s $SESSION -n "backend"

# Backend
tmux send-keys -t $SESSION:0 "cd backend && npm run start:dev" C-m

# WhatsApp Service
tmux new-window -t $SESSION -n "whatsapp"
tmux send-keys -t $SESSION:1 "cd services/whatsapp && npm run dev" C-m

# Frontend
tmux new-window -t $SESSION -n "frontend"
tmux send-keys -t $SESSION:2 "cd frontend && npm start" C-m

# Logs
tmux new-window -t $SESSION -n "logs"
tmux send-keys -t $SESSION:3 "echo '📊 Logs do sistema'; docker-compose logs -f postgres" C-m

# Selecionar primeira janela
tmux select-window -t $SESSION:0

echo "✅ Todos os serviços foram iniciados!"
echo ""
echo "Para acessar os terminais:"
echo "  tmux attach -t $SESSION"
echo ""
echo "Navegação tmux:"
echo "  Ctrl+B, então número da janela (0-3)"
echo "  Ctrl+B, d → Desconectar (serviços continuam rodando)"
echo "  Ctrl+B, & → Fechar janela"
echo ""
echo "URLs:"
echo "  - Frontend: http://localhost:4200"
echo "  - Backend API: http://localhost:3000/api/v1"
echo "  - API Docs: http://localhost:3000/api/docs"
echo "  - pgAdmin: http://localhost:5050"
echo ""

# Anexar à sessão
tmux attach -t $SESSION
