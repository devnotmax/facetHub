import type { FastifyPluginAsync } from 'fastify';
import { type HealthCheckResponse, healthCheckResponseSchema } from '@facet/shared';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async (_request, reply): Promise<HealthCheckResponse> => {
    const payload: HealthCheckResponse = {
      status: 'ok',
      uptime: Math.round(process.uptime() * 100) / 100,
      timestamp: new Date().toISOString(),
    };

    // Validate payload against shared schema to guarantee contract
    const parsed = healthCheckResponseSchema.safeParse(payload);
    if (!parsed.success) {
      reply.status(500);
      throw new Error('Health check payload contract violation');
    }

    return parsed.data;
  });
};
