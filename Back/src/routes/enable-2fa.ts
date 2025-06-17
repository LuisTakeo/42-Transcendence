import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

import { saveSecret } from '../utils/temp'; // Função para salvar o segredo 2FA no banco de dados ou em outro local

export async function enableTwoFactor(app: FastifyInstance) {
    app.post('/enable-2fa', async (req, res) => {
       const bodySchema = z.object({
            email: z.string().email(),
       });

        const { email } = bodySchema.parse(req.body);

        const secret = speakeasy.generateSecret({
            name: ` ⭐ Transcendence ⭐ `
        });

        saveSecret(email, secret.base32);

        const qrCode = await qrcode.toDataURL(secret.otpauth_url || '');

        return res.status(200).send({
            message: 'Scan the QR code with Google Authenticator',
            qrCode,
            secret: secret.base32
        });
    });
}