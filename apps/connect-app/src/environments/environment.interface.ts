import { AppEnvironment } from '@connect-app/shared';

/**
 * App-specific environment, extending the shared `AppEnvironment` base.
 * Add new fields here (and validate/parse them in `environment.ts`) as the app needs more
 * runtime configuration, mirroring `ConnectEnvironment extends AppEnvironment` in ns-twin.
 */
export interface ConnectAppEnvironment extends AppEnvironment {
  /** Sample field demonstrating how to extend the base environment */
  exampleApiKey: string;
}
