import { FastifyInstance } from "fastify";

export default async function websocketRoutes(fastify: FastifyInstance) {
    fastify.get('/ws', { websocket: true }, (connection, req) => {
        let i = 0;
        connection.on('message', (message: string) => {
            i++;
            console.log(`Received message: ${message}. Count: ${i}`);
            connection.send(`Echo: ${message}, Count: ${i}`);
        });

        connection.on('close', () => {
            console.log('Connection closed');
        });
    });

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