import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Shared } from '@connect-app/shared';
import { NxWelcome } from './nx-welcome';

@Component({
  imports: [NxWelcome, RouterModule, Shared],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'connect-app';
}
