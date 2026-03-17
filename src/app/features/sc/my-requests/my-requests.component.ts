import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EstimateService } from '../../../core/services/estimate.service';
import { Estimate } from '../../../core/models/estimate.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface MaterialRequest {
  id: string;
  project: string;
  projectId: string;
  scope: string;
  trade: string;
  suppliersInvited: number;
  responses: number;
  status: string;
  dueDate: string;
  expanded: boolean;
  supplierResponses: Array<{ name: string; amount: number | null; status: string; submittedDate: string }>;
}

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent],
  template: `
    <div class="my-requests-page">
      <div class="page-header-row">
        <div class="page-header">
          <h1>My Requests</h1>
          <p>Track all your material requests and supplier responses</p>
        </div>
        <a routerLink="/sc/create-rfq" class="btn-primary new-btn">+ Create Material Request</a>
      </div>

      <!-- Filters -->
      <div class="filters-row">
        <div class="ph-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Search requests..." [value]="searchQuery()" (input)="searchQuery.set($any($event.target).value)" />
        </div>
        <select class="ph-select" [value]="projectFilter()" (change)="projectFilter.set($any($event.target).value)">
          <option value="">Project ▾</option>
          <option>Top Pot Doughnuts Foundry Cafe TI</option>
          <option>Private test-8-6</option>
          <option>Riverside Commons Phase 2</option>
          <option>Harbor View Medical Center</option>
          <option>Sunset Ridge Apartments</option>
        </select>
        <select class="ph-select" [value]="statusFilter()" (change)="statusFilter.set($any($event.target).value)">
          <option value="">Status ▾</option>
          <option value="requested">Requested</option>
          <option value="sent">Sent</option>
          <option value="replied">Replied</option>
          <option value="negotiating">Negotiating</option>
          <option value="awarded">Awarded</option>
        </select>
        <select class="ph-select">
          <option>Trade ▾</option>
          <option>Electrical</option>
          <option>Plumbing</option>
          <option>HVAC</option>
          <option>Framing</option>
          <option>Concrete</option>
        </select>
      </div>

      <!-- Requests Table -->
      <div class="ph-card table-card">
        <table class="ph-table">
          <thead>
            <tr>
              <th style="width:40px"></th>
              <th>Project</th>
              <th>Material Scope</th>
              <th>Trade</th>
              <th>Suppliers Invited</th>
              <th>Responses</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (req of filteredRequests(); track req.id) {
              <tr class="req-row" (click)="toggleExpand(req)">
                <td>
                  <button class="expand-btn" [class.open]="req.expanded">▶</button>
                </td>
                <td><span class="proj-name">{{ req.project }}</span></td>
                <td><span class="scope-text">{{ req.scope }}</span></td>
                <td><span class="trade-tag">{{ req.trade }}</span></td>
                <td><span class="count-badge">{{ req.suppliersInvited }}</span></td>
                <td>
                  <span class="count-badge" [class.has-responses]="req.responses > 0">
                    {{ req.responses }} / {{ req.suppliersInvited }}
                  </span>
                </td>
                <td (click)="$event.stopPropagation()"><app-status-badge [status]="req.status" /></td>
                <td><span class="date-text">{{ formatDate(req.dueDate) }}</span></td>
                <td (click)="$event.stopPropagation()">
                  <div class="action-btns">
                    <a class="action-btn" routerLink="/sc/compare">Compare</a>
                    <button class="action-btn">Edit</button>
                  </div>
                </td>
              </tr>
              @if (req.expanded) {
                <tr class="expanded-row">
                  <td colspan="9">
                    <div class="expanded-content">
                      <h4>Supplier Responses for "{{ req.scope }}"</h4>
                      <table class="supplier-responses-table">
                        <thead>
                          <tr>
                            <th>Supplier</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Submitted</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (resp of req.supplierResponses; track resp.name) {
                            <tr>
                              <td>
                                <div class="supplier-row">
                                  <div class="sup-logo">{{ resp.name.substring(0,2).toUpperCase() }}</div>
                                  {{ resp.name }}
                                </div>
                              </td>
                              <td>
                                @if (resp.amount) {
                                  <span class="amount">{{ formatCurrency(resp.amount) }}</span>
                                } @else {
                                  <span class="text-secondary">Pending</span>
                                }
                              </td>
                              <td><app-status-badge [status]="resp.status" /></td>
                              <td><span class="date-text">{{ resp.submittedDate }}</span></td>
                              <td>
                                <div class="action-btns">
                                  <button class="action-btn award-btn">Award</button>
                                  <button class="action-btn">View</button>
                                </div>
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              }
            }
            @if (filteredRequests().length === 0) {
              <tr>
                <td colspan="9" class="empty-row">No requests found. <a routerLink="/sc/create-rfq" class="ph-link">Create your first request →</a></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .my-requests-page { }
    .page-header-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
    .new-btn { text-decoration: none; }
    .filters-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .table-card { padding: 0; overflow: hidden; }
    .proj-name { font-weight: 600; color: #2d3748; font-size: 14px; }
    .scope-text { font-size: 13px; color: #4a5568; }
    .trade-tag { background: #ebf8ff; color: #2b6cb0; font-size: 12px; padding: 2px 8px; border-radius: 4px; }
    .count-badge { background: #edf2f7; color: #4a5568; font-size: 13px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
    .count-badge.has-responses { background: #e6fffa; color: #234e52; }
    .date-text { font-size: 13px; color: #4a5568; }
    .action-btns { display: flex; gap: 4px; }
    .action-btn {
      padding: 4px 10px; border: 1px solid #e2e8f0;
      border-radius: 4px; font-size: 12px; cursor: pointer;
      background: white; color: #4a5568; text-decoration: none; white-space: nowrap;
    }
    .action-btn:hover { border-color: #1BB8A8; color: #1BB8A8; }
    .award-btn { background: #f0fff4; color: #276749; border-color: #9ae6b4; }
    .req-row { cursor: pointer; }
    .expand-btn {
      background: none; border: none; cursor: pointer;
      font-size: 12px; color: #718096; transform: rotate(0deg);
      transition: transform 0.15s;
    }
    .expand-btn.open { transform: rotate(90deg); }
    .expanded-row td { background: #f9fafb !important; padding: 0 !important; }
    .expanded-content { padding: 16px 24px; }
    .expanded-content h4 { margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #2d3748; }
    .supplier-responses-table { width: 100%; border-collapse: collapse; }
    .supplier-responses-table th {
      font-size: 11px; font-weight: 600; color: #718096;
      text-transform: uppercase; padding: 8px 12px;
      text-align: left; border-bottom: 1px solid #e2e8f0;
    }
    .supplier-responses-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
    .supplier-row { display: flex; align-items: center; gap: 8px; }
    .sup-logo {
      width: 28px; height: 28px; border-radius: 6px;
      background: #1BB8A8; color: white; font-size: 10px;
      font-weight: 700; display: flex; align-items: center; justify-content: center;
    }
    .amount { font-weight: 700; color: #2d3748; }
    .text-secondary { color: #a0aec0; }
    .empty-row { text-align: center; color: #718096; padding: 40px !important; }
  `]
})
export class MyRequestsComponent implements OnInit {
  private estimateService = inject(EstimateService);

  searchQuery = signal('');
  projectFilter = signal('');
  statusFilter = signal('');

  requests = signal<MaterialRequest[]>([
    {
      id: 'req-001',
      project: 'Riverside Commons Phase 2',
      projectId: 'proj-003',
      scope: 'Ready-mix concrete 4000 PSI, reinforcing steel, form materials',
      trade: 'Concrete',
      suppliersInvited: 5,
      responses: 3,
      status: 'replied',
      dueDate: '2026-05-10',
      expanded: false,
      supplierResponses: [
        { name: 'Columbia Concrete Supply', amount: 187500, status: 'replied', submittedDate: 'Mar 8, 2026' },
        { name: 'Pacific Concrete Inc.', amount: 172000, status: 'sent', submittedDate: 'Mar 10, 2026' },
        { name: 'Northwest Concrete', amount: 195000, status: 'sent', submittedDate: 'Mar 12, 2026' },
        { name: 'Oregon Concrete Co.', amount: null, status: 'requested', submittedDate: 'Pending' },
        { name: 'Valley Ready Mix', amount: null, status: 'requested', submittedDate: 'Pending' }
      ]
    },
    {
      id: 'req-002',
      project: 'Sunset Ridge Apartments',
      projectId: 'proj-005',
      scope: 'Drywall panels, metal framing, insulation batts, joint compound — 96 units',
      trade: 'Drywall',
      suppliersInvited: 4,
      responses: 2,
      status: 'sent',
      dueDate: '2026-06-01',
      expanded: false,
      supplierResponses: [
        { name: 'Pacific Drywall & Insulation', amount: 198400, status: 'sent', submittedDate: 'Mar 11, 2026' },
        { name: 'Northwest Drywall Supply', amount: 185000, status: 'sent', submittedDate: 'Mar 13, 2026' },
        { name: 'Sound Drywall Systems', amount: null, status: 'requested', submittedDate: 'Pending' },
        { name: 'Cascade Building Supply', amount: null, status: 'requested', submittedDate: 'Pending' }
      ]
    },
    {
      id: 'req-003',
      project: 'Harbor View Medical Center',
      projectId: 'proj-004',
      scope: 'Medical grade HVAC units, ductwork, controls, air handling units',
      trade: 'HVAC',
      suppliersInvited: 3,
      responses: 1,
      status: 'negotiating',
      dueDate: '2026-04-30',
      expanded: false,
      supplierResponses: [
        { name: 'Puget Sound HVAC', amount: 312000, status: 'negotiating', submittedDate: 'Mar 3, 2026' },
        { name: 'Pacific Air Systems', amount: null, status: 'requested', submittedDate: 'Pending' },
        { name: 'Western HVAC Supply', amount: null, status: 'requested', submittedDate: 'Pending' }
      ]
    },
    {
      id: 'req-004',
      project: 'Private test-8-6',
      projectId: 'proj-002',
      scope: 'Residential plumbing fixtures, PEX piping, water heater',
      trade: 'Plumbing',
      suppliersInvited: 4,
      responses: 4,
      status: 'awarded',
      dueDate: '2026-03-28',
      expanded: false,
      supplierResponses: [
        { name: 'Bellevue Plumbing Supply', amount: 14500, status: 'awarded', submittedDate: 'Mar 2, 2026' },
        { name: 'Seattle Plumbing Solutions', amount: 16200, status: 'lost', submittedDate: 'Mar 3, 2026' },
        { name: 'Eastside Plumbing Co.', amount: 15800, status: 'lost', submittedDate: 'Mar 4, 2026' },
        { name: 'Pacific Plumbing Dist.', amount: 17500, status: 'lost', submittedDate: 'Mar 5, 2026' }
      ]
    }
  ]);

  filteredRequests = computed(() => {
    let reqs = this.requests();
    if (this.searchQuery()) {
      const q = this.searchQuery().toLowerCase();
      reqs = reqs.filter(r => r.project.toLowerCase().includes(q) || r.scope.toLowerCase().includes(q));
    }
    if (this.projectFilter()) reqs = reqs.filter(r => r.project === this.projectFilter());
    if (this.statusFilter()) reqs = reqs.filter(r => r.status === this.statusFilter());
    return reqs;
  });

  ngOnInit() {}

  toggleExpand(req: MaterialRequest) {
    req.expanded = !req.expanded;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  }
}
