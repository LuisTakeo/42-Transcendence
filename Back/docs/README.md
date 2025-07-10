# Backend API Documentation

Welcome to the Transcendence Backend API documentation. This directory contains comprehensive documentation for all API endpoints.

## 📚 Documentation Index

### Core APIs

- **[Authentication API](./AUTHENTICATION_API.md)** - Google OAuth login and JWT token management
- **[Users API](./USERS_API.md)** - User management, profiles, and 2FA endpoints
- **[2FA API](./2FA_API.md)** - Two-Factor Authentication (TOTP) management
- **[Friends API](./FRIENDS_API.md)** - Friend requests and relationships
- **[Matches API](./MATCHES_API.md)** - Pong game matches and statistics
- **[Messages API](./MESSAGES_API.md)** - Chat messages and conversations
- **[Conversations API](./CONVERSATIONS_API.md)** - Chat conversations and threads
- **[Tournaments API](./TOURNAMENTS_API.md)** - Tournament management and brackets

## 🚀 Quick Start

### Base URL
```
http://localhost:3142
```

### Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```javascript
const headers = {
  'Authorization': `Bearer ${jwtToken}`,
  'Content-Type': 'application/json'
};
```

### Getting Started
1. **Authentication**: Start with [Authentication API](./AUTHENTICATION_API.md) for login
2. **User Management**: Use [Users API](./USERS_API.md) for profile management
3. **2FA Setup**: Follow [2FA API](./2FA_API.md) for enhanced security
4. **Game Features**: Explore [Matches API](./MATCHES_API.md) and [Tournaments API](./TOURNAMENTS_API.md)
5. **Social Features**: Use [Friends API](./FRIENDS_API.md) and [Messages API](./MESSAGES_API.md)

## 🔐 Authentication Flow

### 1. Google OAuth Login
```javascript
// Step 1: Authenticate with Google
const loginResponse = await fetch('http://localhost:3142/login-google', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idToken: googleIdToken })
});

const loginData = await loginResponse.json();

if (loginData.needTwoFactorCode) {
  // Step 2: Handle 2FA if enabled
  const twoFAResponse = await fetch('http://localhost:3142/login-google/2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idToken: googleIdToken,
      twoFactorCode: "123456"
    })
  });

  const twoFAData = await twoFAResponse.json();
  const jwtToken = twoFAData.token;
} else {
  // Direct login successful
  const jwtToken = loginData.token;
}
```

### 2. Using JWT Token
```javascript
// Include token in all subsequent requests
const response = await fetch('http://localhost:3142/users/me', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  }
});
```

## 📋 API Endpoints Overview

### Authentication Endpoints
- `POST /login-google` - Google OAuth login
- `POST /login-google/2fa` - Complete login with 2FA
- `GET /debug-token/:email` - Debug 2FA tokens (development)

### User Management Endpoints
- `GET /users` - Get all users (paginated)
- `GET /users/all` - Get all users (no pagination)
- `GET /users/me` - Get current user
- `PUT /users/me` - Update current user
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `PATCH /users/:id/online-status` - Update online status
- `GET /users/avatars/list` - Get available avatars
- `GET /users/:id/stats` - Get user statistics

### 2FA Endpoints
- `GET /users/2fa/generate-qr` - Generate 2FA QR code
- `POST /users/2fa/enable` - Enable 2FA
- `POST /users/2fa/disable` - Disable 2FA
- `POST /users/2fa/verify` - Verify 2FA code

### Game Endpoints
- `GET /matches` - Get all matches
- `POST /matches` - Create new match
- `GET /matches/:id` - Get match by ID
- `PUT /matches/:id` - Update match
- `DELETE /matches/:id` - Delete match

### Social Endpoints
- `GET /friends` - Get friends list
- `POST /friends` - Send friend request
- `PUT /friends/:id` - Accept/reject friend request
- `DELETE /friends/:id` - Remove friend

### Communication Endpoints
- `GET /conversations` - Get conversations
- `POST /conversations` - Create conversation
- `GET /conversations/:id` - Get conversation
- `GET /conversations/:id/messages` - Get messages
- `POST /conversations/:id/messages` - Send message

### Tournament Endpoints
- `GET /tournaments` - Get all tournaments
- `POST /tournaments` - Create tournament
- `GET /tournaments/:id` - Get tournament
- `PUT /tournaments/:id` - Update tournament
- `DELETE /tournaments/:id` - Delete tournament

## 🛠️ Development

### Environment Variables
```bash
BACK_PORT=3142
FASTIFY_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
```

### Database
The application uses SQLite with the following main tables:
- `users` - User accounts and profiles
- `matches` - Game matches and results
- `friends` - Friend relationships
- `conversations` - Chat conversations
- `messages` - Chat messages
- `tournaments` - Tournament data

### Testing
Use the provided HTTP test files in the `tests/` directory:
- `test-users.http` - User management tests
- `test-matches.http` - Match management tests
- `test-friends.http` - Friend management tests
- `test-messages.http` - Message tests
- `test-conversations.http` - Conversation tests
- `test-tournaments.http` - Tournament tests

## 🔒 Security Features

1. **JWT Authentication** - Secure token-based authentication
2. **Google OAuth** - Trusted third-party authentication
3. **Two-Factor Authentication** - TOTP-based 2FA support
4. **Input Validation** - Comprehensive request validation
5. **SQL Injection Protection** - Parameterized queries
6. **CORS Configuration** - Cross-origin request handling

## 📊 Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 42,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

## 🚨 Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## 📞 Support

For questions or issues:
1. Check the specific API documentation
2. Review the test files for usage examples
3. Check the server logs for detailed error information
4. Verify your JWT token is valid and not expired

## 🔄 API Versioning

This is version 1.0 of the API. All endpoints are stable and backward compatible within this version.
