type User = {
  id: number;
  email: string;
  name?: string;
  twoFactorEnabled: boolean;
};

// user-store.ts
const userSecrets = new Map<string, string>();
const users = new Map<string, User>();
let userIdCounter = 1;

export function saveSecret(email: string, secret: string) {
  userSecrets.set(email, secret);
}

export function getSecret(email: string): string | undefined {
  return userSecrets.get(email);
}

// export function findOrCreateUser(email: string, name?: string): User {
//   if (!users.has(email)) {
//     users.set(email, {
//       id: userIdCounter++,
//       email,
//       name,
//       twoFactorEnabled: false,
//     });
//   }
//   return users.get(email)!;
// }

async function findOrCreateUserDb(email: string, name?: string) {
  const db = await openDb();
  let user = await db.get('SELECT * FROM users WHERE email = ?', email);
  if (!user) {
    const result = await db.run(
      `INSERT INTO users (email, name) VALUES (?, ?)`,
      email,
      name ?? ''
    );
    user = await db.get('SELECT * FROM users WHERE id = ?', result.lastID);
  }
  return user;
}


export function enableTwoFactor(email: string) {
  const user = users.get(email);
  if (user) {
    user.twoFactorEnabled = true;
  }
}
