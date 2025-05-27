import fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';
import type { FastifyRequest, FastifyReply } from 'fastify';

const server = fastify({ logger: true });
const port = process.env.BACK_PORT;
const host = '0.0.0.0';


// registra plugin JWT

server.register(fastifyJwt, {
	secret : process.env.JWT_SECRET || 'supersecret'
});

// cria middleware para verificar o token JWT

server.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});


// Define a simple route
server.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
	return { hello: 'world' };
  });

// Exemplo de rota protegida

server.get('/profile', {preValidation: [server.authenticate]}, async (request: FastifyRequest, reply: FastifyReply) => {
	return { user: request.user };
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