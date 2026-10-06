import { loadEnvironment, toRecord } from '@connect-app/shared';
import { ConnectAppEnvironment } from './environment.interface';

// Set by the build pipeline; falls back to a dev marker when built locally.
declare const __BUILD_VERSION__: string | undefined;
const buildVersion = typeof __BUILD_VERSION__ !== 'undefined' ? __BUILD_VERSION__ : 'local';

const loadedEnvironment = loadEnvironment<ConnectAppEnvironment>(
  true,
  buildVersion,
  // verify
  (dynamicEnvironment): dynamicEnvironment is ConnectAppEnvironment => {
    const record = toRecord(dynamicEnvironment);

    // `exampleApiKey` is allowed to be an empty string
    if (typeof record['exampleApiKey'] !== 'string') {
      console.log(
        'Invalid environment, key `exampleApiKey` was',
        record['exampleApiKey'],
        'expected a string',
      );
      return false;
    }

    return true;
  },
  // parse
  (dynamicEnvironment) => ({
    exampleApiKey: dynamicEnvironment.exampleApiKey,
  }),
);

if (loadedEnvironment.environmentInitializationFailed) {
  console.error('Failed to initialize environment from window["__connect-app-env"]');
}

export const environment = loadedEnvironment;
