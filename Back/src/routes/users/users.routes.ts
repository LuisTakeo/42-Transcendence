// users.routes.ts
import { FastifyInstance } from 'fastify';
import { getAllUsers } from './users.controller';

export default async function usersRoutes(app: FastifyInstance) {
  app.get('/users', getAllUsers);
}
