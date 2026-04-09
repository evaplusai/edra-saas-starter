import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../server/lib/password';

describe('hashPassword', () => {
  it('returns a bcrypt hash (starts with $2)', async () => {
    const hash = await hashPassword('mysecretpass');
    expect(hash).toMatch(/^\$2[aby]?\$/);
  });

  it('produces different hashes for the same input (salt)', async () => {
    const hash1 = await hashPassword('samepassword');
    const hash2 = await hashPassword('samepassword');
    expect(hash1).not.toBe(hash2);
  });
});

describe('verifyPassword', () => {
  it('returns true for a correct password', async () => {
    const hash = await hashPassword('correctpassword');
    const result = await verifyPassword('correctpassword', hash);
    expect(result).toBe(true);
  });

  it('returns false for a wrong password', async () => {
    const hash = await hashPassword('correctpassword');
    const result = await verifyPassword('wrongpassword', hash);
    expect(result).toBe(false);
  });
});
