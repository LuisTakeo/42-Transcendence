import { FastifyInstance } from 'fastify';

export async function profile(app: FastifyInstance) {
    app.addHook('onRequest', async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            return reply.status(401).send({ error: 'Unauthorized' });
        }
    });

    app.get('/profile', async (request, reply) => {
        const user = request.user; // O usuário autenticado está disponível aqui
        return reply.status(200).send({ user });
    });
}