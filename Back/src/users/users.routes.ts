// src/users/users.routes.ts
import { FastifyInstance } from 'fastify';
import {
	getAllUsers,
	getAllUsersSimple,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
	updateUserOnlineStatus
} from './users.controller';

export default async function usersRoutes(server: FastifyInstance) {
	// GET /users - Get all users with pagination
	server.get('/', getAllUsers);

	// GET /users/all - Get all users without pagination (for simple lists)
	server.get('/all', getAllUsersSimple);

	// GET /users/:id - Get user by ID
	server.get('/:id', getUserById);

	// POST /users - Create new user
	server.post('/', createUser);

	// PUT /users/:id - Update user
	server.put('/:id', updateUser);

	// DELETE /users/:id - Delete user
	server.delete('/:id', deleteUser);

	// PATCH /users/:id/status - Update user online status
	server.patch('/:id/status', updateUserOnlineStatus);
}
