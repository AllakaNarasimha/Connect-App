import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { HealthService } from './services/health.service';

@Component({
  standalone: true,
  selector: 'app-health-status',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="health-status">
      <header>
        <h3>API Health</h3>
        <button type="button" (click)="check()" [disabled]="busy()">
          Check
        </button>
      </header>
      <div *ngIf="prefetch() || busy(); else resultTpl">
        <p>Checking health…</p>
      </div>

      <ng-template #resultTpl>
        <div *ngIf="ok(); else errorOrEmpty">
          <pre>{{ res()?.body | json }}</pre>
        </div>
        <ng-template #errorOrEmpty>
          <div *ngIf="errorStatus(); else noResult">
            <p class="error">
              Health request failed with status {{ errorStatus() }}.
            </p>
          </div>
          <ng-template #noResult>
            <p class="muted">No result yet — press Check.</p>
          </ng-template>
        </ng-template>
      </ng-template>
    </section>
  `,
  styles: [
    `
      .health-status {
        padding: 0.5rem 0;
      }
      .error {
        color: #b00020;
      }
      .muted {
        color: #666;
      }
    `,
  ],
})
export class HealthStatusComponent {
  readonly #service = inject(HealthService);

  readonly state = this.#service.checkHealth.state;
  readonly busy = computed(() => this.state().busy);
  readonly prefetch = computed(() => this.state().prefetch);
  readonly ok = computed(() => this.state().ok);
  readonly res = computed(() => this.state().okRes);
  readonly errorStatus = computed(() => this.state().errorRes?.status);

  async check(): Promise<void> {
    const state = await this.#service.checkHealth();

    console.log('Health fetch state:', state);
    console.log('Health HttpResponse:', state.okRes);
    console.log('Health body:', state.okRes?.body);
  }
}
