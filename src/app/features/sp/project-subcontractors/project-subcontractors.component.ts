import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EstimateService } from '../../../core/services/estimate.service';
import { ProjectService } from '../../../core/services/project.service';
import { ScStateService } from '../../../core/services/sc-state.service';
import { Project } from '../../../core/models/project.model';
import { Subcontractor, BiddingStatus } from '../../../core/models/subcontractor.model';

const BIDDING_STATUS_OPTIONS: { value: BiddingStatus; label: string }[] = [
  { value: 'placed_bid',  label: 'Placed Bid' },
  { value: 'bidding',     label: 'Bidding' },
  { value: 'interested',  label: 'Interested' },
  { value: 'not_bidding', label: 'Not Bidding' },
  { value: 'undecided',   label: 'Undecided' },
  { value: 'no_response', label: 'No Response' },
];

const ALL_BIDDING_STATUSES = new Set<BiddingStatus>(BIDDING_STATUS_OPTIONS.map(o => o.value));

@Component({
  selector: 'app-project-subcontractors',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <!-- Project Header -->
      <div class="project-header">
        <div class="header-title-row">
          <a routerLink="/sp/bid-planner" class="back-link">← Bid Planner</a>
          <div class="title-line">
            <h1><span class="project-label">Project Name:</span> {{ project()?.name || 'Loading...' }}</h1>
            <span class="header-meta">Bid Due Date {{ project() ? formatDateLong(project()!.bidDueDate) : '' }}</span>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-crm">Integrate with CRM</button>
          <button class="hdr-icon-btn" title="No bid">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </button>
          <button class="hdr-icon-btn" title="Favorite">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button class="hdr-icon-btn" title="Share">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>
      </div>

      <!-- Full-width Block Tabs -->
      <div class="tab-bar">
        <button class="tab-btn" [class.active]="activeTab() === 'overview'" (click)="activeTab.set('overview')">Overview</button>
        <button class="tab-btn" [class.active]="activeTab() === 'files'" (click)="activeTab.set('files')">Project Files</button>
        <button class="tab-btn" [class.active]="activeTab() === 'subcontractors'" (click)="activeTab.set('subcontractors')">Subcontractors</button>
        <button class="tab-btn" [class.active]="activeTab() === 'gc'" (click)="activeTab.set('gc')">General Contractors</button>
        <button class="tab-btn" [class.active]="activeTab() === 'intel'" (click)="activeTab.set('intel')">Competitor Intel</button>
      </div>

      @if (activeTab() === 'subcontractors') {
        <!-- Filters Row -->
        <div class="filters-row">
          <!-- Search -->
          <div class="search-wrap">
            <input class="search-input" type="text" placeholder="Search by name or email"
              [value]="searchQuery()" (input)="searchQuery.set($any($event.target).value); resetPage()" />
            <button class="search-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
          </div>

          <!-- Estimate Status (outlined label) -->
          <div class="outlined-field">
            <span class="outlined-label">Estimate Status <span class="req">*</span></span>
            <select class="outlined-select" [value]="statusFilter()" (change)="statusFilter.set($any($event.target).value); resetPage()">
              <option value="">All Subcontractors</option>
              <option value="received">Received Estimate</option>
              <option value="not_received">Haven't Received Estimate</option>
            </select>
            <svg class="select-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          <!-- Select Trades -->
          <div class="outlined-field">
            <span class="outlined-label">Select Trades</span>
            <select class="outlined-select" [value]="tradesFilter()" (change)="tradesFilter.set($any($event.target).value); resetPage()">
              <option value="">Select Trades ({{ tradesFilter() ? 1 : 0 }})</option>
              @for (trade of availableTrades(); track trade) {
                <option [value]="trade">{{ trade }}</option>
              }
            </select>
            <svg class="select-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          <!-- Activity (outlined label) -->
          <div class="activity-wrap">
            <div class="outlined-field">
              <span class="outlined-label">Activity <span class="req">*</span></span>
              <select class="outlined-select" [value]="activityFilter()" (change)="activityFilter.set($any($event.target).value); resetPage()">
                <option value="">Who's Viewed</option>
                <option value="whos_downloaded_files">Who's Downloaded Files</option>
                <option value="whos_submitted_bid">Who's Submitted Bid</option>
              </select>
              <svg class="select-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <button class="info-btn" title="Activity tracks the highest engagement level of each subcontractor">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </button>
          </div>


          <!-- Bidding Status multi-select -->
          <div class="multiselect-wrap" [class.ms-open]="biddingStatusOpen()">
            <div class="outlined-field ms-trigger" (click)="biddingStatusOpen.set(!biddingStatusOpen())">
              <span class="outlined-label">Bidding Status</span>
              <span class="ms-value">Bidding Status ({{ selectedBiddingStatuses().size }})</span>
              <svg class="select-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            @if (biddingStatusOpen()) {
              <div class="ms-dropdown" (click)="$event.stopPropagation()">
                <div class="ms-search-row">
                  <input class="ms-search-input" type="text" placeholder="" />
                </div>
                <label class="ms-option">
                  <input type="checkbox" [checked]="allBiddingStatusSelected()" (change)="toggleAllBiddingStatuses($any($event.target).checked)" />
                  Select All
                </label>
                @for (opt of biddingStatusOptions; track opt.value) {
                  <label class="ms-option">
                    <input type="checkbox" [checked]="selectedBiddingStatuses().has(opt.value)" (change)="toggleBiddingStatus(opt.value)" />
                    {{ opt.label }}
                  </label>
                }
              </div>
            }
          </div>
        </div>

        <!-- SC Signals Chips -->
        <div class="signal-chips-row">
          <button class="signal-chip" [class.active]="scSignals().size === 0" (click)="clearSignals()">
            All <span class="chip-count">{{ subcontractors().length }}</span>
          </button>
          <button class="signal-chip" [class.active]="scSignals().has('looking')" (click)="toggleSignal('looking')">
            Looking for Suppliers <span class="chip-count">{{ lookingCount() }}</span>
            <span class="chip-help" title="This SC has indicated they need material suppliers for this project. Includes those who've also submitted a request.">?</span>
          </button>
          <button class="signal-chip" [class.active]="scSignals().has('requested')" (click)="toggleSignal('requested')">
            Requested Estimate <span class="chip-count">{{ requestedCount() }}</span>
            <span class="chip-help" title="This SC has formally requested a material estimate from you on this project.">?</span>
          </button>
        </div>

        <!-- Select All / Actions Row -->
        <div class="select-row">
          <div class="select-row-left">
            <input type="checkbox" class="select-chk" (change)="toggleAll($any($event.target).checked)" [checked]="allSelected()" />
            <span class="select-label">Select All</span>
            <span class="select-meta">| {{ filteredSubcontractors().length }} total ({{ selectedIds().size }} Selected)</span>
          </div>
          <div class="select-row-right">
            <button class="btn-outline-sm">Integrate with CRM</button>
            <button class="btn-primary-sm">Share Group Estimate</button>
          </div>
        </div>

        <!-- Table -->
        <div class="table-wrap">
          <table class="sc-table">
            <thead>
              <tr>
                <th class="col-chk"></th>
                <th>Company Name</th>
                <th>Contact Name</th>
                <th>Contact Information</th>
                <th>Bidding Status</th>
                <th>Submitted Estimate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (sc of pagedSubcontractors(); track sc.id) {
                <tr [class.row-selected]="selectedIds().has(sc.id)">
                  <td class="col-chk" (click)="$event.stopPropagation()">
                    <input type="checkbox" [checked]="selectedIds().has(sc.id)" (change)="toggleSelect(sc.id)" />
                  </td>
                  <td>
                    <div class="company-cell">
                      <div class="company-logo" [class.logo-gray]="!sc.estimateId">{{ sc.logoInitials }}</div>
                      <div>
                        <div class="company-name">{{ sc.companyName }}</div>
                        <div class="company-loc-row">
                          <span class="company-loc">{{ sc.location }}</span>
                          @if (sc.estimateStatus === 'requested') {
                            <span class="intent-pill pill-req">Requested Estimate</span>
                          } @else if (sc.looking_for_suppliers) {
                            <span class="intent-pill pill-lfs">Looking for Suppliers</span>
                          }
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><span class="contact-name">{{ sc.contactName }}</span></td>
                  <td>
                    <div class="contact-info-row">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4a5568" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      <a class="phone-link" href="tel:{{ sc.phone }}">{{ sc.phone }}</a>
                      <span class="ci-sep">|</span>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4a5568" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      <a class="email-link" href="mailto:{{ sc.email }}">{{ sc.email }}</a>
                    </div>
                  </td>
                  <td>
                    <span class="bidding-badge" [class]="'bs-' + (sc.biddingStatus || 'no_response')">
                      {{ biddingStatusLabel(sc.biddingStatus) }}
                    </span>
                  </td>
                  <td>
                    @if (sc.estimateId && sc.estimateAmount) {
                      <div class="est-file-cell">
                        <a class="est-file-link" href="#" (click)="$event.preventDefault(); downloadEstimate(sc)">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          Estimate_{{ sc.logoInitials }}.pdf
                        </a>
                        <span class="est-file-date">{{ sc.lastActivity ? formatDateTime(sc.lastActivity) : '—' }}</span>
                      </div>
                    } @else {
                      <span class="cell-dash">—</span>
                    }
                  </td>
                  <td>
                    <div class="action-row">
                      @if (sc.estimateId) {
                        <a class="action-link" routerLink="/sp/estimates/create" [queryParams]="{fromProject: project()?.id}">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                          Share Estimate
                        </a>
                        <button class="nudge-btn" [class.nudge-off]="!canNudge(sc.id)" [disabled]="!canNudge(sc.id)" (click)="openNudge(sc)" [title]="nudgeTitle(sc)">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          @if (getNudgeCount(sc.id) > 0) { <span class="nudge-count">{{ getNudgeCount(sc.id) }}/3</span> }
                        </button>
                      } @else {
                        <a class="action-link" routerLink="/sp/estimates/create" [queryParams]="{fromProject: project()?.id}">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                          Share Estimate
                        </a>
                      }
                    </div>
                  </td>
                </tr>
              }
              @if (filteredSubcontractors().length === 0) {
                <tr><td colspan="7" class="empty-row">No subcontractors found.</td></tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div class="table-footer">
          <span class="footer-label">Go to page</span>
          <input class="page-input" type="number" min="1" [max]="totalPages()" [value]="currentPage()" (change)="goToPage(+$any($event.target).value)" />
          <span class="footer-label">Results per page</span>
          <select class="page-size-select" [value]="pageSize()" (change)="pageSize.set(+$any($event.target).value); currentPage.set(1)">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span class="footer-label">Page {{ currentPage() }} of {{ totalPages() }}</span>
        </div>
      }

      @if (activeTab() === 'overview') {
        <div class="ph-card">
          <h3>Project Overview</h3>
          <div class="overview-grid">
            <div class="ov-item"><span class="ov-label">Construction Type</span><span class="ov-value">{{ project()?.constructionType }}</span></div>
            <div class="ov-item"><span class="ov-label">Project Type</span><span class="ov-value">{{ project()?.projectType }}</span></div>
            <div class="ov-item"><span class="ov-label">Building Use</span><span class="ov-value">{{ project()?.buildingUse }}</span></div>
            <div class="ov-item"><span class="ov-label">Trades</span><span class="ov-value">{{ project()?.trades?.join(', ') }}</span></div>
          </div>
        </div>
      }

      @if (activeTab() === 'files' || activeTab() === 'gc' || activeTab() === 'intel') {
        <div class="ph-card empty-tab">
          <p>This section is under construction.</p>
        </div>
      }

      <!-- Bulk Action Bar -->
      @if (selectedIds().size > 0) {
        <div class="bulk-bar">
          <span class="bulk-count">{{ selectedIds().size }} {{ selectedIds().size === 1 ? 'subcontractor' : 'subcontractors' }} selected</span>
          <button class="bulk-nudge-btn" (click)="openBulkNudge()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Send Reminder
          </button>
          <button class="bulk-clear" (click)="clearSelection()">✕ Clear</button>
        </div>
      }

      <!-- Nudge Modal -->
      @if (nudgeSc() || bulkNudging()) {
        <div class="modal-backdrop" (click)="closeNudge()">
          <div class="nudge-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <span class="modal-title">Send Reminder</span>
              <button class="modal-close" (click)="closeNudge()">✕</button>
            </div>
            <div class="modal-body">
              <div class="nudge-target">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1BB8A8" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                @if (nudgeSc()) {
                  <span>Sending to <strong>{{ nudgeSc()!.companyName }}</strong></span>
                } @else {
                  <span>Sending to <strong>{{ selectedIds().size }} subcontractor{{ selectedIds().size === 1 ? '' : 's' }}</strong></span>
                }
              </div>
              <label class="msg-label">Message</label>
              <textarea class="msg-textarea" [value]="nudgeMessage()" (input)="nudgeMessage.set($any($event.target).value)" rows="5"></textarea>
            </div>
            <div class="modal-footer">
              <button class="btn-outline" (click)="closeNudge()">Cancel</button>
              <button class="btn-primary" (click)="sendNudge()">Send Reminder</button>
            </div>
          </div>
        </div>
      }

      <!-- Toast -->
      @if (toastVisible()) {
        <div class="toast">{{ toastMsg() }}</div>
      }

      <!-- Notes FAB -->
      <button class="notes-fab" title="Add note">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Notes
      </button>

      <!-- Backdrop to close multi-select -->
      @if (biddingStatusOpen()) {
        <div class="ms-backdrop" (click)="biddingStatusOpen.set(false)"></div>
      }
    </div>
  `,
  styles: [`
    .page { position: relative; padding-bottom: 80px; }

    /* ─── Header ─────────────────────────────────────────── */
    .project-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
    }
    .back-link {
      display: block;
      color: #1BB8A8;
      text-decoration: none;
      font-size: 13px;
      margin-bottom: 6px;
    }
    .back-link:hover { text-decoration: underline; }
    .title-line {
      display: flex;
      align-items: baseline;
      gap: 16px;
      flex-wrap: wrap;
    }
    .project-label { font-size: 22px; font-weight: 400; color: #2d3748; }
    h1 { margin: 0; font-size: 22px; font-weight: 700; color: #2d3748; }
    .header-meta { font-size: 13px; color: #718096; white-space: nowrap; }
    .header-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .btn-crm {
      padding: 8px 16px;
      background: #1BB8A8;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }
    .btn-crm:hover { background: #159a8c; }
    .hdr-icon-btn {
      width: 36px; height: 36px;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      background: white;
      color: #4a5568;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
    .hdr-icon-btn:hover { background: #f7fafc; color: #2d3748; }

    /* ─── Full-width block tabs ──────────────────────────── */
    .tab-bar {
      display: flex;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 20px;
    }
    .tab-btn {
      flex: 1;
      padding: 12px 8px;
      border: none;
      border-right: 1px solid #e2e8f0;
      background: white;
      font-size: 13px;
      font-weight: 500;
      color: #4a5568;
      cursor: pointer;
      transition: background 0.12s, color 0.12s;
      white-space: nowrap;
    }
    .tab-btn:last-child { border-right: none; }
    .tab-btn:hover:not(.active) { background: #f7fafc; }
    .tab-btn.active {
      background: #1a3a35;
      color: white;
      font-weight: 600;
    }

    /* ─── Filters row ────────────────────────────────────── */
    .filters-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .search-wrap {
      display: flex;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      overflow: hidden;
      background: white;
    }
    .search-input {
      border: none; outline: none;
      padding: 8px 12px;
      font-size: 13px;
      color: #2d3748;
      width: 180px;
    }
    .search-btn {
      background: #1BB8A8;
      border: none;
      padding: 8px 12px;
      cursor: pointer;
      color: white;
      display: flex; align-items: center;
    }
    .search-btn:hover { background: #159a8c; }

    /* Outlined field (floating label style) */
    .outlined-field {
      position: relative;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      background: white;
      min-width: 170px;
      cursor: pointer;
    }
    .outlined-field:focus-within { border-color: #1BB8A8; }
    .outlined-label {
      position: absolute;
      top: -8px;
      left: 8px;
      background: white;
      padding: 0 3px;
      font-size: 11px;
      color: #718096;
      pointer-events: none;
      white-space: nowrap;
    }
    .req { color: #e53e3e; }
    .outlined-select {
      width: 100%;
      border: none; outline: none;
      padding: 10px 28px 10px 12px;
      font-size: 13px;
      color: #2d3748;
      background: transparent;
      appearance: none;
      cursor: pointer;
    }
    .select-caret {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      color: #718096;
    }

    .activity-wrap { display: flex; align-items: center; gap: 6px; }
    .info-btn {
      width: 24px; height: 24px;
      background: #1BB8A8;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      color: white;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    /* Multi-select */
    .multiselect-wrap { position: relative; z-index: 50; }
    .ms-trigger {
      min-width: 170px;
      cursor: pointer;
      user-select: none;
    }
    .ms-value {
      display: block;
      padding: 10px 28px 10px 12px;
      font-size: 13px;
      color: #2d3748;
      white-space: nowrap;
    }
    .ms-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      min-width: 200px;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      z-index: 100;
    }
    .ms-search-row { padding: 8px; border-bottom: 1px solid #f0f0f0; }
    .ms-search-input {
      width: 100%; box-sizing: border-box;
      border: 1px solid #d1d5db; border-radius: 3px;
      padding: 5px 8px; font-size: 12px; outline: none;
    }
    .ms-search-input:focus { border-color: #1BB8A8; }
    .ms-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      font-size: 13px;
      color: #2d3748;
      cursor: pointer;
    }
    .ms-option:hover { background: #f7fafc; }
    .ms-option input[type="checkbox"] { accent-color: #1BB8A8; cursor: pointer; }
    .ms-backdrop {
      position: fixed; inset: 0; z-index: 40;
    }

    /* ─── Select All row ─────────────────────────────────── */
    .signal-chips-row {
      display: flex;
      gap: 8px;
      padding: 10px 12px 4px;
    }
    .signal-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      background: white;
      font-size: 12px;
      font-weight: 500;
      color: #4a5568;
      cursor: pointer;
      transition: all 0.15s;
    }
    .signal-chip:hover { border-color: #1BB8A8; color: #1BB8A8; }
    .signal-chip.active { background: #1BB8A8; color: white; border-color: #1BB8A8; }
    .signal-chip .chip-count {
      background: rgba(0,0,0,0.1);
      border-radius: 10px;
      padding: 1px 6px;
      font-size: 11px;
    }
    .signal-chip.active .chip-count { background: rgba(255,255,255,0.25); }
    .chip-help {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: rgba(0,0,0,0.12);
      font-size: 9px;
      font-weight: 700;
      cursor: help;
      flex-shrink: 0;
    }
    .signal-chip.active .chip-help { background: rgba(255,255,255,0.3); }
    .select-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-bottom: none;
      border-radius: 4px 4px 0 0;
      background: #f9fafb;
    }
    .select-row-left { display: flex; align-items: center; gap: 8px; }
    .select-chk { cursor: pointer; accent-color: #1BB8A8; }
    .select-label { font-size: 13px; font-weight: 500; color: #2d3748; }
    .select-meta { font-size: 12px; color: #718096; }
    .select-row-right { display: flex; gap: 8px; }
    .btn-outline-sm {
      padding: 5px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      background: white;
      color: #4a5568;
      font-size: 12px;
      cursor: pointer;
    }
    .btn-outline-sm:hover { border-color: #1BB8A8; color: #1BB8A8; }
    .btn-primary-sm {
      padding: 5px 12px;
      border: none;
      border-radius: 4px;
      background: #1BB8A8;
      color: white;
      font-size: 12px;
      cursor: pointer;
    }
    .btn-primary-sm:hover { background: #159a8c; }

    /* ─── Table ──────────────────────────────────────────── */
    .table-wrap {
      border: 1px solid #e2e8f0;
      border-top: none;
      border-radius: 0 0 4px 4px;
      overflow-x: auto;
    }
    .sc-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .sc-table thead tr { background: #f9fafb; border-bottom: 1px solid #e2e8f0; }
    .sc-table th {
      padding: 10px 14px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      white-space: nowrap;
    }
    .sc-table td { padding: 12px 14px; border-bottom: 1px solid #f0f4f8; vertical-align: middle; }
    .sc-table tbody tr:last-child td { border-bottom: none; }
    .sc-table tbody tr:hover td { background: #f8fffe; }
    .row-selected td { background: #f0fffe !important; }
    .col-chk { width: 44px; }

    /* Company cell */
    .company-cell { display: flex; align-items: center; gap: 10px; }
    .company-logo {
      width: 32px; height: 32px;
      border-radius: 6px;
      background: #1BB8A8;
      color: white;
      font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .logo-gray { background: #cbd5e0; color: #4a5568; }
    .company-name { font-weight: 600; font-size: 13px; color: #111827; }
    .company-loc-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
    .company-loc { font-size: 11px; color: #6b7280; }
    .intent-pill {
      display: inline-block;
      padding: 1px 7px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 600;
      white-space: nowrap;
    }
    .pill-lfs { background: #e6fffa; color: #065f46; border: 1px solid #b2f5ea; }
    .pill-req { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
    .contact-name { font-size: 13px; color: #111827; }

    /* Contact info inline */
    .contact-info-row {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      flex-wrap: wrap;
    }
    .phone-link { color: #2563eb; text-decoration: none; }
    .phone-link:hover { text-decoration: underline; }
    .email-link { color: #1BB8A8; text-decoration: none; }
    .email-link:hover { text-decoration: underline; }
    .ci-sep { color: #d1d5db; }

    /* Bidding Status badges */
    .bidding-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
    }
    .bs-placed_bid  { background: #dcfce7; color: #166534; }
    .bs-bidding     { background: #e6fffa; color: #065f46; }
    .bs-interested  { background: #dbeafe; color: #1e40af; }
    .bs-not_bidding { background: #fee2e2; color: #991b1b; }
    .bs-undecided   { background: #fef9c3; color: #854d0e; }
    .bs-no_response { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }

    /* Bidding status cell stack */
    .bidding-status-cell { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }


    /* Amount */
    .amount { font-weight: 600; color: #111827; font-size: 13px; }
    .cell-dash { color: #9ca3af; }

    /* Submitted estimate file cell */
    .est-file-cell { display: flex; flex-direction: column; gap: 2px; }
    .est-file-link {
      display: inline-flex; align-items: center; gap: 4px;
      color: #1BB8A8; text-decoration: none; font-size: 12px; font-weight: 500;
    }
    .est-file-link:hover { text-decoration: underline; }
    .est-file-date { font-size: 11px; color: #6b7280; }

    /* Action row */
    .action-row { display: flex; align-items: center; gap: 6px; }
    .action-link {
      display: inline-flex; align-items: center; gap: 4px;
      color: #1BB8A8;
      font-size: 12px; font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      border: none; background: none;
      padding: 0;
      white-space: nowrap;
    }
    .action-link:hover { text-decoration: underline; }
    .nudge-btn {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 8px;
      border: 1px solid #b2e8e4;
      border-radius: 4px;
      background: white;
      color: #1BB8A8;
      font-size: 12px;
      cursor: pointer;
    }
    .nudge-btn:hover:not(:disabled) { background: #e6f7f6; }
    .nudge-off { color: #9ca3af !important; border-color: #e2e8f0 !important; cursor: not-allowed !important; }
    .nudge-count { font-size: 10px; font-weight: 600; }

    /* Empty row */
    .empty-row { text-align: center; color: #6b7280; padding: 40px !important; }

    /* ─── Pagination footer ──────────────────────────────── */
    .table-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      padding: 12px 4px;
      font-size: 13px;
      color: #4a5568;
    }
    .footer-label { white-space: nowrap; }
    .page-input {
      width: 50px;
      padding: 4px 8px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 13px;
      text-align: center;
      outline: none;
    }
    .page-input:focus { border-color: #1BB8A8; }
    .page-size-select {
      padding: 4px 24px 4px 8px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 13px;
      outline: none;
      appearance: none;
      background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 6px center;
      cursor: pointer;
    }

    /* ─── Overview tab ───────────────────────────────────── */
    .overview-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; margin-top: 16px; }
    .ov-item { display: flex; flex-direction: column; gap: 4px; }
    .ov-label { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
    .ov-value { font-size: 14px; color: #111827; }
    .empty-tab { text-align: center; color: #6b7280; padding: 40px; }

    /* ─── Bulk bar ───────────────────────────────────────── */
    .bulk-bar {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: #1a2e35; color: white;
      display: flex; align-items: center; gap: 16px;
      padding: 14px 32px;
      z-index: 200;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
    }
    .bulk-count { font-size: 14px; font-weight: 500; flex: 1; }
    .bulk-nudge-btn {
      display: flex; align-items: center; gap: 6px;
      background: #1BB8A8; color: white;
      border: none; border-radius: 6px;
      padding: 8px 16px; font-size: 13px; font-weight: 500;
      cursor: pointer;
    }
    .bulk-nudge-btn:hover { background: #159a8c; }
    .bulk-clear {
      background: none;
      border: 1px solid rgba(255,255,255,0.3);
      color: white; padding: 7px 14px; border-radius: 6px;
      cursor: pointer; font-size: 13px;
    }
    .bulk-clear:hover { background: rgba(255,255,255,0.1); }

    /* ─── Modal ──────────────────────────────────────────── */
    .modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 300;
      display: flex; align-items: center; justify-content: center;
    }
    .nudge-modal {
      background: white; border-radius: 8px; width: 440px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2); overflow: hidden;
    }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; border-bottom: 1px solid #e2e8f0;
    }
    .modal-title { font-size: 15px; font-weight: 600; color: #111827; }
    .modal-close { background: none; border: none; font-size: 18px; cursor: pointer; color: #6b7280; }
    .modal-body { padding: 20px; }
    .nudge-target { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #111827; margin-bottom: 16px; }
    .msg-label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px; }
    .msg-textarea {
      width: 100%; box-sizing: border-box;
      border: 1px solid #e2e8f0; border-radius: 6px;
      padding: 10px 12px; font-size: 13px; color: #111827;
      resize: vertical; font-family: inherit; line-height: 1.5;
    }
    .msg-textarea:focus { outline: none; border-color: #1BB8A8; }
    .modal-footer {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 16px 20px; border-top: 1px solid #e2e8f0;
    }

    /* ─── Toast ──────────────────────────────────────────── */
    .toast {
      position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
      background: #1a2e35; color: white;
      padding: 12px 24px; border-radius: 8px;
      font-size: 14px; font-weight: 500;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      z-index: 400;
    }

    /* ─── Notes FAB ──────────────────────────────────────── */
    .notes-fab {
      position: fixed; bottom: 32px; right: 32px;
      display: flex; align-items: center; gap: 6px;
      padding: 10px 18px;
      border-radius: 24px;
      background: #1BB8A8; color: white;
      font-size: 13px; font-weight: 500;
      border: none; cursor: pointer;
      box-shadow: 0 4px 12px rgba(27,184,168,0.4);
    }
    .notes-fab:hover { background: #159a8c; }

    /* ─── Shared buttons ─────────────────────────────────── */
    .btn-outline {
      padding: 7px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      background: white; color: #4a5568;
      font-size: 13px; cursor: pointer;
    }
    .btn-outline:hover { border-color: #1BB8A8; color: #1BB8A8; }
    .btn-primary {
      padding: 7px 14px;
      border: none; border-radius: 5px;
      background: #1BB8A8; color: white;
      font-size: 13px; cursor: pointer;
    }
    .btn-primary:hover { background: #159a8c; }
    .ph-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 16px; }

    @media (max-width: 1024px) {
      .filters-row { flex-wrap: wrap; gap: 8px; }
    }
    @media (max-width: 768px) {
      .filters-row { flex-direction: column; align-items: stretch; }
      .search-wrap { width: 100%; }
      .signal-chips-row { flex-wrap: wrap; }
    }
    @media (max-width: 640px) {
      .col-chk { width: 32px; }
      th:nth-child(4), td:nth-child(4) { display: none; }
      th:nth-child(5), td:nth-child(5) { display: none; }
    }
  `]
})
export class ProjectSubcontractorsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private estimateService = inject(EstimateService);
  private projectService = inject(ProjectService);
  private scState = inject(ScStateService);

  project = signal<Project | undefined>(undefined);
  subcontractors = signal<Subcontractor[]>([]);
  activeTab = signal('subcontractors');

  // Filters
  searchQuery = signal('');
  statusFilter = signal('');       // '', 'received', 'not_received', 'viewed', ...
  activityFilter = signal('');
  tradesFilter = signal('');
  scSignals = signal<Set<string>>(new Set());

  lookingCount = computed(() => this.subcontractors().filter(sc => sc.looking_for_suppliers === true).length);
  requestedCount = computed(() => this.subcontractors().filter(sc => sc.estimateStatus === 'requested').length);

  toggleSignal(key: string) {
    const s = new Set(this.scSignals());
    s.has(key) ? s.delete(key) : s.add(key);
    this.scSignals.set(s);
    this.resetPage();
  }

  clearSignals() {
    this.scSignals.set(new Set());
    this.resetPage();
  }
  selectedBiddingStatuses = signal<Set<BiddingStatus>>(new Set(ALL_BIDDING_STATUSES));
  biddingStatusOpen = signal(false);

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);

  // Selection & nudge
  selectedIds = signal<Set<string>>(new Set());
  nudgeSc = signal<Subcontractor | null>(null);
  bulkNudging = signal(false);
  nudgeMessage = signal('');
  toastMsg = signal('');
  toastVisible = signal(false);
  nudgeCounts = signal<Map<string, number>>(new Map());

  readonly NUDGE_LIMIT = 3;
  readonly biddingStatusOptions = BIDDING_STATUS_OPTIONS;

  availableTrades = computed(() => {
    const trades = new Set<string>();
    this.subcontractors().forEach(sc => sc.trades.forEach(t => trades.add(t)));
    return [...trades].sort();
  });

  filteredSubcontractors = computed(() => {
    // Merge live SC-side state so SP view reflects SC actions in real time
    const lfsOverrides = this.scState.lookingForSuppliers();
    const scId = this.scState.scId;
    const projectId = this.project()?.id ?? '';
    let scs = this.subcontractors().map(sc =>
      sc.id === scId
        ? { ...sc, looking_for_suppliers: lfsOverrides[projectId] ?? sc.looking_for_suppliers }
        : sc
    );
    const q = this.searchQuery().toLowerCase();
    if (q) scs = scs.filter(sc => sc.companyName.toLowerCase().includes(q) || sc.contactName.toLowerCase().includes(q) || sc.email.toLowerCase().includes(q));
    if (this.tradesFilter()) scs = scs.filter(sc => sc.trades.includes(this.tradesFilter()));
    const sf = this.statusFilter();
    if (sf === 'received')    scs = scs.filter(sc => !!sc.estimateId);
    if (sf === 'not_received') scs = scs.filter(sc => !sc.estimateId);
    if (sf === 'viewed')       scs = scs.filter(sc => sc.estimateStatus === 'viewed');
    if (sf === 'negotiating')  scs = scs.filter(sc => sc.estimateStatus === 'negotiating');
    if (sf === 'awarded')      scs = scs.filter(sc => sc.estimateStatus === 'awarded');
    if (sf === 'lost')         scs = scs.filter(sc => sc.estimateStatus === 'lost');
    if (sf === 'pending')      scs = scs.filter(sc => ['sent', 'requested'].includes(sc.estimateStatus ?? ''));
    if (sf === 'overdue')      scs = scs.filter(sc => sc.followUpOverdue === true);
    const activity = this.activityFilter();
    if (activity) {
      const intentMap: Record<string, string> = {
        whos_downloaded_files: 'downloaded_plans',
        whos_submitted_bid: 'submitted_estimate',
      };
      const intentValue = intentMap[activity];
      if (intentValue) scs = scs.filter(sc => sc.activity === intentValue);
    }
    const selected = this.selectedBiddingStatuses();
    if (selected.size < ALL_BIDDING_STATUSES.size) {
      scs = scs.filter(sc => selected.has((sc.biddingStatus ?? 'no_response') as BiddingStatus));
    }
    const signals = this.scSignals();
    if (signals.size > 0) {
      scs = scs.filter(sc =>
        (signals.has('looking') && (sc.looking_for_suppliers === true || sc.estimateStatus === 'requested')) ||
        (signals.has('requested') && sc.estimateStatus === 'requested')
      );
    }
    return scs;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredSubcontractors().length / this.pageSize())));

  pagedSubcontractors = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredSubcontractors().slice(start, start + this.pageSize());
  });

  allSelected = computed(() =>
    this.filteredSubcontractors().length > 0 &&
    this.filteredSubcontractors().every(sc => this.selectedIds().has(sc.id))
  );

  allBiddingStatusSelected = computed(() => this.selectedBiddingStatuses().size === ALL_BIDDING_STATUSES.size);

  toggleSelect(id: string) {
    const s = new Set(this.selectedIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.selectedIds.set(s);
  }

  toggleAll(checked: boolean) {
    this.selectedIds.set(checked ? new Set(this.filteredSubcontractors().map(sc => sc.id)) : new Set());
  }

  clearSelection() { this.selectedIds.set(new Set()); }

  toggleBiddingStatus(value: BiddingStatus) {
    const s = new Set(this.selectedBiddingStatuses());
    s.has(value) ? s.delete(value) : s.add(value);
    this.selectedBiddingStatuses.set(s);
    this.currentPage.set(1);
  }

  toggleAllBiddingStatuses(checked: boolean) {
    this.selectedBiddingStatuses.set(checked ? new Set(ALL_BIDDING_STATUSES) : new Set());
    this.currentPage.set(1);
  }

  resetPage() { this.currentPage.set(1); }

  goToPage(n: number) {
    const clamped = Math.min(Math.max(1, n), this.totalPages());
    this.currentPage.set(clamped);
  }

  getNudgeCount(scId: string): number { return this.nudgeCounts().get(scId) ?? 0; }
  canNudge(scId: string): boolean { return this.getNudgeCount(scId) < this.NUDGE_LIMIT; }

  nudgeTitle(sc: Subcontractor): string {
    const count = this.getNudgeCount(sc.id);
    if (count >= this.NUDGE_LIMIT) return `Reminder limit reached (${this.NUDGE_LIMIT}/${this.NUDGE_LIMIT})`;
    const r = this.NUDGE_LIMIT - count;
    return `Send Bid Follow Up · ${sc.companyName} · ${r} reminder${r === 1 ? '' : 's'} remaining`;
  }

  openNudge(sc: Subcontractor) {
    if (!this.canNudge(sc.id)) return;
    this.nudgeSc.set(sc);
    this.bulkNudging.set(false);
    this.nudgeMessage.set(`Hi ${sc.companyName}, just following up on the material estimate we shared. Please let us know if you have any questions or need to discuss the scope. Looking forward to hearing from you!`);
  }

  openBulkNudge() {
    this.bulkNudging.set(true);
    this.nudgeSc.set(null);
    this.nudgeMessage.set(`Hi, just following up on the material estimate we shared. Please let us know if you have any questions or need to discuss the scope. Looking forward to hearing from you!`);
  }

  closeNudge() { this.nudgeSc.set(null); this.bulkNudging.set(false); }

  sendNudge() {
    const isBulk = this.bulkNudging();
    const counts = new Map(this.nudgeCounts());
    if (isBulk) {
      this.selectedIds().forEach(id => counts.set(id, (counts.get(id) ?? 0) + 1));
    } else {
      const id = this.nudgeSc()!.id;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    this.nudgeCounts.set(counts);
    const name = this.nudgeSc()?.companyName;
    const bulkCount = this.selectedIds().size;
    this.closeNudge();
    if (isBulk) this.clearSelection();
    this.toastMsg.set(isBulk ? `Reminder sent to ${bulkCount} subcontractors` : `Reminder sent to ${name}`);
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 3000);
  }

  biddingStatusLabel(status: BiddingStatus | undefined): string {
    return BIDDING_STATUS_OPTIONS.find(o => o.value === status)?.label ?? 'No Response';
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || 'proj-001';
    this.projectService.getById(id).subscribe(p => this.project.set(p));
    this.estimateService.getSubcontractorsForProject(id).subscribe(scs => this.subcontractors.set(scs));
  }

  downloadEstimate(sc: Subcontractor) {
    alert(`Downloading Estimate_${sc.logoInitials}.pdf`);
  }

  formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  formatDateLong(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  }
}
