import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EstimateService } from '../../../core/services/estimate.service';
import { Estimate } from '../../../core/models/estimate.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface ComparisonColumn {
  estimate: Estimate;
  isPreferred: boolean;
  isExcluded: boolean;
}

@Component({
  selector: 'app-estimate-comparison',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent],
  template: `
    <div class="comparison-page">
      <!-- Header -->
      <div class="page-header">
        <a routerLink="/sc/dashboard" class="back-link">← Dashboard</a>
        <h1>Estimate Comparison</h1>
        <p>Compare supplier estimates side by side to select the best option</p>
      </div>

      <!-- Request Selector -->
      <div class="ph-card request-selector">
        <div class="selector-row">
          <div class="selector-info">
            <span class="selector-label">Comparing estimates for:</span>
            <select class="ph-select" [value]="activeRequest()" (change)="activeRequest.set($any($event.target).value)">
              <option value="req-001">Riverside Commons Phase 2 — Concrete Supply</option>
              <option value="req-002">Sunset Ridge Apartments — Drywall & Insulation</option>
              <option value="req-003">Harbor View Medical Center — HVAC</option>
            </select>
          </div>
          <div class="selector-meta">
            <span class="meta-badge">Due: May 10, 2026</span>
            <span class="meta-badge">{{ columns().length }} suppliers</span>
          </div>
        </div>
      </div>

      @if (columns().length > 0) {
        <!-- Award Banner -->
        @if (preferredEstimate()) {
          <div class="award-banner">
            <span class="award-text">⭐ Preferred supplier selected: <strong>{{ preferredEstimate()!.estimate.subcontractorName }}</strong></span>
            <button class="btn-primary award-btn" (click)="awardToPreferred()">
              Award to {{ preferredEstimate()!.estimate.subcontractorName }} →
            </button>
          </div>
        }

        <!-- Comparison Table -->
        <div class="comparison-wrapper">
          <table class="comparison-table">
            <thead>
              <tr>
                <th class="row-header-cell">Criteria</th>
                @for (col of columns(); track col.estimate.id) {
                  <th class="supplier-col" [class.preferred]="col.isPreferred" [class.excluded]="col.isExcluded">
                    <div class="supplier-header">
                      <div class="sup-logo-lg">
                        {{ (col.estimate.subcontractorName || 'SP').substring(0,2).toUpperCase() }}
                      </div>
                      <div class="sup-header-info">
                        <span class="sup-name">{{ col.estimate.subcontractorName }}</span>
                        <span class="sup-trade">{{ col.estimate.trade }}</span>
                      </div>
                    </div>
                    @if (col.isPreferred) {
                      <div class="preferred-badge">⭐ Preferred</div>
                    }
                    @if (col.isExcluded) {
                      <div class="excluded-badge">✗ Not Selected</div>
                    }
                    <div class="col-actions">
                      <button class="prefer-btn" [class.active]="col.isPreferred" (click)="setPreferred(col)" [disabled]="col.isExcluded">
                        @if (col.isPreferred) { ⭐ Preferred } @else { ☆ Select as Preferred }
                      </button>
                      <button class="exclude-btn" [class.active]="col.isExcluded" (click)="toggleExclude(col)" [disabled]="col.isPreferred">
                        @if (col.isExcluded) { ↩ Restore } @else { ✗ Not Selected }
                      </button>
                    </div>
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              <tr class="highlight-row">
                <td class="row-label">Amount</td>
                @for (col of columns(); track col.estimate.id) {
                  <td [class.preferred-cell]="col.isPreferred" [class.excluded-cell]="col.isExcluded">
                    @if (col.estimate.amount) {
                      <span class="amount-value" [class.best-price]="col.estimate.id === lowestPriceId()">
                        {{ formatCurrency(col.estimate.amount) }}
                        @if (col.estimate.id === lowestPriceId()) {
                          <span class="best-tag">Lowest</span>
                        }
                      </span>
                    } @else {
                      <span class="text-secondary">Not submitted</span>
                    }
                  </td>
                }
              </tr>
              <tr>
                <td class="row-label">Trade / Material</td>
                @for (col of columns(); track col.estimate.id) {
                  <td [class.preferred-cell]="col.isPreferred" [class.excluded-cell]="col.isExcluded">
                    <span class="cell-text">{{ col.estimate.trade }}</span>
                  </td>
                }
              </tr>
              <tr>
                <td class="row-label">Material Scope</td>
                @for (col of columns(); track col.estimate.id) {
                  <td [class.preferred-cell]="col.isPreferred" [class.excluded-cell]="col.isExcluded">
                    <span class="cell-text scope-cell">{{ col.estimate.materialScope }}</span>
                  </td>
                }
              </tr>
              <tr>
                <td class="row-label">Status</td>
                @for (col of columns(); track col.estimate.id) {
                  <td [class.preferred-cell]="col.isPreferred" [class.excluded-cell]="col.isExcluded">
                    <app-status-badge [status]="col.estimate.status" />
                  </td>
                }
              </tr>
              <tr>
                <td class="row-label">Submitted Date</td>
                @for (col of columns(); track col.estimate.id) {
                  <td [class.preferred-cell]="col.isPreferred" [class.excluded-cell]="col.isExcluded">
                    <span class="cell-text">{{ col.estimate.submittedDate ? formatDate(col.estimate.submittedDate) : '—' }}</span>
                  </td>
                }
              </tr>
              <tr>
                <td class="row-label">Includes Alternates</td>
                @for (col of columns(); track col.estimate.id) {
                  <td [class.preferred-cell]="col.isPreferred" [class.excluded-cell]="col.isExcluded">
                    @if (col.estimate.hasAlternates) {
                      <span class="yes-badge">✓ Yes</span>
                    } @else {
                      <span class="no-badge">— No</span>
                    }
                  </td>
                }
              </tr>
              <tr>
                <td class="row-label">Attachments</td>
                @for (col of columns(); track col.estimate.id) {
                  <td [class.preferred-cell]="col.isPreferred" [class.excluded-cell]="col.isExcluded">
                    @if (col.estimate.hasAttachments) {
                      <span class="attach-count">📎 2 files</span>
                    } @else {
                      <span class="text-secondary">None</span>
                    }
                  </td>
                }
              </tr>
              <tr>
                <td class="row-label">Notes</td>
                @for (col of columns(); track col.estimate.id) {
                  <td [class.preferred-cell]="col.isPreferred" [class.excluded-cell]="col.isExcluded">
                    <span class="cell-text notes-cell">{{ col.estimate.notes || '—' }}</span>
                  </td>
                }
              </tr>
              <tr>
                <td class="row-label">View Detail</td>
                @for (col of columns(); track col.estimate.id) {
                  <td [class.preferred-cell]="col.isPreferred" [class.excluded-cell]="col.isExcluded">
                    <a class="action-btn" [routerLink]="['/sp/estimates', col.estimate.id]">View Full Estimate →</a>
                  </td>
                }
              </tr>
            </tbody>
          </table>
        </div>
      } @else {
        <div class="ph-card empty-state">
          <p>No estimates to compare for this request yet.</p>
          <a routerLink="/sc/requests" class="ph-link">Back to My Requests</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .comparison-page { }
    .back-link { display: inline-block; color: #1BB8A8; text-decoration: none; font-size: 13px; margin-bottom: 8px; }
    .back-link:hover { text-decoration: underline; }
    .request-selector { margin-bottom: 16px; }
    .selector-row { display: flex; align-items: center; justify-content: space-between; }
    .selector-info { display: flex; align-items: center; gap: 12px; }
    .selector-label { font-size: 13px; color: #718096; font-weight: 500; }
    .selector-meta { display: flex; gap: 8px; }
    .meta-badge {
      background: #edf2f7; color: #4a5568;
      border-radius: 4px; padding: 4px 10px; font-size: 12px;
    }

    .award-banner {
      background: #f0fff4;
      border: 1px solid #9ae6b4;
      border-radius: 8px;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .award-text { font-size: 14px; color: #276749; }
    .award-btn { text-decoration: none; padding: 8px 16px; }

    .comparison-wrapper { overflow-x: auto; }
    .comparison-table { border-collapse: collapse; min-width: 100%; }
    .comparison-table th, .comparison-table td {
      padding: 14px 16px;
      border: 1px solid #e2e8f0;
      text-align: left;
      vertical-align: top;
      min-width: 200px;
    }
    .row-header-cell {
      background: #f9fafb;
      font-size: 12px;
      font-weight: 600;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      min-width: 160px !important;
      position: sticky;
      left: 0;
      z-index: 2;
    }
    .row-label {
      background: #f9fafb;
      font-size: 13px;
      font-weight: 600;
      color: #4a5568;
      min-width: 160px !important;
      position: sticky;
      left: 0;
      z-index: 1;
    }

    .supplier-col { background: white; }
    .supplier-col.preferred { background: #f0fffe; border-color: #1BB8A8 !important; }
    .supplier-col.excluded { background: #f7f7f7; opacity: 0.6; }

    .supplier-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .sup-logo-lg {
      width: 40px; height: 40px; border-radius: 8px;
      background: #1BB8A8; color: white;
      font-size: 12px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
    .sup-header-info { display: flex; flex-direction: column; gap: 2px; }
    .sup-name { font-size: 14px; font-weight: 600; color: #2d3748; }
    .sup-trade { font-size: 12px; color: #718096; }

    .preferred-badge { background: #1BB8A8; color: white; border-radius: 4px; padding: 3px 8px; font-size: 11px; font-weight: 600; display: inline-block; margin-bottom: 8px; }
    .excluded-badge { background: #718096; color: white; border-radius: 4px; padding: 3px 8px; font-size: 11px; font-weight: 600; display: inline-block; margin-bottom: 8px; }

    .col-actions { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
    .prefer-btn {
      padding: 6px 10px; border: 1px solid #e2e8f0; border-radius: 4px;
      font-size: 12px; cursor: pointer; background: white; color: #4a5568;
      text-align: center;
    }
    .prefer-btn.active { background: #1BB8A8; color: white; border-color: #1BB8A8; }
    .prefer-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .exclude-btn {
      padding: 6px 10px; border: 1px solid #e2e8f0; border-radius: 4px;
      font-size: 12px; cursor: pointer; background: white; color: #4a5568;
      text-align: center;
    }
    .exclude-btn.active { background: #718096; color: white; border-color: #718096; }
    .exclude-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .highlight-row td { background: #fafff9 !important; }
    .preferred-cell { background: #f0fffe !important; }
    .excluded-cell { background: #f7f7f7 !important; opacity: 0.5; }

    .amount-value { font-size: 18px; font-weight: 700; color: #2d3748; display: flex; align-items: center; gap: 8px; }
    .best-price { color: #276749; }
    .best-tag { background: #f0fff4; color: #276749; border: 1px solid #9ae6b4; border-radius: 4px; padding: 2px 6px; font-size: 11px; font-weight: 600; }
    .cell-text { font-size: 13px; color: #4a5568; }
    .scope-cell { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .notes-cell { font-size: 12px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .yes-badge { color: #276749; font-size: 13px; font-weight: 500; }
    .no-badge { color: #a0aec0; font-size: 13px; }
    .attach-count { font-size: 13px; color: #4a5568; }
    .text-secondary { color: #a0aec0; font-size: 13px; }
    .action-btn {
      padding: 6px 12px; border: 1px solid #e2e8f0; border-radius: 4px;
      font-size: 12px; cursor: pointer; background: white; color: #1BB8A8;
      text-decoration: none; display: inline-block;
    }
    .action-btn:hover { background: #f0fffe; border-color: #1BB8A8; }
    .empty-state { text-align: center; padding: 40px; color: #718096; }
  `]
})
export class EstimateComparisonComponent implements OnInit {
  private estimateService = inject(EstimateService);

  activeRequest = signal('req-001');
  columns = signal<ComparisonColumn[]>([]);

  private requestEstimateMap: Record<string, string[]> = {
    'req-001': ['est-005', 'est-001'],
    'req-002': ['est-011', 'est-016'],
    'req-003': ['est-008']
  };

  preferredEstimate = computed(() => this.columns().find(c => c.isPreferred) || null);

  lowestPriceId = computed(() => {
    const withAmounts = this.columns().filter(c => c.estimate.amount && !c.isExcluded);
    if (withAmounts.length === 0) return null;
    return withAmounts.reduce((min, col) => col.estimate.amount! < min.estimate.amount! ? col : min).estimate.id;
  });

  ngOnInit() {
    this.loadEstimates();
    // Watch for activeRequest changes
  }

  loadEstimates() {
    const ids = this.requestEstimateMap[this.activeRequest()] || [];
    this.estimateService.getAll().subscribe(estimates => {
      const cols: ComparisonColumn[] = estimates
        .filter(e => ids.includes(e.id))
        .map(e => ({ estimate: e, isPreferred: false, isExcluded: false }));
      this.columns.set(cols);
    });
  }

  setPreferred(col: ComparisonColumn) {
    this.columns.update(cols => cols.map(c => ({
      ...c,
      isPreferred: c.estimate.id === col.estimate.id ? !c.isPreferred : false
    })));
  }

  toggleExclude(col: ComparisonColumn) {
    this.columns.update(cols => cols.map(c =>
      c.estimate.id === col.estimate.id ? { ...c, isExcluded: !c.isExcluded } : c
    ));
  }

  awardToPreferred() {
    const preferred = this.preferredEstimate();
    if (preferred) {
      alert(`Awarding contract to ${preferred.estimate.subcontractorName} for ${formatCurrency(preferred.estimate.amount || 0)}`);
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}
