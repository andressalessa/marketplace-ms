export enum CircuitBreakerStateEnum {
  CLOSED = 'CLOSED', // The circuit breaker is closed and requests are allowed
  OPEN = 'OPEN', // The circuit breaker is open and requests are blocked
  HALF_OPEN = 'HALF_OPEN', // The circuit breaker is half-open and allows a limited number of requests
}

export interface CircuitBreakerOptions {
  failureThreshold: number; // The number of failures before the circuit breaker trips
  timeout: number; // The time in milliseconds before the circuit breaker resets
  resetTimeout: number; // The time in milliseconds before the circuit breaker allows requests again
}

export interface CircuitBreakerState {
  state: CircuitBreakerStateEnum; // The current state of the circuit breaker
  failureCount: number; // The number of failures that have occurred
  lastFailureTime: number; // The timestamp of the last failure
  nextAttemptTime: number; // The timestamp of the next allowed attempt when in HALF_OPEN state
}

export interface CircuitBreakerResult<T> {
  success: boolean; // Indicates if the operation was successful
  data?: T; // The data returned from the operation, if successful
  error?: Error; // The error returned from the operation, if failed
  fromCache?: boolean; // Indicates if the result was returned from cache
}
