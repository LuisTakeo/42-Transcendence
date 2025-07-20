import { FastifyInstance } from 'fastify';
import speakeasy from 'speakeasy';

import { getSecret } from '../users/user.repository';

export async function debugTwoFactor(app: FastifyInstance) {

app.get('/debug-token/:email', async (req, res) => {
    const { email } = req.params as { email: string };
    const secret = await getSecret(email);

    if (!secret) {
      return res.status(404).send({ error: 'Secret not found' });
    }

    const token = speakeasy.totp({
      secret,
      encoding: 'base32',
    });

    return res.send({ token });
  });

}
