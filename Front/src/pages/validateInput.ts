// Simple input validation utility for vanilla JS/TS forms

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function isEmail(value: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());
}

export function minLength(value: string, min: number): boolean {
  return value.length >= min;
}

export function maxLength(value: string, max: number): boolean {
  return value.length <= max;
}

// Allow only letters, spaces, accents for name (no < > " ' / \)
export function isSafeName(value: string): boolean {
  return /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]{2,32}$/.test(value.trim());
}

// Allow only letters, numbers, dots, underscores, 3-16 chars for username
export function isSafeUsername(value: string): boolean {
  return /^[A-Za-z0-9_.]{3,16}$/.test(value.trim());
}

// Optionally, a generic sanitizer (removes dangerous chars)
export function sanitizeInput(value: string): string {
  return value.replace(/[<>"'\/\\]/g, "");
}
