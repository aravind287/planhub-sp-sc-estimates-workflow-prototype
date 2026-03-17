import { Component, inject } from '@angular/core';
import { RoleService } from '../../../core/services/role.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-role-toggle',
  standalone: true,
  template: `
    <div class="role-toggle-wrapper" title="Switch between Supplier and Subcontractor experiences">
      <span class="view-as-label">View as:</span>
      <div class="toggle-pill">
        <button
          class="toggle-btn"
          [class.active]="roleService.currentRole() === 'sp'"
          (click)="selectRole('sp')"
        >SP View</button>
        <button
          class="toggle-btn"
          [class.active]="roleService.currentRole() === 'sc'"
          (click)="selectRole('sc')"
        >SC View</button>
      </div>
    </div>
  `,
  styles: [`
    .role-toggle-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .view-as-label {
      font-size: 10px;
      color: #718096;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .toggle-pill {
      display: flex;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      background: #f0f4f8;
    }
    .toggle-btn {
      padding: 5px 14px;
      border: none;
      background: transparent;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      color: #718096;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .toggle-btn.active {
      background: #1BB8A8;
      color: white;
      border-radius: 20px;
    }
    .toggle-btn:hover:not(.active) {
      background: #e2e8f0;
      color: #2d3748;
    }
  `]
})
export class RoleToggleComponent {
  roleService = inject(RoleService);
  private router = inject(Router);

  selectRole(role: 'sp' | 'sc') {
    this.roleService.setRole(role);
    if (role === 'sp') {
      this.router.navigate(['/sp/pipeline']);
    } else {
      this.router.navigate(['/sc/dashboard']);
    }
  }
}
