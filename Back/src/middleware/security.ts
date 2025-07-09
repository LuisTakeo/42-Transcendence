// src/middleware/security.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { XSSSanitizer, InputValidator } from '../utils/security';

/**
 * Rate limiting middleware
 */
export const rateLimitConfig = {
  max: 100, // 100 requests per window
  timeWindow: '1 minute',
  errorResponseBuilder: function (request: FastifyRequest, context: any) {
    return {
      code: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded, retry in ${context.after}`
    };
  }
};

/**
 * Helmet security configuration
 */
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Needed for some frontend frameworks
};

/**
 * Input sanitization middleware
 */
export async function sanitizeInputMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Sanitize query parameters
    if (request.query && typeof request.query === 'object') {
      const sanitizedQuery: any = {};
      for (const [key, value] of Object.entries(request.query)) {
        if (typeof value === 'string') {
          sanitizedQuery[key] = XSSSanitizer.sanitizeInput(value);
        } else {
          sanitizedQuery[key] = value;
        }
      }
      request.query = sanitizedQuery;
    }

    // Sanitize request body
    if (request.body && typeof request.body === 'object') {
      request.body = sanitizeObject(request.body);
    }

    // Sanitize URL parameters
    if (request.params && typeof request.params === 'object') {
      const sanitizedParams: any = {};
      for (const [key, value] of Object.entries(request.params)) {
        if (typeof value === 'string') {
          sanitizedParams[key] = XSSSanitizer.sanitizeInput(value);
        } else {
          sanitizedParams[key] = value;
        }
      }
      request.params = sanitizedParams;
    }
  } catch (error) {
    request.log.error('Error in input sanitization middleware:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error during input sanitization'
    });
  }
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return XSSSanitizer.sanitizeInput(obj);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize both key and value
      const sanitizedKey = XSSSanitizer.sanitizeInput(key);
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Request validation middleware
 */
export async function validateRequestMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Validate Content-Type for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers['content-type'];
      if (contentType && !contentType.includes('application/json')) {
        return reply.status(400).send({
          success: false,
          error: 'Content-Type must be application/json'
        });
      }
    }

    // Validate Content-Length
    const contentLength = request.headers['content-length'];
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
      return reply.status(413).send({
        success: false,
        error: 'Request payload too large'
      });
    }

    // Check for common SQL injection patterns in URL
    const suspiciousPatterns = [
      /(\s|^)(select|insert|update|delete|drop|union|exec|execute)\s/i,
      /(\s|^)(or|and)\s+\d+\s*=\s*\d+/i,
      /[\s]*['"][\s]*;[\s]*--/i,
      /[\s]*['"][\s]*;[\s]*#/i,
    ];

    const fullUrl = request.url;
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(fullUrl)) {
        request.log.warn(`Suspicious SQL injection pattern detected in URL: ${fullUrl}`);
        return reply.status(400).send({
          success: false,
          error: 'Invalid request format'
        });
      }
    }

  } catch (error) {
    request.log.error('Error in request validation middleware:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error during request validation'
    });
  }
}

/**
 * Security headers middleware
 */
export async function securityHeadersMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Add custom security headers
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('X-XSS-Protection', '1; mode=block');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Remove server information
  reply.removeHeader('x-powered-by');
  reply.removeHeader('server');
}

/**
 * SQL injection detection middleware
 */
export async function sqlInjectionDetectionMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const suspiciousPatterns = [
      // SQL injection patterns
      /(\s|^)(select|insert|update|delete|drop|alter|create|exec|execute|union|declare)\s/i,
      /(\s|^)(or|and)\s+[\d'"]+(=|<|>|<=|>=)[\d'"]+/i,
      /[\s]*['"][\s]*(;|--|#|\*|\/\*)/,
      /(\s|^)(information_schema|sys\.|pg_|mysql\.)/i,
      /(\s|^)(waitfor\s+delay|benchmark\s*\()/i,
      // XSS patterns
      /<script[^>]*>.*?<\/script>/i,
      /javascript\s*:/i,
      /on\w+\s*=/i,
      /<iframe[^>]*>.*?<\/iframe>/i,
    ];

    // Check URL parameters
    const url = decodeURIComponent(request.url);
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        request.log.warn(`Malicious pattern detected in URL: ${url}`);
        return reply.status(400).send({
          success: false,
          error: 'Invalid request format'
        });
      }
    }

    // Check request body if it exists
    if (request.body) {
      const bodyString = JSON.stringify(request.body);
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(bodyString)) {
          request.log.warn(`Malicious pattern detected in request body`);
          return reply.status(400).send({
            success: false,
            error: 'Invalid request data'
          });
        }
      }
    }

  } catch (error) {
    request.log.error('Error in SQL injection detection middleware:', error);
  }
}
