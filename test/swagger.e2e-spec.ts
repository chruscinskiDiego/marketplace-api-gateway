import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { corsOrigin } from '../src/config/cors-origin';

describe('Swagger (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({}).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors({ origin: corsOrigin, credentials: true });
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle('Marketplace API Gateway').build(),
    );
    SwaggerModule.setup('api', app, document);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([
    ['/api', /text\/html/],
    ['/api-json', /application\/json/],
    ['/api/swagger-ui.css', /text\/css/],
    ['/api/swagger-ui-bundle.js', /javascript/],
    ['/api/swagger-ui-standalone-preset.js', /javascript/],
    ['/api/swagger-ui-init.js', /javascript/],
    ['/api/favicon-32x32.png', /image\/png/],
    ['/api/favicon-16x16.png', /image\/png/],
  ])('serves %s without an Origin header', async (path, contentType) => {
    await request(app.getHttpServer())
      .get(path)
      .expect(200)
      .expect('Content-Type', contentType);
  });
});
