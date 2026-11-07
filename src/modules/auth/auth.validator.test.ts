import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './auth.validator';

describe('auth validators', () => {
  it('accepts a valid registration payload', () => {
    const payload = {
      name: 'Ana García',
      email: 'ana@aserco.com',
      password: 'Abcdef123',
    };

    expect(registerSchema.parse(payload)).toMatchObject(payload);
  });

  it('rejects weak passwords', () => {
    expect(() =>
      registerSchema.parse({
        name: 'Ana García',
        email: 'ana@aserco.com',
        password: '123',
      }),
    ).toThrow();
  });

  it('accepts a valid login payload', () => {
    expect(
      loginSchema.parse({
        email: 'ana@aserco.com',
        password: 'Abcdef123',
      }),
    ).toMatchObject({
      email: 'ana@aserco.com',
      password: 'Abcdef123',
    });
  });
});
