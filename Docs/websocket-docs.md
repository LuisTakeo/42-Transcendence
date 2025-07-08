# Documentação WebSocket

## Frontend (TypeScript)

### Criando conexão
```typescript
const ws = new WebSocket('ws://localhost:3001/api/ws');
```

### Métodos principais

#### `ws.onopen`
Executado quando conexão é estabelecida
```typescript
ws.onopen = () => {
    console.log('Conectado!');
};
```

#### `ws.onmessage`
Recebe mensagens do backend
```typescript
ws.onmessage = (event) => {
    console.log('Mensagem recebida:', event.data);
    
    // Para JSON
    try {
        const data = JSON.parse(event.data);
        console.log('Dados JSON:', data);
    } catch (error) {
        console.log('Mensagem texto:', event.data);
    }
};
```

#### `ws.onclose`
Executado quando conexão fecha
```typescript
ws.onclose = () => {
    console.log('Desconectado');
};
```

#### `ws.onerror`
Captura erros na conexão
```typescript
ws.onerror = (error) => {
    console.error('Erro:', error);
};
```

#### `ws.send()`
Envia mensagem para o backend
```typescript
// Texto simples
ws.send('Mensagem texto');

// JSON
ws.send(JSON.stringify({ 
    type: 'game_action', 
    data: 'valor' 
}));
```

#### `ws.readyState`
Verifica estado da conexão
```typescript
if (ws.readyState === WebSocket.OPEN) {
    ws.send('mensagem');
}

// Estados possíveis:
// WebSocket.CONNECTING (0) - Conectando
// WebSocket.OPEN (1) - Aberto
// WebSocket.CLOSING (2) - Fechando
// WebSocket.CLOSED (3) - Fechado
```

### Exemplo completo Frontend
```typescript
class WebSocketManager {
    private ws: WebSocket | null = null;

    connect() {
        this.ws = new WebSocket('ws://localhost:3001/api/ws');

        this.ws.onopen = () => {
            console.log('✅ Conectado');
        };

        this.ws.onmessage = (event) => {
            console.log('📨 Recebido:', event.data);
        };

        this.ws.onclose = () => {
            console.log('❌ Desconectado');
        };

        this.ws.onerror = (error) => {
            console.error('🚫 Erro:', error);
        };
    }

    send(message: string | object) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const msg = typeof message === 'string' ? message : JSON.stringify(message);
            this.ws.send(msg);
        }
    }
}
```

---

## Backend (Fastify)

### Configurando rota WebSocket
```typescript
import { FastifyInstance } from "fastify";

export default async function websocketRoutes(fastify: FastifyInstance) {
    fastify.get('/ws', { websocket: true }, (connection, req) => {
        // handlers aqui
    });
}
```

### Métodos principais

#### `connection.on('message')`
Recebe mensagens do frontend
```typescript
connection.on('message', (message: string) => {
    console.log('Recebido:', message);
    
    // Para JSON
    try {
        const data = JSON.parse(message);
        console.log('Dados JSON:', data);
    } catch (error) {
        console.log('Mensagem texto:', message);
    }
});
```

#### `connection.on('close')`
Executado quando cliente desconecta
```typescript
connection.on('close', () => {
    console.log('Cliente desconectou');
});
```

#### `connection.send()`
Envia mensagem para o frontend
```typescript
// Texto simples
connection.send('Mensagem texto');

// JSON
connection.send(JSON.stringify({ 
    type: 'response', 
    data: 'valor' 
}));
```

### Exemplo completo Backend
```typescript
import { FastifyInstance } from "fastify";

// Array para múltiplas conexões
const connections: any[] = [];

export default async function websocketRoutes(fastify: FastifyInstance) {
    fastify.get('/ws', { websocket: true }, (connection, req) => {
        // Adicionar conexão
        connections.push(connection);
        console.log(`Nova conexão! Total: ${connections.length}`);

        connection.on('message', (message: string) => {
            console.log(`Received: ${message}`);
            
            try {
                const data = JSON.parse(message);
                
                switch (data.type) {
                    case 'chat':
                        broadcastToAll(`Chat: ${data.message}`);
                        break;
                    case 'game':
                        connection.send(`Game response: ${data.action}`);
                        break;
                    default:
                        connection.send(`Echo: ${message}`);
                }
            } catch (error) {
                connection.send(`Echo: ${message}`);
            }
        });

        connection.on('close', () => {
            const index = connections.indexOf(connection);
            if (index > -1) {
                connections.splice(index, 1);
            }
            console.log(`Conexão fechada! Total: ${connections.length}`);
        });
    });
}

// Enviar para todas as conexões
function broadcastToAll(message: string) {
    connections.forEach((conn, index) => {
        try {
            conn.send(message);
        } catch (error) {
            connections.splice(index, 1);
        }
    });
}
```

---

## Fluxo de Comunicação

### Básico
1. **Frontend** conecta → `ws.onopen` dispara
2. **Frontend** envia → `ws.send()` → **Backend** `connection.on('message')` recebe
3. **Backend** responde → `connection.send()` → **Frontend** `ws.onmessage` recebe
4. **Frontend** desconecta → **Backend** `connection.on('close')` dispara

### Com JSON
```typescript
// Frontend envia
ws.send(JSON.stringify({ type: 'player_move', direction: 'up' }));

// Backend recebe e processa
connection.on('message', (message: string) => {
    const data = JSON.parse(message);
    if (data.type === 'player_move') {
        console.log(`Jogador moveu: ${data.direction}`);
        connection.send(JSON.stringify({ type: 'move_confirmed', direction: data.direction }));
    }
});

// Frontend recebe resposta
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'move_confirmed') {
        console.log(`Movimento confirmado: ${data.direction}`);
    }
};
```

### Múltiplos Clientes
- Mantenha array de conexões no backend
- Use `broadcast` para enviar para todos
- Remova conexões mortas do array

### Tipos de Mensagem Recomendados
```json
{ "type": "chat", "message": "Olá!" }
{ "type": "game_move", "player": "1", "direction": "up" }
{ "type": "game_start", "gameId": "123" }
{ "type": "player_join", "username": "João" }
```