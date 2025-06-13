// src/routes/verify-2fa.ts
import { FastifyInstance } from 'fastify';
import speakeasy from 'speakeasy';
import { z } from 'zod';

import { getSecret } from '../utils/temp'; // Função para obter o segredo 2FA do banco de dados ou de outro local

export async function verifyTwoFactor(app: FastifyInstance) {
  app.post('/verify-2fa', async (request, reply) => {
    const bodySchema = z.object({
      email: z.string().email(),
      code: z.string().min(6).max(6),
    });

    const { email, code } = bodySchema.parse(request.body);

    const secret = getSecret(email);

    if (!secret) {
      return reply.status(404).send({ error: 'Secret not found' });
    }

    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 1 // Permite uma janela de 1 minuto para o código ser verificado
    });

    if (!verified) {
      return reply.status(401).send({ error: 'Invalid 2FA code' });
    }

    return reply.send({ message: '2FA enabled successfully' });
  });
}
