import { describe, it, expect, beforeAll } from 'vitest';
import jwt from 'jsonwebtoken';
import { signToken, verifyToken, type JwtPayload } from '../server/lib/jwt';

const TEST_SECRET = 'a-test-secret-that-is-at-least-32-chars-long!!';

beforeAll(() => {
  process.env.JWT_SECRET = TEST_SECRET;
});

describe('signToken', () => {
  it('returns a string', () => {
    const token = signToken({ sub: '123', role: 'user' });
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });
});

describe('verifyToken', () => {
  it('returns the payload for a valid token', () => {
    const payload: JwtPayload = { sub: 'user-1', role: 'admin' };
    const token = signToken(payload);

    const result = verifyToken(token);

    expect(result.sub).toBe(payload.sub);
    expect(result.role).toBe(payload.role);
  });

  it('throws on an expired token', () => {
    const token = jwt.sign(
      { sub: 'user-1', role: 'user' },
      TEST_SECRET,
      { expiresIn: '0s' },
    );

    expect(() => verifyToken(token)).toThrow();
  });

  it('throws on a tampered token', () => {
    const token = signToken({ sub: 'user-1', role: 'user' });
    const tampered = token.slice(0, -4) + 'XXXX';

    expect(() => verifyToken(tampered)).toThrow();
  });
});

describe('round-trip', () => {
  it('sign then verify returns original payload fields', () => {
    const payload: JwtPayload = { sub: 'abc-999', role: 'editor' };
    const token = signToken(payload, '1h');
    const decoded = verifyToken(token);

    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.role).toBe(payload.role);
  });
});
