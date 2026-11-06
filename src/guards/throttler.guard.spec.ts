import { ExecutionContext } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Reflector } from '@nestjs/core';
import {
  ThrottlerException,
  ThrottlerRequest,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { CustomThrottlerGuard } from './throttler.guard';

class TestThrottlerGuard extends CustomThrottlerGuard {
  check(request: ThrottlerRequest): Promise<boolean> {
    return this.handleRequest(request);
  }
}

describe('CustomThrottlerGuard', () => {
  const increment = jest.fn<
    ReturnType<ThrottlerStorage['increment']>,
    Parameters<ThrottlerStorage['increment']>
  >();
  let guard: TestThrottlerGuard;
  let setHeader: jest.Mock;
  let context: ExecutionContext;

  beforeEach(() => {
    increment.mockReset();
    guard = new TestThrottlerGuard([], { increment }, new Reflector());
    setHeader = jest.fn();
    context = new ExecutionContextHost(
      [
        { ip: '127.0.0.1', headers: { 'user-agent': 'test-agent' } },
        { setHeader },
      ],
      TestThrottlerGuard,
      () => undefined,
    );
  });

  function check(): Promise<boolean> {
    return guard.check({
      context,
      limit: 2,
      ttl: 60000,
      blockDuration: 60000,
      throttler: { name: 'default', limit: 2, ttl: 60000 },
      getTracker: () => Promise.resolve('tracker'),
      generateKey: () => 'key',
    });
  }

  it('uses the numeric hit count returned by storage in response headers', async () => {
    increment.mockResolvedValue({
      totalHits: 1,
      timeToExpire: 60,
      isBlocked: false,
      timeToBlockExpire: 0,
    });
    await expect(check()).resolves.toBe(true);
    expect(setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 1);
    expect(increment).toHaveBeenCalledWith(
      expect.any(String),
      60000,
      2,
      1,
      'default',
    );
  });

  it('blocks requests above the limit', async () => {
    increment.mockResolvedValue({
      totalHits: 3,
      timeToExpire: 60,
      isBlocked: true,
      timeToBlockExpire: 60,
    });
    await expect(check()).rejects.toThrow(ThrottlerException);
    expect(setHeader).toHaveBeenCalledWith('Retry-After', 60);
  });
});
