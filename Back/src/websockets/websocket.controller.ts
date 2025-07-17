import { WebSocket } from "@fastify/websocket";
import { FastifyRequest } from "fastify";
import { GameRoom, createGameRoom, joinGameRoom, leaveGameRoom, handlePlayerMove } from "../pong-game/game.controller";

// Estrutura para múltiplas salas (como mostrado anteriormente)
interface WebSocketQuery {
    userId: string;
}

function handleWebSocketConn(connection: WebSocket, 
    req: FastifyRequest<{Querystring: WebSocketQuery}>){
    
    const userId = req.query.userId as string;
    connection.on('message', (message: string) => {
        console.log(`Message received from ${userId}: ${message}`);
        
        try {
            const data = JSON.parse(message);
            if (!data || !data.type)
                throw new Error('Invalid message format');
            switch (data.type) {
                case 'create_game_room':
                    createGameRoom(userId, connection);
                    break;
                
                case 'join_game_room':
                    joinGameRoom(userId, connection, data.roomId);
                    break;
                
                // AQUI: Escutar movimento dos jogadores
                case 'player_move':
                    handlePlayerMove(userId, data);
                    break;
                
                case 'leave_game':
                    leaveGameRoom(userId);
                    break;
                
                default:
                    console.log(`Unknown message type: ${data.type}`);
            }
        } catch (error) {
            connection.send(`Echo: ${message}`);
        }
    });
}




// Outras funções (createGameRoom, joinGameRoom, etc.) como mostrado anteriormente...

// function handleChatMessage(userId: string, message: string) {
//     console.log(`Chat message from ${userId}: ${message}`);
    
//     // Verificar se o usuário está conectado no chat
//     const userConnection = chatUsers.get(userId);
//     if (!userConnection) {
//         console.log(`User ${userId} não está no chat`);
//         return;
//     }
    
//     // Broadcast da mensagem para todos no chat
//     const chatMessage = {
//         type: 'chat_message_broadcast',
//         from: userId,
//         message: message,
//         timestamp: new Date().toISOString()
//     };
    
//     const messageString = JSON.stringify(chatMessage);
    
//     // Enviar para todos os usuários conectados no chat
//     chatUsers.forEach((connection, chatUserId) => {
//         try {
//             connection.send(messageString);
//         } catch (error) {
//             console.log(`Erro ao enviar mensagem para ${chatUserId}`);
//             // Remove conexões mortas
//             chatUsers.delete(chatUserId);
//         }
//     });
    
//     console.log(`Mensagem "${message}" enviada para ${chatUsers.size} usuários no chat`);
// }

export { handleWebSocketConn, GameRoom };
export type { WebSocketQuery };