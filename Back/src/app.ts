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


import { registerRoutes } from './routes/routes-controller'
import { runMigrations } from './database/database';


dotenv.config();


async function setupNgrok() {

  const ngrokAuthToken = process.env.NGROK_AUTHTOKEN;

  if (!ngrokAuthToken) {
    console.log('ℹ️  NGROK_AUTHTOKEN not found - skipping ngrok setup');
    return;
  }

  try {
    const ngrok = require('ngrok');
    await ngrok.authtoken(ngrokAuthToken);

    const frontendPort = process.env.FRONT_PORT || '3042';
    const frontendUrl = await ngrok.connect({
      addr: `frontend:${frontendPort}`,
      proto: 'http',
      authtoken: ngrokAuthToken
    });

    const backendUrl = await ngrok.connect({
      addr: process.env.BACK_PORT,
      proto: 'http',
      authtoken: ngrokAuthToken
    });

    console.log(`🎯 Frontend ngrok tunnel: ${frontendUrl}`);
    console.log(`⚙️  Backend ngrok tunnel: ${backendUrl}`);

    return { frontendUrl, backendUrl };
    return { frontendUrl };
  } catch (error) {
    console.error('❌ Error setting up ngrok:', error);
  }
}

export const startServer = async () => {
	const app = fastify({ logger: true });
	const port = process.env.BACK_PORT;

	const host = '0.0.0.0';

	app.register(fastifyJwt, {
	  secret: process.env.FASTIFY_SECRET,
	});


	await app.register(cors, {
    origin: process.env.FRONT_URL || true,
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
	});

  app.register(registerRoutes);

	await app.register(fastifyStatic, {
		root: path.join(__dirname, '../public'),
		prefix: '/public/'
	});

	await app.register(websocket);

	await runMigrations();
	app.register(matchesRoutes, { prefix: '/matches' });
	app.register(friendsRoutes, { prefix: '/friends' });
	app.register(conversationsRoutes, { prefix: '/conversations' });
	app.register(messagesRoutes, { prefix: '/messages' });
	app.register(tournamentRoutes, { prefix: '/tournaments' });
	app.register(usersRoutes, { prefix: '/users' });
	app.register(websocketRoutes, { prefix: '/ws' });

	await app.listen({ port, host });
	app.log.info(`Server running at http://${host}:${port}`);

	await setupNgrok();
};
