import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import speakeasy from 'speakeasy';

import { verifyGoogleToken } from '../../utils/google';
import { findOrCreateUserDb, getSecret, enableTwoFactor } from  '../../utils/temp';

export function loginWithGoogle2FA(app: FastifyInstance) {
  app.post('/login-google/2fa', async (request, reply) => {
    const bodySchema = z.object({
      idToken: z.string(),
      twoFactorCode: z.string(),
    });

    const { idToken, twoFactorCode } = bodySchema.parse(request.body);

    let payload;
    try {
      payload = await verifyGoogleToken(idToken);
    } catch {
      return reply.status(401).send({ error: 'Invalid Google token' });
    }

    const { email, name } = payload;
    const user = findOrCreateUserDb(email, name);
    const secret = getSecret(user.email);

    if (!secret) {
      return reply.status(400).send({ error: 'No 2FA secret found for this user.' });
    }

    const isCodeValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: twoFactorCode,
      window: 1,
    });

    if (!isCodeValid) {
      return reply.status(401).send({ error: 'Invalid 2FA code' });
    }

    if (!user.twoFactorEnabled) {
      enableTwoFactor(email);
    }

    const token = app.jwt.sign({
      id: user.id,
      email: user.email,
    });

    return reply.status(200).send({
      message: 'Login with Google successful',
      token,
    });
  });
}
