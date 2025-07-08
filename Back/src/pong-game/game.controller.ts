import { Game, Room, Player, GameStatus } from "./game";
import { FastifyRequest } from "fastify";
import { WebSocket } from '@fastify/websocket';


interface GameRoom {
    id: string;
    players: Map<string, any>; // userId -> connection
    gameState: {
        ball: { x: number, y: number, vx: number, vy: number };
        player1: { y: number };
        player2: { y: number };
        score: { player1: number, player2: number };
    };
    gameLoop?: NodeJS.Timeout;
    status: 'waiting' | 'playing' | 'finished';
}

// Maps principais
const gameRooms: Map<string, GameRoom> = new Map();
const userToRoom: Map<string, string> = new Map(); // userId -> roomId



// interface GameRoom {
//     id: string;
//     players: Map<string, any>; // userId -> connection
//     gameState: {
//         ball: { x: number, y: number, vx: number, vy: number };
//         player1: { y: number };
//         player2: { y: number };
//         score: { player1: number, player2: number };
//     };
//     gameLoop?: NodeJS.Timer;
//     status: 'waiting' | 'playing' | 'finished';
// }

// const mapRooms: Map<number, Room> = new Map<number, Room>();



// Função para processar movimento dos jogadores
function handlePlayerMove(userId: string, data: any) {
    const roomId = userToRoom.get(userId);
    if (!roomId) {
        console.log(`User ${userId} não está em nenhuma sala`);
        return;
    }
    
    const room = gameRooms.get(roomId);
    if (!room || room.status !== 'playing') {
        console.log(`Sala ${roomId} não está jogando`);
        return;
    }
    
    // Determinar qual jogador (baseado na ordem de entrada)
    const playerIds = Array.from(room.players.keys());
    const isPlayer1 = playerIds[0] === userId;
    
    console.log(`Movimento recebido: ${userId} (${isPlayer1 ? 'Player1' : 'Player2'}) - ${data.direction}`);
    
    // Atualizar posição do jogador no backend
    if (isPlayer1) {
        // Limitar movimento dentro da mesa
        if (data.direction === 'up') {
            room.gameState.player1.y = Math.max(-15, room.gameState.player1.y - 2);
        } else if (data.direction === 'down') {
            room.gameState.player1.y = Math.min(15, room.gameState.player1.y + 2);
        }
    } else {
        if (data.direction === 'up') {
            room.gameState.player2.y = Math.max(-15, room.gameState.player2.y - 2);
        } else if (data.direction === 'down') {
            room.gameState.player2.y = Math.min(15, room.gameState.player2.y + 2);
        }
    }
    
    // Broadcast movimento para todos na sala
    broadcastToRoom(roomId, {
        type: 'player_moved',
        player: isPlayer1 ? 'player1' : 'player2',
        y: isPlayer1 ? room.gameState.player1.y : room.gameState.player2.y,
        userId: userId
    });
}

function broadcastToRoom(roomId: string, data: any) {
    const room = gameRooms.get(roomId);
    if (!room) return;
    
    const message = JSON.stringify(data);
    room.players.forEach(connection => {
        try {
            connection.send(message);
        } catch (error) {
            console.log('Erro ao enviar mensagem para jogador');
        }
    });
}

function updateGameLogic(room: GameRoom) {
    const { ball, player1, player2 } = room.gameState;
    const tableWidth = 100; // Ajuste conforme sua mesa
    const tableDepth = 100;
    const paddleWidth = 2;
    const paddleHeight = 6;
    
    // Atualizar posição da bola
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // Colisão com bordas superior e inferior
    const halfTableDepth = (tableDepth / 2) - 3;
    if (ball.y > halfTableDepth || ball.y < -halfTableDepth) {
        ball.vy *= -1; // Inverte velocidade Y
    }
    
    // Colisão com raquetes (jogadores)
    checkPaddleCollision(room);
    
    // Verificar pontuação (bola saiu pelos lados)
    const halfTableWidth = tableWidth / 2;
    if (ball.x > halfTableWidth) {
        // Player 1 marcou ponto
        room.gameState.score.player1++;
        resetBall(room);
        
        broadcastToRoom(room.id, {
            type: 'goal',
            scorer: 'player1',
            score: room.gameState.score
        });
    } else if (ball.x < -halfTableWidth) {
        // Player 2 marcou ponto
        room.gameState.score.player2++;
        resetBall(room);
        
        broadcastToRoom(room.id, {
            type: 'goal',
            scorer: 'player2',
            score: room.gameState.score
        });
    }
}

function checkPaddleCollision(room: GameRoom) {
    const { ball, player1, player2 } = room.gameState;
    const paddleWidth = 2;
    const paddleHeight = 6;
    const ballRadius = 0.75; // Raio da bola
    
    // Posições das raquetes (ajuste conforme sua implementação)
    const player1X = -18; // Lado esquerdo
    const player2X = 18;  // Lado direito
    
    // Colisão com raquete do Player 1 (lado esquerdo)
    if (ball.x - ballRadius <= player1X + paddleWidth && 
        ball.vx < 0 && // Bola indo para a esquerda
        ball.y >= player1.y - paddleHeight/2 && 
        ball.y <= player1.y + paddleHeight/2) {
        
        ball.vx *= -1; // Inverte velocidade X
        
        // Adicionar efeito baseado na posição de contato
        const contactPoint = (ball.y - player1.y) / (paddleHeight/2);
        ball.vy += contactPoint * 2; // Efeito na velocidade Y
        
        // Garantir que a bola não grude na raquete
        ball.x = player1X + paddleWidth + ballRadius;
    }
    
    // Colisão com raquete do Player 2 (lado direito)
    if (ball.x + ballRadius >= player2X - paddleWidth && 
        ball.vx > 0 && // Bola indo para a direita
        ball.y >= player2.y - paddleHeight/2 && 
        ball.y <= player2.y + paddleHeight/2) {
        
        ball.vx *= -1; // Inverte velocidade X
        
        // Adicionar efeito baseado na posição de contato
        const contactPoint = (ball.y - player2.y) / (paddleHeight/2);
        ball.vy += contactPoint * 2; // Efeito na velocidade Y
        
        // Garantir que a bola não grude na raquete
        ball.x = player2X - paddleWidth - ballRadius;
    }
}

function resetBall(room: GameRoom) {
    room.gameState.ball = {
        x: 0,
        y: 0,
        vx: Math.random() > 0.5 ? 0.5 : -0.5, // Direção aleatória
        vy: (Math.random() - 0.5) * 0.5
    };
}

function createGameRoom(userId: string, connection: any): string {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newRoom: GameRoom = {
        id: roomId,
        players: new Map([[userId, connection]]),
        gameState: {
            ball: { x: 400, y: 300, vx: 5, vy: 3 },
            player1: { y: 250 },
            player2: { y: 250 },
            score: { player1: 0, player2: 0 }
        },
        status: 'waiting'
    };
    
    gameRooms.set(roomId, newRoom);
    userToRoom.set(userId, roomId);
    
    connection.send(JSON.stringify({
        type: 'room_created',
        roomId: roomId,
        status: 'waiting'
    }));
    
    return roomId;
}

function joinGameRoom(userId: string, connection: any, roomId: string) {
    const room = gameRooms.get(roomId);
    
    if (!room) {
        connection.send(JSON.stringify({ type: 'error', message: 'Sala não encontrada' }));
        return;
    }
    
    if (room.players.size >= 2) {
        connection.send(JSON.stringify({ type: 'error', message: 'Sala cheia' }));
        return;
    }
    
    room.players.set(userId, connection);
    userToRoom.set(userId, roomId);
    
    // Se sala ficou cheia, iniciar jogo
    if (room.players.size === 2) {
        room.status = 'playing';
        startGameLoop(roomId);
        
        // Notificar jogadores
        broadcastToRoom(roomId, {
            type: 'game_started',
            roomId: roomId,
            gameState: room.gameState
        });
    }
}


function startGameLoop(roomId: string) {
    const room = gameRooms.get(roomId);
    if (!room) return;
    
    // Game loop específico para esta sala
    room.gameLoop = setInterval(() => {
        if (room.status === 'playing') {
            updateGameLogic(room);
            broadcastToRoom(roomId, {
                type: 'game_update',
                gameState: room.gameState
            });
        }
    }, 16); // 60 FPS
}



function leaveGameRoom(userId: string) {
    const roomId = userToRoom.get(userId);
    if (!roomId) return;
    
    const room = gameRooms.get(roomId);
    if (!room) return;
    
    room.players.delete(userId);
    userToRoom.delete(userId);
    
    // Se sala ficou vazia, limpar
    if (room.players.size === 0) {
        if (room.gameLoop) {
            clearInterval(room.gameLoop);
        }
        gameRooms.delete(roomId);
    } else {
        // Notificar jogador restante
        broadcastToRoom(roomId, {
            type: 'player_left',
            message: 'Adversário saiu do jogo'
        });
    }
}

export {
    GameRoom, leaveGameRoom, createGameRoom, joinGameRoom, handlePlayerMove,
    broadcastToRoom, updateGameLogic, resetBall, checkPaddleCollision, startGameLoop}