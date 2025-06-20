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
// //   };
// // }

export async function verifyGoogleToken(idToken: string) {
    if (idToken === 'mock-valid-token') {
      return {
        email: 'mockuser@example.com',
        name: 'Mock User',
        picture: 'https://example.com/mockuser.jpg',
      };
    }
    throw new Error('Invalid Google token');
  }
