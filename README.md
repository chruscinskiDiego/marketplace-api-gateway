# Marketplace API Gateway

NestJS API gateway project for exploring authentication, HTTP integration and resilience when communicating with marketplace services.

## Components

- Authentication and health-check endpoints.
- JWT strategy and authorization, session and role guards.
- HTTP proxy service with a circuit breaker and fallbacks.
- Configurable rate limiting, DTO validation, CORS and Helmet.
- Logging middleware and Swagger documentation.

## Run locally

```bash
npm ci
# Create .env and configure the services used by the gateway.
npm run start:dev
```

The default port is 3005 and Swagger is served at /api. Set USERS_SERVICE_URL, PRODUCTS_SERVICE_URL, CHECKOUT_SERVICE_URL and PAYMENTS_SERVICE_URL as defined in src/config/gateway.config.ts. Also review CORS, JWT and rate-limit settings in their modules.

## Structure

- `src/auth/` and `src/guards/`: authentication and access control.
- `src/proxy/`: HTTP communication, circuit breaker and fallbacks.
- `src/config/`: service addresses and CORS.
- `src/middleware/`: logging.

## Tests and build

```bash
npm test
npm run test:e2e
npm run build
```

## Project status

Proxy infrastructure is implemented as a service. This does not mean every product, checkout and payment path is exposed as an HTTP route. Downstream services are external dependencies. Treat this as an evolving implementation rather than a complete microservices platform.
