/*


*/
// importar websocket do fastify 
import { FastifyWebSocket } from 'fastify-websocket';


interface Player {
    id: string;
    name: string;
    socketId: string;
    socket: FastifyWebSocket | null; // Replace with actual socket type if available
    paddlePosition: number;
}

interface Room {
    roomId: string;
    status: 'waiting' | 'playing' | 'finished';
    players: Player[];
    score: { player1: number; player2: number };
    ballPosition: { x: number; y: number };
    ballVelocity: number;
}


class Game {
    private rooms: Map<string, Room>;

    constructor() {
        this.rooms = new Map<string, Room>();
    }

    createRoom(roomId: string): Room {
        if (this.rooms.has(roomId)) {
            throw new Error(`Room with ID ${roomId} already exists`);
        }
        const room: Room = {
            roomId,
            players: [],
            score: { player1: 0, player2: 0 }
        };
        this.rooms.set(roomId, room);
        return room;
    }

    joinRoom(roomId: string, player: Player): Room {
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

    getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId);
    }

    leaveRoom(roomId: string, playerId: string): void {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new Error(`Room with ID ${roomId} does not exist`);
        }
        room.players = room.players.filter(player => player.id !== playerId);
    }
}