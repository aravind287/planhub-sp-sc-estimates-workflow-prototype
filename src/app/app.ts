import { Component, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './features/layout/nav/nav.component';
import { RoleService } from './core/services/role.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private roleService = inject(RoleService);
  constructor() {
    effect(() => {
      document.body.classList.toggle('sc-mode', this.roleService.currentRole() === 'sc');
    });
  }
}
