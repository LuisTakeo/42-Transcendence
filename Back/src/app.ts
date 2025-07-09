// app.ts
import fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv';
import path from 'path';

import matchesRoutes from './matches/matches.routes';
import friendsRoutes from './friends/friends.routes';
import conversationsRoutes from './conversations/conversations.routes';
import messagesRoutes from './messages/messages.routes';
import { tournamentRoutes } from './tournaments/tournaments.routes';
import usersRoutes from './routes/users/users.routes';
import websocketRoutes from './websockets/websocket.routes';
// import outros módulos aqui futuramente

import { registerRoutes } from './routes/routes-controller'
import { runMigrations } from './database/database';

dotenv.config();

export const startServer = async () => {
	const app = fastify({ logger: true });
	const port = process.env.BACK_PORT;

	const host = '0.0.0.0';

	// app.register(fastifyJwt, {
	//   secret: process.env.FASTIFY_SECRET,
	// });

	app.register(registerRoutes);

	// Habilitar CORS para seu frontend
	await app.register(cors, {
		origin: ['http://localhost:5173', 'http://localhost:3042'], // URLs do frontend
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization']
	});

	// Serve static files from public folder
	await app.register(fastifyStatic, {
		root: path.join(__dirname, '../public'),
		prefix: '/public/'
	});

	await app.register(websocket);

	// Run migrations
	await runMigrations();
	app.register(matchesRoutes, { prefix: '/matches' });
	app.register(friendsRoutes, { prefix: '/friends' });
	app.register(conversationsRoutes, { prefix: '/conversations' });
	app.register(messagesRoutes, { prefix: '/messages' });
	app.register(tournamentRoutes, { prefix: '/tournaments' });
	app.register(usersRoutes, { prefix: '/users' });
	app.register(websocketRoutes, { prefix: '/api' });

	// app.get('/', async () => ({ hello: 'world' }));

	await app.listen({ port, host });
	app.log.info(`Server running at http://${host}:${port}`);
};
