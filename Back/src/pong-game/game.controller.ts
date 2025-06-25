import { Game, Room, Player, GameStatus } from "./game";
import { FastifyRequest } from "fastify";
import { WebSocket } from '@fastify/websocket';

interface ClientIncomingMessage {
	type: string;
	playerId: number;
	roomId?: number;
	key?: string;
}

interface ClientOutgoingMessage {
	type: string;
	message?: string;
	room?: {
		roomId: number;
		players: { id: number; name: string }[];
		playerCount: number;
		maxPlayers: number;
	};
	gameUpdate?: {
		message: string;
		playerCount: number;
		ballPosition?: { x: number; y: number };
		ballVelocity?: number;
		score?: { player1: number; player2: number };
		paddleLeft?: number;
		paddleRight?: number;
	};
}


const mapRooms: Map<number, Room> = new Map<number, Room>();

function handleGameConnection(connection: WebSocket, req: FastifyRequest){
    let i = 0;
    console.log("New WebSocket connection established");
    connection.on('open', () => {
        console.log('WebSocket connection opened');
        connection.send('Welcome to the Pong Game Server!');
    });

    connection.on('message', (message: string) => {
        try {
            const data = JSON.parse(message.toString());

            if (data.type && data.type === 'joinRoom') {
                const roomId = data.roomId;
                const idPlayer = data.playerId;
                const playerName = data.playerName || `Player${idPlayer}`;

                const player: Player = {
                    id: idPlayer,
                    name: playerName,
                    socket: connection,
                    paddlePosition: 0
                };

                // ✅ Usar nova lógica
                const joinResult = joinRoom(roomId, player);

                if (joinResult.success) {
                    const room = joinResult.room!;

                    broadcastToRoom(room, {
                        type: 'playerJoined',
                        room: {
                            roomId: room.roomId,
                            players: room.players.map(p => ({
                                id: p.id,
                                name: p.name
                            })),
                            playerCount: room.players.length,
                            maxPlayers: 2
                        }
                    });

                    console.log(`✅ Player ${player.id} joined room ${roomId}. Total players: ${room.players.length}`);
                } else {
                    // Enviar erro para o cliente
                    connection.send(JSON.stringify({
                        type: 'error',
                        message: joinResult.error
                    }));
                    console.log(`❌ ${joinResult.error}`);
                }
            }

        } catch (error) {
            console.error("Error: " + error);
            connection.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        }
    });

    connection.on('close', () => {
        console.log('Connection closed');
        cleanupPlayer(connection);
    });
}

// ✅ Nova função para entrar na room
function joinRoom(roomId: number, player: Player): {
    success: boolean;
    room?: Room;
    error?: string
} {
    // Verificar se o jogador já está na room
    if (mapRooms.has(roomId)) {
        const existingRoom = mapRooms.get(roomId)!;

        // Verificar se jogador já está na room
        if (existingRoom.players.find(p => p.id === player.id)) {
            return {
                success: false,
                error: `Player ${player.id} already in room ${roomId}`
            };
        }

        // Verificar se a room está cheia
        if (existingRoom.players.length >= 2) {
            return {
                success: false,
                error: `Room ${roomId} is full (${existingRoom.players.length}/2)`
            };
        }

        // Adicionar jogador à room existente
        existingRoom.players.push(player);
        return {
            success: true,
            room: existingRoom
        };
    } else {
        // Criar nova room
        const newRoom: Room = {
            roomId: roomId,
            players: [player], // ✅ Já adicionar o jogador
            status: GameStatus.WAITING,
            score: { player1: 0, player2: 0 },
            ballPosition: { x: 0, y: 0 },
            ballVelocity: 0,
        };

        mapRooms.set(roomId, newRoom);
        console.log(`🏠 Room ${roomId} created with player ${player.id}`);

        return {
            success: true,
            room: newRoom
        };
    }
}

// ✅ Função para limpar jogador desconectado
function cleanupPlayer(connection: WebSocket) {
    mapRooms.forEach((room, roomId) => {
        const initialCount = room.players.length;

        // Remover jogador da room
        room.players = room.players.filter(player => player.socket !== connection);

        if (room.players.length !== initialCount) {
            console.log(`🚪 Player disconnected from room ${roomId}. Remaining: ${room.players.length}`);

            // Notificar jogadores restantes
            if (room.players.length > 0) {
                broadcastToRoom(room, {
                    type: 'playerLeft',
                    room: {
                        roomId: room.roomId,
                        playerCount: room.players.length,
                        maxPlayers: 2
                    }
                });
            } else {
                // Deletar room se vazia
                mapRooms.delete(roomId);
                console.log(`🗑️ Room ${roomId} deleted (empty)`);
            }
        }
    });
}


function loopGame(room: Room, connection: WebSocket) {
    if (connection.readyState !== WebSocket.OPEN) {
        console.log(`Connection is not open for room ${room.roomId}`);
        return;
    }
    console.log(`Game loop for room ${room.roomId} is running`);
    room.players.forEach(player => {
        if (player.socket && player.socket.readyState === WebSocket.OPEN) {
            player.socket.send(JSON.stringify({
                type: 'gameUpdate',
                message: 'Game is running',
                playerCount: room.players.length
            }));
        }
    });
}

function broadcastToRoom(room: Room, message: any) {
    const messageStr = JSON.stringify(message);

    room.players.forEach(player => {
        if (player.socket && player.socket.readyState === WebSocket.OPEN) {
            player.socket.send(messageStr);
        }
    });
}

export { handleGameConnection };