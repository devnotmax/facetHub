import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health';

export async function buildApp(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const app = Fastify(opts);

  await app.register(cors, {
    origin: true,
  });

  await app.register(healthRoutes);

  return app;
}
