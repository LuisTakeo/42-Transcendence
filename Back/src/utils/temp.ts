/*Arquivo temporário para mockar dados antes de integrar com banco*/

// user-store.ts
const userSecrets = new Map<string, string>();

export function saveSecret(email: string, secret: string) {
  userSecrets.set(email, secret);
}

export function getSecret(email: string): string | undefined {
  return userSecrets.get(email);
}
