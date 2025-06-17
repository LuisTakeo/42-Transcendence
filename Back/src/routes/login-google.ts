import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import qrcode from 'qrcode';
import speakeasy from 'speakeasy';

import { verifyGoogleToken } from '../utils/google';
import { findOrCreateUser, getSecret, saveSecret } from '../utils/temp';
import { enableTwoFactor } from './enable-2fa';

export async function loginWithGoogle(app: FastifyInstance) {
    app.post('/login-google', async (request, reply) => {
        const bodySchema = z.object({
            idToken : z.string(),
            twoFactorCode: z.string().optional(),
        });

        const { idToken, twoFactorCode } = bodySchema.parse(request.body);

        let payload;
        try {
            payload = await verifyGoogleToken(idToken);
        } catch (error) {
            return reply.status(401).send({ error: 'Invalid Google token' });
        }

        const { email, name} = payload;

        const user = findOrCreateUser(email, name);

        const secret = getSecret(user.email);

        if (!user.twoFactorEnabled || !secret) {
            const newSecret = speakeasy.generateSecret({
                name: '⭐ Transcendence ⭐',
              });

              saveSecret(user.email, newSecret.base32);
              const qrCode = await qrcode.toDataURL(newSecret.otpauth_url || '');

              return reply.status(403).send({
                    message: 'Two-factor authentication required. Please scan the QR code and verify your 2FA.',
                    qrCode,
                    secret: newSecret.base32,
                    needTwoFactorSetup: true,
               });

        }

        if (!twoFactorCode) {
            return reply.status(400).send({ error: 'Two-factor code is required' });
        }

        const isCodeValid = speakeasy.totp.verify({
            secret: secret!,
            encoding: 'base32',
            token: twoFactorCode,
        });

        if (!isCodeValid) {
        return reply.status(401).send({ error: 'Invalid 2FA code' });
        }

        if (!user.twoFactorEnabled) {
            enableTwoFactor(email); // Atualiza o user para refletir isso (se for mockado, apenas atualiza um campo)
        }

        const token = app.jwt.sign({ id: user.id, email: user.email});

        return reply.status(200).send({
            message : 'Login with Google successful',
            token,
        });
    });
}