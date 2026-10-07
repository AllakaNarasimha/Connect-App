/**
 * Base set of environment values every app in this workspace must provide.
 * App-specific environments should `extends AppEnvironment` and add their own fields,
 * mirroring the `ConnectEnvironment extends AppEnvironment` pattern.
 */
export interface AppEnvironment {
  /** Angular production mode flag, set at environment-load time */
  production: boolean;
  /** Human readable name of the environment (e.g. "local", "dev", "production") */
  environmentName: string;
  /** Host (no scheme) the app should call for HTTP APIs */
  apiEndpoint: string;
  /** App build version, injected at build time */
  version: string;
  /** True when running against a non-production backend */
  isDevEnvironment: boolean;
  /** True when running on a developer's machine (served locally) */
  isLocalEnvironment: boolean;
}
