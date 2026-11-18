import React, { useEffect, useState, useCallback } from 'react';
import { type HealthCheckResponse, healthCheckResponseSchema } from '@facet/shared';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface HealthStatusProps {
  apiUrl?: string;
}

export const HealthStatus: React.FC<HealthStatusProps> = ({ apiUrl = '/health' }) => {
  const [state, setState] = useState<'loading' | 'connected' | 'error'>('loading');
  const [data, setData] = useState<HealthCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setState('loading');
    setError(null);

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Respuesta HTTP con código ${response.status}`);
      }

      const json = await response.json();
      const parsed = healthCheckResponseSchema.safeParse(json);

      if (!parsed.success) {
        throw new Error('El formato de respuesta de la API no es válido');
      }

      setData(parsed.data);
      setState('connected');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al conectar');
      setState('error');
    }
  }, [apiUrl]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return (
    <Card className="w-full max-w-md mx-auto shadow-sm border-border bg-card text-card-foreground">
      <CardHeader className="p-4 sm:p-6 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-primary" />
            <CardTitle className="text-lg sm:text-xl font-semibold">Estado del servidor</CardTitle>
          </div>
          {state === 'loading' && (
            <Badge variant="outline" className="text-muted-foreground animate-pulse">
              Comprobando...
            </Badge>
          )}
          {state === 'connected' && (
            <Badge
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-600 text-white gap-1"
            >
              <CheckCircle2 className="size-3.5" /> Conectado
            </Badge>
          )}
          {state === 'error' && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="size-3.5" /> Error
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
          Verificación de conectividad entre el frontend y la API Fastify.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
        {state === 'loading' && (
          <div className="flex items-center justify-center py-6 text-muted-foreground text-sm gap-2">
            <RefreshCw className="size-4 animate-spin text-primary" />
            <span>Consultando salud de la API...</span>
          </div>
        )}

        {state === 'connected' && data && (
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-lg p-3 text-xs sm:text-sm space-y-1.5 border border-border/50">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado del backend:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400 uppercase">
                  {data.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tiempo activo:</span>
                <span className="font-mono font-medium">{data.uptime} s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Último reporte:</span>
                <span className="font-mono text-[11px] sm:text-xs">
                  {new Date(data.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={checkHealth}
              className="w-full gap-2 text-xs sm:text-sm"
            >
              <RefreshCw className="size-3.5" />
              Verificar de nuevo
            </Button>
          </div>
        )}

        {state === 'error' && (
          <div className="space-y-3">
            <div className="rounded-lg p-3 text-xs sm:text-sm bg-destructive/10 text-destructive border border-destructive/20 space-y-1">
              <p className="font-medium">No se pudo contactar con la API</p>
              <p className="text-[11px] sm:text-xs opacity-90">{error}</p>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={checkHealth}
              className="w-full gap-2 text-xs sm:text-sm"
            >
              <RefreshCw className="size-3.5" />
              Reintentar conexión
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
