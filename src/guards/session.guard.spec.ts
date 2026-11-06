import { HttpService } from '@nestjs/axios';
import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/services/auth.service';
import type {
  AuthenticatedRequest,
  UserSession,
} from '../auth/types/auth.types';
import { SessionGuard } from './session.guard';

describe('SessionGuard', () => {
  const session: UserSession = {
    valid: true,
    user: {
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      status: null,
    },
  };
  let guard: SessionGuard;
  let validateSessionToken: jest.SpyInstance<Promise<UserSession>, [string]>;

  beforeEach(() => {
    const service = new AuthService(new JwtService(), new HttpService());
    validateSessionToken = jest
      .spyOn(service, 'validateSessionToken')
      .mockResolvedValue(session);
    guard = new SessionGuard(service);
  });

  afterEach(() => jest.restoreAllMocks());

  it('attaches the validated session user to the request', async () => {
    const request: Pick<AuthenticatedRequest, 'headers' | 'user'> = {
      headers: { 'x-session-token': 'session-token' },
    };
    await expect(
      guard.canActivate(new ExecutionContextHost([request])),
    ).resolves.toBe(true);
    expect(request.user).toEqual(session.user);
    expect(validateSessionToken).toHaveBeenCalledWith('session-token');
  });

  it.each([undefined, '', ['first-token', 'second-token']])(
    'rejects missing, empty or repeated session headers',
    async (token) => {
      const context = new ExecutionContextHost([
        { headers: { 'x-session-token': token } },
      ]);
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(validateSessionToken).not.toHaveBeenCalled();
    },
  );

  it('rejects an invalid session', async () => {
    validateSessionToken.mockResolvedValue({ ...session, valid: false });
    const context = new ExecutionContextHost([
      { headers: { 'x-session-token': 'invalid-token' } },
    ]);
    await expect(guard.canActivate(context)).rejects.toThrow(
      'Invalid session token',
    );
  });
});
