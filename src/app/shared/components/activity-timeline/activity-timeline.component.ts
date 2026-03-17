import { Component, input, computed } from '@angular/core';
import { ActivityEntry } from '../../../core/models/estimate.model';

@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  template: `
    <div class="timeline">
      @for (entry of activities(); track entry.id) {
        <div class="timeline-item">
          <div class="timeline-icon" [class]="'icon-' + entry.type">
            {{ iconMap[entry.type] }}
          </div>
          <div class="timeline-content">
            <p class="timeline-description">{{ entry.description }}</p>
            <div class="timeline-meta">
              <span class="timeline-user">{{ entry.user }}</span>
              <span class="timeline-dot">·</span>
              <span class="timeline-time">{{ getRelativeTime(entry.timestamp) }}</span>
            </div>
          </div>
        </div>
      }
      @if (activities().length === 0) {
        <p class="no-activity">No activity recorded yet.</p>
      }
    </div>
  `,
  styles: [`
    .timeline {
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    .timeline-item {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      position: relative;
    }
    .timeline-item:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 16px;
      top: 44px;
      bottom: 0;
      width: 2px;
      background: #e2e8f0;
    }
    .timeline-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
      background: #e6fffa;
      color: #234e52;
      z-index: 1;
    }
    .icon-request_created { background: #ebf8ff; color: #2b6cb0; }
    .icon-estimate_submitted { background: #e6fffa; color: #234e52; }
    .icon-estimate_viewed { background: #faf5ff; color: #6b46c1; }
    .icon-follow_up { background: #fffaf0; color: #c05621; }
    .icon-message { background: #ebf8ff; color: #2b6cb0; }
    .icon-status_change { background: #f0fff4; color: #276749; }
    .icon-awarded { background: #f0fff4; color: #276749; }
    .icon-lost { background: #fff5f5; color: #c53030; }
    .icon-note { background: #fffff0; color: #744210; }
    .icon-call { background: #f0fff4; color: #276749; }
    .icon-email { background: #ebf8ff; color: #2b6cb0; }
    .timeline-content {
      flex: 1;
      padding-top: 4px;
    }
    .timeline-description {
      font-size: 14px;
      color: #2d3748;
      margin: 0 0 4px 0;
      line-height: 1.5;
    }
    .timeline-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #718096;
    }
    .timeline-dot { color: #cbd5e0; }
    .timeline-user { font-weight: 500; }
    .no-activity {
      text-align: center;
      color: #718096;
      font-size: 14px;
      padding: 20px 0;
    }
  `]
})
export class ActivityTimelineComponent {
  activities = input.required<ActivityEntry[]>();

  iconMap: Record<string, string> = {
    request_created: '📋',
    estimate_submitted: '📤',
    estimate_viewed: '👁',
    follow_up: '⏰',
    message: '💬',
    status_change: '🔄',
    awarded: '✅',
    lost: '❌',
    note: '📝',
    call: '📞',
    email: '✉'
  };

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
