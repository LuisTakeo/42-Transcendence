// // export async function verifyGoogleToken(idToken: string) {
// //   const ticket = await client.verifyIdToken({
// //     idToken,
// //     audience: process.env.GOOGLE_CLIENT_ID,
// //   });

// //   const payload = ticket.getPayload();
// //   if (!payload || !payload.email) {
// //     throw new Error('Invalid Google token');
// //   }

// //   return {
// //     email: payload.email,
// //     name: payload.name,
// //     picture: payload.picture,
// //     googleId: payload.sub,
// //   };
// // }

export async function verifyGoogleToken(idToken: string) {
    if (idToken === 'mock-valid-token') {
      return {
        email: 'mockuser1@example.com',
        username: 'MockUser',
        picture: 'https://example.com/mockuser.jpg',
      };
    }
    throw new Error('Invalid Google token');
  }
