# Authentication API Documentation

This document describes the complete authentication system including Google OAuth login and Two-Factor Authentication (2FA).

## Base URL
```
http://localhost:3142
```

## Overview

The authentication system uses Google OAuth for initial login and supports Two-Factor Authentication (TOTP) for enhanced security. The system generates JWT tokens for session management.

## Authentication Flow

1. **Google OAuth Login**: User signs in with Google
2. **2FA Check**: If enabled, user must provide 6-digit TOTP code
3. **JWT Token**: Upon successful authentication, a JWT token is issued
4. **Session Management**: Token is used for subsequent API calls

---

## Endpoints

### 1. Google OAuth Login
**POST** `/login-google`

Authenticates a user using Google OAuth. If the user has 2FA enabled, this endpoint will return a response indicating that a 2FA code is required.

**Request Body:**
```json
{
  "idToken": "google_id_token_here"
}
```

**Response (No 2FA - Direct Login):**
```json
{
  "message": "Login with Google successful",
  "token": "jwt_token_here",
  "success": true
}
```

**Response (2FA Required):**
```json
{
  "message": "Two-factor authentication code required",
  "needTwoFactorCode": true
}
```

**Status Codes:**
- `200`: Login successful (no 2FA)
- `401`: 2FA required or authentication failed
- `500`: Server error

**Example Usage:**
```javascript
const response = await fetch('http://localhost:3142/login-google', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    idToken: googleIdToken
  })
});
```

### 2. Google OAuth Login with 2FA
**POST** `/login-google/2fa`

Completes the authentication process when 2FA is enabled. This endpoint should be called after receiving a `needTwoFactorCode: true` response from the initial login endpoint.

**Request Body:**
```json
{
  "idToken": "google_id_token_here",
  "twoFactorCode": "123456"
}
```

**Response:**
```json
{
  "message": "Login with Google successful",
  "token": "jwt_token_here"
}
```

**Status Codes:**
- `200`: Login successful
- `400`: Invalid 2FA code or missing secret
- `401`: Invalid Google token
- `404`: User not found
- `500`: Server error

**Example Usage:**
```javascript
const response = await fetch('http://localhost:3142/login-google/2fa', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    idToken: googleIdToken,
    twoFactorCode: "123456"
  })
});
```

### 3. Debug 2FA Token (Development Only)
**GET** `/debug-token/:email`

Generates a current 2FA token for debugging purposes. This endpoint should only be used in development environments.

**Path Parameters:**
- `email`: User's email address

**Response:**
```json
{
  "token": "123456"
}
```

**Status Codes:**
- `200`: Token generated successfully
- `404`: Secret not found for user
- `500`: Server error

**Example Usage:**
```javascript
const response = await fetch('http://localhost:3142/debug-token/user@example.com');
const data = await response.json();
console.log('Current 2FA token:', data.token);
```

---

## JWT Token Usage

After successful authentication, include the JWT token in the Authorization header for protected endpoints:

```javascript
const headers = {
  'Authorization': `Bearer ${jwtToken}`,
  'Content-Type': 'application/json'
};
```

## Error Handling

### Common Error Responses

**Invalid Google Token:**
```json
{
  "error": "Invalid Google token"
}
```

**2FA Code Required:**
```json
{
  "message": "Two-factor authentication code required",
  "needTwoFactorCode": true
}
```

**Invalid 2FA Code:**
```json
{
  "error": "Invalid 2FA code"
}
```

**User Not Found:**
```json
{
  "error": "User not found."
}
```

## Security Considerations

1. **JWT Token Expiration**: Tokens expire after 1 hour
2. **2FA Secret Storage**: Secrets are stored securely in the database
3. **Google Token Verification**: All Google tokens are verified with Google's servers
4. **TOTP Algorithm**: Uses industry-standard TOTP (Time-based One-Time Password)
5. **Token Window**: Allows for 30-second timing windows to account for clock drift

## Integration with Frontend

The frontend should handle the authentication flow as follows:

1. **Initial Login**: Call `/login-google` with Google ID token
2. **Check Response**: If `needTwoFactorCode` is true, show 2FA input
3. **2FA Verification**: Call `/login-google/2fa` with the 6-digit code
4. **Store Token**: Save the JWT token for subsequent API calls
5. **Token Usage**: Include token in Authorization header for protected endpoints

## Testing

For testing purposes, you can use the debug endpoint to generate valid 2FA codes:

```bash
# Get current 2FA token for a user
curl http://localhost:3142/debug-token/user@example.com
```

This will return the current valid 2FA code for the specified user.
