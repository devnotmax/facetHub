import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health';

export async function buildApp(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const app = Fastify(opts);

  const isProd = process.env.NODE_ENV === 'production';
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : isProd
      ? []
      : ['http://localhost:5173'];

  await app.register(cors, {
    origin: allowedOrigins,
    credentials: true,
  });

  await app.register(healthRoutes);

  return app;
}
