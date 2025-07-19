#!/bin/bash

# Função para limpeza quando o script terminar
cleanup() {
    echo "🧹 Cleaning up..."
    pkill -f ngrok || true
    pkill -f vite || true
    exit
}

# Configurar trap para limpeza
trap cleanup SIGTERM SIGINT

echo "🚀 Starting frontend with ngrok..."

# Iniciar o Vite em background
npx vite --host 0.0.0.0 &
VITE_PID=$!

# Aguardar o Vite inicializar
sleep 3

# Configurar e iniciar ngrok se estiver em desenvolvimento
if [ "$NODE_ENV" = "development" ]; then
    echo "🌐 Setting up ngrok for frontend..."

    # Configurar authtoken do ngrok
    npx ngrok config add-authtoken 303vyKk40lpPLLwC49RSl7DimOn_497U2KV1B4pgVuAsUhJ6h

    # Iniciar ngrok tunnel em background
    npx ngrok http ${FRONT_PORT:-3042} --log stdout &
    NGROK_PID=$!

    echo "✅ Frontend ngrok tunnel starting..."
    echo "📊 Ngrok dashboard: http://localhost:4040"
fi

# Aguardar o processo do Vite
wait $VITE_PID
