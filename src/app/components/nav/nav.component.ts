import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Main navigation">
      <ul>
        <li><a routerLink="/income" routerLinkActive="active">Income</a></li>
        <li><a routerLink="/expenses" routerLinkActive="active">Expenses</a></li>
        <li><a routerLink="/summary" routerLinkActive="active">Summary</a></li>
      </ul>
    </nav>
  `
})
export class NavComponent {
}
