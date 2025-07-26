// src/matches/matches.routes.ts
import { FastifyInstance } from 'fastify';
import {
	getAllMatches,
	getAllMatchesSimple,
	getMatchById,
	getMatchesByPlayer,
	getPlayerStats,
	getBulkUserStats,
	createMatch,
	generateAllRoundRobinMatches,
	updateMatch
} from './matches.controller';

export default async function matchesRoutes(server: FastifyInstance) {
	// GET /matches - Get all matches with pagination
	server.get('/', getAllMatches);

	// GET /matches/all - Get all matches without pagination (for simple lists)
	server.get('/all', getAllMatchesSimple);

	// GET /matches/:id - Get match by ID
	server.get('/:id', getMatchById);

	// GET /matches/player/:playerId - Get matches by player ID
	server.get('/player/:playerId', getMatchesByPlayer);

	// GET /matches/player/:playerId/stats - Get player statistics
	server.get('/player/:playerId/stats', getPlayerStats);

	// POST /matches/bulk-stats - Get bulk user statistics
	server.post('/bulk-stats', getBulkUserStats);

	// POST /matches - Create new match
	server.post('/', createMatch);

	// POST /matches/generate - Generate matches

	server.post('/generate', generateAllRoundRobinMatches);

	// PUT /matches/:id - Update match
	server.put('/:id', updateMatch);

  // PATCH /matches/:id - Update match results
  server.patch('/:id', updateMatch);
}
