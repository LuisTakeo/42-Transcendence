import Fastify from 'fastify';

// 🔧 Cria o servidor Fastify
const fastify = Fastify({ logger: true });

// 🏠 Rota pública simples
fastify.get('/', async (request, reply) => {
  return { message: 'Backend rodando perfeitamente! 🚀' };
});

// 🚀 Inicializa o servidor
const start = async () => {
  try {
    await fastify.listen({ port: 3142, host: '0.0.0.0' });
    console.log('Servidor rodando em http://0.0.0.0:3142');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
