# Marketplace API Gateway

Projeto de API Gateway em NestJS para estudar autenticação, integração HTTP e mecanismos de resiliência na comunicação com serviços de um marketplace.

## Componentes presentes

- Endpoints de autenticação e verificação de saúde.
- Estratégia JWT e guards de autorização, sessão e papéis.
- Serviço de proxy HTTP com circuit breaker e fallbacks.
- Rate limiting configurável, validação de DTOs, CORS e Helmet.
- Middleware de logging e documentação Swagger.

## Executar localmente

```bash
npm ci
# Crie .env e configure os serviços usados pelo gateway.
npm run start:dev
```

A porta padrão é 3005; a documentação Swagger fica em /api. Configure USERS_SERVICE_URL, PRODUCTS_SERVICE_URL, CHECKOUT_SERVICE_URL e PAYMENTS_SERVICE_URL conforme src/config/gateway.config.ts. Revise também as opções de CORS, JWT e limites de requisição nos módulos correspondentes.

## Organização

- `src/auth/` e `src/guards/`: autenticação e controle de acesso.
- `src/proxy/`: comunicação HTTP, circuit breaker e fallbacks.
- `src/config/`: endereços dos serviços e CORS.
- `src/middleware/`: logging.

## Testes e build

```bash
npm test
npm run test:e2e
npm run build
```

## Estado do projeto

A infraestrutura de proxy está presente como serviço; isso não significa que todos os caminhos de produtos, checkout e pagamentos já estejam publicados como rotas HTTP. Os serviços downstream são dependências externas a este repositório. O projeto deve ser avaliado como uma implementação em evolução, sem afirmar uma plataforma completa de microsserviços.
