import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="status-badge" [class]="'status-' + status()">
      {{ labelMap[status()] || status() }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }
    .status-requested { background: #ebf8ff; color: #2b6cb0; }
    .status-preparing { background: #f7fafc; color: #4a5568; border: 1px solid #e2e8f0; }
    .status-sent { background: #faf5ff; color: #6b46c1; }
    .status-viewed { background: #ebf4ff; color: #3c366b; }
    .status-replied { background: #e6fffa; color: #234e52; }
    .status-negotiating { background: #fffaf0; color: #c05621; }
    .status-awarded { background: #f0fff4; color: #276749; }
    .status-lost { background: #fff5f5; color: #c53030; }
    .status-expired { background: #f7fafc; color: #718096; border: 1px solid #e2e8f0; }
    .status-archived { background: #edf2f7; color: #4a5568; }
  `]
})
export class StatusBadgeComponent {
  status = input.required<string>();

  labelMap: Record<string, string> = {
    requested: 'Requested',
    preparing: 'Preparing',
    sent: 'Sent',
    viewed: 'Viewed',
    replied: 'Replied',
    negotiating: 'Negotiating',
    awarded: 'Awarded',
    lost: 'Lost',
    expired: 'Expired',
    archived: 'Archived'
  };
}
