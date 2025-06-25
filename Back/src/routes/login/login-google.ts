import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import qrcode from 'qrcode';
import speakeasy from 'speakeasy';

import { verifyGoogleToken } from '../../utils/google';
import { findOrCreateUserDb, getSecret, saveSecret } from '../users/user.repository';

export function loginWithGoogle(app: FastifyInstance) {
  app.post('/login-google', async (request, reply) => {
    const bodySchema = z.object({
      idToken: z.string(),
    });

    const { idToken } = bodySchema.parse(request.body);

    let payload;
    try {
      payload = await verifyGoogleToken(idToken);
    } catch (err){
      return reply.status(401).send({ error: err });
    }

    const { email, username } = payload;

    const user = await findOrCreateUserDb(email, username);

    const secret = await getSecret(user.email);

    if (!user.twoFactorEnabled) {
      if (!secret) {
        const newSecret = speakeasy.generateSecret({
          name: '⭐ Transcendence ⭐',
        });

        await saveSecret(user.email, newSecret.base32);
        const qrCode = await qrcode.toDataURL(newSecret.otpauth_url || '');

        return reply.status(202).send({
          message: '2FA setup required. Please scan the QR code and confirm with your code.',
          qrCode,
          secret: newSecret.base32,
          needTwoFactorSetup: true,
        });
      }
    }

    return reply.status(401).send({
      message: 'Two-factor authentication code required',
    });
  });
}