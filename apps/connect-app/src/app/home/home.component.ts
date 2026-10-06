import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <h1>Connect App</h1>

      <button type="button" routerLink="/http-api-example/health">
        Check API Health
      </button>
    </main>
  `,
})
export class HomeComponent {}
