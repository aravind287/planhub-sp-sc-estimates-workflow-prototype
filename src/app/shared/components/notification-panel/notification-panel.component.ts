import { Component, inject, signal, input, output } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  template: `
    @if (open()) {
      <div class="panel-overlay" (click)="closePanel.emit()"></div>
      <div class="notification-panel">
        <div class="panel-header">
          <h3>Notifications</h3>
          <div class="panel-actions">
            <button class="mark-all-btn" (click)="markAllRead()">Mark all read</button>
            <button class="close-btn" (click)="closePanel.emit()">✕</button>
          </div>
        </div>
        <div class="panel-body">
          @for (notif of notifications(); track notif.id) {
            <div class="notif-item" [class.unread]="!notif.read" (click)="markRead(notif.id)">
              <div class="notif-icon" [class]="'ntype-' + notif.type">{{ typeIcon[notif.type] }}</div>
              <div class="notif-content">
                <p class="notif-message">{{ notif.message }}</p>
                <div class="notif-meta">
                  <span class="notif-project">{{ notif.projectName }}</span>
                  <span class="notif-time">{{ getRelativeTime(notif.timestamp) }}</span>
                </div>
              </div>
              @if (!notif.read) {
                <div class="unread-dot"></div>
              }
            </div>
          }
          @if (notifications().length === 0) {
            <div class="empty-state">
              <p>No notifications</p>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .panel-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 999;
    }
    .notification-panel {
      position: fixed;
      top: 60px;
      right: 0;
      width: 380px;
      height: calc(100vh - 60px);
      background: white;
      border-left: 1px solid #e2e8f0;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      box-shadow: -4px 0 20px rgba(0,0,0,0.1);
    }
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #e2e8f0;
    }
    .panel-header h3 {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
    }
    .panel-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .mark-all-btn {
      background: none;
      border: none;
      font-size: 13px;
      color: #1BB8A8;
      cursor: pointer;
      font-weight: 500;
    }
    .mark-all-btn:hover { text-decoration: underline; }
    .close-btn {
      background: none;
      border: none;
      font-size: 18px;
      color: #718096;
      cursor: pointer;
      padding: 0 4px;
    }
    .panel-body {
      flex: 1;
      overflow-y: auto;
    }
    .notif-item {
      display: flex;
      gap: 12px;
      padding: 14px 20px;
      border-bottom: 1px solid #f7fafc;
      cursor: pointer;
      position: relative;
      transition: background 0.1s;
    }
    .notif-item:hover { background: #f9fafb; }
    .notif-item.unread { background: #f0fffe; }
    .notif-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
      background: #ebf8ff;
    }
    .ntype-request_received, .ntype-estimate_received { background: #ebf8ff; }
    .ntype-estimate_viewed { background: #faf5ff; }
    .ntype-sc_responded, .ntype-sp_responded { background: #e6fffa; }
    .ntype-follow_up_due { background: #fffaf0; }
    .ntype-estimate_revised { background: #fff5f5; }
    .notif-content { flex: 1; min-width: 0; }
    .notif-message {
      font-size: 13px;
      color: #2d3748;
      margin: 0 0 4px 0;
      line-height: 1.4;
    }
    .notif-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: #718096;
    }
    .notif-project { font-weight: 500; color: #4a5568; }
    .unread-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #1BB8A8;
      flex-shrink: 0;
      margin-top: 4px;
    }
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #718096;
    }
  `]
})
export class NotificationPanelComponent {
  open = input.required<boolean>();
  closePanel = output<void>();

  private notifService = inject(NotificationService);

  typeIcon: Record<string, string> = {
    request_received: '📋',
    estimate_viewed: '👁',
    sc_responded: '💬',
    follow_up_due: '⏰',
    estimate_received: '📩',
    estimate_revised: '🔄',
    sp_responded: '💬'
  };

  notifications() {
    return this.notifService.getNotifications();
  }

  markRead(id: string) {
    this.notifService.markRead(id);
  }

  markAllRead() {
    this.notifService.markAllRead();
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
}
