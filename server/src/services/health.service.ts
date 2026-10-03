import { pingDatabase } from '../models/health.model.js';

export type HealthStatus = {
  status: 'ok';
  database: 'connected';
  timestamp: string;
};

/** Confirms API + DB are reachable — used by deploy checks and the client scaffold. */
export const checkHealth = async (): Promise<HealthStatus> => {
  await pingDatabase();

  return {
    status: 'ok',
    database: 'connected',
    timestamp: new Date().toISOString(),
  };
};
