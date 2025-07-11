// app.ts
import fastify from 'fastify';
import cors from '@fastify/cors';
import { runMigrations } from './database/database';
import usersRoutes from './users/users.routes';
// import outros módulos aqui futuramente

export const startServer = async () => {
	const app = fastify({ logger: true });
	const port = process.env.BACK_PORT ? Number(process.env.BACK_PORT) : 3143;
	const host = '0.0.0.0';

	// Habilitar CORS para seu frontend
	await app.register(cors, {
		origin: 'http://localhost:5173', // URL do seu frontend
	});

	// Run migrations
	await runMigrations();

	// Register routes
	app.register(usersRoutes, { prefix: '/users' });

	app.get('/', async () => ({ hello: 'world' }));

	await app.listen({ port, host });
	app.log.info(`Server running at http://${host}:${port}`);
};
