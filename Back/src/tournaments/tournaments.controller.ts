import { FastifyReply, FastifyRequest } from 'fastify';
import { TournamentRepository } from './tournament.repository';

interface CreateTournamentBody {
    name: string;
    owner_id: number;
}

interface JoinTournamentBody {
    user_id: number;
}

interface TournamentParams {
    id: string;
}

export class TournamentsController {
    private tournamentRepository: TournamentRepository;

    constructor() {
        this.tournamentRepository = new TournamentRepository();
    }

    // Get all tournaments
    async getAllTournaments(request: FastifyRequest, reply: FastifyReply) {
        try {
            const tournaments = await this.tournamentRepository.getAll();
            reply.code(200).send({ success: true, data: tournaments });
        } catch (error) {
            console.error('Error getting tournaments:', error);
            reply.code(500).send({ success: false, error: 'Internal server error' });
        }
    }

    // Get tournament by ID with players and matches
    async getTournamentById(request: FastifyRequest<{ Params: TournamentParams }>, reply: FastifyReply) {
        try {
            const id = parseInt(request.params.id);
            if (isNaN(id)) {
                return reply.code(400).send({ success: false, error: 'Invalid tournament ID' });
            }

            const tournament = await this.tournamentRepository.getById(id);
            if (!tournament) {
                return reply.code(404).send({ success: false, error: 'Tournament not found' });
            }

            const players = await this.tournamentRepository.getTournamentPlayers(id);
            const matches = await this.tournamentRepository.getTournamentMatches(id);
            const standings = await this.tournamentRepository.getTournamentStandings(id);

            reply.code(200).send({ 
                success: true, 
                data: { 
                    ...tournament,
                    players,
                    matches,
                    standings
                } 
            });
        } catch (error) {
            console.error('Error getting tournament:', error);
            reply.code(500).send({ success: false, error: 'Internal server error' });
        }
    }

    // Create new tournament
    async createTournament(request: FastifyRequest<{ Body: CreateTournamentBody }>, reply: FastifyReply) {
        try {
            const { name, owner_id } = request.body;
            
            if (!name || !owner_id) {
                return reply.code(400).send({ 
                    success: false, 
                    error: 'Name and owner_id are required' 
                });
            }

            const tournament = await this.tournamentRepository.create({ name, owner_id });
            reply.code(201).send({ success: true, data: tournament });
        } catch (error) {
            console.error('Error creating tournament:', error);
            reply.code(500).send({ success: false, error: 'Internal server error' });
        }
    }

    // Join tournament
    async joinTournament(request: FastifyRequest<{ Params: TournamentParams, Body: JoinTournamentBody }>, reply: FastifyReply) {
        try {
            const tournamentId = parseInt(request.params.id);
            const { user_id } = request.body;

            if (isNaN(tournamentId) || !user_id) {
                return reply.code(400).send({ 
                    success: false, 
                    error: 'Valid tournament ID and user_id are required' 
                });
            }

            // Check if tournament exists and is pending
            const tournament = await this.tournamentRepository.getById(tournamentId);
            if (!tournament) {
                return reply.code(404).send({ success: false, error: 'Tournament not found' });
            }

            if (tournament.status !== 'pending') {
                return reply.code(400).send({ 
                    success: false, 
                    error: 'Can only join pending tournaments' 
                });
            }

            // Check if user is already in tournament
            const existingPlayer = await this.tournamentRepository.getTournamentPlayer(tournamentId, user_id);
            if (existingPlayer) {
                return reply.code(400).send({ 
                    success: false, 
                    error: 'User is already in this tournament' 
                });
            }

            await this.tournamentRepository.addPlayer(tournamentId, user_id);
            reply.code(200).send({ success: true, message: 'Successfully joined tournament' });
        } catch (error) {
            console.error('Error joining tournament:', error);
            reply.code(500).send({ success: false, error: 'Internal server error' });
        }
    }

    // Start tournament (generate matches)
    async startTournament(request: FastifyRequest<{ Params: TournamentParams }>, reply: FastifyReply) {
        try {
            const tournamentId = parseInt(request.params.id);
            if (isNaN(tournamentId)) {
                return reply.code(400).send({ success: false, error: 'Invalid tournament ID' });
            }

            const tournament = await this.tournamentRepository.getById(tournamentId);
            if (!tournament) {
                return reply.code(404).send({ success: false, error: 'Tournament not found' });
            }

            if (tournament.status !== 'pending') {
                return reply.code(400).send({ 
                    success: false, 
                    error: 'Can only start pending tournaments' 
                });
            }

            const players = await this.tournamentRepository.getTournamentPlayers(tournamentId);
            if (players.length < 2) {
                return reply.code(400).send({ 
                    success: false, 
                    error: 'Need at least 2 players to start tournament' 
                });
            }

            // Generate first round matches
            await this.tournamentRepository.generateFirstRound(tournamentId);
            await this.tournamentRepository.updateStatus(tournamentId, 'ongoing');

            reply.code(200).send({ success: true, message: 'Tournament started successfully' });
        } catch (error) {
            console.error('Error starting tournament:', error);
            reply.code(500).send({ success: false, error: 'Internal server error' });
        }
    }

    // Get active tournaments (ongoing and pending)
    async getActiveTournaments(request: FastifyRequest, reply: FastifyReply) {
        try {
            const tournaments = await this.tournamentRepository.getActive();
            reply.code(200).send({ success: true, data: tournaments });
        } catch (error) {
            console.error('Error getting active tournaments:', error);
            reply.code(500).send({ success: false, error: 'Internal server error' });
        }
    }

    // Get tournaments by user (as player or owner)
    async getUserTournaments(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
        try {
            const userId = parseInt(request.params.userId);
            if (isNaN(userId)) {
                return reply.code(400).send({ success: false, error: 'Invalid user ID' });
            }

            const tournaments = await this.tournamentRepository.getByUser(userId);
            reply.code(200).send({ success: true, data: tournaments });
        } catch (error) {
            console.error('Error getting user tournaments:', error);
            reply.code(500).send({ success: false, error: 'Internal server error' });
        }
    }
}
