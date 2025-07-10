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

    const { email, name, googleId } = payload;

    const user = await findOrCreateUserDb(email, name, googleId);

    // Check if user has 2FA enabled
    if (user.two_factor_enabled) {
      // User has 2FA enabled - require 2FA code
      return reply.status(401).send({
        message: 'Two-factor authentication code required',
        needTwoFactorCode: true,
      });
    }

    // User doesn't have 2FA enabled - allow direct login
    // Generate JWT token for direct login
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
      success: true,
    });
  });
}
