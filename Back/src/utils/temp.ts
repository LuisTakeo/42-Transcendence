/*Arquivo temporário para mockar dados antes de integrar com banco*/

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

export function findOrCreateUser(email: string, name?: string): User {
  if (!users.has(email)) {
    users.set(email, {
      id: userIdCounter++,
      email,
      name,
      twoFactorEnabled: false,
    });
  }
  return users.get(email)!;
}

export function enableTwoFactor(email: string) {
  const user = users.get(email);
  if (user) {
    user.twoFactorEnabled = true;
  }
}
