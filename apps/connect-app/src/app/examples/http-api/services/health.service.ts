import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_ENVIRONMENT, fetchFnWithState } from '@connect-app/shared';

export interface HealthResponse {
  status: string;
  service: string;
}

@Injectable({ providedIn: 'root' })
export class HealthService {
  readonly #http = inject(HttpClient);
  readonly #environment = inject(APP_ENVIRONMENT);

  readonly #baseUrl = this.#environment.apiEndpoint.replace(/\/+$/u, '');

  checkHealth = fetchFnWithState<HealthResponse>(() =>
    this.#http.get<HealthResponse>(
      `${this.#baseUrl}/health`,
      { observe: 'response' as const },
    ),
  );
}