import { WebSocket } from '@fastify/websocket';

enum GameStatus {
    WAITING = 'waiting',
    PLAYING = 'playing',
    FINISHED = 'finished',
    READY = 'ready'
}


interface Player {
    id: number;
    name: string;
    socket: WebSocket; // Replace with actual socket type if available
    paddlePosition: number;
}

interface Room {
    roomId: number;
    status: GameStatus;
    players: Player[];
    score: { player1: number; player2: number };
    ballPosition: { x: number; y: number };
    ballVelocity: number;
}


class Game {
    private rooms: Map<number, Room>;

    constructor() {
        this.rooms = new Map<number, Room>();
    }

    createRoom(roomId: number): Room {
        if (this.rooms.has(roomId)) {
            throw new Error(`Room with ID ${roomId} already exists`);
        }
        const room: Room = {
            roomId,
            players: [],
            score: { player1: 0, player2: 0 },
            status: GameStatus.WAITING,
            ballPosition: { x: 0, y: 0 },
            ballVelocity: 0
        };
        this.rooms.set(roomId, room);
        return room;
    }

    joinRoom(roomId: number, player: Player): Room {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new Error(`Room with ID ${roomId} does not exist`);
        }
        if (room.players.length >= 2) {
            throw new Error(`Room with ID ${roomId} is full`);
        }
        room.players.push(player);
        return room;
    }

    getRoom(roomId: number): Room | undefined {
        return this.rooms.get(roomId);
    }

    leaveRoom(roomId: number, playerId: number): void {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new Error(`Room with ID ${roomId} does not exist`);
        }
        room.players = room.players.filter(player => player.id !== playerId);
    }
}

export { Game, Player, Room, GameStatus };