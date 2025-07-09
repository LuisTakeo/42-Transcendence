// src/utils/security.ts
import validator from 'validator';

// Import xss with require since types are not available
const xss = require('xss');

/**
 * SQL Injection Protection Utilities
 */

export class SQLSanitizer {
  // Whitelist for allowed table names (add your table names here)
  private static readonly ALLOWED_TABLES = [
    'users', 'conversations', 'messages', 'friends', 'matches',
    'tournaments', 'tournament_players', 'tournament_rounds'
  ];

  // Whitelist for allowed column names (add your column names here)
  private static readonly ALLOWED_COLUMNS = [
    'id', 'name', 'username', 'email', 'avatar_url', 'is_online', 'last_seen_at',
    'created_at', 'user1_id', 'user2_id', 'sender_id', 'content', 'sent_at',
    'player1_id', 'player2_id', 'winner_id', 'player1_score', 'player2_score',
    'played_at', 'status', 'owner_id', 'tournament_id', 'round_number',
    'match_position', 'player1_alias', 'player2_alias', 'conversation_id',
    'eliminated_in_round', 'two_factor_enabled', 'two_factor_secret', 'google_id'
  ];

  /**
   * Validate and sanitize table names to prevent SQL injection
   */
  static validateTableName(tableName: string): boolean {
    if (!tableName || typeof tableName !== 'string') {
      return false;
    }

    // Only allow alphanumeric characters and underscores
    const sanitized = tableName.replace(/[^a-zA-Z0-9_]/g, '');

    return this.ALLOWED_TABLES.includes(sanitized);
  }

  /**
   * Validate and sanitize column names to prevent SQL injection
   */
  static validateColumnName(columnName: string): boolean {
    if (!columnName || typeof columnName !== 'string') {
      return false;
    }

    // Only allow alphanumeric characters and underscores
    const sanitized = columnName.replace(/[^a-zA-Z0-9_]/g, '');

    return this.ALLOWED_COLUMNS.includes(sanitized);
  }

  /**
   * Validate ORDER BY clauses to prevent SQL injection
   */
  static validateOrderBy(orderBy: string): boolean {
    if (!orderBy || typeof orderBy !== 'string') {
      return false;
    }

    // Split by comma and validate each part
    const parts = orderBy.split(',').map(part => part.trim());

    return parts.every(part => {
      // Parse "column ASC/DESC" format
      const tokens = part.split(/\s+/);
      if (tokens.length > 2) return false;

      const [column, direction] = tokens;

      // Validate column name
      if (!this.validateColumnName(column)) return false;

      // Validate direction (optional)
      if (direction && !['ASC', 'DESC'].includes(direction.toUpperCase())) {
        return false;
      }

      return true;
    });
  }

  /**
   * Validate LIMIT values to prevent SQL injection
   */
  static validateLimit(limit: any): boolean {
    const num = parseInt(limit, 10);
    return Number.isInteger(num) && num > 0 && num <= 1000;
  }

  /**
   * Validate OFFSET values to prevent SQL injection
   */
  static validateOffset(offset: any): boolean {
    const num = parseInt(offset, 10);
    return Number.isInteger(num) && num >= 0;
  }
}

/**
 * XSS Protection Utilities
 */

export class XSSSanitizer {
  // XSS filter options
  private static readonly XSS_OPTIONS = {
    whiteList: {
      // Only allow very basic formatting - customize as needed
      b: [],
      i: [],
      em: [],
      strong: [],
      br: [],
      p: [],
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  };

  /**
   * Sanitize user input to prevent XSS attacks
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // First, use the xss library to remove dangerous tags
    let sanitized = xss(input, this.XSS_OPTIONS);

    // Additional sanitization: remove any remaining HTML entities that could be dangerous
    sanitized = sanitized
      .replace(/&lt;script/gi, '')
      .replace(/&lt;\/script/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/onload=/gi, '')
      .replace(/onerror=/gi, '')
      .replace(/onclick=/gi, '')
      .replace(/onmouseover=/gi, '');

    return sanitized.trim();
  }

  /**
   * Sanitize HTML content more strictly
   */
  static sanitizeHTML(html: string): string {
    if (!html || typeof html !== 'string') {
      return '';
    }

    // Strip all HTML tags except whitelisted ones
    return xss(html, this.XSS_OPTIONS);
  }

  /**
   * Escape HTML entities
   */
  static escapeHTML(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}

/**
 * Input Validation Utilities
 */

export class InputValidator {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }
    return validator.isEmail(email) && email.length <= 255;
  }

  /**
   * Validate username format
   */
  static isValidUsername(username: string): boolean {
    if (!username || typeof username !== 'string') {
      return false;
    }

    // Username: 3-20 characters, alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }

  /**
   * Validate name format
   */
  static isValidName(name: string): boolean {
    if (!name || typeof name !== 'string') {
      return false;
    }

    const sanitizedName = name.trim();
    // Name: 2-50 characters, letters, spaces, hyphens, and apostrophes only
    const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
    return nameRegex.test(sanitizedName);
  }

  /**
   * Validate message content
   */
  static isValidMessageContent(content: string): boolean {
    if (!content || typeof content !== 'string') {
      return false;
    }

    const trimmedContent = content.trim();
    return trimmedContent.length > 0 && trimmedContent.length <= 1000;
  }

  /**
   * Validate ID format
   */
  static isValidId(id: any): boolean {
    const num = parseInt(id, 10);
    return Number.isInteger(num) && num > 0;
  }

  /**
   * Validate URL format
   */
  static isValidURL(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }

    try {
      new URL(url);
      return validator.isURL(url, {
        protocols: ['http', 'https'],
        require_protocol: true,
        validate_length: true
      });
    } catch {
      return false;
    }
  }

  /**
   * Validate search query
   */
  static isValidSearchQuery(query: string): boolean {
    if (!query || typeof query !== 'string') {
      return false;
    }

    const trimmedQuery = query.trim();
    // Search query: 1-100 characters, no special SQL characters
    return trimmedQuery.length >= 1 &&
           trimmedQuery.length <= 100 &&
           !/[;'"\\]/.test(trimmedQuery);
  }

  /**
   * Validate avatar filename
   */
  static isValidAvatarFilename(filename: string): boolean {
    if (!filename || typeof filename !== 'string') {
      return false;
    }

    // Only allow specific image file extensions
    const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
    const filenameRegex = /^[a-zA-Z0-9_\-\.]+$/;

    return allowedExtensions.test(filename) &&
           filenameRegex.test(filename) &&
           filename.length <= 255;
  }
}

/**
 * Content Security Policy (CSP) Headers
 */
export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"], // Note: 'unsafe-inline' should be avoided in production
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  fontSrc: ["'self'", "https://fonts.gstatic.com"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'"],
  mediaSrc: ["'self'"],
  objectSrc: ["'none'"],
  frameSrc: ["'none'"],
  upgradeInsecureRequests: []
};
