import fastify from 'fastify';

const server = fastify({ logger: true });
const port = process.env.BACK_PORT || 3142;
const host = '0.0.0.0';


// Define a simple route
server.get('/', async (request, reply) => {
	return { hello: 'world' };
  });

const start = async () =>
{
	try
	{
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