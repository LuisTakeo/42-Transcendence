// src/friends/friends.routes.ts
import { FastifyInstance } from 'fastify';
import {
	getAllFriends,
	getAllFriendsSimple,
	getFriendsByUser,
	checkFriendship,
	getMutualFriends,
	getUserFriendCount,
	createFriendship,
	deleteFriendship
} from './friends.controller';

export default async function friendsRoutes(server: FastifyInstance) {
	// GET /friends - Get all friendships with pagination
	server.get('/', getAllFriends);

	// GET /friends/all - Get all friendships without pagination
	server.get('/all', getAllFriendsSimple);

	// GET /friends/user/:userId - Get friends by user ID
	server.get('/user/:userId', getFriendsByUser);

	// GET /friends/user/:userId/count - Get user's friend count
	server.get('/user/:userId/count', getUserFriendCount);

	// GET /friends/check/:userId1/:userId2 - Check if two users are friends
	server.get('/check/:userId1/:userId2', checkFriendship);

	// GET /friends/mutual/:userId1/:userId2 - Get mutual friends between two users
	server.get('/mutual/:userId1/:userId2', getMutualFriends);

	// POST /friends - Create new friendship
	server.post('/', createFriendship);

	// DELETE /friends/:userId1/:userId2 - Delete friendship
	server.delete('/:userId1/:userId2', deleteFriendship);
}
