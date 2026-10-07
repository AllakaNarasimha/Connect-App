import { loadEnvironment } from '@connect-app/shared';
import { ConnectAppEnvironment } from './environment.interface';

// Set by the build pipeline; falls back to a dev marker when built locally.
declare const __BUILD_VERSION__: string | undefined;

const buildVersion =
  typeof __BUILD_VERSION__ !== 'undefined' ? __BUILD_VERSION__ : 'local';

const loadedEnvironment = loadEnvironment<ConnectAppEnvironment>(
  true,
  buildVersion,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_dynamicEnvironment): _dynamicEnvironment is ConnectAppEnvironment => true,
  (dynamicEnvironment) => dynamicEnvironment,
);

if (loadedEnvironment.environmentInitializationFailed) {
  console.error(
    'Failed to initialize environment from window["__connect-app-env"]',
  );
}

export const environment = loadedEnvironment;