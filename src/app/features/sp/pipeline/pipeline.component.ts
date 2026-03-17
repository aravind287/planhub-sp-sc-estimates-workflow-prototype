import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EstimateService } from '../../../core/services/estimate.service';
import { Estimate, EstimateStatus, EstimateSubmission } from '../../../core/models/estimate.model';

interface ProjectGroup {
  projectId: string;
  projectName: string;
  bidDueDate: string;
  estimates: Estimate[];
}

@Component({
  selector: 'app-pipeline',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="pipeline-page">
      <!-- Page Header -->
      <div class="page-header-row">
        <div class="page-header">
          <h1>Bids</h1>
          <p>Manage your GC bids and material estimates in one place</p>
        </div>
      </div>

      <!-- Type Filter Chips -->
      <div class="filter-chips-row">
        <button class="filter-chip" [class.active]="typeFilter() === 'all'" (click)="typeFilter.set('all')">
          All <span class="chip-count">{{ allEstimates().length }}</span>
        </button>
        <button class="filter-chip" [class.active]="typeFilter() === 'gc_bid'" (click)="typeFilter.set('gc_bid')">
          GC Bids <span class="chip-count">{{ gcBidCount() }}</span>
        </button>
        <button class="filter-chip" [class.active]="typeFilter() === 'material_estimate'" (click)="typeFilter.set('material_estimate')">
          Material Estimates <span class="chip-count">{{ materialEstimateCount() }}</span>
        </button>
      </div>

      <!-- Search & Filters Row -->
      <div class="filters-row">
        <div class="ph-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Search project, company..." [value]="searchQuery()" (input)="searchQuery.set($any($event.target).value)" />
        </div>
        <select class="ph-select" [value]="submitterFilter()" (change)="submitterFilter.set($any($event.target).value)">
          <option value="">Submitter ▾</option>
          @for (s of submitterOptions(); track s) {
            <option [value]="s">{{ s }}</option>
          }
        </select>
      </div>

      <!-- Grouped Table -->
      <div class="ph-card table-card">
        <table class="ph-table">
          <thead>
            <tr class="main-header">
              <td colspan="8">
                <div class="main-header-inner">
                  <button class="mh-sort-btn mh-project" (click)="setSort('name')">
                    Project Name
                    <span class="sort-icon">{{ sortField() === 'name' ? (sortDir() === 'asc' ? '↑' : '↓') : '↕' }}</span>
                  </button>
                  <button class="mh-sort-btn mh-date" (click)="setSort('date')">
                    Bid Date
                    <span class="sort-icon">{{ sortField() === 'date' ? (sortDir() === 'asc' ? '↑' : '↓') : '↕' }}</span>
                  </button>
                  <span class="mh-bids">Bids</span>
                </div>
              </td>
            </tr>
          </thead>
          <tbody>
            @for (group of projectGroups(); track group.projectId) {
              <!-- Project Accordion Row -->
              <tr class="project-row" (click)="toggleProject(group.projectId)">
                <td colspan="8" class="pr-cell">
                  <div class="project-row-inner">
                    <div class="pr-left">
                      <span class="expand-icon">{{ isExpanded(group.projectId) ? '▾' : '▸' }}</span>
                      <span class="project-name">{{ group.projectName }}</span>
                    </div>
                    <span class="pr-date">{{ formatDate(group.bidDueDate) }}</span>
                    <span class="pr-count">{{ group.estimates.length }} {{ group.estimates.length === 1 ? 'bid' : 'bids' }}</span>
                  </div>
                </td>
              </tr>

              @if (isExpanded(group.projectId)) {
                <!-- Per-project teal sub-header (8 cols) -->
                <tr class="sub-header">
                  <th class="col-type">Type</th>
                  <th class="col-initiated">Bid Initiated</th>
                  <th class="col-submitter">Submitter</th>
                  <th class="col-contractors">Contractors</th>
                  <th class="col-trade">Trade</th>
                  <th class="col-submitted-date">Submitted Date</th>
                  <th class="col-amount">Amount</th>
                  <th class="col-actions">Bid Activity</th>
                </tr>

                <!-- Estimate Rows -->
                @for (est of group.estimates; track est.id) {
                  <tr class="estimate-row" (click)="download(est)">
                    <td class="col-type">
                      <span class="type-badge" [class.gc-bid]="est.type === 'gc_bid'" [class.material-estimate]="est.type === 'material_estimate'">
                        {{ est.type === 'gc_bid' ? 'GC Bid' : 'Material Est.' }}
                      </span>
                    </td>
                    <td class="col-initiated">
                      <span class="initiated-date">{{ est.submittedDate ? formatDate(est.submittedDate) : '—' }}</span>
                    </td>
                    <td class="col-submitter">
                      <span class="submitted-by">{{ est.submittedBy || '—' }}</span>
                    </td>
                    <td class="col-contractors">
                      @if (est.type === 'gc_bid') {
                        <span class="company-name">{{ est.gcCompany }}</span>
                      } @else {
                        <a class="subs-pill" [routerLink]="['/sp/projects', est.projectId, 'subcontractors']" (click)="$event.stopPropagation()" [title]="getSubNames(est)">
                          {{ getSubCount(est) }} {{ getSubCount(est) === 1 ? 'sub' : 'subs' }}
                        </a>
                      }
                    </td>
                    <td class="col-trade">
                      @if (est.type === 'gc_bid') {
                        <span class="trade-label">{{ est.trade }}</span>
                      } @else {
                        <span class="text-secondary">—</span>
                      }
                    </td>
                    <td class="col-submitted-date">
                      <span class="submitted-date">{{ est.submittedDate ? formatDate(est.submittedDate) : '—' }}</span>
                    </td>
                    <td class="col-amount">
                      @if (est.type === 'gc_bid' && est.amount) {
                        <span class="amount">{{ formatCurrency(est.amount) }}</span>
                      } @else {
                        <span class="text-secondary">—</span>
                      }
                    </td>
                    <td class="col-actions" (click)="$event.stopPropagation()">
                      <div class="action-btns">
                        <a class="action-btn" routerLink="/sp/estimates/create" [queryParams]="{fromProject: est.projectId}" (click)="$event.stopPropagation()">Share Estimate</a>
                        <button
                          class="action-btn nudge-btn"
                          [class.nudge-exhausted]="!canNudge(est.id)"
                          [disabled]="!canNudge(est.id)"
                          (click)="openNudge(est)"
                          [title]="nudgeTitle(est)">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          @if (getNudgeCount(est.id) > 0) {
                            <span class="nudge-count-badge">{{ getNudgeCount(est.id) }}/3</span>
                          }
                        </button>
                        <button class="action-btn" (click)="download(est)">↓</button>
                      </div>
                    </td>
                  </tr>
                }
              }
            }
            @if (projectGroups().length === 0) {
              <tr>
                <td colspan="8" class="empty-row">No estimates found matching current filters.</td>
              </tr>
            }
          </tbody>
        </table>

        <div class="table-footer">
          <span class="footer-info">{{ projectGroups().length }} projects · {{ filteredEstimates().length }} estimates</span>
        </div>
      </div>
      <!-- Nudge Modal -->
      @if (nudgeEst()) {
        <div class="modal-backdrop" (click)="closeNudge()">
          <div class="nudge-modal" (click)="$event.stopPropagation()">
            <div class="nudge-modal-header">
              <span class="nudge-modal-title">Send Reminder</span>
              <button class="nudge-close" (click)="closeNudge()">✕</button>
            </div>
            <div class="nudge-modal-body">
              <div class="nudge-target-info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1BB8A8" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                @if (nudgeEst()!.type === 'gc_bid') {
                  <span>Sending to <strong>{{ nudgeEst()!.gcCompany }}</strong></span>
                } @else {
                  <span>Sending to <strong>{{ getSubCount(nudgeEst()!) }} {{ getSubCount(nudgeEst()!) === 1 ? 'sub' : 'subs' }}</strong></span>
                }
              </div>
              <div class="nudge-estimate-label">{{ nudgeEst()!.trade }} · {{ nudgeEst()!.projectName }}</div>
              <label class="nudge-msg-label">Message</label>
              <textarea class="nudge-textarea" [value]="nudgeMessage()" (input)="nudgeMessage.set($any($event.target).value)" rows="5"></textarea>
            </div>
            <div class="nudge-modal-footer">
              <button class="btn-outline" (click)="closeNudge()">Cancel</button>
              <button class="btn-primary" (click)="sendNudge()">Send Reminder</button>
            </div>
          </div>
        </div>
      }

      <!-- Toast -->
      @if (toastVisible()) {
        <div class="nudge-toast">{{ toastMsg() }}</div>
      }
    </div>
  `,
  styles: [`
    .pipeline-page { padding: 0; }
    .page-header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .new-btn { text-decoration: none; }
    .filter-chips-row {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .chip-count {
      background: rgba(255,255,255,0.3);
      border-radius: 10px;
      padding: 1px 6px;
      font-size: 11px;
    }
    .filter-chip.active .chip-count { background: rgba(255,255,255,0.3); }
    .filter-chip:not(.active) .chip-count { background: #edf2f7; color: #4a5568; }
    .filters-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin-bottom: 16px;
    }
    .table-card { padding: 0; overflow: hidden; }

    /* Main outer header — full-width flex, decoupled from column grid */
    .main-header td {
      background: #f1f5f9 !important;
      border-bottom: 1px solid #e2e8f0 !important;
      padding: 0 !important;
    }
    .main-header-inner {
      display: flex;
      align-items: center;
      padding: 9px 16px;
      gap: 0;
    }
    .mh-sort-btn {
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      padding: 0;
    }
    .mh-sort-btn:hover { color: #1BB8A8; }
    .mh-sort-btn.mh-project { flex: 1; }
    .mh-sort-btn.mh-date { width: 160px; }
    .sort-icon { font-size: 10px; opacity: 0.6; }
    .mh-bids {
      width: 80px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      text-align: right;
    }

    /* Per-project teal sub-header (8 cols) */
    .sub-header th {
      background: #1BB8A8 !important;
      color: white !important;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 7px 16px;
      border: none !important;
    }

    /* Column widths (8 cols) */
    .col-type           { width: 100px; }
    .col-initiated      { width: 120px; }
    .col-submitter      { width: 120px; }
    .col-contractors    { width: 150px; }
    .col-trade          { min-width: 110px; }
    .col-submitted-date { width: 120px; }
    .col-amount         { width: 100px; }
    .col-actions        { width: 130px; }

    /* Project accordion row */
    .project-row { cursor: pointer; user-select: none; }
    .project-row td {
      background: #f7fafc !important;
      border-top: 1px solid #e2e8f0 !important;
      border-bottom: 1px solid #e2e8f0 !important;
      padding: 0 !important;
    }
    .project-row:hover td { background: #edf2f7 !important; }
    .pr-cell {
      border-left: 3px solid #1BB8A8 !important;
    }
    .project-row-inner {
      display: flex;
      align-items: center;
      padding: 14px 16px;
      gap: 0;
    }
    .pr-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }
    .expand-icon {
      color: #4a5568;
      font-size: 12px;
      flex-shrink: 0;
    }
    .project-name {
      font-weight: 600;
      font-size: 14px;
      color: #2d3748;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .pr-date {
      width: 160px;
      font-size: 13px;
      color: #718096;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .pr-count {
      width: 80px;
      font-size: 13px;
      color: #718096;
      white-space: nowrap;
      flex-shrink: 0;
      text-align: right;
    }

    /* Estimate rows */
    .estimate-row { background: white; cursor: pointer; }
    .estimate-row:hover { background: #f7fafc; }
    .estimate-row td { padding: 9px 16px !important; border-bottom: 1px solid #f0f4f7 !important; }

    .initiated-date { font-size: 13px; color: #4a5568; }
    .submitted-date { font-size: 13px; color: #4a5568; }

    /* Type badge */
    .type-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }
    .type-badge.gc-bid { background: #e9f5fe; color: #2b6cb0; }
    .type-badge.material-estimate { background: #fef9e6; color: #b7791f; }

    /* Trade */
    .trade-label { font-size: 13px; font-weight: 500; color: #2d3748; }

    /* Shared With */
    .company-name { font-weight: 500; color: #2d3748; font-size: 13px; white-space: nowrap; }
    .subs-pill {
      display: inline-block;
      padding: 3px 10px;
      background: #e6f7f6;
      color: #1BB8A8;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      border: 1px solid #b2e8e4;
      white-space: nowrap;
    }
    .subs-pill:hover { background: #1BB8A8; color: white; }

    /* Submitter */
    .submitted-by { font-size: 13px; color: #2d3748; }

    /* Amount */
    .amount { font-weight: 600; color: #2d3748; font-size: 13px; }
    .text-secondary { color: #a0aec0; }

    /* Actions */
    .action-btns { display: flex; gap: 4px; }
    .action-btn {
      padding: 4px 10px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      background: white;
      color: #4a5568;
      text-decoration: none;
      white-space: nowrap;
    }
    .action-btn:hover { background: #f7fafc; color: #1BB8A8; border-color: #1BB8A8; }

    .empty-row {
      text-align: center;
      color: #718096;
      padding: 40px !important;
    }
    .table-footer {
      padding: 12px 20px;
      border-top: 1px solid #e2e8f0;
      background: #f7fafc;
    }
    .footer-info { font-size: 12px; color: #718096; }
    .nudge-btn { color: #1BB8A8; border-color: #b2e8e4; padding: 4px 8px; display: inline-flex; align-items: center; gap: 4px; }
    .nudge-btn:hover:not(:disabled) { background: #e6f7f6; }
    .nudge-exhausted { color: #a0aec0 !important; border-color: #e2e8f0 !important; cursor: not-allowed !important; }
    .nudge-count-badge { font-size: 10px; font-weight: 600; }
    .modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 200;
      display: flex; align-items: center; justify-content: center;
    }
    .nudge-modal {
      background: white;
      border-radius: 8px;
      width: 440px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      overflow: hidden;
    }
    .nudge-modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #e2e8f0;
    }
    .nudge-modal-title { font-size: 15px; font-weight: 600; color: #2d3748; }
    .nudge-close { background: none; border: none; font-size: 18px; cursor: pointer; color: #718096; }
    .nudge-modal-body { padding: 20px; }
    .nudge-target-info {
      display: flex; align-items: center; gap: 8px;
      font-size: 14px; color: #2d3748;
      margin-bottom: 4px;
    }
    .nudge-estimate-label { font-size: 12px; color: #718096; margin-bottom: 16px; }
    .nudge-msg-label { display: block; font-size: 12px; font-weight: 600; color: #4a5568; margin-bottom: 6px; }
    .nudge-textarea {
      width: 100%; box-sizing: border-box;
      border: 1px solid #e2e8f0; border-radius: 6px;
      padding: 10px 12px; font-size: 13px; color: #2d3748;
      resize: vertical; font-family: inherit; line-height: 1.5;
    }
    .nudge-textarea:focus { outline: none; border-color: #1BB8A8; }
    .nudge-modal-footer {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 16px 20px;
      border-top: 1px solid #e2e8f0;
    }
    .nudge-toast {
      position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
      background: #1a2e35; color: white;
      padding: 12px 24px; border-radius: 8px;
      font-size: 14px; font-weight: 500;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      z-index: 300;
      animation: slideUp 0.2s ease;
    }
    @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
  `]
})
export class PipelineComponent implements OnInit {
  private estimateService = inject(EstimateService);

  allEstimates = signal<Estimate[]>([]);
  typeFilter = signal<'all' | 'gc_bid' | 'material_estimate'>('all');
  searchQuery = signal('');
  submitterFilter = signal('');
  expandedProjects = signal<Set<string>>(new Set());
  sortField = signal<'name' | 'date' | null>(null);
  sortDir = signal<'asc' | 'desc'>('asc');

  gcBidCount = computed(() => this.allEstimates().filter(e => e.type === 'gc_bid').length);
  materialEstimateCount = computed(() => this.allEstimates().filter(e => e.type === 'material_estimate').length);

  submitterOptions = computed(() => {
    const names = this.allEstimates().map(e => e.submittedBy).filter((s): s is string => !!s);
    return [...new Set(names)].sort();
  });

  filteredEstimates = computed(() => {
    let result = this.allEstimates();
    if (this.typeFilter() !== 'all') result = result.filter(e => e.type === this.typeFilter());
    if (this.searchQuery()) {
      const q = this.searchQuery().toLowerCase();
      result = result.filter(e =>
        e.projectName.toLowerCase().includes(q) ||
        (e.gcCompany || '').toLowerCase().includes(q) ||
        (e.submissions?.some(s => s.subcontractorName.toLowerCase().includes(q)) ?? false)
      );
    }
    if (this.submitterFilter()) result = result.filter(e => e.submittedBy === this.submitterFilter());
    return result;
  });

  projectGroups = computed((): ProjectGroup[] => {
    const map = new Map<string, ProjectGroup>();
    for (const est of this.filteredEstimates()) {
      if (!map.has(est.projectId)) {
        map.set(est.projectId, { projectId: est.projectId, projectName: est.projectName, bidDueDate: est.bidDueDate, estimates: [] });
      }
      map.get(est.projectId)!.estimates.push(est);
    }
    let groups = Array.from(map.values());
    const field = this.sortField();
    if (field) {
      const dir = this.sortDir() === 'asc' ? 1 : -1;
      groups = groups.sort((a, b) => {
        if (field === 'name') return dir * a.projectName.localeCompare(b.projectName);
        return dir * (new Date(a.bidDueDate).getTime() - new Date(b.bidDueDate).getTime());
      });
    }
    return groups;
  });

  ngOnInit() {
    this.estimateService.getAll().subscribe(estimates => {
      this.allEstimates.set(estimates);
      // expand all projects by default
      const ids = new Set(estimates.map(e => e.projectId));
      this.expandedProjects.set(ids);
    });
  }

  setSort(field: 'name' | 'date') {
    if (this.sortField() === field) {
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }
  }

  toggleProject(projectId: string) {
    const current = new Set(this.expandedProjects());
    if (current.has(projectId)) current.delete(projectId);
    else current.add(projectId);
    this.expandedProjects.set(current);
  }

  isExpanded(projectId: string): boolean {
    return this.expandedProjects().has(projectId);
  }

  getTotalSubs(estimates: Estimate[]): number {
    return estimates.filter(e => e.type === 'material_estimate').reduce((sum, e) => sum + this.getSubCount(e), 0);
  }

  nudgeEst = signal<Estimate | null>(null);
  nudgeMessage = signal('');
  toastMsg = signal('');
  toastVisible = signal(false);
  nudgeCounts = signal<Map<string, number>>(new Map());

  readonly NUDGE_LIMIT = 3;

  getNudgeCount(estId: string): number {
    return this.nudgeCounts().get(estId) ?? 0;
  }

  canNudge(estId: string): boolean {
    return this.getNudgeCount(estId) < this.NUDGE_LIMIT;
  }

  nudgeTitle(est: Estimate): string {
    const count = this.getNudgeCount(est.id);
    if (count >= this.NUDGE_LIMIT) return `Reminder limit reached (${this.NUDGE_LIMIT}/${this.NUDGE_LIMIT})`;
    const remaining = this.NUDGE_LIMIT - count;
    const recipient = est.type === 'gc_bid' ? est.gcCompany! : `${this.getSubCount(est)} ${this.getSubCount(est) === 1 ? 'sub' : 'subs'}`;
    return `Send Bid Follow Up · ${recipient} · ${remaining} reminder${remaining === 1 ? '' : 's'} remaining`;
  }

  openNudge(est: Estimate) {
    if (!this.canNudge(est.id)) return;
    this.nudgeEst.set(est);
    const type = est.type === 'gc_bid' ? 'bid' : 'material estimate';
    const recipient = est.type === 'gc_bid' ? est.gcCompany : `your team`;
    this.nudgeMessage.set(`Hi ${recipient}, just following up on the ${type} we shared for ${est.projectName}. Please let us know if you have any questions or need to discuss the scope — we're happy to help. Looking forward to hearing from you!`);
  }

  closeNudge() { this.nudgeEst.set(null); }

  sendNudge() {
    const est = this.nudgeEst()!;
    const counts = new Map(this.nudgeCounts());
    counts.set(est.id, (counts.get(est.id) ?? 0) + 1);
    this.nudgeCounts.set(counts);
    this.nudgeEst.set(null);
    const recipient = est.type === 'gc_bid'
      ? est.gcCompany!
      : `${this.getSubCount(est)} ${this.getSubCount(est) === 1 ? 'sub' : 'subs'}`;
    this.toastMsg.set(`Reminder sent to ${recipient}`);
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 3000);
  }

  private readonly statusPriority: EstimateStatus[] = ['awarded', 'negotiating', 'replied', 'viewed', 'sent', 'preparing', 'requested', 'lost', 'expired', 'archived'];

  getSubCount(est: Estimate): number {
    return est.submissions?.length ?? (est.subcontractorId ? 1 : 0);
  }

  getSubNames(est: Estimate): string {
    if (est.submissions?.length) return est.submissions.map(s => s.subcontractorName).join(', ');
    return est.subcontractorName || '';
  }

  getRollupStatus(est: Estimate): EstimateStatus {
    const subs = est.submissions;
    if (!subs?.length) return est.status;
    for (const s of this.statusPriority) {
      if (subs.some(sub => sub.status === s)) return s;
    }
    return est.status;
  }

  getStatusSummary(est: Estimate): string {
    const subs = est.submissions;
    if (!subs || subs.length <= 1) return '';
    const counts = new Map<string, number>();
    for (const sub of subs) counts.set(sub.status, (counts.get(sub.status) ?? 0) + 1);
    return Array.from(counts.entries()).map(([s, n]) => `${n} ${s}`).join(' · ');
  }

  hasOverdueFollowUp(est: Estimate): boolean {
    return est.submissions?.some(s => s.followUpOverdue) ?? false;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  navigateToDetail(id: string) {
    window.location.href = `/sp/estimates/${id}`;
  }

  resend(est: Estimate) {
    alert(`Resending estimate to ${est.subcontractorName || est.gcCompany}`);
  }

  download(est: Estimate) {
    alert(`Downloading estimate PDF for ${est.projectName}`);
  }
}
