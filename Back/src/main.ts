import fastify from 'fastify';
import { runMigrations, openDb } from './database/database';

const server = fastify({ logger: true });
const port = process.env.BACK_PORT;
const host = '0.0.0.0';


// Define a simple route
server.get('/', async (request, reply) => {
	return { hello: 'world' };
  });

// ✅ Route to get all users
server.get('/users', async (request, reply) => {
	const db = await openDb();
	const users = await db.all('SELECT * FROM users');
	return users;
});

const start = async () =>
{
	try
	{
    	await runMigrations(); // Run migrations before starting the server
		await server.listen({ port, host });
		server.log.info(`Server listening on ${host}:${port}`);
	}
	catch (err)
	{
		server.log.error(err);
		process.exit(1);
	}

}

start();
