import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './auth.guard';

describe('JwtAuthGuard', () => {
  const guard = new JwtAuthGuard(new Reflector());

  it('returns the authenticated user without a type assertion', () => {
    const user = { userId: 'user-1', email: 'user@example.com', role: 'user' };
    expect(guard.handleRequest(null, user)).toBe(user);
  });

  it.each([false, null, undefined])(
    'rejects a missing authenticated user',
    (user) => {
      expect(() => guard.handleRequest(null, user)).toThrow(
        UnauthorizedException,
      );
    },
  );

  it('preserves authentication errors', () => {
    const error = new Error('Invalid signature');
    expect(() => guard.handleRequest(error, false)).toThrow(error);
  });

  it('handles an unknown authentication failure safely', () => {
    expect(() => guard.handleRequest('invalid token', false)).toThrow(
      UnauthorizedException,
    );
  });
});
