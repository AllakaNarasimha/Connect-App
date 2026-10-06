import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TodoApiService } from './services/todo-api.service';

@Component({
  selector: 'app-http-api-example',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './http-api-example.html',
  styleUrl: './http-api-example.scss',
})
export class HttpApiExample implements OnInit {
  protected readonly todoApi = inject(TodoApiService);

  protected readonly fetchState = this.todoApi.fetchTodos.state;
  protected readonly busy = computed(() => this.fetchState().busy);
  protected readonly prefetch = computed(() => this.fetchState().prefetch);
  protected readonly ok = computed(() => this.fetchState().ok);
  protected readonly todos = computed(() => this.fetchState().okRes?.body ?? []);
  protected readonly errorStatus = computed(() => this.fetchState().errorRes?.status);

  ngOnInit(): void {
    this.refresh();
  }

  protected refresh(): void {
    void this.todoApi.fetchTodos();
  }
}
