// src/matches/matches.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import * as repository from './match.repository';
import { CreateMatchData, UpdateMatchData } from './match.repository';
import { TournamentRepository } from '../tournaments/tournament.repository';

const RESERVED_USER_IDS = [4, 5];

// Validation helper functions
const isValidScore = (score: number): boolean => {
	return Number.isInteger(score) && score >= 0;
};

const isValidPlayerId = (id: number): boolean => {
	return Number.isInteger(id) && id > 0;
};

// Get all matches with pagination
export async function getAllMatches(request: FastifyRequest, reply: FastifyReply) {
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

		// Get matches and total count
		const [matches, totalCount] = await Promise.all([
			repository.getMatchesFromDb(limitNum, offset, search),
			repository.getMatchesCount(search)
		]);

		// Calculate pagination metadata
		const totalPages = Math.ceil(totalCount / limitNum);
		const hasNextPage = pageNum < totalPages;
		const hasPrevPage = pageNum > 1;

		reply.send({
			success: true,
			data: matches,
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
			error: 'Failed to retrieve matches',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get all matches without pagination (for simple lists)
export async function getAllMatchesSimple(request: FastifyRequest, reply: FastifyReply) {
	try {
		const matches = await repository.getAllMatchesFromDb();

		reply.send({
			success: true,
			data: matches,
			count: matches.length
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve matches',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get match by ID
export async function getMatchById(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { id } = request.params as { id: string };
		const matchId = parseInt(id, 10);

		if (isNaN(matchId)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid match ID'
			});
		}

		const match = await repository.getMatchById(matchId);

		if (!match) {
			return reply.status(404).send({
				success: false,
				error: 'Match not found'
			});
		}

		reply.send({
			success: true,
			data: match
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve match',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get matches by player ID
export async function getMatchesByPlayer(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { playerId } = request.params as { playerId: string };
		const playerIdNum = parseInt(playerId, 10);

		if (isNaN(playerIdNum)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid player ID'
			});
		}

		const matches = await repository.getMatchesByPlayerId(playerIdNum);

		reply.send({
			success: true,
			data: matches,
			count: matches.length
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve player matches',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get player statistics
export async function getPlayerStats(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { playerId } = request.params as { playerId: string };
		const playerIdNum = parseInt(playerId, 10);

		if (isNaN(playerIdNum)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid player ID'
			});
		}

		if (RESERVED_USER_IDS.includes(playerIdNum)) {
			return reply.status(404).send({
				success: false,
				error: 'Stats not available for reserved users'
			});
		}

		// Get both stats and recent matches
		const [stats, recentMatches] = await Promise.all([
			repository.getUserStats(playerIdNum),
			repository.getMatchesByPlayerId(playerIdNum)
		]);

		// Format all matches for the frontend (no limit)
		const formattedMatches = recentMatches.map(match => {
			const isPlayer1 = match.player1_id === playerIdNum;
			const playerId = isPlayer1 ? match.player1_id : match.player2_id;
			const opponentId = isPlayer1 ? match.player2_id : match.player1_id;
			const playerAlias = isPlayer1 ? match.player1_alias : match.player2_alias;
			const opponentAlias = isPlayer1 ? match.player2_alias : match.player1_alias;
			const playerUsername = RESERVED_USER_IDS.includes(playerId) ? playerAlias : (isPlayer1 ? match.player1_username : match.player2_username);
			const opponentUsername = RESERVED_USER_IDS.includes(opponentId) ? opponentAlias : (isPlayer1 ? match.player2_username : match.player1_username);
			const playerScore = isPlayer1 ? match.player1_score : match.player2_score;
			const opponentScore = isPlayer1 ? match.player2_score : match.player1_score;

			return {
				id: match.id,
				playerUsername,
				opponentUsername,
				playerScore,
				opponentScore,
				playedAt: match.played_at
			};
		});

		reply.send({
			success: true,
			data: {
				...stats,
				recentMatches: formattedMatches
			}
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve player statistics',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get bulk user statistics for multiple users
export async function getBulkUserStats(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { userIds } = request.body as { userIds: number[] };

		if (!userIds || !Array.isArray(userIds)) {
			return reply.status(400).send({
				success: false,
				error: 'userIds must be an array of user IDs'
			});
		}

		// Validate all user IDs are positive integers
		const invalidIds = userIds.filter(id => !Number.isInteger(id) || id <= 0);
		if (invalidIds.length > 0) {
			return reply.status(400).send({
				success: false,
				error: 'All user IDs must be positive integers',
				invalidIds
			});
		}

		// Limit the number of users to prevent abuse
		if (userIds.length > 100) {
			return reply.status(400).send({
				success: false,
				error: 'Maximum 100 users can be requested at once'
			});
		}

		const filteredUserIds = userIds.filter(id => !RESERVED_USER_IDS.includes(id));
		if (filteredUserIds.length === 0) {
			return reply.send({
				success: true,
				data: {}
			});
		}

		const statsMap = await repository.getBulkUserStats(filteredUserIds);

		// Convert Map to object for JSON response
		const statsObject: Record<number, any> = {};
		statsMap.forEach((stats, userId) => {
			statsObject[userId] = stats;
		});

		reply.send({
			success: true,
			data: statsObject
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve bulk user statistics',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Create new match
export async function createMatch(request: FastifyRequest, reply: FastifyReply) {
	try {
		const {
			player1_id,
			player2_id,
			player1_alias,
			player2_alias,
			winner_id,
			player1_score,
			player2_score,
			tournament_id  // Extract tournament_id from request body
		} = request.body as CreateMatchData;

		// Validation
		if (!player1_id || !player2_id || !player1_alias || !player2_alias ||
			player1_score === undefined || player2_score === undefined) {
			return reply.status(400).send({
				success: false,
				error: 'Missing required fields',
				required: ['player1_id', 'player2_id', 'player1_alias', 'player2_alias', 'player1_score', 'player2_score']
			});
		}

		if (!isValidPlayerId(player1_id)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid player1_id'
			});
		}

		// Allow player2_id to be a valid user ID or a reserved user ID (4, 5)
		if (!isValidPlayerId(player2_id) && !RESERVED_USER_IDS.includes(player2_id)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid player2_id'
			});
		}

		if (!isValidScore(player1_score)) {
			return reply.status(400).send({
				success: false,
				error: 'Player1 score must be a non-negative integer'
			});
		}

		if (!isValidScore(player2_score)) {
			return reply.status(400).send({
				success: false,
				error: 'Player2 score must be a non-negative integer'
			});
		}

		if (player1_alias.trim().length < 1 || player1_alias.trim().length > 50) {
			return reply.status(400).send({
				success: false,
				error: 'Player1 alias must be between 1 and 50 characters'
			});
		}

		if (player2_alias.trim().length < 1 || player2_alias.trim().length > 50) {
			return reply.status(400).send({
				success: false,
				error: 'Player2 alias must be between 1 and 50 characters'
			});
		}

		// Validate winner_id if provided
		if (winner_id !== undefined && winner_id !== null) {
			if (!isValidPlayerId(winner_id)) {
				return reply.status(400).send({
					success: false,
					error: 'Invalid winner_id'
				});
			}

			if (winner_id !== player1_id && winner_id !== player2_id) {
				return reply.status(400).send({
					success: false,
					error: 'Winner must be one of the players'
				});
			}
		}

		// Validate tournament_id if provided
		if (tournament_id !== undefined && tournament_id !== null) {
			if (!isValidPlayerId(tournament_id)) {
				return reply.status(400).send({
					success: false,
					error: 'Invalid tournament_id'
				});
			}
		}

		const newMatch = await repository.createMatch({
			player1_id,
			player2_id,
			player1_alias: player1_alias.trim(),
			player2_alias: player2_alias.trim(),
			winner_id: winner_id || null,
			player1_score,
			player2_score,
			tournament_id // Pass tournament_id to repository
		});

		reply.status(201).send({
			success: true,
			data: newMatch,
			message: 'Match created successfully'
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to create match',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

export async function generateAllRoundRobinMatches(request: FastifyRequest, reply: FastifyReply) {
  let { players } = request.body as { players: string[] };

  if (!Array.isArray(players) || players.length < 3) {
    return reply.code(400).send({ error: 'At least three players are required' });
  }

  const isOdd = players.length % 2 !== 0;
  if (isOdd) {
    players = [...players, 'BYE'];
  }

  const rounds = [];
  const n = players.length;
  const half = n / 2;

  const rotatedPlayers = [...players];

  for (let round = 0; round < n - 1; round++) {
    const matches = [];

    for (let i = 0; i < half; i++) {
      const player1 = rotatedPlayers[i];
      const player2 = rotatedPlayers[n - 1 - i];

      matches.push({
        player1_alias: player1 === 'BYE' ? null : player1,
        player2_alias: player2 === 'BYE' ? null : player2,
      });
    }

    rounds.push({ round: round + 1, matches });
    const last = rotatedPlayers.pop()!;
    rotatedPlayers.splice(1, 0, last);
  }

  return reply.send({ rounds });
}

// Update match
export async function updateMatch(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { id } = request.params as { id: string };
        const matchId = parseInt(id, 10);
        const updateData = request.body as UpdateMatchData;

        if (isNaN(matchId)) {
            return reply.status(400).send({
                success: false,
                error: 'Invalid match ID'
            });
        }

        // Validate update data
        if (
            !updateData.winner_id ||
            updateData.player1_score === undefined || !isValidScore(updateData.player1_score) ||
            updateData.player2_score === undefined || !isValidScore(updateData.player2_score)
        ) {
            return reply.status(400).send({
                success: false,
                error: 'Invalid update data',
                required: ['winner_id', 'player1_score', 'player2_score']
            });
        }

        // Validate winner_id
        if (!isValidPlayerId(updateData.winner_id)) {
            return reply.status(400).send({
                success: false,
                error: 'Invalid winner_id'
            });
        }

        // Remove status if not in UpdateMatchData type
        const updatedMatch = await repository.updateMatch(matchId, {
            winner_id: updateData.winner_id,
            player1_score: updateData.player1_score,
            player2_score: updateData.player2_score
        });

        if (!updatedMatch) {
            return reply.status(404).send({
                success: false,
                error: 'Match not found'
            });
        }

        reply.send({
            success: true,
            data: updatedMatch,
            message: 'Match updated successfully'
        });
    } catch (error) {
        reply.status(500).send({
            success: false,
            error: 'Failed to update match',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
