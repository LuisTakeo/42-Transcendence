// app.ts
import fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
// import outros módulos aqui futuramente

import { registerRoutes } from './routes/routes-controller'
import { runMigrations } from './database/database';

dotenv.config();

export const startServer = async () => {
	const app = fastify({ logger: true });
	const port = Number(process.env.BACK_PORT);
	const host = '0.0.0.0';

	app.register(fastifyJwt, {
	  secret: process.env.FASTIFY_SECRET,
	});

	app.register(registerRoutes);

	// Habilitar CORS para seu frontend
	await app.register(cors, {
		origin: 'http://localhost:5173', // URL do seu frontend
	});

	// Run migrations
	await runMigrations();

	app.get('/', async () => ({ hello: 'world' }));

	await app.listen({ port, host });
	app.log.info(`Server running at http://${host}:${port}`);
};
