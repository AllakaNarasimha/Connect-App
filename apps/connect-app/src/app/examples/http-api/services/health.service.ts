import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { fetchFnWithState } from '@connect-app/shared';
import { runtimeEnvironment } from '../../core/config/runtime-environment';

@Injectable({ providedIn: 'root' })
export class HealthService {
  readonly #http = inject(HttpClient);

  // Normalize endpoint (handles trailing slash) — runtime env sets full URL.
  readonly #base = `${runtimeEnvironment.apiEndpoint.replace(/\/\+$/u, '')}`;

  /**
   * Returns a triggerable fetch state for the `/health` endpoint. Call the returned
   * function (e.g. `checkHealth().call()`) to execute the request or wire it to a
   * component as in the HTTP examples.
   */
  checkHealth = fetchFnWithState<{ status: string; service: string }>(() =>
    this.#http.get<{ status: string; service: string }>(`${this.#base}/health`, { observe: 'response' }),
  );
}
