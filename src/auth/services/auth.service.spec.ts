import { HttpService } from '@nestjs/axios';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AxiosHeaders } from 'axios';
import type { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { RegisterDto } from '../dto/register.dto';
import type { JwtUser, UserSession } from '../types/auth.types';
import { AuthService } from './auth.service';

function response<T>(data: T): AxiosResponse<T, unknown> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let httpService: HttpService;
  let jwtService: JwtService;
  const user: JwtUser = {
    userId: 'user-1',
    email: 'user@example.com',
    role: 'user',
  };

  beforeEach(() => {
    httpService = new HttpService();
    jwtService = new JwtService({ secret: 'test-secret' });
    service = new AuthService(jwtService, httpService);
  });

  afterEach(() => jest.restoreAllMocks());

  it('verifies a signed JWT and returns its payload', async () => {
    await expect(
      service.validateJwtToken(jwtService.sign(user)),
    ).resolves.toMatchObject(user);
  });

  it.each([
    'invalid-token',
    new JwtService({ secret: 'other-secret' }).sign(user),
  ])('rejects an invalid JWT', async (token) => {
    await expect(service.validateJwtToken(token)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects an expired JWT', async () => {
    const token = jwtService.sign(user, { expiresIn: -1 });
    await expect(service.validateJwtToken(token)).rejects.toThrow(
      'Invalid JWT token',
    );
  });

  it('returns the validated session', async () => {
    const session: UserSession = {
      valid: true,
      user: {
        id: 'user-1',
        email: user.email,
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        status: null,
      },
    };
    const get = jest
      .spyOn(httpService, 'get')
      .mockReturnValue(of(response(session)));
    await expect(
      service.validateSessionToken('session-token'),
    ).resolves.toEqual(session);
    expect(get).toHaveBeenCalledWith(
      expect.stringContaining('/sessions/validate/session-token'),
      { timeout: 10000 },
    );
  });

  it('forwards login data and the upstream response', async () => {
    const credentials = { email: user.email, password: 'password123' };
    const data = { sessionToken: 'session-token' };
    const post = jest
      .spyOn(httpService, 'post')
      .mockReturnValue(of(response(data)));
    await expect(service.login(credentials)).resolves.toEqual(data);
    expect(post).toHaveBeenCalledWith(
      expect.stringContaining('/sessions'),
      credentials,
      { timeout: 10000 },
    );
  });

  it('forwards registration data and the upstream response', async () => {
    const registration = Object.assign(new RegisterDto(), {
      firstName: 'John',
      lastName: 'Doe',
      email: user.email,
      password: 'password123',
    });
    const data = { id: user.userId };
    const post = jest
      .spyOn(httpService, 'post')
      .mockReturnValue(of(response(data)));
    await expect(service.register(registration)).resolves.toEqual(data);
    expect(post).toHaveBeenCalledWith(
      expect.stringContaining('/auth/register'),
      registration,
      { timeout: 10000 },
    );
  });

  it('maps upstream failures to authentication errors', async () => {
    jest
      .spyOn(httpService, 'get')
      .mockReturnValue(throwError(() => new Error('offline')));
    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(throwError(() => new Error('offline')));
    await expect(service.validateSessionToken('token')).rejects.toThrow(
      'Invalid session token',
    );
    await expect(
      service.login({ email: user.email, password: 'password123' }),
    ).rejects.toThrow('Invalid credentials');
    await expect(service.register(new RegisterDto())).rejects.toThrow(
      'Error occurred while registering',
    );
  });
});
