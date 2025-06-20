import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import qrcode from 'qrcode';
import speakeasy from 'speakeasy';

import { verifyGoogleToken } from '../../utils/google';
import { findOrCreateUserDb } from '../users/user.repository';
import { getSecret } from '../../utils/temp';
import { saveSecret } from '../../utils/temp';

export function loginWithGoogle(app: FastifyInstance) {
  app.post('/login-google', async (request, reply) => {
    const bodySchema = z.object({
      idToken: z.string(),
    });

    const { idToken } = bodySchema.parse(request.body);

    let payload;
    try {
      payload = await verifyGoogleToken(idToken);
    } catch {
      return reply.status(401).send({ error: 'Invalid Google token' });
    }

    const { email, username } = payload;
    console.log("Payload retornado do Google:", payload);

    const user = await findOrCreateUserDb(email, username);
    console.log("usuário criado: ", user);
    // const secret = getSecret(user.email);

    // if (!user.twoFactorEnabled) {
    //   if (!secret) {
    //     const newSecret = speakeasy.generateSecret({
    //       name: '⭐ Transcendence ⭐',
    //     });

    //     saveSecret(user.email, newSecret.base32);
    //     const qrCode = await qrcode.toDataURL(newSecret.otpauth_url || '');

    //     return reply.status(403).send({
    //       message: '2FA setup required. Please scan the QR code and confirm with your code.',
    //       qrCode,
    //       secret: newSecret.base32,
    //       needTwoFactorSetup: true,
    //     });
    //   }

    //   return reply.status(401).send({
    //     message: 'Two-factor authentication code required',
    //     needTwoFactorSetup: false,
    //   });
    // }

    // return reply.status(401).send({
    //   message: 'Two-factor authentication code required',
    // });
  });
}