import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RoleService } from '../../../core/services/role.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ScStateService } from '../../../core/services/sc-state.service';
import { RoleToggleComponent } from '../../../shared/components/role-toggle/role-toggle.component';
import { NotificationPanelComponent } from '../../../shared/components/notification-panel/notification-panel.component';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RoleToggleComponent, NotificationPanelComponent],
  template: `
    @if (roleService.currentRole() === 'sp') {
      <nav class="nav-bar">
        <div class="nav-inner">
          <!-- Logo -->
          <a class="nav-logo" routerLink="/">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 25,8 25,20 14,26 3,20 3,8" fill="#1BB8A8"/>
              <text x="14" y="19" text-anchor="middle" fill="white" font-size="10" font-weight="bold" font-family="sans-serif">P</text>
            </svg>
            <span class="logo-text">planHub</span>
          </a>

          <!-- Nav Items -->
          <ul class="nav-links">
            <li><a class="nav-item" routerLink="/sp/pipeline" routerLinkActive="active">Bids</a></li>
            <li><a class="nav-item" routerLink="/sp/bid-planner" routerLinkActive="active">Bid Planner</a></li>
          </ul>

          <!-- Right Side -->
          <div class="nav-right">
            <app-role-toggle />
            <!-- Notifications Bell -->
            <button class="icon-btn notif-btn" (click)="toggleNotifications()" title="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              @if (notifService.unreadCount() > 0) {
                <span class="notif-badge">{{ notifService.unreadCount() }}</span>
              }
            </button>
            <!-- Viewing As -->
            <div class="viewing-as">
              <div class="user-avatar">A</div>
              <div class="viewing-as-info">
                <span class="viewing-name">{{ scState.spUserName }}</span>
                <span class="viewing-company">{{ scState.spCompanyName }}</span>
              </div>
            </div>
            <!-- Location Badge -->
            <span class="location-badge">Nationwide</span>
          </div>
        </div>
      </nav>
      <app-notification-panel [open]="notifPanelOpen()" (closePanel)="notifPanelOpen.set(false)" />
    } @else {
      <aside class="sc-sidebar">
        <div class="sc-logo-area">
          <div class="sc-logo-icon">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 25,8 25,20 14,26 3,20 3,8" fill="#1BB8A8"/>
              <text x="14" y="19" text-anchor="middle" fill="white" font-size="10" font-weight="bold" font-family="sans-serif">P</text>
            </svg>
          </div>
          <span class="sc-logo-text">planHub</span>
        </div>
        <div class="sc-company-badge">
          <span class="sc-company-name">{{ scState.scCompanyName }}</span>
        </div>

        <button class="sc-add-new">+ Add New</button>

        <!-- Role toggle near top so it's always visible -->
        <div class="sc-role-toggle-wrap">
          <app-role-toggle />
        </div>

        <nav class="sc-nav">
          <a class="sc-nav-item" routerLink="/sc/dashboard" routerLinkActive="sc-nav-active">Project Finder</a>
        </nav>

      </aside>
    }
  `,
  styles: [`
    /* ===== SP TOP NAV ===== */
    .nav-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: white;
      border-bottom: 1px solid #e2e8f0;
      height: 60px;
    }
    .nav-inner {
      display: flex;
      align-items: center;
      height: 60px;
      padding: 0 24px;
      gap: 24px;
    }
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      flex-shrink: 0;
    }
    .logo-text {
      font-size: 18px;
      font-weight: 700;
      color: #2d3748;
      letter-spacing: -0.5px;
    }
    .nav-links {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 2px;
      flex: 1;
      overflow-x: auto;
      flex-shrink: 1;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      color: #4a5568;
      border-radius: 4px;
      transition: color 0.15s;
      position: relative;
      white-space: nowrap;
    }
    .nav-item:hover { color: #1BB8A8; }
    .nav-item.active {
      color: #1BB8A8;
    }
    .nav-item.active::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 0;
      right: 0;
      height: 2px;
      background: #1BB8A8;
    }
    .caret { font-size: 10px; }
    .badge {
      background: #fc8181;
      color: white;
      border-radius: 10px;
      padding: 1px 6px;
      font-size: 11px;
      font-weight: 600;
    }
    .nav-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #4a5568;
      padding: 6px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      position: relative;
    }
    .icon-btn:hover { background: #f7fafc; color: #2d3748; }
    .notif-badge {
      position: absolute;
      top: 0;
      right: 0;
      background: #fc8181;
      color: white;
      border-radius: 10px;
      padding: 1px 5px;
      font-size: 10px;
      font-weight: 700;
      min-width: 16px;
      text-align: center;
    }
    .viewing-as {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 10px;
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }
    .viewing-as-info {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .viewing-name {
      font-size: 12px;
      font-weight: 600;
      color: #2d3748;
      line-height: 1.2;
    }
    .viewing-company {
      font-size: 11px;
      color: #1BB8A8;
      font-weight: 500;
      line-height: 1.2;
    }
    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #1BB8A8;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      flex-shrink: 0;
    }
    .location-badge {
      font-size: 12px;
      color: #4a5568;
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 3px 8px;
    }
    .pro-pill {
      font-size: 12px;
      font-weight: 700;
      color: #6b46c1;
      background: #faf5ff;
      border: 1px solid #e9d8fd;
      border-radius: 12px;
      padding: 3px 10px;
    }

    /* ===== SC SIDEBAR ===== */
    .sc-sidebar {
      position: fixed;
      left: 0; top: 0;
      width: 160px;
      height: 100vh;
      background: #1a2030;
      display: flex;
      flex-direction: column;
      z-index: 100;
      overflow-y: auto;
    }
    .sc-logo-area {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 14px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .sc-logo-text {
      font-size: 15px;
      font-weight: 700;
      color: white;
    }
    .sc-company-badge {
      padding: 6px 14px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .sc-company-name {
      font-size: 11px;
      font-weight: 600;
      color: #1BB8A8;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .sc-add-new {
      margin: 12px;
      padding: 8px;
      border: 1px solid rgba(255,255,255,0.4);
      border-radius: 5px;
      background: transparent;
      color: white;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
    }
    .sc-add-new:hover { background: rgba(255,255,255,0.08); }
    .sc-nav { flex: 1; padding: 4px 0; }
    .sc-nav-item {
      display: block;
      padding: 9px 14px;
      color: rgba(255,255,255,0.75);
      text-decoration: none;
      font-size: 13px;
      font-weight: 400;
      transition: all 0.12s;
    }
    .sc-nav-item:hover { color: white; background: rgba(255,255,255,0.08); }
    .sc-nav-active { color: white !important; background: rgba(255,255,255,0.12) !important; }
    .sc-nav-bottom {
      padding: 8px 0;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .sc-account-type {
      display: block;
      width: calc(100% - 28px);
      margin: 6px 14px;
      padding: 7px 10px;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 5px;
      background: transparent;
      color: white;
      font-size: 12px;
      cursor: pointer;
      text-align: left;
    }
    .sc-account-type:hover { background: rgba(255,255,255,0.08); }
    .sc-role-toggle-wrap {
      padding: 10px 14px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }

    @media (max-width: 900px) {
      .viewing-as-info { display: none; }
      .location-badge { display: none; }
    }
    @media (max-width: 640px) {
      .nav-inner { padding: 0 12px; gap: 12px; }
      .logo-text { display: none; }
    }

    @media (max-width: 640px) {
      .sc-sidebar {
        position: fixed;
        left: 0; top: 0;
        width: 100%;
        height: 56px;
        flex-direction: row;
        align-items: center;
        padding: 0 16px;
        overflow: hidden;
        z-index: 200;
      }
      .sc-logo-area { border-bottom: none; padding: 0; flex-shrink: 0; }
      .sc-company-badge { padding: 0 12px; border-bottom: none; flex-shrink: 0; }
      .sc-add-new { display: none; }
      .sc-role-toggle-wrap { margin-left: auto; padding: 0; border-top: none; }
      .sc-nav { display: none; }
      .sc-nav-bottom { display: none; }
    }
  `]
})
export class NavComponent {
  roleService = inject(RoleService);
  notifService = inject(NotificationService);
  scState = inject(ScStateService);
  notifPanelOpen = signal(false);

  toggleNotifications() {
    this.notifPanelOpen.update(v => !v);
  }
}
