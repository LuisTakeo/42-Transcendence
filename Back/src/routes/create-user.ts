import { FastifyInstance } from 'fastify';
import { hashPassword } from '../utils/hash';
import { z } from 'zod';


export async function createUser(app: FastifyInstance) {

    const createUser = z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email format'),
        password: z.string().min(6, 'Password must be at least 6 characters long'),
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
            }
        }
        return reply.status(201).send(user);
    });
}


//     username: string, password: string): { username: string; password: string } {
//     // Aqui você pode adicionar lógica para criar um usuário, como salvar em um banco de dados
//     return { username, password };
// }