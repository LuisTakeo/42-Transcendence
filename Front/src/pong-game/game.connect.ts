// Crie um arquivo de teste, por exemplo: src/websocket-test.ts

class WebSocketTest {
    private ws: WebSocket | null = null;

    connect() {
        // Conectar ao seu backend (ajuste a porta conforme seu .env)
        this.ws = new WebSocket('ws://localhost:3001/api/ws');

        this.ws.onopen = () => {
            console.log('✅ Conectado ao WebSocket');
            this.sendTestMessage();
        };

        this.ws.onmessage = (event) => {
            console.log('📨 Mensagem recebida:', event.data);
        };

        this.ws.onclose = () => {
            console.log('❌ Conexão fechada');
        };

        this.ws.onerror = (error) => {
            console.error('🚫 Erro no WebSocket:', error);
        };
    }

    sendTestMessage() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send('Hello from frontend!');
            console.log('📤 Mensagem enviada');
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

// Para testar, adicione isso ao seu main.ts ou onde quiser
const wsTest = new WebSocketTest();

// Teste básico
document.addEventListener('DOMContentLoaded', () => {
    // Conectar automaticamente
    wsTest.connect();

    // Ou criar botões para testar manualmente
    const connectBtn = document.createElement('button');
    connectBtn.textContent = 'Conectar WS';
    connectBtn.onclick = () => wsTest.connect();
    
    const sendBtn = document.createElement('button');
    sendBtn.textContent = 'Enviar Mensagem';
    sendBtn.onclick = () => wsTest.sendTestMessage();

    document.body.appendChild(connectBtn);
    document.body.appendChild(sendBtn);
});