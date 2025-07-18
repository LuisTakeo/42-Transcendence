export class GameService {
    private websocket: WebSocket | null = null;
    private listeners: { [key: string]: (data: any) => void } = {};
    private isConnected: boolean = false;
    constructor(private serverUrl: string, private userId: string) {}

    // Inicializar a conexão WebSocket
    public connect(): void {
        try {
            console.log(`Attempting to connect to WebSocket at ${this.serverUrl}?userId=${this.userId}`);
            this.websocket = new WebSocket(`${this.serverUrl}?userId=${this.userId}`);
            
            this.setupEventHandlers();
        } catch (error) {
            console.error("Failed to create WebSocket connection:", error);
            this.attemptReconnection();
        }
    }

    private setupEventHandlers(): void {
        if (!this.websocket) return;
        
        this.websocket.onopen = () => {
            console.log("Connected to WebSocket server!");
            this.isConnected = true;
        };

        this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Mensagem recebida:", data);

            // Notificar os listeners registrados
            if (data.type && this.listeners[data.type]) {
                this.listeners[data.type](data);
            }
        };
        
        this.websocket.onerror = (error) => {
            console.error("WebSocket error:", error);
            // Don't attempt reconnect here - wait for onclose
        };
        
        this.websocket.onclose = (event) => {
            console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
            this.isConnected = false;
            this.attemptReconnection();
        };
    }

    private attemptReconnection(): void {
        console.log("Attempting to reconnect in 5 seconds...");
        setTimeout(() => {
            this.connect();
        }, 5000);
    }

    public isConnectedToServer(): boolean {
        return this.isConnected && this.websocket !== null && this.websocket.readyState === WebSocket.OPEN;
    }

    public sendMessage(type: string, payload: any): void {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({ type, ...payload }));
        } else {
            console.error("WebSocket não está conectado.");
        }
    }

    // Registrar listeners para tipos de mensagens
    public onMessage(type: string, callback: (data: any) => void): void {
        this.listeners[type] = callback;
    }

    // Fechar a conexão WebSocket
    public disconnect(): void {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
    }
}