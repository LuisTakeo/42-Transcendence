export class GameService {
    private websocket: WebSocket | null = null;
    private listeners: { [key: string]: (data: any) => void } = {};

    constructor(private serverUrl: string, private userId: string) {}

    // Inicializar a conexão WebSocket
    public connect(): void {
        this.websocket = new WebSocket(`${this.serverUrl}?userId=${this.userId}`);

        this.websocket.onopen = () => {
            console.log("Conectado ao WebSocket!");
        };

        this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Mensagem recebida:", data);

            // Notificar os listeners registrados
            if (data.type && this.listeners[data.type]) {
                this.listeners[data.type](data);
            }
        };

        this.websocket.onclose = () => {
            console.log("Conexão encerrada.");
        };

        this.websocket.onerror = (error) => {
            console.error("Erro no WebSocket:", error);
        };
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