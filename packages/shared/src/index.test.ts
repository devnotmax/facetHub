import { describe, expect, it } from 'vitest';
import { healthCheckResponseSchema } from './index';

describe('healthCheckResponseSchema', () => {
  it('validates a correct health check payload', () => {
    const payload = {
      status: 'ok',
      uptime: 12.34,
      timestamp: new Date().toISOString(),
    };

    const parsed = healthCheckResponseSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });

  it('rejects an invalid status or negative uptime', () => {
    const payload = {
      status: 'error',
      uptime: -5,
      timestamp: 'invalid-date',
    };

    const parsed = healthCheckResponseSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });
});
