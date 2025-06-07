// src/users/users.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { getUsersFromDb } from './user.repository';

export async function getAllUsers(request: FastifyRequest, reply: FastifyReply) {
	const users = await getUsersFromDb();
	reply.send(users);
}
