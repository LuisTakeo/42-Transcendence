import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import dotenv from 'dotenv';

import { registerRoutes } from './routes/routes-controller'

dotenv.config();

const app = Fastify({ logger: true });

app.register(fastifyJwt, {
  secret: 'my-secret-key',
});

app.register(registerRoutes);

app.get('/', async (request, reply) => {
  return { message: 'Hello World!' };
});

app.listen({ port : 3142, host : '0.0.0.0'}).then(() =>
console.log('Servidor rodando na porta 3142'));