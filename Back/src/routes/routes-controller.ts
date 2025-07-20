import { FastifyInstance } from 'fastify';

import { profile } from './users/profile';
import { debugTwoFactor } from './login/debug-2fa';
import { loginWithGoogle } from './login/login-google';
import { loginWithGoogle2FA } from './login/login-google-2fa';
import usersRoutes from './users/users.routes';

export async function registerRoutes(app: FastifyInstance) {

  // LOGIN
  app.register(debugTwoFactor);
  app.register(loginWithGoogle);
  app.register(loginWithGoogle2FA);

  // USERS
  app.register(profile);
  app.register(usersRoutes);

}
