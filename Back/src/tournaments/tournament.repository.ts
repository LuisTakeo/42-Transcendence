import { openDb } from '../database/database';

interface Tournament {
    id?: number;
    name: string;
    owner_id: number;
    status?: string;
    created_at?: string;
}

interface TournamentPlayer {
    tournament_id: number;
    user_id: number;
    username: string;
    name: string;
    status: string;
    eliminated_in_round: number | null;
}

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
    round_number: number;
    match_position: number;
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

    // Get tournament players
    async getTournamentPlayers(tournamentId: number): Promise<TournamentPlayer[]> {
        const db = await openDb();
        const query = `
            SELECT tp.*, u.username, u.name
            FROM tournament_players tp
            JOIN users u ON tp.user_id = u.id
            WHERE tp.tournament_id = ?
            ORDER BY tp.status ASC, tp.eliminated_in_round ASC
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

    // Add player to tournament
    async addPlayer(tournamentId: number, userId: number): Promise<void> {
        const db = await openDb();
        const query = `
            INSERT INTO tournament_players (tournament_id, user_id)
            VALUES (?, ?)
        `;
        await db.run(query, [tournamentId, userId]);
    }

    // Get tournament matches
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
            ORDER BY m.round_number, m.match_position
        `;
        return db.all(query, [tournamentId]);
    }

    // Get tournament standings
    async getTournamentStandings(tournamentId: number): Promise<any[]> {
        const db = await openDb();
        const query = `
            SELECT * FROM tournament_standings
            WHERE tournament_id = ?
            ORDER BY ranking_order
        `;
        return db.all(query, [tournamentId]);
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
                   CASE WHEN tp.user_id IS NOT NULL THEN 'player' ELSE 'owner' END as user_role,
                   tp.status as player_status
            FROM tournaments t
            JOIN users u ON t.owner_id = u.id
            LEFT JOIN tournament_players tp ON t.id = tp.tournament_id AND tp.user_id = ?
            WHERE t.owner_id = ? OR tp.user_id = ?
            ORDER BY t.created_at DESC
        `;
        return db.all(query, [userId, userId, userId]);
    }

    // Generate first round matches for tournament
    async generateFirstRound(tournamentId: number): Promise<void> {
        const db = await openDb();
        // Get active players
        const players = await db.all(`
            SELECT tp.user_id, u.username
            FROM tournament_players tp
            JOIN users u ON tp.user_id = u.id
            WHERE tp.tournament_id = ? AND tp.status = 'active'
        `, [tournamentId]);

        if (players.length < 2) {
            throw new Error('Not enough players to generate matches');
        }

        // Create tournament round
        await db.run(`
            INSERT INTO tournament_rounds (tournament_id, round_number)
            VALUES (?, 1)
        `, [tournamentId]);

        // Shuffle players for random matchmaking
        const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

        // Generate matches (pair players)
        for (let i = 0; i < shuffledPlayers.length - 1; i += 2) {
            if (i + 1 < shuffledPlayers.length) {
                const player1 = shuffledPlayers[i];
                const player2 = shuffledPlayers[i + 1];

                await db.run(`
                    INSERT INTO matches (
                        player1_id, player2_id, player1_alias, player2_alias,
                        player1_score, player2_score, tournament_id, round_number, match_position
                    ) VALUES (?, ?, ?, ?, 0, 0, ?, 1, ?)
                `, [
                    player1.user_id, player2.user_id,
                    player1.username, player2.username,
                    tournamentId, Math.floor(i / 2) + 1
                ]);
            }
        }
    }

    // Advance tournament to next round
    async advanceToNextRound(tournamentId: number): Promise<void> {
        const db = await openDb();
        // Get current round number
        const currentRound = await db.get(`
            SELECT MAX(round_number) as current_round
            FROM tournament_rounds
            WHERE tournament_id = ?
        `, [tournamentId]);

        const roundNumber = currentRound?.current_round || 0;

        // Get winners from current round
        const winners = await db.all(`
            SELECT winner_id, u.username
            FROM matches m
            JOIN users u ON m.winner_id = u.id
            WHERE m.tournament_id = ? AND m.round_number = ? AND m.winner_id IS NOT NULL
        `, [tournamentId, roundNumber]);

        if (winners.length < 2) {
            // Tournament finished
            if (winners.length === 1) {
                await db.run(`
                    UPDATE tournament_players
                    SET status = 'winner'
                    WHERE tournament_id = ? AND user_id = ?
                `, [tournamentId, winners[0].winner_id]);

                await this.updateStatus(tournamentId, 'finished');
            }
            return;
        }

        // Create next round
        const nextRound = roundNumber + 1;
        await db.run(`
            INSERT INTO tournament_rounds (tournament_id, round_number)
            VALUES (?, ?)
        `, [tournamentId, nextRound]);

        // Generate next round matches
        for (let i = 0; i < winners.length - 1; i += 2) {
            if (i + 1 < winners.length) {
                const player1 = winners[i];
                const player2 = winners[i + 1];

                await db.run(`
                    INSERT INTO matches (
                        player1_id, player2_id, player1_alias, player2_alias,
                        player1_score, player2_score, tournament_id, round_number, match_position
                    ) VALUES (?, ?, ?, ?, 0, 0, ?, ?, ?)
                `, [
                    player1.winner_id, player2.winner_id,
                    player1.username, player2.username,
                    tournamentId, nextRound, Math.floor(i / 2) + 1
                ]);
            }
        }
    }

    // Eliminate player from tournament
    async eliminatePlayer(tournamentId: number, userId: number, roundNumber: number): Promise<void> {
        const db = await openDb();
        await db.run(`
            UPDATE tournament_players
            SET status = 'eliminated', eliminated_in_round = ?
            WHERE tournament_id = ? AND user_id = ?
        `, [roundNumber, tournamentId, userId]);
    }
}
