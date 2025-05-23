import fastify from 'fastify';
import { runMigrations } from './database/database';

const server = fastify({ logger: true });
const port = 3001;
const host = '0.0.0.0';


// Define a simple route
server.get('/', async (request, reply) => {
	return { hello: 'world' };
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
