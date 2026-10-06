import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_ENVIRONMENT, fetchFnWithState } from '@connect-app/shared';

@Injectable({ providedIn: 'root' })
export class HealthService {
  readonly #http = inject(HttpClient);
  readonly #env = inject(APP_ENVIRONMENT);

  // Normalize endpoint (handles trailing slash) — generator sets full URL by default.
  readonly #base = `${this.#env.apiEndpoint.replace(/\/+$/u, '')}`;

  /**
   * Returns a triggerable fetch state for the `/health` endpoint. Call the returned
   * function (e.g. `checkHealth().call()`) to execute the request or wire it to a
   * component as in the HTTP examples.
   */
  checkHealth = fetchFnWithState<{ status: string; service: string }>(() =>
    this.#http.get<{ status: string; service: string }>(`${this.#base}/health`, { observe: 'response' }),
  );
}
