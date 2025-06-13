import { FastifyInstance } from 'fastify';
import { hashPassword } from '../utils/hash';
import { z } from 'zod';

export async function createUser(app: FastifyInstance) {

    const createUser = z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email format'),
        password: z.string().min(6, 'Password must be at least 6 characters long'),
        twoFactorEnabled: z.boolean().default(false),       // 2FA desligado inicialmente
        twoFactorSecret: z.string().nullable().default(null),
    });

    app.post('/create-user', async (request, reply) => {
        const {name, email, password} = createUser.parse(request.body);

        const hashedPassword = await hashPassword(password);

        // TODO: implementar lógica caso usuário já exista no banco de dados

        const user = {
            data : {
                name,
                email,
                password:hashedPassword,
                twoFactorEnabled: false,
                twoFactorSecret: null,
            }
        }
        return reply.status(201).send(user);
    });
}
