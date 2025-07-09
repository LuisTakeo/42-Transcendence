// twofa.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import * as repository from './user.repository';

// Enable 2FA for user (simplified version for now)
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

    // For now, accept any 6-digit code for demonstration
    // In production, this would verify against the actual 2FA secret

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

    // Disable 2FA for the user
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

// Generate QR code placeholder (simplified)
export async function generate2FAQRCode(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Verify JWT token
    await request.jwtVerify();

    // Get user from token payload
    const user = request.user as any;
    if (!user || !user.id) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    // For now, return a placeholder response
    // In production, this would generate a real QR code
    return reply.send({
      success: true,
      data: {
        qrCode: 'data:image/png;base64,placeholder',
        message: 'QR code generation not fully implemented yet'
      }
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
