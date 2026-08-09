import { apiFetch } from './api';

export interface HealthCheckResponse {
  status: 'ok' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: Record<string, { status: 'ok' | 'degraded' | 'down'; latencyMs: number; message?: string }>;
}

export const healthService = {
  /**
   * Ping backend health status and satellite API route readiness.
   */
  getHealthStatus: async (): Promise<HealthCheckResponse> => {
    return apiFetch<HealthCheckResponse>('/api/health');
  }
};
