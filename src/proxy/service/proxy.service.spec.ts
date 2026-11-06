import { HttpService } from '@nestjs/axios';
import { AxiosHeaders } from 'axios';
import type { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { serviceConfig } from '../../config/gateway.config';
import { ProxyService } from './proxy.service';

const response: AxiosResponse<unknown, unknown> = {
  data: { ok: true },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: { headers: new AxiosHeaders() },
};

describe('ProxyService', () => {
  let service: ProxyService;
  let httpService: HttpService;

  beforeEach(() => {
    httpService = new HttpService();
    service = new ProxyService(httpService);
  });

  afterEach(() => jest.restoreAllMocks());

  it('forwards request data, headers and authenticated user information', async () => {
    const request = jest
      .spyOn(httpService, 'request')
      .mockReturnValue(of(response));
    const user = { userId: 'user-1', email: 'user@example.com', role: 'user' };
    const data = { name: 'Product' };
    await expect(
      service.proxyRequest(
        'products',
        'POST',
        '/products',
        data,
        { accept: 'application/json' },
        user,
      ),
    ).resolves.toBe(response);
    expect(request).toHaveBeenCalledWith({
      method: 'post',
      url: `${serviceConfig.products.url}/products`,
      data,
      headers: {
        accept: 'application/json',
        'x-user-id': user.userId,
        'x-user-email': user.email,
        'x-user-role': user.role,
      },
      timeout: 10000,
    });
  });

  it('allows requests without optional data or user information', async () => {
    jest.spyOn(httpService, 'request').mockReturnValue(of(response));
    await expect(
      service.proxyRequest('products', 'GET', '/products'),
    ).resolves.toBe(response);
  });

  it('propagates upstream request failures', async () => {
    const error = new Error('upstream unavailable');
    jest.spyOn(httpService, 'request').mockReturnValue(throwError(() => error));
    await expect(
      service.proxyRequest('products', 'GET', '/products'),
    ).rejects.toBe(error);
  });

  it('returns the upstream health data', async () => {
    jest.spyOn(httpService, 'get').mockReturnValue(of(response));
    await expect(service.getServiceHealth('users')).resolves.toEqual({
      status: 'healthy',
      data: response.data,
    });
  });

  it.each([
    [new Error('offline'), 'offline'],
    ['unexpected failure', 'Unknown service error'],
    [null, 'Unknown service error'],
  ])('handles a health check failure safely', async (error, message) => {
    jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));
    await expect(service.getServiceHealth('users')).resolves.toEqual({
      status: 'unhealthy',
      error: message,
    });
  });
});
