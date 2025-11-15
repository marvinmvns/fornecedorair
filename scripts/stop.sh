#!/bin/bash

echo "🛑 Parando FornecedorAir..."

# Matar sessão tmux se existir
if tmux has-session -t fornecedorair 2>/dev/null; then
    tmux kill-session -t fornecedorair
    echo "✅ Sessão tmux encerrada"
fi

# Parar containers Docker
docker-compose down
echo "✅ Containers Docker parados"

echo ""
echo "✅ Todos os serviços foram parados!"
