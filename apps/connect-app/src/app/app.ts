import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Shared } from '@connect-app/shared';
import { NxWelcome } from './nx-welcome';
import { HealthStatusComponent } from './examples/http-api/health-status.component';

@Component({
  imports: [NxWelcome, RouterModule, Shared, HealthStatusComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'connect-app';
}
