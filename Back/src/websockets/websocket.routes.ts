import { WebSocket } from "@fastify/websocket";
import { FastifyInstance, FastifyRequest } from "fastify";
import { handleWebSocketConn } from "./websocket.controller";



export default async function websocketRoutes(fastify: FastifyInstance) {
    // Rota única para chat E game
    fastify.get('/ws', { websocket: true }, handleWebSocketConn);
}
