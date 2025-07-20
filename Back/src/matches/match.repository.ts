// src/matches/match.repository.ts
import { openDb } from '../database/database';

// Interface for Match data
export interface Match {
	id?: number;
	player1_id: number;
	player2_id: number;
	player1_alias: string;
	player2_alias: string;
	winner_id?: number | null;
	player1_score: number;
	player2_score: number;
	tournament_id?: number | null;
	round_number?: number | null;
	match_position?: number | null;
	played_at?: string;
}

export interface CreateMatchData {
	player1_id: number;
	player2_id: number;
	player1_alias: string;
	player2_alias: string;
	winner_id?: number | null;
	player1_score: number;
	player2_score: number;
	tournament_id?: number | null;
	round_number?: number | null;
	match_position?: number | null;
}

export interface UpdateMatchData {
	player1_alias?: string;
	player2_alias?: string;
	winner_id?: number | null;
	player1_score?: number;
	player2_score?: number;
}

// Get all matches with pagination and optional search
export async function getMatchesFromDb(limit?: number, offset?: number, search?: string): Promise<Match[]> {
	const db = await openDb();

	let query = `
		SELECT
			m.*,
			p1.name as player1_name,
			p1.username as player1_username,
			p2.name as player2_name,
			p2.username as player2_username,
			w.name as winner_name,
			w.username as winner_username,
			t.name as tournament_name
		FROM matches m
		JOIN users p1 ON m.player1_id = p1.id
		JOIN users p2 ON m.player2_id = p2.id
		LEFT JOIN users w ON m.winner_id = w.id
		LEFT JOIN tournaments t ON m.tournament_id = t.id
	`;
	const params: any[] = [];

	// Add search condition if provided
	if (search) {
		query += ` WHERE (
			p1.name LIKE ? OR p1.username LIKE ? OR
			p2.name LIKE ? OR p2.username LIKE ? OR
			m.player1_alias LIKE ? OR m.player2_alias LIKE ?
		)`;
		const searchTerm = `%${search}%`;
		params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
	}

	query += ' ORDER BY m.played_at DESC';

	if (limit !== undefined) {
		query += ' LIMIT ?';
		params.push(limit);

		if (offset !== undefined) {
			query += ' OFFSET ?';
			params.push(offset);
		}
	}

	return db.all(query, params);
}

// Get all matches without pagination (for simple lists)
export async function getAllMatchesFromDb(): Promise<Match[]> {
	const db = await openDb();
	return db.all(`
		SELECT
			m.*,
			p1.name as player1_name,
			p1.username as player1_username,
			p2.name as player2_name,
			p2.username as player2_username,
			w.name as winner_name,
			w.username as winner_username,
			t.name as tournament_name
		FROM matches m
		JOIN users p1 ON m.player1_id = p1.id
		JOIN users p2 ON m.player2_id = p2.id
		LEFT JOIN users w ON m.winner_id = w.id
		LEFT JOIN tournaments t ON m.tournament_id = t.id
		ORDER BY m.played_at DESC
	`);
}

// Get total count of matches with optional search
export async function getMatchesCount(search?: string): Promise<number> {
	const db = await openDb();

	let query = `
		SELECT COUNT(*) as count
		FROM matches m
		JOIN users p1 ON m.player1_id = p1.id
		JOIN users p2 ON m.player2_id = p2.id
	`;
	const params: any[] = [];

	if (search) {
		query += ` WHERE (
			p1.name LIKE ? OR p1.username LIKE ? OR
			p2.name LIKE ? OR p2.username LIKE ? OR
			m.player1_alias LIKE ? OR m.player2_alias LIKE ?
		)`;
		const searchTerm = `%${search}%`;
		params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
	}

	const result = await db.get(query, params);
	return result.count;
}

// Get match by ID
export async function getMatchById(id: number): Promise<Match | null> {
	const db = await openDb();
	const match = await db.get(`
		SELECT
			m.*,
			p1.name as player1_name,
			p1.username as player1_username,
			p2.name as player2_name,
			p2.username as player2_username,
			w.name as winner_name,
			w.username as winner_username,
			t.name as tournament_name
		FROM matches m
		JOIN users p1 ON m.player1_id = p1.id
		JOIN users p2 ON m.player2_id = p2.id
		LEFT JOIN users w ON m.winner_id = w.id
		LEFT JOIN tournaments t ON m.tournament_id = t.id
		WHERE m.id = ?
	`, [id]);
	return match || null;
}

// Get matches by player ID
export async function getMatchesByPlayerId(playerId: number): Promise<Match[]> {
	const db = await openDb();
	return db.all(`
		SELECT
			m.*,
			p1.name as player1_name,
			p1.username as player1_username,
			p2.name as player2_name,
			p2.username as player2_username,
			w.name as winner_name,
			w.username as winner_username,
			t.name as tournament_name
		FROM matches m
		JOIN users p1 ON m.player1_id = p1.id
		JOIN users p2 ON m.player2_id = p2.id
		LEFT JOIN users w ON m.winner_id = w.id
		LEFT JOIN tournaments t ON m.tournament_id = t.id
		WHERE m.player1_id = ? OR m.player2_id = ?
		ORDER BY m.played_at DESC
	`, [playerId, playerId]);
}

// Create new match
export async function createMatch(matchData: CreateMatchData): Promise<Match> {
	const db = await openDb();
	const result = await db.run(
		`INSERT INTO matches (player1_id, player2_id, player1_alias, player2_alias, winner_id, player1_score, player2_score, tournament_id, round_number, match_position, played_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
		[
			matchData.player1_id,
			matchData.player2_id,
			matchData.player1_alias,
			matchData.player2_alias,
			matchData.winner_id || null,
			matchData.player1_score,
			matchData.player2_score,
			matchData.tournament_id || null,
			matchData.round_number || null,
			matchData.match_position || null
		]
	);

	const newMatch = await getMatchById(result.lastID!);
	if (!newMatch) {
		throw new Error('Failed to create match');
	}
	return newMatch;
}

// Update match
export async function updateMatch(id: number, matchData: UpdateMatchData): Promise<Match | null> {
	const db = await openDb();

	// Build dynamic update query
	const updateFields: string[] = [];
	const values: any[] = [];

	if (matchData.player1_alias !== undefined) {
		updateFields.push('player1_alias = ?');
		values.push(matchData.player1_alias);
	}
	if (matchData.player2_alias !== undefined) {
		updateFields.push('player2_alias = ?');
		values.push(matchData.player2_alias);
	}
	if (matchData.winner_id !== undefined) {
		updateFields.push('winner_id = ?');
		values.push(matchData.winner_id);
	}
	if (matchData.player1_score !== undefined) {
		updateFields.push('player1_score = ?');
		values.push(matchData.player1_score);
	}
	if (matchData.player2_score !== undefined) {
		updateFields.push('player2_score = ?');
		values.push(matchData.player2_score);
	}

	if (updateFields.length === 0) {
		return getMatchById(id); // No fields to update, return current match
	}

	values.push(id); // Add ID for WHERE clause

	const query = `UPDATE matches SET ${updateFields.join(', ')} WHERE id = ?`;
	const result = await db.run(query, values);

	if (result.changes === 0) {
		return null; // Match not found
	}

	return getMatchById(id);
}

// Get user statistics
export async function getUserStats(userId: number): Promise<{
	totalMatches: number;
	wins: number;
	losses: number;
	winRate: number;
}> {
	const db = await openDb();

	const totalMatches = await db.get(
		'SELECT COUNT(*) as count FROM matches WHERE player1_id = ? OR player2_id = ?',
		[userId, userId]
	);

	const wins = await db.get(
		'SELECT COUNT(*) as count FROM matches WHERE winner_id = ?',
		[userId]
	);

	const total = totalMatches.count;
	const winCount = wins.count;
	const losses = total - winCount;
	const winRate = total > 0 ? (winCount / total) * 100 : 0;

	return {
		totalMatches: total,
		wins: winCount,
		losses,
		winRate: Math.round(winRate * 100) / 100 // Round to 2 decimal places
	};
}

// Get bulk user statistics for multiple users in a single query
export async function getBulkUserStats(userIds: number[]): Promise<Map<number, {
	totalMatches: number;
	wins: number;
	losses: number;
	winRate: number;
}>> {
	if (userIds.length === 0) {
		return new Map();
	}

	const db = await openDb();
	const placeholders = userIds.map(() => '?').join(',');

	// Get total matches for all users
	const totalMatchesQuery = `
		SELECT
			user_id,
			COUNT(*) as total_matches
		FROM (
			SELECT player1_id as user_id FROM matches WHERE player1_id IN (${placeholders})
			UNION ALL
			SELECT player2_id as user_id FROM matches WHERE player2_id IN (${placeholders})
		)
		GROUP BY user_id
	`;

	// Get wins for all users
	const winsQuery = `
		SELECT
			winner_id as user_id,
			COUNT(*) as wins
		FROM matches
		WHERE winner_id IN (${placeholders})
		GROUP BY winner_id
	`;

	const totalMatchesResults = await db.all(totalMatchesQuery, [...userIds, ...userIds]);
	const winsResults = await db.all(winsQuery, userIds);

	// Create maps for easy lookup
	const totalMatchesMap = new Map();
	const winsMap = new Map();

	totalMatchesResults.forEach(row => {
		totalMatchesMap.set(row.user_id, row.total_matches);
	});

	winsResults.forEach(row => {
		winsMap.set(row.user_id, row.wins);
	});

	// Build result map
	const result = new Map();
	userIds.forEach(userId => {
		const totalMatches = totalMatchesMap.get(userId) || 0;
		const wins = winsMap.get(userId) || 0;
		const losses = totalMatches - wins;
		const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

		result.set(userId, {
			totalMatches,
			wins,
			losses,
			winRate: Math.round(winRate * 100) / 100 // Round to 2 decimal places
		});
	});

	return result;
}
