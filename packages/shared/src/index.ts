import { z } from 'zod';

export const healthCheckResponseSchema = z.object({
  status: z.literal('ok'),
  uptime: z.number().nonnegative(),
  timestamp: z.string().datetime(),
});

export type HealthCheckResponse = z.infer<typeof healthCheckResponseSchema>;
