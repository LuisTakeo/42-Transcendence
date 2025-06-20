import { FastifyInstance } from 'fastify';

import { profile } from './user/profile';
import { debugTwoFactor } from './login/debug-2fa';
import { loginWithGoogle } from './login/login-google';
import { loginWithGoogle2FA } from './login/login-google-2fa';

export async function registerRoutes(app: FastifyInstance) {
  app.register(profile);
  app.register(debugTwoFactor);
  app.register(loginWithGoogle);
  app.register(loginWithGoogle2FA);
}
