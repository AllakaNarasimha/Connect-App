import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { DestroyRef, inject, Injector, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  Observable,
  OperatorFunction,
  Subject,
  catchError,
  defaultIfEmpty,
  filter,
  firstValueFrom,
  map,
  of,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';

/**
 * Reactive state describing where an HTTP call is in its lifecycle. Mirrors the
 * `FetchState` shape used by `@aveva/fetch-rx` (`libs/aveva/fetch-rx` in ns-twin) so
 * templates can branch on `prefetch` / `busy` / `ok` / `res` / `exception`.
 */
export interface FetchState<T, ErrorT = unknown> {
  busy: boolean;
  prefetchOrBusy: boolean;
  nascent: boolean;
  prefetch: boolean;
  ok: boolean | undefined;
  res: HttpResponse<T | ErrorT> | undefined;
  okRes: HttpResponse<T> | undefined;
  errorRes: HttpResponse<ErrorT> | undefined;
  exception: unknown;
  errorResOrException: HttpResponse<ErrorT> | unknown;
}

export type FetchFunctionWithStateSignal<T, ErrorT, TRequestData> = ((
  requestData: TRequestData,
) => Promise<FetchState<T, ErrorT>>) & {
  state: () => FetchState<T, ErrorT>;
  state$: Observable<FetchState<T, ErrorT>>;
};

const initialState: FetchState<unknown, unknown> = {
  busy: false,
  prefetchOrBusy: true,
  nascent: true,
  prefetch: true,
  ok: undefined,
  res: undefined,
  okRes: undefined,
  errorRes: undefined,
  exception: undefined,
  errorResOrException: undefined,
};

/** Turns `HttpErrorResponse` into a `next`ed `HttpResponse`; only exceptions are thrown. */
function unthrowErrorResponse<T, ErrorT>(): OperatorFunction<
  HttpResponse<T>,
  HttpResponse<T | ErrorT>
> {
  return catchError((error: unknown) => {
    if (error instanceof HttpErrorResponse) {
      return of(
        new HttpResponse<T | ErrorT>({
          body: error.error,
          headers: error.headers,
          status: error.status,
          statusText: error.statusText,
          url: error.url ?? undefined,
        }),
      );
    }
    return throwError(() => error);
  });
}

/**
 * Converts an Angular `HttpClient` observable into easy-to-read signals so templates can
 * branch on request lifecycle instead of juggling subscriptions.
 *
 * Usage:
 * ```ts
 * fetchTodos = fetchFnWithState<Todo[]>(() => this.http.get<Todo[]>(url, { observe: 'response' }));
 * fetchState = this.fetchTodos.state;
 * ok = computed(() => this.fetchState().ok);
 *
 * ngOnInit() { this.fetchTodos(); }
 * ```
 */
export function fetchFnWithState<T, ErrorT = unknown, TRequestData = void>(
  callback: (requestData: TRequestData) => Observable<HttpResponse<T>>,
  opts: { injector?: Injector } = {},
): FetchFunctionWithStateSignal<T, ErrorT, TRequestData> {
  const injector = opts.injector || inject(Injector);

  const fetch$ = new Subject<TRequestData>();
  const state = signal<FetchState<T, ErrorT>>(initialState as FetchState<T, ErrorT>);
  const state$ = new BehaviorSubject<FetchState<T, ErrorT>>(state());

  fetch$
    .pipe(
      tap(() => {
        state.set({ ...state(), prefetch: false, busy: true, prefetchOrBusy: true });
        state$.next(state());
      }),
      switchMap((requestData) =>
        callback(requestData).pipe(
          unthrowErrorResponse<T, ErrorT>(),
          map((res): { res: HttpResponse<T | ErrorT>; exception: undefined } => ({
            res,
            exception: undefined,
          })),
          catchError(
            (exception: unknown): Observable<{ res: undefined; exception: unknown }> =>
              of({ res: undefined, exception }),
          ),
        ),
      ),
      takeUntilDestroyed(injector.get(DestroyRef)),
    )
    .subscribe(({ res, exception }) => {
      const ok = res?.ok;
      state.set({
        busy: false,
        prefetchOrBusy: false,
        nascent: false,
        prefetch: false,
        ok,
        res,
        okRes: ok ? (res as HttpResponse<T>) : undefined,
        errorRes: ok === false ? (res as HttpResponse<ErrorT>) : undefined,
        exception,
        errorResOrException: (ok === false ? res : undefined) ?? exception,
      });
      state$.next(state());
    });

  const result = (requestData: TRequestData) =>
    untracked(() => {
      fetch$.next(requestData);
      return firstValueFrom(
        result.state$.pipe(
          filter(({ busy, nascent, prefetch }) => !busy && !nascent && !prefetch),
          defaultIfEmpty({} as FetchState<T, ErrorT>),
          take(1),
        ),
      );
    });
  result.state = state;
  result.state$ = state$.pipe(takeUntilDestroyed(injector.get(DestroyRef)));

  return result;
}
