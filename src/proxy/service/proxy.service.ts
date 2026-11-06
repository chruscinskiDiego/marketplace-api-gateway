import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import type { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { firstValueFrom } from 'rxjs';
import type { JwtUser } from '../../auth/types/auth.types';
import { serviceConfig } from '../../config/gateway.config';

export type ServiceHealth =
  | { status: 'healthy'; data: unknown }
  | { status: 'unhealthy'; error: string };

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(private readonly httpService: HttpService) {}

  async proxyRequest(
    serviceName: keyof typeof serviceConfig,
    method: Method,
    path: string,
    data?: unknown,
    headers?: AxiosRequestConfig<unknown>['headers'],
    userInfo?: JwtUser,
  ): Promise<AxiosResponse<unknown, unknown>> {
    const service = serviceConfig[serviceName];
    const url = `${service.url}${path}`;
    this.logger.log(`Proxying ${method} request to ${serviceName}: ${url}`);

    const enhancedHeaders = {
      ...headers,
      'x-user-id': userInfo?.userId,
      'x-user-email': userInfo?.email,
      'x-user-role': userInfo?.role,
    };

    return firstValueFrom(
      this.httpService.request<unknown>({
        method: method.toLowerCase(),
        url,
        data,
        headers: enhancedHeaders,
        timeout: service.timeout,
      }),
    );
  }

  async getServiceHealth(
    serviceName: keyof typeof serviceConfig,
  ): Promise<ServiceHealth> {
    try {
      const service = serviceConfig[serviceName];
      const response = await firstValueFrom(
        this.httpService.get<unknown>(`${service.url}/health`, {
          timeout: 3000,
        }),
      );
      return { status: 'healthy', data: response.data };
    } catch (error: unknown) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown service error',
      };
    }
  }
}
