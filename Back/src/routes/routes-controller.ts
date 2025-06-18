import { FastifyInstance } from 'fastify';

import { profile } from './profile';
import { debugTwoFactor } from './debug-2fa';
import { loginWithGoogle } from './login-google';

export async function registerRoutes(app: FastifyInstance) {
  app.register(profile);
  app.register(debugTwoFactor);
  app.register(loginWithGoogle);

}
