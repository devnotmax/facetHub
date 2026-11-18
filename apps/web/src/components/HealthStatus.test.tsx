import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HealthStatus } from './HealthStatus';

describe('HealthStatus Component', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders loading state initially', async () => {
    // Hang fetch promise to observe loading state
    global.fetch = vi.fn(() => new Promise<Response>(() => {})) as unknown as typeof global.fetch;

    render(<HealthStatus apiUrl="/test-health" />);

    expect(screen.getByText('Consultando salud de la API...')).toBeInTheDocument();
    expect(screen.getByText('Comprobando...')).toBeInTheDocument();
  });

  it('renders connected state when API responds with valid payload', async () => {
    const mockPayload = {
      status: 'ok',
      uptime: 42.5,
      timestamp: '2026-11-17T21:00:00.000Z',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPayload,
    } as unknown as Response);

    render(<HealthStatus apiUrl="/test-health" />);

    await waitFor(() => {
      expect(screen.getByText('Conectado')).toBeInTheDocument();
    });

    expect(screen.getByText('42.5 s')).toBeInTheDocument();
    expect(screen.getByText('Verificar de nuevo')).toBeInTheDocument();
  });

  it('renders error state and retries when API fails', async () => {
    // First call fails, second call succeeds
    const mockPayload = {
      status: 'ok',
      uptime: 10,
      timestamp: '2026-11-17T21:00:00.000Z',
    };

    global.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fallo de red'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPayload,
      } as unknown as Response);

    render(<HealthStatus apiUrl="/test-health" />);

    await waitFor(() => {
      expect(screen.getByText('No se pudo contactar con la API')).toBeInTheDocument();
    });
    expect(screen.getByText('Fallo de red')).toBeInTheDocument();
    expect(screen.getByText('Reintentar conexión')).toBeInTheDocument();

    // Click retry
    const retryBtn = screen.getByText('Reintentar conexión');
    await userEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Conectado')).toBeInTheDocument();
    });
  });
});
