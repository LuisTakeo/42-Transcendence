// twofa.routes.ts
import { FastifyInstance } from 'fastify';
import {
  enable2FA,
  disable2FA,
  verify2FACode,
  generate2FAQRCode
} from './twofa.controller';

export default async function twofaRoutes(app: FastifyInstance) {
  app.post('/enable-2fa', enable2FA);
  app.post('/disable-2fa', disable2FA);
  app.post('/verify-2fa', verify2FACode);
  app.get('/generate-qr', generate2FAQRCode);
}
