// users.routes.ts
import { FastifyInstance } from 'fastify';
import {
  getAllUsers,
  getAllUsersSimple,
  getUserById,
  getCurrentUser,
  updateCurrentUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserOnlineStatus,
  getAvailableAvatars,
  getUserStats
} from './users.controller';
import {
  enable2FA,
  disable2FA,
  verify2FACode,
  generate2FAQRCode
} from './twofa.controller';

export default async function usersRoutes(app: FastifyInstance) {
  app.get('/', getAllUsers);
  app.get('/all', getAllUsersSimple);
  app.get('/me', getCurrentUser);
  app.put('/me', updateCurrentUser);
  app.get('/:id', getUserById);
  app.post('/', createUser);
  app.put('/:id', updateUser);
  app.delete('/:id', deleteUser);
  app.patch('/:id/online-status', updateUserOnlineStatus);
  app.get('/avatars/list', getAvailableAvatars);
  app.get('/:id/stats', getUserStats);

  // 2FA endpoints
  app.get('/2fa/generate-qr', generate2FAQRCode);
  app.post('/2fa/enable', enable2FA);
  app.post('/2fa/disable', disable2FA);
  app.post('/2fa/verify', verify2FACode);
}
