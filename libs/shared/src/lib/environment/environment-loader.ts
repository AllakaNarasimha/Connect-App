import { AppEnvironment } from './environment.interface';

/**
 * Global key the runtime config script (`assets/configs/env.js`) writes to before Angular
 * bootstraps. Keeping the environment out of the compiled bundle lets the same build be
 * deployed to every environment; only this runtime payload changes.
 */
const RUNTIME_ENV_GLOBAL_KEY = '__connect-app-env';

/** Narrows an unknown value to a plain record, defaulting to `{}` for non-objects. */
export function toRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? { ...(value as Record<string, unknown>) }
    : {};
}

/**
 * Loads, validates and parses the runtime environment from the global scope.
 *
 * This runs prior to Angular's initialization (production mode, routing, etc. all depend on
 * it), so it cannot live in an injectable service.
 *
 * @param angularProductionMode Angular production mode flag to stamp onto the environment
 * @param buildVersion App build version, set when built in a pipeline
 * @param validate App-specific validation of the extra (non-`AppEnvironment`) fields
 * @param parse App-specific extraction/transformation of the extra fields
 * @returns The fully validated environment, or a Proxy that throws on access if loading failed
 */
export function loadEnvironment<TEnvironment extends AppEnvironment>(
  angularProductionMode: boolean,
  buildVersion: string,
  validate: (dynamicEnvironment: unknown) => dynamicEnvironment is TEnvironment,
  parse: (dynamicEnvironment: TEnvironment) => Omit<TEnvironment, keyof AppEnvironment>,
): TEnvironment & { environmentInitializationFailed: boolean } {
  const globalScope = window as unknown as Record<string, unknown>;
  const parsedEnvironment: unknown = JSON.parse(
    JSON.stringify(globalScope[RUNTIME_ENV_GLOBAL_KEY] ?? {}),
  );
  const dynamicEnvironment = toRecord(parsedEnvironment);

  // coerce string booleans ("true"/"false") coming from the runtime config script
  for (const booleanKey of ['isDevEnvironment', 'isLocalEnvironment'] as const) {
    if (Object.prototype.hasOwnProperty.call(dynamicEnvironment, booleanKey)) {
      const value = dynamicEnvironment[booleanKey];
      dynamicEnvironment[booleanKey] = value === 'true' ? true : value === 'false' ? false : value;
    }
  }

  if (validateAppEnvironment(dynamicEnvironment) && validate(dynamicEnvironment)) {
    const appEnvironment: AppEnvironment = {
      production: angularProductionMode,
      environmentName: dynamicEnvironment['environmentName'],
      apiEndpoint: dynamicEnvironment['apiEndpoint'],
      version: buildVersion,
      isDevEnvironment: dynamicEnvironment['isDevEnvironment'],
      isLocalEnvironment: dynamicEnvironment['isLocalEnvironment'],
    };

    const final = {
      environmentInitializationFailed: false,
      ...appEnvironment,
      ...parse(dynamicEnvironment),
    };

    if (validateAppEnvironment(final) && validate(final)) {
      return final;
    }
  }

  // Fallback: return a safe, non-throwing environment object marked as failed.
  // This prevents runtime exceptions when the runtime `env.js` is missing
  // (for example, if the deployment/publish pipeline didn't generate it).
  return {
    environmentInitializationFailed: true,
    production: angularProductionMode,
    environmentName: 'unknown',
    apiEndpoint: '',
    version: buildVersion,
    isDevEnvironment: false,
    isLocalEnvironment: false,
  } as unknown as TEnvironment & { environmentInitializationFailed: boolean };
}

function validateAppEnvironment(
  dynamicEnvironment: unknown,
): dynamicEnvironment is AppEnvironment {
  const record = toRecord(dynamicEnvironment);

  if (typeof record['apiEndpoint'] !== 'string' || record['apiEndpoint'].length < 1) {
    console.log(
      'Invalid environment, key `apiEndpoint` was',
      record['apiEndpoint'],
      'expected a string of length > 0',
    );
    return false;
  }

  if (typeof record['environmentName'] !== 'string' || record['environmentName'].length < 1) {
    console.log(
      'Invalid environment, key `environmentName` was',
      record['environmentName'],
      'expected a string of length > 0',
    );
    return false;
  }

  const isDevEnvironment = record['isDevEnvironment'];
  if (typeof isDevEnvironment !== 'boolean') {
    console.log(
      'Invalid environment, key `isDevEnvironment` was',
      isDevEnvironment,
      'expected a boolean',
    );
    return false;
  }

  const isLocalEnvironment = record['isLocalEnvironment'];
  if (typeof isLocalEnvironment !== 'boolean') {
    console.log(
      'Invalid environment, key `isLocalEnvironment` was',
      isLocalEnvironment,
      'expected a boolean',
    );
    return false;
  }

  return true;
}
