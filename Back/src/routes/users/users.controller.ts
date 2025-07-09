// src/routes/users/users.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import {
  SecureUserRepository,
  CreateUserData,
  UpdateUserData,
  User
} from '../../repositories/secure-user.repository';
import { InputValidator, XSSSanitizer } from '../../utils/security';
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

		// Validate pagination parameters
		if (isNaN(pageNum) || pageNum < 1) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid page number'
			});
		}

		if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid limit (must be between 1 and 100)'
			});
		}

		const offset = (pageNum - 1) * limitNum;

		// Sanitize search parameter if provided
		const sanitizedSearch = search ? XSSSanitizer.sanitizeInput(search) : undefined;

		// Get users using secure repository
		const users = await SecureUserRepository.getUsersFromDb(limitNum, offset, sanitizedSearch);
		const totalUsers = await SecureUserRepository.getUsersCount(sanitizedSearch);

		const totalPages = Math.ceil(totalUsers / limitNum);

		return reply.send({
			success: true,
			data: {
				users,
				pagination: {
					page: pageNum,
					limit: limitNum,
					total: totalUsers,
					totalPages,
					hasNext: pageNum < totalPages,
					hasPrev: pageNum > 1
				}
			}
		});

	} catch (error) {
		console.error('Error getting users:', error);
		return reply.status(500).send({
			success: false,
			error: 'Internal server error'
		});
	}
}

// Get all users without pagination (for simple lists)
export async function getAllUsersSimple(request: FastifyRequest, reply: FastifyReply) {
	try {
		const users = await SecureUserRepository.getUsersFromDb();

		return reply.send({
			success: true,
			data: users
		});
	} catch (error) {
		console.error('Error getting users:', error);
		return reply.status(500).send({
			success: false,
			error: 'Internal server error'
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

		const user = await SecureUserRepository.getUserById(userId);

		if (!user) {
			return reply.status(404).send({
				success: false,
				error: 'User not found'
			});
		}

		return reply.send({
			success: true,
			data: user
		});

	} catch (error) {
		console.error('Error getting user by ID:', error);
		return reply.status(500).send({
			success: false,
			error: 'Internal server error'
		});
	}
}

// Get user by username
export async function getUserByUsername(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { username } = request.params as { username: string };

		if (!username) {
			return reply.status(400).send({
				success: false,
				error: 'Username is required'
			});
		}

		// Sanitize username input
		const sanitizedUsername = XSSSanitizer.sanitizeInput(username);

		if (!isValidUsername(sanitizedUsername)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid username format'
			});
		}

		const user = await SecureUserRepository.getUserByUsername(sanitizedUsername);

		if (!user) {
			return reply.status(404).send({
				success: false,
				error: 'User not found'
			});
		}

		return reply.send({
			success: true,
			data: user
		});

	} catch (error) {
		console.error('Error getting user by username:', error);
		return reply.status(500).send({
			success: false,
			error: 'Internal server error'
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
				error: 'Invalid username format (3-20 characters, alphanumeric and underscores only)'
			});
		}

		// Sanitize input data
		const sanitizedData: CreateUserData = {
			name: XSSSanitizer.sanitizeInput(name.trim()),
			username: XSSSanitizer.sanitizeInput(username.trim()),
			email: XSSSanitizer.sanitizeInput(email.trim().toLowerCase()),
			avatar_url: avatar_url ? XSSSanitizer.sanitizeInput(avatar_url.trim()) : undefined
		};

		// Additional validation
		if (!InputValidator.isValidName(sanitizedData.name)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid name format'
			});
		}

		// Check for existing user
		const existingUser = await SecureUserRepository.getUserByUsername(sanitizedData.username);
		if (existingUser) {
			return reply.status(409).send({
				success: false,
				error: 'Username already exists'
			});
		}

		const existingEmail = await SecureUserRepository.getUserByEmail(sanitizedData.email);
		if (existingEmail) {
			return reply.status(409).send({
				success: false,
				error: 'Email already exists'
			});
		}

		// Create user using secure repository
		const newUser = await SecureUserRepository.createUser(sanitizedData);

		return reply.status(201).send({
			success: true,
			data: newUser
		});

	} catch (error) {
		console.error('Error creating user:', error);
		return reply.status(500).send({
			success: false,
			error: 'Internal server error'
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

		if (!updateData || Object.keys(updateData).length === 0) {
			return reply.status(400).send({
				success: false,
				error: 'No update data provided'
			});
		}

		// Validate and sanitize update data
		const cleanedData: UpdateUserData = {};

		if (updateData.name) {
			const sanitizedName = XSSSanitizer.sanitizeInput(updateData.name.trim());
			if (!InputValidator.isValidName(sanitizedName)) {
				return reply.status(400).send({
					success: false,
					error: 'Invalid name format'
				});
			}
			cleanedData.name = sanitizedName;
		}

		if (updateData.username) {
			const sanitizedUsername = XSSSanitizer.sanitizeInput(updateData.username.trim());
			if (!isValidUsername(sanitizedUsername)) {
				return reply.status(400).send({
					success: false,
					error: 'Invalid username format (3-20 characters, alphanumeric and underscores only)'
				});
			}
			cleanedData.username = sanitizedUsername;
		}

		if (updateData.email) {
			const sanitizedEmail = XSSSanitizer.sanitizeInput(updateData.email.trim().toLowerCase());
			if (!isValidEmail(sanitizedEmail)) {
				return reply.status(400).send({
					success: false,
					error: 'Invalid email format'
				});
			}
			cleanedData.email = sanitizedEmail;
		}

		if (updateData.avatar_url) {
			cleanedData.avatar_url = XSSSanitizer.sanitizeInput(updateData.avatar_url.trim());
		}

		if (updateData.is_online !== undefined) {
			cleanedData.is_online = updateData.is_online;
		}

		if (updateData.last_seen_at) {
			cleanedData.last_seen_at = updateData.last_seen_at;
		}

		// Check for conflicting username/email if being updated
		if (cleanedData.username) {
			const existingUser = await SecureUserRepository.getUserByUsername(cleanedData.username);
			if (existingUser && existingUser.id !== userId) {
				return reply.status(409).send({
					success: false,
					error: 'Username already exists'
				});
			}
		}

		if (cleanedData.email) {
			const existingEmail = await SecureUserRepository.getUserByEmail(cleanedData.email);
			if (existingEmail && existingEmail.id !== userId) {
				return reply.status(409).send({
					success: false,
					error: 'Email already exists'
				});
			}
		}

		// Update user using secure repository
		const updatedUser = await SecureUserRepository.updateUser(userId, cleanedData);

		if (!updatedUser) {
			return reply.status(404).send({
				success: false,
				error: 'User not found'
			});
		}

		return reply.send({
			success: true,
			data: updatedUser
		});

	} catch (error) {
		console.error('Error updating user:', error);
		return reply.status(500).send({
			success: false,
			error: 'Internal server error'
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

		const deleted = await SecureUserRepository.deleteUser(userId);

		if (!deleted) {
			return reply.status(404).send({
				success: false,
				error: 'User not found'
			});
		}

		return reply.send({
			success: true,
			message: 'User deleted successfully'
		});

	} catch (error) {
		console.error('Error deleting user:', error);
		return reply.status(500).send({
			success: false,
			error: 'Internal server error'
		});
	}
}

// Update user avatar
export async function updateUserAvatar(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { id } = request.params as { id: string };
		const userId = parseInt(id, 10);

		if (isNaN(userId)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid user ID'
			});
		}

		// Check if user exists
		const user = await SecureUserRepository.getUserById(userId);
		if (!user) {
			return reply.status(404).send({
				success: false,
				error: 'User not found'
			});
		}

		// For now, we'll expect avatar_url in the request body
		const { avatar_url } = request.body as { avatar_url: string };

		if (!avatar_url) {
			return reply.status(400).send({
				success: false,
				error: 'Avatar URL is required'
			});
		}

		// Sanitize avatar URL
		const sanitizedAvatarUrl = XSSSanitizer.sanitizeInput(avatar_url.trim());

		// Update user with new avatar URL
		const updatedUser = await SecureUserRepository.updateUser(userId, { avatar_url: sanitizedAvatarUrl });

		return reply.send({
			success: true,
			data: updatedUser,
			message: 'Avatar updated successfully'
		});

	} catch (error) {
		console.error('Error updating user avatar:', error);
		return reply.status(500).send({
			success: false,
			error: 'Internal server error'
		});
	}
}

// Set user as online/offline
export async function setUserOnlineStatus(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { id } = request.params as { id: string };
		const { is_online } = request.body as { is_online: boolean };
		const userId = parseInt(id, 10);

		if (isNaN(userId)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid user ID'
			});
		}

		if (typeof is_online !== 'boolean') {
			return reply.status(400).send({
				success: false,
				error: 'is_online must be a boolean'
			});
		}

		const updateData: UpdateUserData = {
			is_online: is_online ? 1 : 0,
			last_seen_at: new Date().toISOString()
		};

		const updatedUser = await SecureUserRepository.updateUser(userId, updateData);

		if (!updatedUser) {
			return reply.status(404).send({
				success: false,
				error: 'User not found'
			});
		}

		return reply.send({
			success: true,
			data: updatedUser
		});

	} catch (error) {
		console.error('Error setting user online status:', error);
		return reply.status(500).send({
			success: false,
			error: 'Internal server error'
		});
	}
}

// Get available avatars
export async function getAvailableAvatars(request: FastifyRequest, reply: FastifyReply) {
	try {
		// Path to avatars folder in backend public directory
		const avatarsPath = path.join(process.cwd(), 'public', 'avatars');

		// Read all files in the avatars directory
		const files = await fs.readdir(avatarsPath);

		// Filter for image files and sort them
		const avatarFiles = files
			.filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file))
			.sort();

		return reply.send({
			success: true,
			data: avatarFiles
		});
	} catch (error) {
		console.error('Error getting available avatars:', error);
		return reply.status(500).send({
			success: false,
			error: 'Internal server error'
		});
	}
}
