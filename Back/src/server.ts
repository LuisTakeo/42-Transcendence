import Fastify from 'fastify';

// 🔧 Cria o servidor Fastify
const app = Fastify({ logger: true });

// 🔧 Define uma rota de teste
app.get('/', async (request, reply) => {
  return { message: 'Hello World!' };
});

app.listen({ port : 3142, host : '0.0.0.0'}).then(() =>
console.log('Servidor rodando na porta 3142'));