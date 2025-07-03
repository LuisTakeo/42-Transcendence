// users.routes.ts
import { FastifyInstance } from 'fastify';
import {
  getAllUsers,
  getAllUsersSimple,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserOnlineStatus
} from './users.controller';

export default async function usersRoutes(app: FastifyInstance) {
  app.get('/', getAllUsers);
  app.get('/all', getAllUsersSimple);
  app.get('/:id', getUserById);
  app.post('/', createUser);
  app.put('/:id', updateUser);
  app.delete('/:id', deleteUser);
  app.patch('/:id/online-status', updateUserOnlineStatus);
}
