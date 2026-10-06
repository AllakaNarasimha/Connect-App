export interface RuntimeEnvironment {
  environment: string;
  apiEndpoint: string;
}

declare global {
  interface Window {
    __env?: RuntimeEnvironment;
  }
}

const config = window.__env;

if (!config) {
  throw new Error(
    'Runtime environment configuration is missing. Make sure assets/env.js is loaded.'
  );
}

export const runtimeEnvironment: RuntimeEnvironment = config;
