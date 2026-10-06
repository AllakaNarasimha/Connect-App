import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_ENVIRONMENT, fetchFnWithState } from '@connect-app/shared';
import { TodoItem } from '../models/todo-item.model';

/**
 * Sample HTTP API service following the workspace pattern:
 * - base URL built from the injected `APP_ENVIRONMENT` (never hardcoded)
 * - `HttpClient` calls wrapped in `fetchFnWithState` so components get signal-based
 *   `busy` / `ok` / `res` / `exception` state instead of managing subscriptions by hand
 */
@Injectable({ providedIn: 'root' })
export class TodoApiService {
  readonly #http = inject(HttpClient);
  readonly #environment = inject(APP_ENVIRONMENT);

  // `apiEndpoint` may include the scheme and/or trailing slash (we set it to a full URL
  // in the generator). Normalize to avoid duplicate scheme or double slashes.
  readonly #baseUrl = `${this.#environment.apiEndpoint.replace(/\/+$/u, '')}/todos`;

  /** Fetches a page of todos. Call the returned function to trigger the request. */
  fetchTodos = fetchFnWithState<TodoItem[]>(() =>
    this.#http.get<TodoItem[]>(this.#baseUrl, { observe: 'response' }),
  );

  /** Fetches a single todo by id. */
  fetchTodoById = fetchFnWithState<TodoItem, unknown, number>((id) =>
    this.#http.get<TodoItem>(`${this.#baseUrl}/${id}`, { observe: 'response' }),
  );

  /** Creates a new todo. */
  createTodo = fetchFnWithState<TodoItem, unknown, Partial<TodoItem>>((body) =>
    this.#http.post<TodoItem>(this.#baseUrl, body, { observe: 'response' }),
  );
}
