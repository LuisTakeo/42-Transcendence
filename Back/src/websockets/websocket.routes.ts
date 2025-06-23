import { FastifyInstance } from "fastify";
import { handleGameConnection } from "../pong-game/game.controller";

export default async function websocketRoutes(fastify: FastifyInstance) {
    fastify.get('/ws/game', { websocket: true }, handleGameConnection);

    fastify.get('/ws/chat', { websocket: true }, (connection, req) => {
        connection.on('message', (message: string) => {
            console.log(`Chat message received: ${message}`);
            connection.send(`Chat Echo: ${message}`);
        });

        connection.on('close', () => {
            console.log('Chat connection closed');
        });
    });
}