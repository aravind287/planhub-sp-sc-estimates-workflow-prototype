import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EstimateService } from '../../../core/services/estimate.service';
import { ProjectService } from '../../../core/services/project.service';
import { Estimate, EstimateStatus } from '../../../core/models/estimate.model';
import { Project } from '../../../core/models/project.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ActivityTimelineComponent } from '../../../shared/components/activity-timeline/activity-timeline.component';

@Component({
  selector: 'app-estimate-detail',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent, ActivityTimelineComponent],
  template: `
    @if (estimate()) {
      <div class="detail-layout">
        <!-- Left Column -->
        <div class="detail-left">
          @if (fromProjectId()) {
            <a [routerLink]="['/sp/projects', fromProjectId(), 'subcontractors']" class="back-link">← Project</a>
          } @else {
            <a routerLink="/sp/pipeline" class="back-link">← Pipeline</a>
          }

          <!-- Header -->
          <div class="estimate-header">
            <div class="header-top">
              <span class="type-badge" [class.gc-bid]="estimate()!.type === 'gc_bid'" [class.material-estimate]="estimate()!.type === 'material_estimate'">
                {{ estimate()!.type === 'gc_bid' ? 'GC Bid' : 'Material Estimate' }}
              </span>
              <app-status-badge [status]="estimate()!.status" />
            </div>
            <h1>{{ estimate()!.projectName }}</h1>
            <p class="company-subtitle">
              {{ estimate()!.type === 'gc_bid' ? estimate()!.gcCompany : estimate()!.subcontractorName }}
            </p>
          </div>

          <!-- Status Stepper -->
          <div class="status-stepper">
            @for (step of statusSteps; track step.key) {
              <div class="step-item" [class.completed]="isStepCompleted(step.key)" [class.current]="estimate()!.status === step.key">
                <div class="step-dot"></div>
                <span class="step-label">{{ step.label }}</span>
              </div>
              @if (!$last) {
                <div class="step-line" [class.completed]="isStepCompleted(step.key)"></div>
              }
            }
          </div>

          <!-- Details Card -->
          <div class="ph-card details-card">
            <h3 class="card-title">Estimate Details</h3>
            <div class="details-grid">
              @if (estimate()!.materialScope) {
                <div class="detail-item full-width">
                  <span class="detail-label">Material Scope</span>
                  <span class="detail-value">{{ estimate()!.materialScope }}</span>
                </div>
              }
              <div class="detail-item">
                <span class="detail-label">Trade</span>
                <span class="detail-value">{{ estimate()!.trade }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Amount</span>
                <span class="detail-value amount">
                  {{ estimate()!.amount ? formatCurrency(estimate()!.amount!) : 'Not set' }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Bid Due Date</span>
                <span class="detail-value">{{ formatDate(estimate()!.bidDueDate) }}</span>
              </div>
              @if (estimate()!.submittedDate) {
                <div class="detail-item">
                  <span class="detail-label">Submitted Date</span>
                  <span class="detail-value">{{ formatDate(estimate()!.submittedDate!) }}</span>
                </div>
              }
              <div class="detail-item">
                <span class="detail-label">Submitted By</span>
                <span class="detail-value">{{ estimate()!.submittedBy }}</span>
              </div>
              @if (estimate()!.assignedTo) {
                <div class="detail-item">
                  <span class="detail-label">Assigned To</span>
                  <span class="detail-value">{{ estimate()!.assignedTo }}</span>
                </div>
              }
              @if (estimate()!.notes) {
                <div class="detail-item full-width">
                  <span class="detail-label">Notes</span>
                  <span class="detail-value">{{ estimate()!.notes }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Alternates Section -->
          @if (estimate()!.hasAlternates && estimate()!.alternateOptions?.length) {
            <div class="ph-card alt-card">
              <h3 class="card-title">Alternate Options</h3>
              <ul class="alt-list">
                @for (alt of estimate()!.alternateOptions!; track alt) {
                  <li class="alt-item">
                    <span class="alt-icon">🔄</span>
                    {{ alt }}
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Attachments -->
          @if (estimate()!.hasAttachments) {
            <div class="ph-card attach-card">
              <h3 class="card-title">Attachments</h3>
              <div class="attach-list">
                <div class="attach-item">
                  <span class="attach-icon">📄</span>
                  <span class="attach-name">Estimate_{{ estimate()!.id }}.pdf</span>
                  <button class="attach-download">↓ Download</button>
                </div>
                <div class="attach-item">
                  <span class="attach-icon">📋</span>
                  <span class="attach-name">Material_Scope_Details.xlsx</span>
                  <button class="attach-download">↓ Download</button>
                </div>
              </div>
            </div>
          }

          <!-- Activity Timeline -->
          <div class="ph-card activity-card">
            <h3 class="card-title">Activity Timeline</h3>
            <app-activity-timeline [activities]="estimate()!.activity" />
          </div>
        </div>

        <!-- Right Column -->
        <div class="detail-right">
          <!-- Status Update Card -->
          <div class="ph-card side-card">
            <h4 class="side-card-title">Update Status</h4>
            <select class="ph-select full-width" [value]="newStatus()" (change)="newStatus.set($any($event.target).value)">
              <option value="requested">Requested</option>
              <option value="preparing">Preparing</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="replied">Replied</option>
              <option value="negotiating">Negotiating</option>
              <option value="awarded">Awarded</option>
              <option value="lost">Lost</option>
              <option value="expired">Expired</option>
              <option value="archived">Archived</option>
            </select>
            <button class="btn-primary full-width mt-8" (click)="updateStatus()">Update Status</button>
          </div>

          <!-- Follow-up Card -->
          <div class="ph-card side-card">
            <h4 class="side-card-title">Follow-up Reminder</h4>
            @if (estimate()!.followUpOverdue) {
              <div class="overdue-alert">⏰ Follow-up overdue!</div>
            }
            <input type="date" class="ph-input full-width" [value]="followUpDate()" (change)="followUpDate.set($any($event.target).value)" />
            <button class="btn-outline full-width mt-8" (click)="setReminder()">Set Reminder</button>
          </div>

          <!-- Win/Loss Card -->
          @if (['negotiating', 'awarded', 'lost'].includes(estimate()!.status)) {
            <div class="ph-card side-card win-loss-card">
              <h4 class="side-card-title">Win / Loss</h4>
              @if (estimate()!.status === 'awarded') {
                <div class="won-banner">✅ Won at {{ estimate()!.awardedValue ? formatCurrency(estimate()!.awardedValue!) : 'TBD' }}</div>
              }
              @if (estimate()!.status === 'lost') {
                <div class="lost-banner">❌ Lost — {{ estimate()!.winLossReason }}</div>
                @if (estimate()!.competitorInfo) {
                  <p class="competitor-info">Competitor: {{ estimate()!.competitorInfo }}</p>
                }
              }
              @if (estimate()!.status === 'negotiating') {
                <div class="win-loss-btns">
                  <button class="btn-won" (click)="markWon()">✅ Mark as Won</button>
                  <button class="btn-lost" (click)="markLost()">❌ Mark as Lost</button>
                </div>
                <textarea class="ph-textarea full-width mt-8" placeholder="Win/loss reason..." rows="3" [value]="winLossReason()" (input)="winLossReason.set($any($event.target).value)"></textarea>
                <input type="number" class="ph-input full-width mt-8" placeholder="Awarded value ($)" [value]="awardedValue()" (change)="awardedValue.set(+$any($event.target).value)" />
                <input type="text" class="ph-input full-width mt-8" placeholder="Competitor info..." [value]="competitorInfo()" (input)="competitorInfo.set($any($event.target).value)" />
              }
            </div>
          }

          <!-- Quick Actions -->
          <div class="ph-card side-card">
            <h4 class="side-card-title">Quick Actions</h4>
            <div class="quick-actions">
              <a routerLink="/sp/estimates/create" class="quick-action-btn">✏️ Revise Estimate</a>
              <button class="quick-action-btn" (click)="resend()">📤 Resend</button>
              <button class="quick-action-btn" (click)="downloadPdf()">📄 Download PDF</button>
              <button class="quick-action-btn" (click)="logCall()">📞 Log Call</button>
              <button class="quick-action-btn" (click)="logEmail()">✉️ Log Email</button>
            </div>
          </div>

          <!-- Project Info Card -->
          @if (project()) {
            <div class="ph-card side-card">
              <h4 class="side-card-title">Project Info</h4>
              <div class="proj-info-list">
                <div class="proj-info-row">
                  <span class="pi-label">Project</span>
                  <span class="pi-value">{{ project()!.name }}</span>
                </div>
                <div class="proj-info-row">
                  <span class="pi-label">Location</span>
                  <span class="pi-value">{{ project()!.location }}</span>
                </div>
                <div class="proj-info-row">
                  <span class="pi-label">GC</span>
                  <span class="pi-value">{{ project()!.gcCompany }}</span>
                </div>
                <div class="proj-info-row">
                  <span class="pi-label">Bid Due</span>
                  <span class="pi-value">{{ formatDate(project()!.bidDueDate) }}</span>
                </div>
              </div>
              <a class="ph-link" [routerLink]="['/sp/projects', project()!.id, 'subcontractors']" style="font-size:13px; display:block; margin-top:12px;">
                View all subcontractors →
              </a>
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="loading-state">
        <p>Loading estimate...</p>
      </div>
    }
  `,
  styles: [`
    .detail-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 24px;
      align-items: start;
    }
    .detail-left { display: flex; flex-direction: column; gap: 16px; }
    .detail-right { display: flex; flex-direction: column; gap: 16px; }
    .back-link {
      display: inline-block;
      color: #1BB8A8;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
    }
    .back-link:hover { text-decoration: underline; }
    .estimate-header { }
    .header-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .estimate-header h1 { margin: 0 0 4px; font-size: 22px; font-weight: 700; color: #2d3748; }
    .company-subtitle { margin: 0; font-size: 15px; color: #718096; }

    /* Status Stepper */
    .status-stepper {
      display: flex;
      align-items: center;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px 20px;
      overflow-x: auto;
    }
    .step-item { display: flex; flex-direction: column; align-items: center; gap: 6px; flex-shrink: 0; }
    .step-dot {
      width: 16px; height: 16px;
      border-radius: 50%;
      background: #e2e8f0;
      border: 2px solid #e2e8f0;
    }
    .step-item.completed .step-dot { background: #1BB8A8; border-color: #1BB8A8; }
    .step-item.current .step-dot { background: white; border-color: #1BB8A8; box-shadow: 0 0 0 3px rgba(27,184,168,0.2); }
    .step-label { font-size: 11px; color: #718096; white-space: nowrap; }
    .step-item.current .step-label { color: #1BB8A8; font-weight: 600; }
    .step-item.completed .step-label { color: #1BB8A8; }
    .step-line {
      flex: 1;
      height: 2px;
      background: #e2e8f0;
      margin-bottom: 20px;
      min-width: 20px;
    }
    .step-line.completed { background: #1BB8A8; }

    .card-title { margin: 0 0 16px; font-size: 15px; font-weight: 600; color: #2d3748; }
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .detail-item { display: flex; flex-direction: column; gap: 4px; }
    .detail-item.full-width { grid-column: 1 / -1; }
    .detail-label { font-size: 11px; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 0.05em; }
    .detail-value { font-size: 14px; color: #2d3748; line-height: 1.5; }
    .detail-value.amount { font-size: 18px; font-weight: 700; color: #1BB8A8; }

    .alt-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
    .alt-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #2d3748; padding: 8px 12px; background: #f7fafc; border-radius: 6px; }

    .attach-list { display: flex; flex-direction: column; gap: 8px; }
    .attach-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f7fafc; border-radius: 6px; }
    .attach-icon { font-size: 18px; }
    .attach-name { flex: 1; font-size: 13px; color: #2d3748; }
    .attach-download { background: none; border: none; color: #1BB8A8; font-size: 12px; cursor: pointer; font-weight: 500; }

    .side-card-title { margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #2d3748; }
    .full-width { width: 100%; box-sizing: border-box; }
    .mt-8 { margin-top: 8px; }

    .ph-input {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 14px;
      color: #2d3748;
      outline: none;
    }
    .ph-input:focus { border-color: #1BB8A8; }
    .ph-textarea {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 14px;
      color: #2d3748;
      resize: vertical;
      font-family: inherit;
      outline: none;
    }
    .ph-select { border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; font-size: 14px; background: white; color: #2d3748; outline: none; }

    .overdue-alert {
      background: #fff5f5;
      color: #c53030;
      border: 1px solid #fed7d7;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 10px;
    }

    .win-loss-btns { display: flex; gap: 8px; }
    .btn-won { flex: 1; padding: 8px 12px; background: #f0fff4; color: #276749; border: 1px solid #9ae6b4; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; }
    .btn-won:hover { background: #c6f6d5; }
    .btn-lost { flex: 1; padding: 8px 12px; background: #fff5f5; color: #c53030; border: 1px solid #fed7d7; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; }
    .btn-lost:hover { background: #fed7d7; }

    .won-banner { background: #f0fff4; color: #276749; border: 1px solid #9ae6b4; border-radius: 6px; padding: 10px 14px; font-size: 14px; font-weight: 600; }
    .lost-banner { background: #fff5f5; color: #c53030; border: 1px solid #fed7d7; border-radius: 6px; padding: 10px 14px; font-size: 14px; font-weight: 600; }
    .competitor-info { font-size: 13px; color: #718096; margin: 8px 0 0 0; }

    .quick-actions { display: flex; flex-direction: column; gap: 6px; }
    .quick-action-btn {
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: white;
      color: #4a5568;
      font-size: 13px;
      cursor: pointer;
      text-align: left;
      text-decoration: none;
      display: block;
    }
    .quick-action-btn:hover { background: #f7fafc; color: #1BB8A8; border-color: #1BB8A8; }

    .proj-info-list { display: flex; flex-direction: column; gap: 10px; }
    .proj-info-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .pi-label { font-size: 12px; color: #718096; flex-shrink: 0; }
    .pi-value { font-size: 13px; color: #2d3748; text-align: right; }

    .loading-state { text-align: center; padding: 60px; color: #718096; }
  `]
})
export class EstimateDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private estimateService = inject(EstimateService);
  private projectService = inject(ProjectService);

  fromProjectId = signal<string | null>(null);
  estimate = signal<Estimate | undefined>(undefined);
  project = signal<Project | undefined>(undefined);
  newStatus = signal<EstimateStatus>('requested');
  followUpDate = signal('');
  winLossReason = signal('');
  awardedValue = signal(0);
  competitorInfo = signal('');

  statusSteps = [
    { key: 'requested', label: 'Requested' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'sent', label: 'Sent' },
    { key: 'viewed', label: 'Viewed' },
    { key: 'replied', label: 'Replied' },
    { key: 'negotiating', label: 'Negotiating' },
    { key: 'awarded', label: 'Awarded/Lost' }
  ];

  private stepOrder = ['requested', 'preparing', 'sent', 'viewed', 'replied', 'negotiating', 'awarded', 'lost'];

  ngOnInit() {
    this.fromProjectId.set(this.route.snapshot.queryParamMap.get('fromProject'));
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.estimateService.getById(id).subscribe(est => {
      if (est) {
        this.estimate.set(est);
        this.newStatus.set(est.status);
        this.followUpDate.set(est.followUpDate || '');
        this.winLossReason.set(est.winLossReason || '');
        this.awardedValue.set(est.awardedValue || 0);
        this.competitorInfo.set(est.competitorInfo || '');
        this.projectService.getById(est.projectId).subscribe(p => this.project.set(p));
      }
    });
  }

  isStepCompleted(key: string): boolean {
    const current = this.estimate()?.status || 'requested';
    const currentIdx = this.stepOrder.indexOf(current);
    const stepIdx = this.stepOrder.indexOf(key);
    return stepIdx < currentIdx;
  }

  updateStatus() {
    const est = this.estimate();
    if (est) {
      this.estimateService.updateStatus(est.id, this.newStatus()).subscribe(updated => {
        if (updated) this.estimate.set(updated);
      });
    }
  }

  setReminder() {
    alert(`Reminder set for ${this.followUpDate()}`);
  }

  markWon() {
    this.estimateService.updateStatus(this.estimate()!.id, 'awarded').subscribe(updated => {
      if (updated) this.estimate.set(updated);
    });
  }

  markLost() {
    this.estimateService.updateStatus(this.estimate()!.id, 'lost').subscribe(updated => {
      if (updated) this.estimate.set(updated);
    });
  }

  resend() { alert('Estimate resent successfully.'); }
  downloadPdf() { alert('Downloading PDF...'); }
  logCall() { alert('Call logged.'); }
  logEmail() { alert('Email logged.'); }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
