# Two-Factor Authentication (2FA) API Documentation

This document describes the Two-Factor Authentication endpoints for managing TOTP (Time-based One-Time Password) security.

## Base URL
```
http://localhost:3142/users
```

## Overview

The 2FA system uses TOTP (Time-based One-Time Password) with Google Authenticator or similar apps. Users can enable, disable, and manage their 2FA settings through these endpoints.

## Authentication

All 2FA endpoints require a valid JWT token in the Authorization header:

```javascript
const headers = {
  'Authorization': `Bearer ${jwtToken}`,
  'Content-Type': 'application/json'
};
```

---

## Endpoints

### 1. Generate 2FA QR Code
**GET** `/users/2fa/generate-qr`

Generates a new QR code for setting up 2FA. This endpoint creates a new secret and returns a QR code that can be scanned with an authenticator app.

**Headers:**
- `Authorization: Bearer <jwt_token>` (Required)

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "secret": "JBSWY3DPEHPK3PXP"
  },
  "message": "QR code generated successfully"
}
```

**Status Codes:**
- `200`: QR code generated successfully
- `400`: 2FA already enabled
- `401`: Unauthorized (invalid or missing token)
- `404`: User not found
- `500`: Server error

**Example Usage:**
```javascript
const response = await fetch('http://localhost:3142/users/2fa/generate-qr', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
// Display the QR code image: data.data.qrCode
// Show the secret for manual entry: data.data.secret
```

### 2. Enable 2FA
**POST** `/users/2fa/enable`

Enables 2FA for the authenticated user. This endpoint verifies the 6-digit code from the authenticator app and enables 2FA if the code is valid.

**Headers:**
- `Authorization: Bearer <jwt_token>` (Required)

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Two-factor authentication enabled successfully"
}
```

**Status Codes:**
- `200`: 2FA enabled successfully
- `400`: Invalid 6-digit code or no secret found
- `401`: Unauthorized (invalid or missing token)
- `404`: User not found
- `500`: Server error

**Example Usage:**
```javascript
const response = await fetch('http://localhost:3142/users/2fa/enable', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    code: "123456"
  })
});
```

### 3. Disable 2FA
**POST** `/users/2fa/disable`

Disables 2FA for the authenticated user. This removes the 2FA requirement for future logins.

**Headers:**
- `Authorization: Bearer <jwt_token>` (Required)

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Two-factor authentication disabled successfully"
}
```

**Status Codes:**
- `200`: 2FA disabled successfully
- `401`: Unauthorized (invalid or missing token)
- `404`: User not found
- `500`: Server error

**Example Usage:**
```javascript
const response = await fetch('http://localhost:3142/users/2fa/disable', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({})
});
```

### 4. Verify 2FA Code
**POST** `/users/2fa/verify`

Verifies a 2FA code without enabling 2FA. This endpoint is useful for testing codes or verifying them in other contexts.

**Headers:**
- `Authorization: Bearer <jwt_token>` (Required)

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "message": "Code is valid"
}
```

**Status Codes:**
- `200`: Code verification completed
- `400`: Invalid 6-digit code
- `401`: Unauthorized (invalid or missing token)
- `500`: Server error

**Example Usage:**
```javascript
const response = await fetch('http://localhost:3142/users/2fa/verify', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    code: "123456"
  })
});
```

---

## Complete 2FA Setup Flow

### Step 1: Generate QR Code
```javascript
// 1. Generate QR code and secret
const qrResponse = await fetch('http://localhost:3142/users/2fa/generate-qr', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  }
});

const qrData = await qrResponse.json();
// Display qrData.data.qrCode to user
// User scans QR code with authenticator app
```

### Step 2: Enable 2FA
```javascript
// 2. User enters code from authenticator app
const enableResponse = await fetch('http://localhost:3142/users/2fa/enable', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    code: userEnteredCode
  })
});

const enableData = await enableResponse.json();
// 2FA is now enabled for the user
```

---

## Error Handling

### Common Error Responses

**2FA Already Enabled:**
```json
{
  "success": false,
  "error": "Two-factor authentication is already enabled"
}
```

**Invalid 6-Digit Code:**
```json
{
  "error": "Valid 6-digit code required"
}
```

**Invalid 2FA Code:**
```json
{
  "error": "Invalid 2FA code"
}
```

**No Secret Found:**
```json
{
  "error": "No 2FA secret found. Please generate QR code first."
}
```

**Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

---

## Security Features

### TOTP Implementation
- **Algorithm**: SHA1
- **Digits**: 6
- **Period**: 30 seconds
- **Window**: 2 time windows (allows for clock drift)

### Secret Management
- **Generation**: Uses `speakeasy.generateSecret()`
- **Storage**: Encoded secrets stored in database
- **Cleanup**: Secrets are cleared when 2FA is disabled

### QR Code Format
The QR code contains an `otpauth://` URL with:
- **Secret**: Base32 encoded secret
- **Label**: User's email address
- **Issuer**: "Transcendence"
- **Algorithm**: SHA1
- **Digits**: 6
- **Period**: 30

---

## Frontend Integration

### Setting Up 2FA
1. **Generate QR Code**: Call `/users/2fa/generate-qr`
2. **Display QR Code**: Show the base64 image to user
3. **User Scans**: User scans QR code with authenticator app
4. **Verify Code**: User enters 6-digit code from app
5. **Enable 2FA**: Call `/users/2fa/enable` with the code

### Managing 2FA
- **Disable**: Call `/users/2fa/disable` to remove 2FA
- **Verify**: Use `/users/2fa/verify` to test codes
- **Status**: Check user's `two_factor_enabled` field

### Login Flow
When 2FA is enabled, the login flow becomes:
1. **Google OAuth**: User signs in with Google
2. **2FA Check**: Backend checks if 2FA is enabled
3. **Code Required**: If enabled, frontend shows 2FA input
4. **Complete Login**: Call `/login-google/2fa` with code

---

## Testing

### Development Debug Endpoint
For testing purposes, use the debug endpoint to generate valid codes:

```bash
# Get current 2FA token for a user
curl http://localhost:3142/debug-token/user@example.com
```

### Manual Testing
1. Enable 2FA for a test user
2. Use the debug endpoint to get current valid codes
3. Test the verification endpoints with these codes
4. Verify that invalid codes are rejected

---

## Best Practices

1. **QR Code Display**: Always show the QR code in a secure context
2. **Code Validation**: Validate 6-digit format before sending to server
3. **Error Handling**: Provide clear error messages for invalid codes
4. **User Education**: Explain the 2FA setup process clearly
5. **Backup Codes**: Consider implementing backup codes for account recovery
6. **Rate Limiting**: Implement rate limiting for 2FA verification attempts
