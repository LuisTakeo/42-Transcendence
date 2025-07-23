import { WebSocket } from "@fastify/websocket";
import { FastifyRequest } from "fastify";
import { GameRoom, createGameRoom, joinGameRoom, leaveGameRoom, handlePlayerMove, gameRooms, connectionToSide } from "../pong-game/game.controller";

// Estrutura para múltiplas salas (como mostrado anteriormente)
interface WebSocketQuery {
    userId: string;
}

// Add alias state per room
const roomAliases = new Map(); // roomId -> { left: { userId, alias }, right: { userId, alias } }

function handleWebSocketConn(connection: WebSocket,
    req: FastifyRequest<{Querystring: WebSocketQuery}>){

    const userId = req.query.userId as string;
    // Store userId on the connection object for later reference
    (connection as any)._userId = userId;
    // dar join room em alguma sala
    const roomInfo = joinGameRoom(connection, userId);
    const roomId = roomInfo.room;
    const side = roomInfo.side;
    const room = gameRooms.get(roomId);
    let opponentId = null;
    if (room) {
        // Find the other player's userId if present
        for (const [sideKey, conn] of room.players.entries()) {
            if (conn !== connection && (conn as any)._userId) {
                opponentId = (conn as any)._userId;
            }
        }
    }
    // Initialize alias state for the room if needed
    if (!roomAliases.has(roomId)) roomAliases.set(roomId, { left: {}, right: {} });
    roomAliases.get(roomId)[side] = { userId, alias: null };
    // Send both userId and opponentId in the join/create message
    connection.send(JSON.stringify({
        type: roomInfo.side === 'left' ? 'room_created' : 'room_joined',
        roomId: roomInfo.room,
        side: roomInfo.side,
        status: room ? room.status : 'waiting',
        userId: userId,
        opponentId: opponentId
    }));
    console.log(`New WebSocket connection from user: ${userId} in room: ${roomInfo.room}`);
    connection.on('message', (message: string) => {
        console.log(`Message received from ${userId}: ${message}`);

        try {
            const data = JSON.parse(message);
            if (!data || !data.type)
                throw new Error('Invalid message format');
            switch (data.type) {
                // AQUI: Escutar movimento dos jogadores
                case 'player_move':
                    handlePlayerMove(connection, data);
                    break;

                case 'leave_game':
                    leaveGameRoom(connection);
                    break;
                case 'set_alias':
                    // Store alias and broadcast room state
                    if (roomAliases.has(roomId)) {
                        roomAliases.get(roomId)[side].alias = data.alias;
                        broadcastRoomState(roomId);
                    }
                    break;
                default:
                    console.log(`Unknown message type: ${data.type}`);
            }
        } catch (error) {
            connection.send(`Echo: ${message}`);
        }
    });

    connection.on('close', () => {
        console.log(`Connection closed for user ${userId}`);
        leaveGameRoom(connection);
        // Clean up aliases if room is empty
        const room = gameRooms.get(roomId);
        if (!room || room.players.size === 0) {
            roomAliases.delete(roomId);
        }
    });

    function broadcastRoomState(roomId: string) {
        const state = roomAliases.get(roomId);
        const room = gameRooms.get(roomId);
        if (!room || !state) return;
        for (const [sideKey, conn] of room.players.entries()) {
            try {
                conn.send(JSON.stringify({
                    type: 'room_state',
                    left: state.left,
                    right: state.right
                }));
            } catch (e) {
                // Ignore send errors
            }
        }
    }
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
