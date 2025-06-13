import { FastifyInstance } from 'fastify';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

import { saveSecret } from '../utils/temp'; // Função para salvar o segredo 2FA no banco de dados ou em outro local

export async function enableTwoFactor(app: FastifyInstance) {
    app.post('/enable-2fa', async (req, res) => {
        const user = {
            email : 'user@example.com', // Substitua pelo email do usuário autenticado
            twoFactorEnabled: false, // Simula que o 2FA está desativado
            twoFactorSecret: null, // Simula que o usuário não tem um segredo 2FA
        };

        const secret = speakeasy.generateSecret({
            name: ` ⭐ Transcendence ⭐ `
        });

        saveSecret(user.email, secret.base32);

        const qrCode = await qrcode.toDataURL(secret.otpauth_url || '');

        return res.status(200).send({
            message: 'Scan the QR code with Google Authenticator',
            qrCode,
            secret: secret.base32
        });
    });
}