import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_ENVIRONMENT, fetchFnWithState } from '@connect-app/shared';

@Injectable({ providedIn: 'root' })
export class HealthService {
  readonly #http = inject(HttpClient);
  readonly #environment = inject(APP_ENVIRONMENT);

  readonly #baseUrl =
    this.#environment.apiEndpoint.replace(/\/+$/u, '');

  checkHealth = fetchFnWithState<{ status: string; service: string }>(() =>
    this.#http.get<{ status: string; service: string }>(
      `${this.#baseUrl}/health`,
      { observe: 'response' },
    ),
  );
}