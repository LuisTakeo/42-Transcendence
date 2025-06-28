// src/friends/friends.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import * as repository from './friend.repository';
import { CreateFriendData } from './friend.repository';

// Validation helper functions
const isValidUserId = (id: number): boolean => {
	return Number.isInteger(id) && id > 0;
};

// Get all friendships with pagination
export async function getAllFriends(request: FastifyRequest, reply: FastifyReply) {
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

		// Get friendships and total count
		const [friendships, totalCount] = await Promise.all([
			repository.getFriendsFromDb(limitNum, offset, search),
			repository.getFriendsCount(search)
		]);

		// Calculate pagination metadata
		const totalPages = Math.ceil(totalCount / limitNum);
		const hasNextPage = pageNum < totalPages;
		const hasPrevPage = pageNum > 1;

		reply.send({
			success: true,
			data: friendships,
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
			error: 'Failed to retrieve friendships',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get all friendships without pagination
export async function getAllFriendsSimple(request: FastifyRequest, reply: FastifyReply) {
	try {
		const friendships = await repository.getAllFriendsFromDb();

		reply.send({
			success: true,
			data: friendships,
			count: friendships.length
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve friendships',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get friends by user ID
export async function getFriendsByUser(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { userId } = request.params as { userId: string };
		const userIdNum = parseInt(userId, 10);

		if (isNaN(userIdNum)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid user ID'
			});
		}

		const friends = await repository.getFriendsByUserId(userIdNum);

		reply.send({
			success: true,
			data: friends,
			count: friends.length
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve user friends',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Check if two users are friends
export async function checkFriendship(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { userId1, userId2 } = request.params as { userId1: string; userId2: string };
		const userId1Num = parseInt(userId1, 10);
		const userId2Num = parseInt(userId2, 10);

		if (isNaN(userId1Num) || isNaN(userId2Num)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid user IDs'
			});
		}

		if (userId1Num === userId2Num) {
			return reply.status(400).send({
				success: false,
				error: 'Cannot check friendship with yourself'
			});
		}

		const areFriends = await repository.areFriends(userId1Num, userId2Num);

		reply.send({
			success: true,
			data: {
				user1_id: userId1Num,
				user2_id: userId2Num,
				are_friends: areFriends
			}
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to check friendship',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get mutual friends between two users
export async function getMutualFriends(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { userId1, userId2 } = request.params as { userId1: string; userId2: string };
		const userId1Num = parseInt(userId1, 10);
		const userId2Num = parseInt(userId2, 10);

		if (isNaN(userId1Num) || isNaN(userId2Num)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid user IDs'
			});
		}

		if (userId1Num === userId2Num) {
			return reply.status(400).send({
				success: false,
				error: 'Cannot get mutual friends with yourself'
			});
		}

		const mutualFriends = await repository.getMutualFriends(userId1Num, userId2Num);

		reply.send({
			success: true,
			data: mutualFriends,
			count: mutualFriends.length
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve mutual friends',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get user's friend count
export async function getUserFriendCount(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { userId } = request.params as { userId: string };
		const userIdNum = parseInt(userId, 10);

		if (isNaN(userIdNum)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid user ID'
			});
		}

		const count = await repository.getUserFriendCount(userIdNum);

		reply.send({
			success: true,
			data: {
				user_id: userIdNum,
				friend_count: count
			}
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve friend count',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Create new friendship
export async function createFriendship(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { user1_id, user2_id } = request.body as CreateFriendData;

		// Validation
		if (!user1_id || !user2_id) {
			return reply.status(400).send({
				success: false,
				error: 'Missing required fields',
				required: ['user1_id', 'user2_id']
			});
		}

		if (!isValidUserId(user1_id)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid user1_id'
			});
		}

		if (!isValidUserId(user2_id)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid user2_id'
			});
		}

		if (user1_id === user2_id) {
			return reply.status(400).send({
				success: false,
				error: 'Users cannot be friends with themselves'
			});
		}

		// Check if friendship already exists
		const alreadyFriends = await repository.areFriends(user1_id, user2_id);
		if (alreadyFriends) {
			return reply.status(409).send({
				success: false,
				error: 'Friendship already exists'
			});
		}

		const newFriendship = await repository.createFriendship({
			user1_id,
			user2_id
		});

		reply.status(201).send({
			success: true,
			data: newFriendship,
			message: 'Friendship created successfully'
		});
	} catch (error) {
		// Handle database constraint errors
		if (error instanceof Error && error.message.includes('FOREIGN KEY')) {
			return reply.status(400).send({
				success: false,
				error: 'One or both users do not exist'
			});
		}

		if (error instanceof Error && error.message.includes('UNIQUE')) {
			return reply.status(409).send({
				success: false,
				error: 'Friendship already exists'
			});
		}

		reply.status(500).send({
			success: false,
			error: 'Failed to create friendship',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Delete friendship
export async function deleteFriendship(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { userId1, userId2 } = request.params as { userId1: string; userId2: string };
		const userId1Num = parseInt(userId1, 10);
		const userId2Num = parseInt(userId2, 10);

		if (isNaN(userId1Num) || isNaN(userId2Num)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid user IDs'
			});
		}

		if (userId1Num === userId2Num) {
			return reply.status(400).send({
				success: false,
				error: 'Cannot delete friendship with yourself'
			});
		}

		// Check if friendship exists
		const friendshipExists = await repository.areFriends(userId1Num, userId2Num);
		if (!friendshipExists) {
			return reply.status(404).send({
				success: false,
				error: 'Friendship not found'
			});
		}

		const deleted = await repository.deleteFriendship(userId1Num, userId2Num);

		if (!deleted) {
			return reply.status(500).send({
				success: false,
				error: 'Failed to delete friendship'
			});
		}

		reply.send({
			success: true,
			message: 'Friendship deleted successfully'
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to delete friendship',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}
