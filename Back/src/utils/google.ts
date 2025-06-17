import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client("37535858373-lu8vc124lg3mfcs0j2e36ubg7l4as8ff.apps.googleusercontent.com"); // coloque no .env

// export async function verifyGoogleToken(idToken: string) {
//   const ticket = await client.verifyIdToken({
//     idToken,
//     audience: "37535858373-lu8vc124lg3mfcs0j2e36ubg7l4as8ff.apps.googleusercontent.com",
//   });

//   const payload = ticket.getPayload();
//   if (!payload || !payload.email) {
//     throw new Error('Invalid Google token');
//   }

//   return {
//     email: payload.email,
//     name: payload.name,
//     picture: payload.picture,
//   };
// }

export async function verifyGoogleToken(idToken: string) {
  // Simulando um token válido (mock)
  if (idToken === 'mock-valid-token') {
    return {
      email: 'mockuser@example.com',
      name: 'Mock User',
      picture: 'https://example.com/mockuser.jpg',
    };
  }

  // Se não for o token mock, lança erro
  throw new Error('Invalid Google token');
}

