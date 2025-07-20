// src/conversations/conversations.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import * as repository from './conversation.repository';
import { CreateConversationData } from './conversation.repository';

// Validation helper functions
const isValidUserId = (id: number): boolean => {
	return Number.isInteger(id) && id > 0;
};

const isValidConversationId = (id: number): boolean => {
	return Number.isInteger(id) && id > 0;
};

// Get all conversations with pagination
export async function getAllConversations(request: FastifyRequest, reply: FastifyReply) {
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

		// Get conversations and total count
		const [conversations, totalCount] = await Promise.all([
			repository.getConversationsFromDb(limitNum, offset, search),
			repository.getConversationsCount(search)
		]);

		// Calculate pagination metadata
		const totalPages = Math.ceil(totalCount / limitNum);
		const hasNextPage = pageNum < totalPages;
		const hasPrevPage = pageNum > 1;

		reply.send({
			success: true,
			data: conversations,
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
			error: 'Failed to retrieve conversations',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get all conversations without pagination
export async function getAllConversationsSimple(request: FastifyRequest, reply: FastifyReply) {
	try {
		const conversations = await repository.getAllConversationsFromDb();

		reply.send({
			success: true,
			data: conversations,
			count: conversations.length
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve conversations',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get conversation by ID
export async function getConversationById(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { id } = request.params as { id: string };
		const conversationId = parseInt(id, 10);

		if (isNaN(conversationId) || !isValidConversationId(conversationId)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid conversation ID'
			});
		}

		const conversation = await repository.getConversationById(conversationId);

		if (!conversation) {
			return reply.status(404).send({
				success: false,
				error: 'Conversation not found'
			});
		}

		reply.send({
			success: true,
			data: conversation
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve conversation',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get conversations by user ID
export async function getConversationsByUser(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { userId } = request.params as { userId: string };
		const userIdNum = parseInt(userId, 10);

		if (isNaN(userIdNum) || !isValidUserId(userIdNum)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid user ID'
			});
		}

		const conversations = await repository.getConversationsByUserId(userIdNum);

		reply.send({
			success: true,
			data: conversations,
			count: conversations.length
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve user conversations',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Check if conversation exists between two users
export async function checkConversation(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { userId1, userId2 } = request.params as { userId1: string; userId2: string };
		const userId1Num = parseInt(userId1, 10);
		const userId2Num = parseInt(userId2, 10);

		if (isNaN(userId1Num) || isNaN(userId2Num) || !isValidUserId(userId1Num) || !isValidUserId(userId2Num)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid user IDs'
			});
		}

		if (userId1Num === userId2Num) {
			return reply.status(400).send({
				success: false,
				error: 'Cannot check conversation with same user'
			});
		}

		const conversation = await repository.conversationExists(userId1Num, userId2Num);

		reply.send({
			success: true,
			data: {
				user1_id: userId1Num,
				user2_id: userId2Num,
				conversation_exists: !!conversation,
				conversation: conversation || null
			}
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to check conversation',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Create new conversation
export async function createConversation(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { user1_id, user2_id } = request.body as CreateConversationData;

		// Validation
		if (!user1_id || !user2_id) {
			return reply.status(400).send({
				success: false,
				error: 'user1_id and user2_id are required'
			});
		}

		if (!isValidUserId(user1_id) || !isValidUserId(user2_id)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid user IDs'
			});
		}

		if (user1_id === user2_id) {
			return reply.status(400).send({
				success: false,
				error: 'Cannot create conversation with same user'
			});
		}

		// Check if conversation already exists
		const existingConversation = await repository.conversationExists(user1_id, user2_id);
		if (existingConversation) {
			return reply.status(409).send({
				success: false,
				error: 'Conversation already exists',
				data: existingConversation
			});
		}

		// Create new conversation
		const newConversation = await repository.createConversation({ user1_id, user2_id });

		reply.status(201).send({
			success: true,
			data: newConversation,
			message: 'Conversation created successfully'
		});
	} catch (error) {
		if (error instanceof Error && error.message.includes('FOREIGN KEY constraint failed')) {
			return reply.status(400).send({
				success: false,
				error: 'One or both users do not exist'
			});
		}

		reply.status(500).send({
			success: false,
			error: 'Failed to create conversation',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get or create conversation between two users
export async function getOrCreateConversation(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { userId1, userId2 } = request.params as { userId1: string; userId2: string };
		const userId1Num = parseInt(userId1, 10);
		const userId2Num = parseInt(userId2, 10);

		if (isNaN(userId1Num) || isNaN(userId2Num) || !isValidUserId(userId1Num) || !isValidUserId(userId2Num)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid user IDs'
			});
		}

		if (userId1Num === userId2Num) {
			return reply.status(400).send({
				success: false,
				error: 'Cannot create conversation with same user'
			});
		}

		const conversation = await repository.getOrCreateConversation(userId1Num, userId2Num);

		reply.send({
			success: true,
			data: conversation
		});
	} catch (error) {
		if (error instanceof Error && error.message.includes('FOREIGN KEY constraint failed')) {
			return reply.status(400).send({
				success: false,
				error: 'One or both users do not exist'
			});
		}

		reply.status(500).send({
			success: false,
			error: 'Failed to get or create conversation',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}
