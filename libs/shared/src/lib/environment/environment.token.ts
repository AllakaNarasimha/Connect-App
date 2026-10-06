import { InjectionToken } from '@angular/core';
import { AppEnvironment } from './environment.interface';

/**
 * DI token the app-level `environment.ts` provides a value for in `app.config.ts`.
 * Inject this instead of importing `environment` directly so services stay testable.
 */
export const APP_ENVIRONMENT = new InjectionToken<AppEnvironment>('APP_ENVIRONMENT');
