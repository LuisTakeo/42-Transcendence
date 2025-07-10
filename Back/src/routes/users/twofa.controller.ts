// twofa.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import * as repository from './user.repository';
import qrcode from 'qrcode';
import speakeasy from 'speakeasy';
import { getSecret, saveSecret } from './user.repository';

// Generate QR code for 2FA setup
export async function generate2FAQRCode(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Verify JWT token
    await request.jwtVerify();

    // Get user from token payload
    const user = request.user as any;
    if (!user || !user.id) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    // Get user data
    const userData = await repository.getUserById(user.id);
    if (!userData) {
      return reply.status(404).send({ error: 'User not found' });
    }

    // ALWAYS clear any existing secret and create a new one
    await repository.updateUser(user.id, {
      two_factor_enabled: 0,
      two_factor_secret: null
    });

    // Check if user already has 2FA enabled
    if (userData.two_factor_enabled) {
      return reply.status(400).send({
        success: false,
        error: 'Two-factor authentication is already enabled'
      });
    }

        // Generate new secret
    const newSecret = speakeasy.generateSecret({
      name: ` 42 Transcendence  (${userData.email})`,
    });

    const secret = newSecret.base32;

    // Generate QR code first to get the encoded secret
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret,
      label: userData.email,
      issuer: 'Transcendence',
      algorithm: 'sha1',
      digits: 6,
      period: 30,
    });

    // Extract the encoded secret from the URL
    const encodedSecret = otpauthUrl.split('secret=')[1]?.split('&')[0];

    // Save the ENCODED secret to the database
    await saveSecret(userData.email, encodedSecret);

    const qrCode = await qrcode.toDataURL(otpauthUrl);

    return reply.send({
      success: true,
      data: {
        qrCode,
        secret
      },
      message: 'QR code generated successfully'
    });

  } catch (err: any) {
    // If JWT verification fails, return 401
    if (err.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER' ||
        err.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID' ||
        err.message?.includes('jwt') ||
        err.message?.includes('token')) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    console.error('Error generating 2FA QR code:', err);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}

// Enable 2FA for user
export async function enable2FA(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Verify JWT token
    await request.jwtVerify();

    // Get user from token payload
    const user = request.user as any;
    if (!user || !user.id) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const userId = user.id;
    const body = request.body as any;
    const { code } = body;

    if (!code || code.length !== 6) {
      return reply.status(400).send({ error: 'Valid 6-digit code required' });
    }

    // Get user data
    const userData = await repository.getUserById(userId);
    if (!userData) {
      return reply.status(404).send({ error: 'User not found' });
    }

    // Get the secret for verification
    const secret = await getSecret(userData.email);
    if (!secret) {
      return reply.status(400).send({ error: 'No 2FA secret found. Please generate QR code first.' });
    }

    // Verify the code
    const isCodeValid = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow 2 time windows for timing issues
    });

    if (!isCodeValid) {
      return reply.status(400).send({ error: 'Invalid 2FA code' });
    }

    // Enable 2FA for the user
    await repository.updateUser(userId, { two_factor_enabled: 1 });

    return reply.send({
      success: true,
      message: 'Two-factor authentication enabled successfully'
    });

  } catch (err: any) {
    // If JWT verification fails, return 401
    if (err.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER' ||
        err.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID' ||
        err.message?.includes('jwt') ||
        err.message?.includes('token')) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    console.error('Error enabling 2FA:', err);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}

// Disable 2FA for user
export async function disable2FA(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Verify JWT token
    await request.jwtVerify();

    // Get user from token payload
    const user = request.user as any;
    if (!user || !user.id) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const userId = user.id;

    // Get user data to check if they have a secret
    const userData = await repository.getUserById(userId);
    if (!userData) {
      return reply.status(404).send({ error: 'User not found' });
    }

    // Disable 2FA for the user and clear the secret
    await repository.updateUser(userId, {
      two_factor_enabled: 0,
      two_factor_secret: null
    });

    return reply.send({
      success: true,
      message: 'Two-factor authentication disabled successfully'
    });

  } catch (err: any) {
    // If JWT verification fails, return 401
    if (err.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER' ||
        err.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID' ||
        err.message?.includes('jwt') ||
        err.message?.includes('token')) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    console.error('Error disabling 2FA:', err);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}

// Verify 2FA code placeholder
export async function verify2FACode(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Verify JWT token
    await request.jwtVerify();

    // Get user from token payload
    const user = request.user as any;
    if (!user || !user.id) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const body = request.body as any;
    const { code } = body;

    if (!code || code.length !== 6) {
      return reply.status(400).send({ error: 'Valid 6-digit code required' });
    }

    // For now, accept any 6-digit code for demonstration
    const verified = code === '123456'; // Placeholder verification

    return reply.send({
      success: true,
      valid: verified,
      message: verified ? 'Code is valid' : 'Code is invalid'
    });

  } catch (err: any) {
    // If JWT verification fails, return 401
    if (err.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER' ||
        err.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID' ||
        err.message?.includes('jwt') ||
        err.message?.includes('token')) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    console.error('Error verifying 2FA code:', err);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}
