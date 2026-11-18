import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../app';

describe('graceful shutdown', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    await app.listen({ port: 0, host: '127.0.0.1' }); // puerto aleatorio
  });

  afterAll(async () => {
    // seguridad: si el test falla antes del close, lo cerramos aquí
    await app.close().catch(() => undefined);
  });

  it('closes the server without throwing', async () => {
    await expect(app.close()).resolves.toBeUndefined();
  });

  it('rejects inject requests after close with a FastifyError', async () => {
    // Fastify lanza "Fastify has already been closed" al llamar inject() post-close
    await expect(
      app.inject({ method: 'GET', url: '/health' }),
    ).rejects.toThrow('Fastify has already been closed');
  });
});
