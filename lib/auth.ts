import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

/**
 * Hash a plain text password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Check if the hash is a bcrypt hash (starts with $2a$, $2b$, or $2y$)
  if (hash && (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$'))) {
    return bcrypt.compare(password, hash)
  }
  // Fall back to plain text comparison for legacy passwords
  // This allows existing users to login with unhashed passwords
  return password === hash
}

/**
 * Check if a password hash is using bcrypt (vs plain text)
 */
export function isHashedPassword(hash: string): boolean {
  return Boolean(hash && (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')))
}
