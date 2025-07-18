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

// Load environment variables from .env files using dotenv. Docker Compose passes environment variables to the container.
dotenv.config();

// Setup ngrok function
async function setupNgrok() {
  if (process.env.NODE_ENV === 'development') {
    try {
      const ngrok = require('ngrok');
      await ngrok.authtoken('301clH3Sd8pU5eBKfXX52Iox3OY_2MjJkjgYSAhTZkSLZunnu');
      
      // Tunnel para o frontend - usando o nome do serviço Docker
      const frontendPort = process.env.FRONT_PORT || '3042';
      const frontendUrl = await ngrok.connect({
        addr: `frontend:${frontendPort}`,
        proto: 'http',
        authtoken: '301clH3Sd8pU5eBKfXX52Iox3OY_2MjJkjgYSAhTZkSLZunnu'
      });
      
      // Tunnel para o backend
      const backendUrl = await ngrok.connect({
        addr: process.env.BACK_PORT,
        proto: 'http',
        authtoken: '301clH3Sd8pU5eBKfXX52Iox3OY_2MjJkjgYSAhTZkSLZunnu'
      });
      
      console.log(`🎯 Frontend ngrok tunnel: ${frontendUrl}`);
      console.log(`⚙️  Backend ngrok tunnel: ${backendUrl}`);
      console.log(`📊 Ngrok dashboard: http://localhost:4040`);
      
      return { frontendUrl, backendUrl };
    } catch (error) {
      console.error('❌ Error setting up ngrok:', error);
    }
  }
}

export const startServer = async () => {
	const app = fastify({ logger: true });
	const port = process.env.BACK_PORT;

	const host = '0.0.0.0';

	app.register(fastifyJwt, {
	  secret: process.env.FASTIFY_SECRET,
	});

	app.register(registerRoutes);

	// Habilitar CORS para seu frontend
	await app.register(cors, {
		origin: ['http://localhost:3142', 'http://localhost:3042', '*'], // URLs do frontend
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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
	
	// Setup ngrok tunnels in development
	await setupNgrok();
};
