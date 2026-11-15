export enum CircuitBreakerStateEnum {
    CLOSED = 'CLOSED',
    OPEN = 'OPEN',
    HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOption {
    failureThreshold: number;
    timeout: number;
    resetTimeout: number;
}

export interface CircuitBreakerState {
    state: CircuitBreakerStateEnum;
    failureCount: number;
    lastFailureTime: number;
    nextAttemptTime: number;
}

export interface CircuitBreakerResult<T> {
    success: boolean;
    data?: T;
    error?: Error;
    fromCache?: boolean;
}

