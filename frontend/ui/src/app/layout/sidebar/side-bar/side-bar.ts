import {
  Component,
  Input
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss'
})
export class Sidebar {

  @Input()
  collapsed = false;

  constructor(
    private router: Router
  ) {}

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}