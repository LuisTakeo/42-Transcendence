// src/repositories/secure-user.repository.ts
import { openDb } from '../database/database';
import { SQLSanitizer, XSSSanitizer, InputValidator } from '../utils/security';

// Enhanced interfaces with validation
export interface User {
	id?: number;
	name: string;
	username: string;
	email: string;
	avatar_url?: string;
	is_online?: number;
	last_seen_at?: string;
	created_at?: string;
}

export interface CreateUserData {
	name: string;
	username: string;
	email: string;
	avatar_url?: string;
}

export interface UpdateUserData {
	name?: string;
	username?: string;
	email?: string;
	avatar_url?: string;
	is_online?: number;
	last_seen_at?: string;
}

/**
 * Secure database operations with SQL injection prevention
 */

export class SecureUserRepository {

  /**
   * Get users with pagination and search - SQL injection safe
   */
  static async getUsersFromDb(limit?: number, offset?: number, search?: string): Promise<User[]> {
    const db = await openDb();

    // Validate parameters to prevent SQL injection
    if (limit !== undefined && !SQLSanitizer.validateLimit(limit)) {
      throw new Error('Invalid limit parameter');
    }

    if (offset !== undefined && !SQLSanitizer.validateOffset(offset)) {
      throw new Error('Invalid offset parameter');
    }

    // Sanitize search input
    let sanitizedSearch = '';
    if (search) {
      if (!InputValidator.isValidSearchQuery(search)) {
        throw new Error('Invalid search query');
      }
      sanitizedSearch = XSSSanitizer.sanitizeInput(search);
    }

    // Build query with parameterized statements only
    let query = 'SELECT id, name, username, email, avatar_url, is_online, last_seen_at, created_at FROM users';
    const params: any[] = [];

    // Add search condition with proper parameterization
    if (sanitizedSearch) {
      query += ' WHERE (name LIKE ? OR username LIKE ? OR email LIKE ?)';
      const searchTerm = `%${sanitizedSearch}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Always use fixed ORDER BY to prevent injection
    query += ' ORDER BY created_at DESC';

    // Add pagination with validated parameters
    if (limit !== undefined) {
      query += ' LIMIT ?';
      params.push(limit);

      if (offset !== undefined) {
        query += ' OFFSET ?';
        params.push(offset);
      }
    }

    const users = await db.all(query, params);
    return users.map(user => this.processUserData(user)).filter((user): user is User => user !== null);
  }

  /**
   * Get user by ID - SQL injection safe
   * @param id User ID
   */
  static async getUserById(id: number): Promise<User | null> {
    if (!InputValidator.isValidId(id)) {
      throw new Error('Invalid user ID');
    }

    const db = await openDb();
    const user = await db.get(
      'SELECT id, name, username, email, avatar_url, is_online, last_seen_at, created_at FROM users WHERE id = ?',
      [id]
    );

    return user ? this.processUserData(user) : null;
  }

  /**
   * Get user by email - SQL injection safe
   * @param email User email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    if (!InputValidator.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    const sanitizedEmail = XSSSanitizer.sanitizeInput(email.toLowerCase());
    const db = await openDb();

    const user = await db.get(
      'SELECT id, name, username, email, avatar_url, is_online, last_seen_at, created_at FROM users WHERE LOWER(email) = LOWER(?)',
      [sanitizedEmail]
    );

    return user ? this.processUserData(user) : null;
  }

  /**
   * Get user by username - SQL injection safe
   * @param username Username
   */
  static async getUserByUsername(username: string): Promise<User | null> {
    if (!InputValidator.isValidUsername(username)) {
      throw new Error('Invalid username format');
    }

    const sanitizedUsername = XSSSanitizer.sanitizeInput(username);
    const db = await openDb();

    const user = await db.get(
      'SELECT id, name, username, email, avatar_url, is_online, last_seen_at, created_at FROM users WHERE LOWER(username) = LOWER(?)',
      [sanitizedUsername]
    );

    return user ? this.processUserData(user) : null;
  }

  /**
   * Create user - with input validation and sanitization
   */
  static async createUser(userData: CreateUserData): Promise<User> {
    // Validate all input data
    if (!InputValidator.isValidName(userData.name)) {
      throw new Error('Invalid name format');
    }

    if (!InputValidator.isValidUsername(userData.username)) {
      throw new Error('Invalid username format');
    }

    if (!InputValidator.isValidEmail(userData.email)) {
      throw new Error('Invalid email format');
    }

    if (userData.avatar_url && !InputValidator.isValidAvatarFilename(userData.avatar_url)) {
      throw new Error('Invalid avatar URL format');
    }

    // Sanitize input data
    const sanitizedData = {
      name: XSSSanitizer.sanitizeInput(userData.name.trim()),
      username: XSSSanitizer.sanitizeInput(userData.username.trim()),
      email: XSSSanitizer.sanitizeInput(userData.email.trim().toLowerCase()),
      avatar_url: userData.avatar_url ? XSSSanitizer.sanitizeInput(userData.avatar_url) : null
    };

    // Check for existing users
    const existingByUsername = await this.getUserByUsername(sanitizedData.username);
    if (existingByUsername) {
      throw new Error('Username already exists');
    }

    const existingByEmail = await this.getUserByEmail(sanitizedData.email);
    if (existingByEmail) {
      throw new Error('Email already exists');
    }

    const db = await openDb();
    const result = await db.run(
      `INSERT INTO users (name, username, email, avatar_url, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [
        sanitizedData.name,
        sanitizedData.username,
        sanitizedData.email,
        sanitizedData.avatar_url
      ]
    );

    if (!result.lastID) {
      throw new Error('Failed to create user');
    }

    const newUser = await this.getUserById(result.lastID);
    if (!newUser) {
      throw new Error('Failed to retrieve created user');
    }

    return newUser;
  }

  /**
   * Update user - with input validation and sanitization
   */
  static async updateUser(id: number, updateData: UpdateUserData): Promise<User | null> {
    if (!InputValidator.isValidId(id)) {
      throw new Error('Invalid user ID');
    }

    // Validate optional fields
    if (updateData.name && !InputValidator.isValidName(updateData.name)) {
      throw new Error('Invalid name format');
    }

    if (updateData.username && !InputValidator.isValidUsername(updateData.username)) {
      throw new Error('Invalid username format');
    }

    if (updateData.email && !InputValidator.isValidEmail(updateData.email)) {
      throw new Error('Invalid email format');
    }

    if (updateData.avatar_url && !InputValidator.isValidAvatarFilename(updateData.avatar_url)) {
      throw new Error('Invalid avatar URL format');
    }

    // Build dynamic update query safely
    const updates: string[] = [];
    const params: any[] = [];

    if (updateData.name) {
      updates.push('name = ?');
      params.push(XSSSanitizer.sanitizeInput(updateData.name.trim()));
    }

    if (updateData.username) {
      updates.push('username = ?');
      params.push(XSSSanitizer.sanitizeInput(updateData.username.trim()));
    }

    if (updateData.email) {
      updates.push('email = ?');
      params.push(XSSSanitizer.sanitizeInput(updateData.email.trim().toLowerCase()));
    }

    if (updateData.avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      params.push(updateData.avatar_url ? XSSSanitizer.sanitizeInput(updateData.avatar_url) : null);
    }

    if (updateData.is_online !== undefined) {
      updates.push('is_online = ?');
      params.push(updateData.is_online);
    }

    if (updateData.last_seen_at !== undefined) {
      updates.push('last_seen_at = ?');
      params.push(updateData.last_seen_at);
    }

    if (updates.length === 0) {
      return this.getUserById(id); // No updates, return current user
    }

    // Add WHERE clause parameter
    params.push(id);

    const db = await openDb();
    await db.run(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return this.getUserById(id);
  }

  /**
   * Delete user - SQL injection safe
   */
  static async deleteUser(id: number): Promise<boolean> {
    if (!InputValidator.isValidId(id)) {
      throw new Error('Invalid user ID');
    }

    const db = await openDb();
    const result = await db.run('DELETE FROM users WHERE id = ?', [id]);

    return (result.changes || 0) > 0;
  }

  /**
   * Check if username exists - SQL injection safe
   */
  static async checkUsernameExists(username: string, excludeUserId?: number): Promise<boolean> {
    if (!InputValidator.isValidUsername(username)) {
      return false; // Invalid username format
    }

    const sanitizedUsername = XSSSanitizer.sanitizeInput(username);
    const db = await openDb();

    let query = 'SELECT id FROM users WHERE LOWER(username) = LOWER(?)';
    const params: any[] = [sanitizedUsername];

    if (excludeUserId !== undefined) {
      if (!InputValidator.isValidId(excludeUserId)) {
        throw new Error('Invalid exclude user ID');
      }
      query += ' AND id != ?';
      params.push(excludeUserId);
    }

    const user = await db.get(query, params);
    return !!user;
  }

  /**
   * Check if email exists - SQL injection safe
   */
  static async checkEmailExists(email: string, excludeUserId?: number): Promise<boolean> {
    if (!InputValidator.isValidEmail(email)) {
      return false; // Invalid email format
    }

    const sanitizedEmail = XSSSanitizer.sanitizeInput(email.toLowerCase());
    const db = await openDb();

    let query = 'SELECT id FROM users WHERE LOWER(email) = LOWER(?)';
    const params: any[] = [sanitizedEmail];

    if (excludeUserId !== undefined) {
      if (!InputValidator.isValidId(excludeUserId)) {
        throw new Error('Invalid exclude user ID');
      }
      query += ' AND id != ?';
      params.push(excludeUserId);
    }

    const user = await db.get(query, params);
    return !!user;
  }

  /**
   * Get users count for pagination - SQL injection safe
   */
  static async getUsersCount(search?: string): Promise<number> {
    let sanitizedSearch = '';
    if (search) {
      if (!InputValidator.isValidSearchQuery(search)) {
        throw new Error('Invalid search query');
      }
      sanitizedSearch = XSSSanitizer.sanitizeInput(search);
    }

    const db = await openDb();
    let query = 'SELECT COUNT(*) as count FROM users';
    const params: any[] = [];

    if (sanitizedSearch) {
      query += ' WHERE (name LIKE ? OR username LIKE ? OR email LIKE ?)';
      const searchTerm = `%${sanitizedSearch}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const result = await db.get(query, params);
    return result?.count || 0;
  }

  /**
   * Process user data and construct avatar URL
   */
  private static processUserData(user: any): User | null {
    if (!user) return null;

    // Construct avatar URL if it's just a filename
    let avatarUrl = user.avatar_url;
    if (avatarUrl && !avatarUrl.startsWith('http')) {
      const backendPort = process.env.BACK_PORT || '3142';
      const baseUrl = `http://localhost:${backendPort}`;
      avatarUrl = `${baseUrl}/public/avatars/${avatarUrl}`;
    }

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar_url: avatarUrl,
      is_online: user.is_online,
      last_seen_at: user.last_seen_at,
      created_at: user.created_at
    };
  }
}
