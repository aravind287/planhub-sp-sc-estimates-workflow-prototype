import { Injectable, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsSignal = signal<Notification[]>([
    {
      id: 'notif-001',
      type: 'request_received',
      message: 'New material estimate request from Pacific Northwest Electric for Top Pot Doughnuts Foundry Cafe TI',
      projectName: 'Top Pot Doughnuts Foundry Cafe TI',
      timestamp: new Date('2026-03-14T09:15:00'),
      read: false,
      estimateId: 'est-001'
    },
    {
      id: 'notif-002',
      type: 'estimate_viewed',
      message: 'Your estimate for Riverside Commons Phase 2 was viewed by Columbia Concrete Supply',
      projectName: 'Riverside Commons Phase 2',
      timestamp: new Date('2026-03-14T08:30:00'),
      read: false,
      estimateId: 'est-005'
    },
    {
      id: 'notif-003',
      type: 'sc_responded',
      message: 'Columbia Concrete Supply replied to your estimate — requesting delivery schedule',
      projectName: 'Riverside Commons Phase 2',
      timestamp: new Date('2026-03-12T14:00:00'),
      read: false,
      estimateId: 'est-005'
    },
    {
      id: 'notif-004',
      type: 'follow_up_due',
      message: 'Follow-up overdue for Cascade Framing Co. on Private test-8-6',
      projectName: 'Private test-8-6',
      timestamp: new Date('2026-03-15T08:00:00'),
      read: false,
      estimateId: 'est-004'
    },
    {
      id: 'notif-005',
      type: 'estimate_received',
      message: 'New estimate received from Pacific Drywall & Insulation for Sunset Ridge Apartments',
      projectName: 'Sunset Ridge Apartments',
      timestamp: new Date('2026-03-11T10:00:00'),
      read: true,
      estimateId: 'est-011'
    },
    {
      id: 'notif-006',
      type: 'sp_responded',
      message: 'Estimate updated for Harbor View Medical Center HVAC — new pricing available',
      projectName: 'Harbor View Medical Center',
      timestamp: new Date('2026-03-09T10:00:00'),
      read: true,
      estimateId: 'est-008'
    },
    {
      id: 'notif-007',
      type: 'estimate_revised',
      message: 'DPR Construction GC bid is in negotiation — check latest notes',
      projectName: 'Harbor View Medical Center',
      timestamp: new Date('2026-03-13T09:00:00'),
      read: true,
      estimateId: 'est-012'
    },
    {
      id: 'notif-008',
      type: 'sc_responded',
      message: 'Puget Sound HVAC requested clarification on OR pressure room specs',
      projectName: 'Harbor View Medical Center',
      timestamp: new Date('2026-03-06T14:30:00'),
      read: true,
      estimateId: 'est-008'
    },
    {
      id: 'notif-009',
      type: 'estimate_received',
      message: 'Estimate for Sunset Ridge Apartments roofing package is awaiting your response',
      projectName: 'Sunset Ridge Apartments',
      timestamp: new Date('2026-03-12T08:00:00'),
      read: false,
      estimateId: 'est-010'
    },
    {
      id: 'notif-010',
      type: 'follow_up_due',
      message: 'Follow-up reminder: Contact Puget Sound HVAC about Harbor View HVAC negotiation',
      projectName: 'Harbor View Medical Center',
      timestamp: new Date('2026-03-18T08:00:00'),
      read: false,
      estimateId: 'est-008'
    }
  ]);

  unreadCount = computed(() => this.notificationsSignal().filter(n => !n.read).length);

  getAll(): Observable<Notification[]> {
    return of(this.notificationsSignal());
  }

  markRead(id: string): void {
    const notifications = this.notificationsSignal();
    const idx = notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      const updated = [...notifications];
      updated[idx] = { ...updated[idx], read: true };
      this.notificationsSignal.set(updated);
    }
  }

  markAllRead(): void {
    this.notificationsSignal.set(this.notificationsSignal().map(n => ({ ...n, read: true })));
  }

  getNotifications(): Notification[] {
    return this.notificationsSignal();
  }
}
