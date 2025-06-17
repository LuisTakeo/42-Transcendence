import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';

import { createUser } from './routes/create-user';
import { loginUser } from './routes/login-user';
import { profile } from './routes/profile';
import { enableTwoFactor } from './routes/enable-2fa';
import { verifyTwoFactor } from './routes/verify-2fa';
import { debugTwoFactor } from './routes/debug-2fa';
import { loginWithGoogle } from './routes/login-google';

// 🔧 Cria o servidor Fastify
const app = Fastify({ logger: true });

// registrando rotas utilizadas
app.register(createUser);
app.register(loginUser);
app.register(profile);
app.register(enableTwoFactor);
app.register(verifyTwoFactor);
app.register(debugTwoFactor);
app.register(loginWithGoogle);

app.register(fastifyJwt, {
  secret: 'my-secret-key', // Substitua pela sua chave secreta
});

// 🔧 Define uma rota de teste
app.get('/', async (request, reply) => {
  return { message: 'Hello World!' };
});

app.listen({ port : 3142, host : '0.0.0.0'}).then(() =>
console.log('Servidor rodando na porta 3142'));