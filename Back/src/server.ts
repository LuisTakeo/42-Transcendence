import Fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';

import { createUser } from './routes/create-user';

// 🔧 Cria o servidor Fastify
const app = Fastify({ logger: true });


// registrando rotas utilizadas
app.register(createUser);
app.register(fastifyJwt, {
  secret: 'my-secret-key', // Substitua pela sua chave secreta
});

// 🔧 Define uma rota de teste
app.get('/', async (request, reply) => {
  return { message: 'Hello World!' };
});

app.listen({ port : 3142, host : '0.0.0.0'}).then(() =>
console.log('Servidor rodando na porta 3142'));