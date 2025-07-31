import { openDb } from '../database/database';

interface Tournament {
    id?: number;
    name: string;
    owner_id: number;
    status?: string;
    created_at?: string;
}

// Update TournamentPlayer interface
interface TournamentPlayer {
    tournament_id: number;
    user_id: number;
    username: string;
    name: string;
    points: number;
}

// Remove TournamentMatch round_number, match_position
interface TournamentMatch {
    id: number;
    player1_id: number;
    player2_id: number;
    player1_alias: string;
    player2_alias: string;
    winner_id: number | null;
    player1_score: number;
    player2_score: number;
    tournament_id: number;
    played_at: string;
}

export class TournamentRepository {
    // Get all tournaments
    async getAll(): Promise<Tournament[]> {
        const db = await openDb();
        const query = `
            SELECT t.*, u.username as owner_username
            FROM tournaments t
            JOIN users u ON t.owner_id = u.id
            ORDER BY t.created_at DESC
        `;
        return db.all(query);
    }

    // Get tournament by ID
    async getById(id: number): Promise<Tournament | null> {
        const db = await openDb();
        const query = `
            SELECT t.*, u.username as owner_username
            FROM tournaments t
            JOIN users u ON t.owner_id = u.id
            WHERE t.id = ?
        `;
        const result = await db.get(query, [id]);
        return result || null;
    }

    // Create new tournament
    async create(tournament: Omit<Tournament, 'id' | 'created_at'>): Promise<Tournament> {
        const db = await openDb();
        const query = `
            INSERT INTO tournaments (name, owner_id)
            VALUES (?, ?)
        `;
        const result = await db.run(query, [tournament.name, tournament.owner_id]);
        const created = await this.getById(result.lastID!);
        if (!created) {
            throw new Error('Failed to create tournament');
        }
        return created;
    }

    // Get tournament players (remove status/eliminated_in_round)
    async getTournamentPlayers(tournamentId: number): Promise<TournamentPlayer[]> {
        const db = await openDb();
        const query = `
            SELECT tp.tournament_id, tp.user_id, u.username, u.name, tp.points
            FROM tournament_players tp
            JOIN users u ON tp.user_id = u.id
            WHERE tp.tournament_id = ?
        `;
        return db.all(query, [tournamentId]);
    }

    // Get specific tournament player
    async getTournamentPlayer(tournamentId: number, userId: number): Promise<TournamentPlayer | null> {
        const db = await openDb();
        const query = `
            SELECT tp.*, u.username, u.name
            FROM tournament_players tp
            JOIN users u ON tp.user_id = u.id
            WHERE tp.tournament_id = ? AND tp.user_id = ?
        `;
        const result = await db.get(query, [tournamentId, userId]);
        return result || null;
    }

    // Add player to tournament (set points to 0)
    async addPlayer(tournamentId: number, userId: number): Promise<void> {
        const db = await openDb();
        const query = `
            INSERT INTO tournament_players (tournament_id, user_id, points)
            VALUES (?, ?, 0)
        `;
        await db.run(query, [tournamentId, userId]);
    }

    // Get tournament matches (remove round_number/match_position)
    async getTournamentMatches(tournamentId: number): Promise<TournamentMatch[]> {
        const db = await openDb();
        const query = `
            SELECT m.*,
                   u1.username as player1_username, u1.name as player1_name,
                   u2.username as player2_username, u2.name as player2_name,
                   w.username as winner_username
            FROM matches m
            JOIN users u1 ON m.player1_id = u1.id
            JOIN users u2 ON m.player2_id = u2.id
            LEFT JOIN users w ON m.winner_id = w.id
            WHERE m.tournament_id = ?
        `;
        return db.all(query, [tournamentId]);
    }

    // Get number of victories for a player in a tournament
    async getPlayerVictories(tournamentId: number, userId: number): Promise<number> {
        const db = await openDb();
        const query = `
            SELECT COUNT(*) as victories
            FROM matches
            WHERE tournament_id = ? AND winner_id = ?
        `;
        const result = await db.get(query, [tournamentId, userId]);
        return result?.victories || 0;
    }

    // Get points difference and total points made for a player
    async getPlayerPointsStats(tournamentId: number, userId: number): Promise<{diff: number, made: number}> {
        const db = await openDb();
        const query = `
            SELECT
                SUM(CASE WHEN player1_id = ? THEN player1_score WHEN player2_id = ? THEN player2_score ELSE 0 END) as made,
                SUM(CASE WHEN player1_id = ? THEN player2_score WHEN player2_id = ? THEN player1_score ELSE 0 END) as suffered
            FROM matches
            WHERE tournament_id = ?
        `;
        const result = await db.get(query, [userId, userId, userId, userId, tournamentId]);
        return { diff: (result?.made || 0) - (result?.suffered || 0), made: result?.made || 0 };
    }

    // Get final ranking with tiebreakers
    async getFinalRanking(tournamentId: number): Promise<Array<{
        tournament_id: number;
        user_id: number;
        username: string;
        name: string;
        points: number;
        victories: number;
        diff: number;
        made: number;
        rank: number;
    }>> {
        const players = await this.getTournamentPlayers(tournamentId);
        const stats = await Promise.all(players.map(async (p) => {
            const victories = await this.getPlayerVictories(tournamentId, p.user_id);
            const { diff, made } = await this.getPlayerPointsStats(tournamentId, p.user_id);
            return { ...p, victories, diff, made };
        }));
        // Sort by points, then victories, then diff, then made
        stats.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.victories !== a.victories) return b.victories - a.victories;
            if (b.diff !== a.diff) return b.diff - a.diff;
            if (b.made !== a.made) return b.made - a.made;
            return 0;
        });
        // Add rank (position) to each player
        const rankedStats = stats.map((p, i) => ({ ...p, rank: i + 1 }));
        // Check for full tie
        if (rankedStats.length > 1) {
            const top = rankedStats[0];
            const allTied = rankedStats.every(p => p.points === top.points && p.victories === top.victories && p.diff === top.diff && p.made === top.made);
            if (allTied) {
                console.log('All requirements are tied, a new game is needed to determine the winner.');
            }
        }
        return rankedStats;
    }

    // Update tournament status
    async updateStatus(tournamentId: number, status: string): Promise<void> {
        const db = await openDb();
        const query = `
            UPDATE tournaments
            SET status = ?
            WHERE id = ?
        `;
        await db.run(query, [status, tournamentId]);
    }

    // Get active tournaments
    async getActive(): Promise<Tournament[]> {
        const db = await openDb();
        const query = `
            SELECT t.*, u.username as owner_username
            FROM tournaments t
            JOIN users u ON t.owner_id = u.id
            WHERE t.status IN ('pending', 'ongoing')
            ORDER BY t.created_at DESC
        `;
        return db.all(query);
    }

    // Get tournaments by user (as player or owner)
    async getByUser(userId: number): Promise<Tournament[]> {
        const db = await openDb();
        const query = `
            SELECT DISTINCT t.*, u.username as owner_username,
                   CASE WHEN tp.user_id IS NOT NULL THEN 'player' ELSE 'owner' END as user_role
            FROM tournaments t
            JOIN users u ON t.owner_id = u.id
            LEFT JOIN tournament_players tp ON t.id = tp.tournament_id AND tp.user_id = ?
            WHERE t.owner_id = ? OR tp.user_id = ?
            ORDER BY t.created_at DESC
        `;
        return db.all(query, [userId, userId, userId]);
    }

    // Generate all-play-all matches for round-robin
    async generateRoundRobinMatches(tournamentId: number): Promise<void> {
        const db = await openDb();
        const players = await db.all(`
            SELECT tp.user_id, u.username
            FROM tournament_players tp
            JOIN users u ON tp.user_id = u.id
            WHERE tp.tournament_id = ?
        `, [tournamentId]);
        for (let i = 0; i < players.length; i++) {
            for (let j = i + 1; j < players.length; j++) {
                const player1 = players[i];
                const player2 = players[j];
                await db.run(`
                    INSERT INTO matches (
                        player1_id, player2_id, player1_alias, player2_alias,
                        player1_score, player2_score, tournament_id
                    ) VALUES (?, ?, ?, ?, 0, 0, ?)
                `, [
                    player1.user_id, player2.user_id,
                    player1.username, player2.username,
                    tournamentId
                ]);
            }
        }
    }

    // Recalculate and update points for all players in a tournament
    async updateTournamentPlayerPoints(tournamentId: number): Promise<void> {
        const db = await openDb();
        const players = await this.getTournamentPlayers(tournamentId);
        for (const player of players) {
            // Count wins and ties for this player in this tournament
            const stats = await db.get(`
                SELECT
                    SUM(CASE
                        WHEN (m.player1_id = tp.user_id AND m.player1_score > m.player2_score)
                          OR (m.player2_id = tp.user_id AND m.player2_score > m.player1_score)
                        THEN 1 ELSE 0 END) as wins,
                    SUM(CASE
                        WHEN m.player1_score = m.player2_score THEN 1 ELSE 0 END) as ties
                FROM matches m
                JOIN tournament_players tp ON tp.user_id = ? AND tp.tournament_id = ?
                WHERE m.tournament_id = ?
                  AND (m.player1_id = tp.user_id OR m.player2_id = tp.user_id)
                  AND m.winner_id IS NOT NULL
            `, [player.user_id, tournamentId, tournamentId]);

            const wins = stats?.wins || 0;
            const ties = stats?.ties || 0;
            const points = wins * 3 + ties * 1;

            await db.run(
                `UPDATE tournament_players SET points = ? WHERE tournament_id = ? AND user_id = ?`,
                [points, tournamentId, player.user_id]
            );
        }
    }
}
