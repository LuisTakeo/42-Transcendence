// app.ts
import fastify from 'fastify';
import cors from '@fastify/cors';
import { runMigrations } from './database/database';
import usersRoutes from './users/users.routes';
import matchesRoutes from './matches/matches.routes';
import friendsRoutes from './friends/friends.routes';
import conversationsRoutes from './conversations/conversations.routes';
import messagesRoutes from './messages/messages.routes';
import { tournamentRoutes } from './tournaments/tournaments.routes';
// import outros módulos aqui futuramente

export const startServer = async () => {
	const app = fastify({ logger: true });
	const port = process.env.BACK_PORT ? Number(process.env.BACK_PORT) : 3143;
	const host = '0.0.0.0';

	// Habilitar CORS para seu frontend
	await app.register(cors, {
		origin: 'http://localhost:3042', // URL do seu frontend
	});

	// Run migrations
	await runMigrations();

	// Register routes
	app.register(usersRoutes, { prefix: '/users' });
	app.register(matchesRoutes, { prefix: '/matches' });
	app.register(friendsRoutes, { prefix: '/friends' });
	app.register(conversationsRoutes, { prefix: '/conversations' });
	app.register(messagesRoutes, { prefix: '/messages' });
	app.register(tournamentRoutes, { prefix: '/tournaments' });

	app.get('/', async () => ({ hello: 'world' }));

	await app.listen({ port, host });
	app.log.info(`Server running at http://${host}:${port}`);
};
