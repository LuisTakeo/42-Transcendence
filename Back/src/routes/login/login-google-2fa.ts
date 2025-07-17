import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import speakeasy from 'speakeasy';

import { verifyGoogleToken } from '../../utils/google';
import { findOrCreateUserDb, getSecret, enableTwoFactor } from '../users/user.repository';

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

    const { email, name, googleId } = payload;

    const user = await findOrCreateUserDb(email, name, googleId);
    if (!user) {
      return reply.status(404).send({ error: 'User not found.' });
    }

    const secret = await getSecret(user.email);

    if (!secret) {
      return reply.status(400).send({ error: 'No 2FA secret found for this user.' });
    }

    const isCodeValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: twoFactorCode,
      window: 2, // Allow 2 time windows for timing issues
      algorithm: 'sha1',
      digits: 6,
      period: 30
    });

    if (!isCodeValid) {
      return reply.status(401).send({ error: 'Invalid 2FA code' });
    }

    if (!user.two_factor_enabled) {
      await enableTwoFactor(email);
    }

    const token = app.jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      {
        expiresIn: '1h'
      }
  );

    return reply.status(200).send({
      message: 'Login with Google successful',
      token,
    });
  });
}
