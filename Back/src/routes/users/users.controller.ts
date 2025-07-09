// src/users/users.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import * as repository from './user.repository';
import { CreateUserData, UpdateUserData } from './user.repository';
import path from 'path';
import { promises as fs } from 'fs';

// Validation helper functions
const isValidEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

const isValidUsername = (username: string): boolean => {
	// Username should be 3-20 characters, alphanumeric and underscores only
	const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
	return usernameRegex.test(username);
};

// Get all users with pagination
export async function getAllUsers(request: FastifyRequest, reply: FastifyReply) {
	try {
		// Extract pagination parameters from query string
		const { page = '1', limit = '10', search } = request.query as {
			page?: string;
			limit?: string;
			search?: string;
		};

		const pageNum = parseInt(page, 10);
		const limitNum = parseInt(limit, 10);

		// Validation
		if (isNaN(pageNum) || pageNum < 1) {
			return reply.status(400).send({
				success: false,
				error: 'Page must be a positive integer'
			});
		}

		if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
			return reply.status(400).send({
				success: false,
				error: 'Limit must be between 1 and 100'
			});
		}

		const offset = (pageNum - 1) * limitNum;

		// Get users and total count
		const [users, totalCount] = await Promise.all([
			repository.getUsersFromDb(limitNum, offset, search),
			repository.getUsersCount(search)
		]);

		// Users are already safe - no password data in repository
		const safeUsers = users;

		// Calculate pagination metadata
		const totalPages = Math.ceil(totalCount / limitNum);
		const hasNextPage = pageNum < totalPages;
		const hasPrevPage = pageNum > 1;

		reply.send({
			success: true,
			data: safeUsers,
			pagination: {
				currentPage: pageNum,
				totalPages,
				totalCount,
				limit: limitNum,
				hasNextPage,
				hasPrevPage,
				nextPage: hasNextPage ? pageNum + 1 : null,
				prevPage: hasPrevPage ? pageNum - 1 : null
			}
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve users',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get all users without pagination (for simple lists)
export async function getAllUsersSimple(request: FastifyRequest, reply: FastifyReply) {
	try {
		const users = await repository.getAllUsersFromDb();

		// Users are already safe - no password data in repository
		const safeUsers = users;

		reply.send({
			success: true,
			data: safeUsers,
			count: safeUsers.length
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve users',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get user by ID
export async function getUserById(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { id } = request.params as { id: string };
		const userId = parseInt(id, 10);

		if (isNaN(userId)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid user ID'
			});
		}

		const user = await repository.getUserById(userId);

		if (!user) {
			return reply.status(404).send({
				success: false,
				error: 'User not found'
			});
		}

		// User data is already safe - no password data in repository
		const safeUser = user;

		reply.send({
			success: true,
			data: safeUser
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve user',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Create new user
export async function createUser(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { name, username, email, avatar_url } = request.body as CreateUserData;

		// Validation
		if (!name || !username || !email) {
			return reply.status(400).send({
				success: false,
				error: 'Missing required fields',
				required: ['name', 'username', 'email']
			});
		}

		if (!isValidEmail(email)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid email format'
			});
		}

		if (!isValidUsername(username)) {
			return reply.status(400).send({
				success: false,
				error: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'
			});
		}

		if (name.trim().length < 2) {
			return reply.status(400).send({
				success: false,
				error: 'Name must be at least 2 characters long'
			});
		}

		// Check if username already exists
		const existingUserByUsername = await repository.getUserByUsername(username);
		if (existingUserByUsername) {
			return reply.status(409).send({
				success: false,
				error: 'Username already exists'
			});
		}

		// Check if email already exists
		const existingUserByEmail = await repository.getUserByEmail(email);
		if (existingUserByEmail) {
			return reply.status(409).send({
				success: false,
				error: 'Email already exists'
			});
		}

		const newUser = await repository.createUser({
			name: name.trim(),
			username: username.trim(),
			email: email.trim().toLowerCase(),
			avatar_url
		});

		// User data is already safe - no password data in repository
		const safeUser = newUser;

		reply.status(201).send({
			success: true,
			data: safeUser,
			message: 'User created successfully'
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to create user',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Update user
export async function updateUser(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { id } = request.params as { id: string };
		const userId = parseInt(id, 10);

		if (isNaN(userId)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid user ID'
			});
		}

		const updateData = request.body as UpdateUserData;

		// Validation for fields being updated
		if (updateData.email && !isValidEmail(updateData.email)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid email format'
			});
		}

		if (updateData.username && !isValidUsername(updateData.username)) {
			return reply.status(400).send({
				success: false,
				error: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'
			});
		}

		if (updateData.name && updateData.name.trim().length < 2) {
			return reply.status(400).send({
				success: false,
				error: 'Name must be at least 2 characters long'
			});
		}

		// Check for existing username/email if being updated
		if (updateData.username) {
			const existingUser = await repository.getUserByUsername(updateData.username);
			if (existingUser && existingUser.id !== userId) {
				return reply.status(409).send({
					success: false,
					error: 'Username already exists'
				});
			}
		}

		if (updateData.email) {
			const existingUser = await repository.getUserByEmail(updateData.email);
			if (existingUser && existingUser.id !== userId) {
				return reply.status(409).send({
					success: false,
					error: 'Email already exists'
				});
			}
		}

		// Clean data
		const cleanedData: UpdateUserData = {};
		if (updateData.name) cleanedData.name = updateData.name.trim();
		if (updateData.username) cleanedData.username = updateData.username.trim();
		if (updateData.email) cleanedData.email = updateData.email.trim().toLowerCase();
		if (updateData.avatar_url !== undefined) cleanedData.avatar_url = updateData.avatar_url;
		if (updateData.is_online !== undefined) cleanedData.is_online = updateData.is_online;
		if (updateData.last_seen_at !== undefined) cleanedData.last_seen_at = updateData.last_seen_at;

		const updatedUser = await repository.updateUser(userId, cleanedData);

		if (!updatedUser) {
			return reply.status(404).send({
				success: false,
				error: 'User not found'
			});
		}

		// User data is already safe - no password data in repository
		const safeUser = updatedUser;

		reply.send({
			success: true,
			data: safeUser,
			message: 'User updated successfully'
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to update user',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Delete user
export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { id } = request.params as { id: string };
		const userId = parseInt(id, 10);

		if (isNaN(userId)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid user ID'
			});
		}

		// Check if user exists first
		const existingUser = await repository.getUserById(userId);
		if (!existingUser) {
			return reply.status(404).send({
				success: false,
				error: 'User not found'
			});
		}

		const deleted = await repository.deleteUser(userId);

		if (!deleted) {
			return reply.status(500).send({
				success: false,
				error: 'Failed to delete user'
			});
		}

		reply.send({
			success: true,
			message: 'User deleted successfully'
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to delete user',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Update user online status
export async function updateUserOnlineStatus(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { id } = request.params as { id: string };
		const userId = parseInt(id, 10);
		const { is_online } = request.body as { is_online: boolean | number };

		if (isNaN(userId)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid user ID'
			});
		}

		if (typeof is_online !== 'boolean' && typeof is_online !== 'number') {
			return reply.status(400).send({
				success: false,
				error: 'is_online must be a boolean or number (0/1)'
			});
		}

		// Check if user exists
		const existingUser = await repository.getUserById(userId);
		if (!existingUser) {
			return reply.status(404).send({
				success: false,
				error: 'User not found'
			});
		}

		const isOnline = Boolean(is_online);
		await repository.updateUserOnlineStatus(userId, isOnline);

		reply.send({
			success: true,
			message: `User ${isOnline ? 'online' : 'offline'} status updated successfully`
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to update user online status',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get available avatars
export async function getAvailableAvatars(request: FastifyRequest, reply: FastifyReply) {
	try {
		// Path to avatars folder in backend public directory
		const avatarsPath = path.join(__dirname, '../../../public/avatars');

		// Read all files in the avatars directory
		const files = await fs.readdir(avatarsPath);

		// Filter for image files and sort them
		const avatarFiles = files
			.filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file))
			.sort();

		reply.send({
			success: true,
			data: avatarFiles
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to get available avatars',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}
