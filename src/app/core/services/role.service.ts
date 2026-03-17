import { Injectable, signal } from '@angular/core';

export type UserRole = 'sp' | 'sc';

@Injectable({ providedIn: 'root' })
export class RoleService {
  currentRole = signal<UserRole>('sp');

  toggleRole() {
    this.currentRole.set(this.currentRole() === 'sp' ? 'sc' : 'sp');
  }

  setRole(role: UserRole) {
    this.currentRole.set(role);
  }
}
