import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { healthCheckResponseSchema } from '@facet/shared';
import { buildApp } from '../app';

describe('GET /health', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns status 200 with matching schema', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);

    const json = JSON.parse(response.payload);
    const parsed = healthCheckResponseSchema.safeParse(json);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.status).toBe('ok');
      expect(typeof parsed.data.uptime).toBe('number');
      expect(typeof parsed.data.timestamp).toBe('string');
    }
  });
});
