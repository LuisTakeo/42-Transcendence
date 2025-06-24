// src/users/users.routes.ts
import { FastifyInstance } from 'fastify';
import { getAllUsers } from './users.controller';

export default async function usersRoutes(server: FastifyInstance) {
	server.get('/', getAllUsers);
}
