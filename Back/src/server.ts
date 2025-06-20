import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import dotenv from 'dotenv';

import { registerRoutes } from './routes/routes-controller'

dotenv.config();

const app = Fastify({ logger: true });

app.register(fastifyJwt, {
  secret: process.env.FASTIFY_SECRET,
});

app.register(registerRoutes);

app.get('/', async (request, reply) => {
  return { message: 'Hello World!' };
});


app.listen({ port: 3142, host: '0.0.0.0' }, () => {
  console.log(`Server is running at http://localhost:3142`);
});