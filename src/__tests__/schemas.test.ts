import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
} from '../types/auth';

describe('registerSchema', () => {
  it('rejects missing email', () => {
    const result = registerSchema.safeParse({
      name: 'John',
      password: 'longpassword',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a short password (< 8 chars)', () => {
    const result = registerSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a short name (< 2 chars)', () => {
    const result = registerSchema.safeParse({
      name: 'J',
      email: 'john@example.com',
      password: 'longpassword',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid input', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securepassword',
    });
    expect(result.success).toBe(true);
  });
});

describe('loginSchema', () => {
  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'longpassword',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a short password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid input', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'longpassword',
    });
    expect(result.success).toBe(true);
  });
});

describe('resetPasswordSchema', () => {
  it('rejects a short password', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'some-token',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing token', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'longpassword',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty token', () => {
    const result = resetPasswordSchema.safeParse({
      token: '',
      password: 'longpassword',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid input', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'valid-reset-token',
      password: 'newsecurepassword',
    });
    expect(result.success).toBe(true);
  });
});
