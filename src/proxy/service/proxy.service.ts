import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import type { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { firstValueFrom } from 'rxjs';
import type { JwtUser } from '../../auth/types/auth.types';
import { serviceConfig } from '../../config/gateway.config';
import { CircuitBreakerService } from '../../common/circuit-breaker/circuit-breaker.service';
import { CacheFallbackService } from '../../common/fallback/cache.fallback';
import { DefaultFallbackService } from '../../common/fallback/default.fallback';
import { RetryService } from 'src/common/retry/retry.service';
import { TimeoutService } from 'src/common/timeout/timeout.service';

export type ServiceHealth =
  | { status: 'healthy'; data: unknown }
  | { status: 'unhealthy'; error: string };

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly cacheFallbackService: CacheFallbackService,
    private readonly defaultFallbackService: DefaultFallbackService,
    private readonly retryService: RetryService,
    private readonly timeoutService: TimeoutService,
  ) { }

  async proxyRequest(
    serviceName: keyof typeof serviceConfig,
    method: Method,
    path: string,
    data?: unknown,
    headers?: AxiosRequestConfig<unknown>['headers'],
    userInfo?: JwtUser,
  ): Promise<any> {

    const service = serviceConfig[serviceName];
    const url = `${service.url}${path}`;

    this.logger.log(`Proxying ${method} request to ${serviceName}: ${url}`);

    const fallback = this.createServiceFallback(serviceName, method, path);

    // Camada 1: Circuit Breaker
    return this.circuitBreakerService.executeWithCircuitBreaker(
      async () => {
        // Camada 2: Retry
        return await this.retryService.executeWithExponentialBackoff(
          async () => {
            // Camada 3: Timeout
            return await this.timeoutService.executeWithCustomTimeout(
              async () => {
                const enhancedHeaders = {
                  ...headers,
                  'x-user-id': userInfo?.userId,
                  'x-user-email': userInfo?.email,
                  'x-user-role': userInfo?.role,
                };

                const response = await firstValueFrom(
                  this.httpService.request<unknown>({
                    method: method.toLowerCase(),
                    url,
                    data,
                    headers: enhancedHeaders,
                    timeout: service.timeout,
                  }),
                );


                if (method.toLowerCase() === 'get') {
                  this.cacheFallbackService.setCachedData(
                    `${serviceName}-${path}`,
                    response.data
                  )
                }

                return response.data;

              },
              service.timeout
              //operation
            )
          },
          3
        );
      },
      fallback,
      `proxy-${serviceName}`,
      {
        failureThreshold: 3,
        timeout: 30000,
        resetTimeout: 30000,
      }
    )

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

  private createServiceFallback(
    serviceName: string,
    method: string,
    path: string,
  ) {

    switch (serviceName) {

      case 'users':
        if (path.includes('/auth/login')) {
          return this.defaultFallbackService.createErrorFallback('users', 'Authentication service unavailable');
        }
        return this.defaultFallbackService.createErrorFallback('users', 'User service unavailable');

      case 'products':
        if (method.toLowerCase() === 'get') {
          return this.cacheFallbackService.createCacheFallback(
            `products-${path}`,
            { products: [], total: 0, page: 1, limit: 10 }
          )
        }
        return this.defaultFallbackService.createErrorFallback('products', 'Product service unavailable');

      case 'checkout':
        return this.defaultFallbackService.createErrorFallback(serviceName, `${serviceName} service unavailable`);

      case 'payments':
        return this.defaultFallbackService.createErrorFallback(serviceName, `${serviceName} service unavailable`);

      default:
        return this.defaultFallbackService.createErrorFallback(
          serviceName,
          'Service unavailable'
        )

    }

  }
}
