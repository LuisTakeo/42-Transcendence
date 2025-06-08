import { FastifyInstance } from 'fastify';
import { compare } from 'bcryptjs';
import { z } from 'zod';

import { hashSync } from 'bcryptjs';

export async function loginUser(app: FastifyInstance) {

    const hash = hashSync('123456', 10);
    console.log(hash);

    const LogininSchema = z.object({
            email: z.string().email('Invalid email format'),
            password: z.string().min(6, 'Password must be at least 6 characters long'),
        });

        const user = {
            id: 1,
            email: 'fulano@email.com',
            // senha: 123456 -> gerado com bcryptjs.hashSync('123456', 10)
            password: '$2b$10$dBsEcGGgo8OFrK.u38JUAeIKXNVR5TCqVSD9jDNc4P448GMccFPfi',
          };

    app.post('/login', async (request, reply) => {
        // implementar lógica para pegar do banco de dados

        const {email, password} = LogininSchema.parse(request.body);

        const isPassword = await compare(password, user.password); // Substitua 'hashedPassword' pela senha real do banco de dados user.password
        if (!isPassword) {
            return reply.status(401).send({ error: 'Invalid email or password' });
        }

        const token = app.jwt.sign({id : user.id, email: user.email});

        return reply.status(200).send({token});

    });
}