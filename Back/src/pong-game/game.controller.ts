import { Game, Room, Player, GameStatus } from "./game";
import { FastifyRequest } from "fastify";
import { WebSocket } from '@fastify/websocket';
import pl from "zod/v4/locales/pl.js";



interface GameRoom {
    id: string;
    players: Map<string, any>; // userId -> connection
    gameState: {
        ball: { x: number, y: number, vx: number, vy: number };
        player1: { y: number };
        player2: { y: number };
        score: { player1: number, player2: number };
    };
    // Controle de movimento contínuo
    playerInputs: {
        player1: { up: boolean, down: boolean };
        player2: { up: boolean, down: boolean };
    };
    // Controle de tempo para deltaTime
    lastUpdateTime: number;
    gameLoop?: NodeJS.Timeout;
    status: 'waiting' | 'playing' | 'finished';
    ballActive: boolean; // Se a bola está ativa (se movendo)
}

// Maps principais
const gameRooms: Map<string, GameRoom> = new Map();
const userToRoom: Map<string, string> = new Map(); // userId -> roomId
const connectionToSide: Map<any, {roomId: string, side: string}> = new Map(); // connection -> {roomId, side}






// Função para processar movimento dos jogadores
function handlePlayerMove(connection: WebSocket, data: any) {
    console.log(`Movimento recebido:`, data);

    // Buscar a sala e lado do jogador pela conexão
    const playerInfo = connectionToSide.get(connection);
    if (!playerInfo) {
        console.log(`Conexão não encontrada nos jogadores ativos`);
        return;
    }

    const room = gameRooms.get(playerInfo.roomId);
    if (!room || room.status !== 'playing') {
        console.log(`Sala ${playerInfo.roomId} não está jogando`);
        return;
    }

    // Atualizar estado das teclas para movimento contínuo
    const playerInputs = playerInfo.side === 'left' ? room.playerInputs.player1 : room.playerInputs.player2;

    if (data.direction === 'up') {
        playerInputs.up = data.pressed !== false; // true por padrão, false se explicitamente definido
        playerInputs.down = false; // Não pode pressionar ambas ao mesmo tempo
        // Ativar a bola no primeiro movimento
        if (!room.ballActive && data.pressed !== false) {
            room.ballActive = true;
            room.gameState.ball.vx = Math.random() > 0.5 ? 0.65 : -0.65;
            room.gameState.ball.vy = (Math.random() - 0.5) * 0.65;
        }
    } else if (data.direction === 'down') {
        playerInputs.down = data.pressed !== false;
        playerInputs.up = false;
        // Ativar a bola no primeiro movimento
        if (!room.ballActive && data.pressed !== false) {
            room.ballActive = true;
            room.gameState.ball.vx = Math.random() > 0.5 ? 0.65 : -0.65;
            room.gameState.ball.vy = (Math.random() - 0.5) * 0.65;
        }
    } else if (data.direction === 'stop') {
        playerInputs.up = false;
        playerInputs.down = false;
    }
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
    const currentTime = Date.now();
    const deltaTime = room.lastUpdateTime ? (currentTime - room.lastUpdateTime) / 1000 : 1/60; // Em segundos
    room.lastUpdateTime = currentTime;

    const { ball, player1, player2 } = room.gameState;

    // Primeiro, processar movimento dos paddles baseado no input contínuo
    updatePaddleMovement(room, deltaTime);

    // Usando as mesmas configurações do frontend
    const tableWidth = 100;
    const tableDepth = 80; // Corrigido para 80 como no frontend
    const paddleWidth = 2.5;
    const paddleHeight = 15; // Corrigido para 15 como no frontend (depth)

    // Atualizar posição da bola com deltaTime (só se a bola estiver ativa)
    if (room.ballActive) {
        ball.x += ball.vx * deltaTime * 60; // Normalizado para 60 FPS
        ball.y += ball.vy * deltaTime * 60;
    }

    // Colisão com bordas superior e inferior (mesma lógica do frontend)
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
        console.log("Player 1 marcou ponto");
        room.gameState.score.player1++;
        resetBall(room);

        broadcastToRoom(room.id, {
            type: 'goal',
            scorer: 'player1',
            score: room.gameState.score
        });
    } else if (ball.x < -halfTableWidth) {
        // Player 2 marcou ponto
        console.log("Player 2 marcou ponto");
        room.gameState.score.player2++;
        resetBall(room);

        broadcastToRoom(room.id, {
            type: 'goal',
            scorer: 'player2',
            score: room.gameState.score
        });
    }
}

// Nova função para processar movimento contínuo dos paddles
function updatePaddleMovement(room: GameRoom, deltaTime: number) {
    const paddleSpeed = 0.65; // Mesma velocidade base do frontend
    const tableDepth = 80;
    const paddleHeight = 15;
    const maxY = (tableDepth / 2) - 3 - (paddleHeight / 2); // Limite da mesa menos metade do paddle

    // Calcular movimento baseado em deltaTime (normalizado para 60 FPS)
    const movement = paddleSpeed * deltaTime * 60;

    // Atualizar Player 1 (esquerda)
    if (room.playerInputs.player1.up) {
        room.gameState.player1.y = Math.min(maxY, room.gameState.player1.y + movement);
    } else if (room.playerInputs.player1.down) {
        room.gameState.player1.y = Math.max(-maxY, room.gameState.player1.y - movement);
    }

    // Atualizar Player 2 (direita)
    if (room.playerInputs.player2.up) {
        room.gameState.player2.y = Math.min(maxY, room.gameState.player2.y + movement);
    } else if (room.playerInputs.player2.down) {
        room.gameState.player2.y = Math.max(-maxY, room.gameState.player2.y - movement);
    }
}

function checkPaddleCollision(room: GameRoom) {
    const { ball, player1, player2 } = room.gameState;
    const paddleWidth = 2.5; // Corrigido para 2.5 como no frontend
    const paddleHeight = 15; // Corrigido para 15 (depth do paddle)
    const ballRadius = 1; // Diâmetro 2 / 2 = raio 1

    // Posições das raquetes (mesma lógica do frontend)
    const player1X = -47; // -(tableWidth/2) + 3 = -50 + 3 = -47
    const player2X = 47;  // (tableWidth/2) - 3 = 50 - 3 = 47

    // Colisão com raquete do Player 1 (lado esquerdo)
    if (ball.x - ballRadius <= player1X + paddleWidth &&
        ball.vx < 0 && // Bola indo para a esquerda
        ball.y >= player1.y - paddleHeight/2 &&
        ball.y <= player1.y + paddleHeight/2) {

        // if (room.isFirstServe) {
        //     room.isFirstServe = false;
        // }
        ball.vx *= -1; // Inverte velocidade X

        // Adicionar efeito baseado na posição de contato (mesma lógica do frontend)
        const contactPoint = (ball.y - player1.y) / (paddleHeight/2);
        ball.vy += contactPoint * 0.3; // Efeito mais suave na velocidade Y

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
        ball.vy += contactPoint * 0.3; // Efeito mais suave na velocidade Y

        // Garantir que a bola não grude na raquete
        ball.x = player2X - paddleWidth - ballRadius;
    }
}

function resetBall(room: GameRoom) {
    room.gameState.ball = {
        x: 0,
        y: 0,
        vx: 0, // Bola parada até próximo movimento
        vy: 0
    };
    room.ballActive = false; // Desativar a bola novamente
}


function createGameRoom(connection: WebSocket, userId?: string) {
    const roomId = `${Date.now()}`;
    const playerSide = "left"; // Definindo o jogador como "left" para a nova sala
    const status = 'waiting' as const; // Definindo o status da sala como 'waiting'
    const newRoom = {
        id: roomId,
        players: new Map([[playerSide, connection]]),
        gameState: {
            ball: { x: 0, y: 0, vx: 0, vy: 0 }, // Bola parada inicialmente
            player1: { y: 0 }, // Jogador da esquerda
            player2: { y: 0 }, // Jogador da direita (ainda não conectado)
            score: { player1: 0, player2: 0 }
        },
        // Inicializar controle de movimento contínuo
        playerInputs: {
            player1: { up: false, down: false },
            player2: { up: false, down: false }
        },
        // Inicializar controle de tempo para deltaTime
        lastUpdateTime: Date.now(),
        status,
        ballActive: false // Bola inativa até primeiro movimento
    };
    gameRooms.set(roomId, newRoom);

    // Mapear conexão para side
    connectionToSide.set(connection, {roomId, side: playerSide});
    if (userId) (connection as any)._userId = userId;

    connection.send(JSON.stringify({
        type: 'room_created',
        roomId: roomId,
        side: playerSide,
        status: 'waiting'
    }));
    return {room: roomId, side: playerSide};
}

function findAvailableRoom(): GameRoom | null {
    for (const [roomId, room] of gameRooms.entries()) {
        if (room.status === 'waiting' && room.players.size < 2) {
            return room;
        }
    }
    return null;
}


function joinGameRoom(connection: WebSocket, userId?: string) {
    const availableRoom = findAvailableRoom();
    if (availableRoom) {
        // Adiciona como jogador da direita
        availableRoom.players.set('right', connection);

        // Mapear conexão para side
        connectionToSide.set(connection, {roomId: availableRoom.id, side: 'right'});
        if (userId) (connection as any)._userId = userId;

        connection.send(JSON.stringify({
            type: 'room_joined',
            roomId: availableRoom.id,
            side: 'right',
            status: availableRoom.status
        }));
        // Se sala ficou cheia, iniciar jogo
        if (availableRoom.players.size === 2) {
            availableRoom.status = 'playing';
            startGameLoop(availableRoom.id);
            broadcastToRoom(availableRoom.id, {
                type: 'game_started',
                roomId: availableRoom.id,
                gameState: availableRoom.gameState
            });
        }
        return {room: availableRoom.id, side: 'right'};
    } else {
        // Cria nova sala e adiciona como jogador da esquerda
        console.log("Nenhuma sala disponível, criando nova sala");
        return createGameRoom(connection, userId);
    }
}

async function startGameLoop(roomId: string) {
    const room = gameRooms.get(roomId);
    if (!room) return;

    // room.isFirstServe = true;

    // Game loop específico para esta sala - 60 FPS como no frontend
    room.gameLoop = setInterval(() => {
        if (room.status === 'playing') {
            updateGameLogic(room);
            broadcastToRoom(roomId, {
                type: 'game_update',
                gameState: room.gameState
            });

            // Verificar condição de vitória (opcional)
            const maxScore = 3; // DEFINIR PONTOS
            if (room.gameState.score.player1 >= maxScore || room.gameState.score.player2 >= maxScore) {
                room.status = 'finished';
                const winner = room.gameState.score.player1 >= maxScore ? 'left' : 'right';
                broadcastToRoom(roomId, {
                    type: 'game_over',
                    winner: winner,
                    finalScore: room.gameState.score
                });
                clearInterval(room.gameLoop);
            }
        }
    }, 1000 / 60); // 60 FPS (16.67ms)
}



function leaveGameRoom(connection: any) {
    const playerInfo = connectionToSide.get(connection);
    if (!playerInfo) return;

    const { roomId, side } = playerInfo;
    const room = gameRooms.get(roomId);
    if (!room) return;

    room.players.delete(side);
    connectionToSide.delete(connection);
    console.log(`Jogador do lado ${side} saiu da sala ${roomId}`);

    // Parar o game loop imediatamente
    if (room.gameLoop) {
        clearInterval(room.gameLoop);
    }

    // Se sala ficou vazia, limpar
    if (room.players.size === 0) {
        gameRooms.delete(roomId);
    } else {
        // Só declarar vencedor por desconexão se o jogo ainda estiver ativo
        if (room.status === 'playing') {
            const remainingSides = Array.from(room.players.keys());
            const winnerSide = remainingSides[0];
            console.log(`Enviando vitória por desconexão para ${winnerSide}`);
            broadcastToRoom(roomId, {
                type: 'end_game',
                message: 'Adversário saiu do jogo',
                winner: winnerSide
            });
            room.status = 'finished';
        } else {
            console.log(`Jogo já terminou (status: ${room.status}), não enviando nova mensagem de vitória`);
        }
        // Se o jogo já terminou (status='finished'), não enviar nova mensagem
    }
}

export {
    GameRoom, leaveGameRoom, createGameRoom, joinGameRoom, handlePlayerMove,
    broadcastToRoom, updateGameLogic, updatePaddleMovement, resetBall, checkPaddleCollision, startGameLoop,
    connectionToSide, gameRooms
}
