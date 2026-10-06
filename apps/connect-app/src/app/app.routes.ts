import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'http-api-example',
    loadComponent: () =>
      import('./examples/http-api/http-api-example').then((m) => m.HttpApiExample),
  },
  {
    path: 'http-api-example/health',
    loadComponent: () =>
      import('./examples/http-api/health-status.component').then((m) => m.HealthStatusComponent),
  },
];
