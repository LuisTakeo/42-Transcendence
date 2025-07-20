import { FastifyInstance } from 'fastify';
import { TournamentsController } from './tournaments.controller';

export async function tournamentRoutes(fastify: FastifyInstance) {
    const tournamentsController = new TournamentsController();

    // GET /tournaments - Get all tournaments
    fastify.get('/', tournamentsController.getAllTournaments.bind(tournamentsController));

    // GET /tournaments/active - Get active tournaments
    fastify.get('/active', tournamentsController.getActiveTournaments.bind(tournamentsController));

    // GET /tournaments/:id - Get tournament by ID with details
    fastify.get('/:id', tournamentsController.getTournamentById.bind(tournamentsController));

    // POST /tournaments - Create new tournament
    fastify.post('/', tournamentsController.createTournament.bind(tournamentsController));

    // POST /tournaments/:id/join - Join tournament
    fastify.post('/:id/join', tournamentsController.joinTournament.bind(tournamentsController));

    // POST /tournaments/:id/start - Start tournament
    fastify.post('/:id/start', tournamentsController.startTournament.bind(tournamentsController));

    // GET /tournaments/user/:userId - Get tournaments by user
    fastify.get('/user/:userId', tournamentsController.getUserTournaments.bind(tournamentsController));
}
