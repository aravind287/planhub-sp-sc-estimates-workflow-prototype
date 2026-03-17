import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { ScStateService, BidStatus } from '../../../core/services/sc-state.service';
import { Project } from '../../../core/models/project.model';

interface SupplierRow {
  id: string;
  company: string;
  contact: string;
  estimate: string;
  received: string;
  avatarColor: string;
  initials: string;
}

@Component({
  selector: 'app-sc-project',
  standalone: true,
  imports: [],
  template: `
    <div class="sc-project-page">

      <!-- Header -->
      <div class="proj-header">
        <div class="proj-header-left">
          <div class="proj-viewing-as">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Viewing as <strong>{{ scState.scCompanyName }}</strong>
          </div>
          <div class="proj-title-row">
            <h1 class="proj-title">{{ project()?.name || 'Loading...' }}</h1>
            <span class="top-match-pill">Top Match</span>
          </div>
        </div>
        <div class="proj-header-right">
          <button class="btn-askai">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/>
            </svg>
            AskAI
          </button>
          <button class="icon-action-btn" title="User">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
          <button class="icon-action-btn" title="Bookmark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          <button class="icon-action-btn" title="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Tab Bar -->
      <div class="tab-bar">
        <button class="tab-btn" [class.tab-active]="activeTab() === 'overview'" (click)="activeTab.set('overview')">Overview</button>
        <button class="tab-btn" [class.tab-active]="activeTab() === 'files'" (click)="activeTab.set('files')">Files</button>
        <button class="tab-btn" [class.tab-active]="activeTab() === 'activity'" (click)="activeTab.set('activity')">
          Activity <span class="tab-badge">4</span>
        </button>
        <button class="tab-btn" [class.tab-active]="activeTab() === 'suppliers'" (click)="activeTab.set('suppliers')">Suppliers</button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">

        <!-- OVERVIEW TAB -->
        @if (activeTab() === 'overview') {
          <div class="ph-card overview-card">
            <h3 class="section-title">Project Details</h3>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Construction Type</span>
                <span class="detail-value">{{ project()?.constructionType || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Location</span>
                <span class="detail-value">{{ project()?.location || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Project Type</span>
                <span class="detail-value">{{ project()?.buildingUse || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Bid Due Date</span>
                <span class="detail-value">{{ project()?.bidDueDate || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">GC Company</span>
                <span class="detail-value">{{ project()?.gcCompany || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Estimated Value</span>
                <span class="detail-value">$24,500,000</span>
              </div>
            </div>
          </div>
        }

        <!-- FILES TAB -->
        @if (activeTab() === 'files') {
          <div class="ph-card files-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p>Project files will appear here.</p>
          </div>
        }

        <!-- ACTIVITY TAB -->
        @if (activeTab() === 'activity') {
          <div class="ph-card activity-card">
            <h3 class="section-title">Activity</h3>
            <div class="activity-list">
              <div class="activity-item">
                <div class="activity-dot" style="background:#1BB8A8;"></div>
                <div class="activity-body">
                  <span class="activity-text">You were invited to bid on this project by Hensel Phelps Construction.</span>
                  <span class="activity-time">Mar 10, 2026 at 9:14 AM</span>
                </div>
              </div>
              <div class="activity-item">
                <div class="activity-dot" style="background:#6366f1;"></div>
                <div class="activity-body">
                  <span class="activity-text">Project documents were updated — Addendum A posted.</span>
                  <span class="activity-time">Mar 12, 2026 at 2:30 PM</span>
                </div>
              </div>
              <div class="activity-item">
                <div class="activity-dot" style="background:#f59e0b;"></div>
                <div class="activity-body">
                  <span class="activity-text">Bid due date extended to March 28, 2026.</span>
                  <span class="activity-time">Mar 14, 2026 at 11:00 AM</span>
                </div>
              </div>
              <div class="activity-item">
                <div class="activity-dot" style="background:#3b82f6;"></div>
                <div class="activity-body">
                  <span class="activity-text">You marked your intent to bid on this project.</span>
                  <span class="activity-time">Mar 15, 2026 at 4:45 PM</span>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- SUPPLIERS TAB -->
        @if (activeTab() === 'suppliers') {

          <!-- Supplier Visibility Banner -->
          <div class="supplier-signal-banner" [class.signal-active]="lookingForSuppliers()">
            @if (!lookingForSuppliers()) {
              <div class="signal-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1BB8A8" stroke-width="2" style="flex-shrink:0;">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <div class="signal-text">
                  <span class="signal-title">Looking for suppliers for this project?</span>
                  <span class="signal-desc">Let suppliers know you're sourcing materials for this project.</span>
                </div>
              </div>
              <button class="btn-signal-on" (click)="setLookingForSuppliers(true)">Turn on supplier visibility</button>
            } @else {
              <div class="signal-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#065f46" stroke-width="2.5" style="flex-shrink:0;">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span class="signal-on-text">Suppliers notified you're looking for suppliers</span>
              </div>
              <button class="btn-signal-off" (click)="setLookingForSuppliers(false)">Turn off</button>
            }
          </div>

          <!-- View 1: Shared Estimates -->
          @if (suppliersView() === 'list') {
            <div class="ph-card suppliers-card">
              <div class="suppliers-header-row">
                <div class="suppliers-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d3748" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <span>Shared Estimates</span>
                </div>
                <button class="send-request-link" (click)="suppliersView.set('request')">
                  Send Request
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>

              <table class="est-table">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Contact</th>
                    <th>Estimate</th>
                    <th>Received</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of supplierRows; track row.id) {
                    <tr [class.sp-user-row]="row.id === 'sp-user'">
                      <td>
                        <div class="company-cell">
                          <div class="company-avatar" [style.background]="row.avatarColor">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                              <rect x="3" y="3" width="18" height="18" rx="3"/>
                              <path d="M8 12h8M12 8v8"/>
                            </svg>
                          </div>
                          <span class="company-name">{{ row.company }}</span>
                          @if (row.id === 'sp-user') {
                            <span class="sp-you-badge">Your Supplier</span>
                          }
                        </div>
                      </td>
                      <td class="contact-cell">{{ row.contact }}</td>
                      <td>
                        <div class="estimate-file-cell">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1BB8A8" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          <a class="file-link" href="#" (click)="$event.preventDefault()">{{ row.estimate }}</a>
                        </div>
                      </td>
                      <td class="date-cell">{{ row.received }}</td>
                      <td>
                        <div class="row-actions">
                          <button class="row-icon-btn" title="Download">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="7 10 12 15 17 10"/>
                              <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                          </button>
                          <button class="row-icon-btn" title="Message">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <!-- View 2: Send Request to Suppliers -->
          @if (suppliersView() === 'request') {
            <div class="ph-card request-card">
              <div class="request-header">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d3748" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <h3>Send Request to Suppliers</h3>
              </div>
              <p class="request-desc">Send your material estimate request through PlanHub to matched Suppliers on this project.</p>

              <div class="request-selects-row">
                <select class="ph-select request-select">
                  <option>Select Trades (26)</option>
                  <option>Concrete</option>
                  <option>Structural Steel</option>
                  <option>Mechanical</option>
                  <option>Electrical</option>
                  <option>Plumbing</option>
                </select>
                <select class="ph-select request-select">
                  <option>Select Suppliers (16)</option>
                  <option>Pacific Concrete Supply</option>
                  <option>Urban Greenery Solutions</option>
                  <option>AquaPure Technologies</option>
                  <option>Bright Minds Education</option>
                </select>
              </div>

              <div class="info-banner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1BB8A8" stroke-width="2" style="flex-shrink:0;">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>Trades from your Company Profile are already selected for you. Update your Company Profile to add or edit trades and reach more matched suppliers.</span>
              </div>

              <textarea class="request-textarea" placeholder="Message"></textarea>

              @if (requestSent()) {
                <div class="sent-banner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#065f46" stroke-width="2.5" style="flex-shrink:0;">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Request sent! Suppliers will be notified.
                </div>
              }

              <div class="request-actions">
                <button class="btn-primary send-btn" (click)="sendEstimateRequest()" [disabled]="requestSent()">
                  {{ requestSent() ? 'Request Sent' : 'Send Request' }}
                </button>
              </div>

              <div class="back-link-row">
                <button class="back-link" (click)="suppliersView.set('list')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                  </svg>
                  Back to Shared Estimates
                </button>
              </div>
            </div>
          }
        }

      </div>

      <!-- Sticky Bottom Action Bar -->
      <div class="bottom-action-bar">
        <span class="bid-status-text">
          @if (bidStatus() === 'declined') {
            {{ scState.scCompanyName }} declined this project.
          } @else if (bidStatus() === 'intend') {
            {{ scState.scCompanyName }} has indicated intent to bid on this project.
          } @else if (bidStatus() === 'submitted') {
            {{ scState.scCompanyName }}'s bid has been submitted.
          } @else {
            No action taken yet on this project.
          }
        </span>
        <div class="bottom-btns">
          <button class="btn-decline" (click)="setBidStatus('declined')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Decline
          </button>
          <button class="btn-intend" (click)="setBidStatus('intend')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Intend to Bid
          </button>
          <button class="btn-submit-bid" (click)="setBidStatus('submitted')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
            Submit Bid
          </button>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .sc-project-page {
      padding: 24px;
      padding-bottom: 80px;
    }

    /* Header */
    .proj-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 16px;
    }
    .proj-viewing-as {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      color: #718096;
      margin-bottom: 4px;
    }
    .proj-viewing-as strong { color: #2d3748; }
    .proj-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .proj-title {
      font-size: 20px;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
    }
    .top-match-pill {
      background: #e6fffa;
      color: #1BB8A8;
      border: 1px solid #b2f5ea;
      border-radius: 12px;
      padding: 3px 10px;
      font-size: 12px;
      font-weight: 600;
    }
    .proj-header-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .btn-askai {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border: 1px solid #1BB8A8;
      border-radius: 6px;
      background: white;
      color: #1BB8A8;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.12s;
    }
    .btn-askai:hover { background: #e6fffa; }
    .icon-action-btn {
      width: 34px; height: 34px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: white;
      color: #4a5568;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.12s;
    }
    .icon-action-btn:hover { background: #f7fafc; color: #2d3748; }

    /* Tabs */
    .tab-bar {
      display: flex;
      gap: 0;
      border-bottom: 2px solid #e2e8f0;
      margin-bottom: 20px;
    }
    .tab-btn {
      padding: 10px 18px;
      border: none;
      background: none;
      font-size: 14px;
      font-weight: 500;
      color: #718096;
      cursor: pointer;
      position: relative;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: color 0.12s;
    }
    .tab-btn:hover { color: #2d3748; }
    .tab-active {
      color: #1BB8A8 !important;
    }
    .tab-active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background: #1BB8A8;
    }
    .tab-badge {
      background: #e2e8f0;
      color: #4a5568;
      border-radius: 10px;
      padding: 1px 6px;
      font-size: 11px;
      font-weight: 600;
    }

    /* Cards */
    .ph-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 16px;
    }

    /* Overview */
    .overview-card { padding: 20px; }
    .details-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .detail-label {
      font-size: 12px;
      color: #718096;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .detail-value {
      font-size: 14px;
      color: #2d3748;
      font-weight: 500;
    }

    /* Files placeholder */
    .files-placeholder {
      padding: 64px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: #a0aec0;
    }
    .files-placeholder p { margin: 0; font-size: 14px; }

    /* Activity */
    .activity-card { padding: 20px; }
    .activity-list { display: flex; flex-direction: column; gap: 0; }
    .activity-item {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f0f4f8;
    }
    .activity-item:last-child { border-bottom: none; }
    .activity-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 4px;
    }
    .activity-body { display: flex; flex-direction: column; gap: 3px; }
    .activity-text { font-size: 14px; color: #2d3748; }
    .activity-time { font-size: 12px; color: #a0aec0; }

    /* Suppliers - Shared Estimates */
    .suppliers-card { padding: 0; overflow: hidden; }
    .suppliers-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      border-bottom: 1px solid #e2e8f0;
    }
    .suppliers-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 600;
      color: #2d3748;
    }
    .send-request-link {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #1BB8A8;
      font-size: 13px;
      font-weight: 500;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
    }
    .send-request-link:hover { text-decoration: underline; }
    .est-table {
      width: 100%;
      border-collapse: collapse;
    }
    .est-table th {
      font-size: 12px;
      font-weight: 600;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 10px 20px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
      background: #f9fafb;
    }
    .est-table td {
      padding: 12px 20px;
      border-bottom: 1px solid #f0f4f8;
      font-size: 14px;
      color: #2d3748;
    }
    .est-table tr:last-child td { border-bottom: none; }
    .est-table tr:hover td { background: #fafbfc; }
    .company-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .company-avatar {
      width: 32px; height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .company-name { font-weight: 500; }
    .sp-user-row td { background: #f0fdfb !important; }
    .sp-you-badge {
      display: inline-block;
      padding: 2px 7px;
      background: #ccfbf1;
      color: #065f46;
      border: 1px solid #99f6e4;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
      margin-left: 6px;
    }
    .contact-cell { color: #4a5568; }
    .estimate-file-cell {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .file-link {
      color: #1BB8A8;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
    }
    .file-link:hover { text-decoration: underline; }
    .date-cell { color: #718096; font-size: 13px; }
    .row-actions { display: flex; gap: 6px; }
    .row-icon-btn {
      width: 30px; height: 30px;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      background: white;
      color: #718096;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.12s;
    }
    .row-icon-btn:hover { background: #f7fafc; color: #2d3748; border-color: #cbd5e0; }

    /* Send Request View */
    .request-card { padding: 24px; }
    .request-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }
    .request-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
    }
    .request-desc {
      font-size: 14px;
      color: #718096;
      margin: 0 0 20px;
    }
    .request-selects-row {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }
    .ph-select {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 14px;
      background: white;
      color: #2d3748;
      cursor: pointer;
      outline: none;
    }
    .ph-select:focus { border-color: #1BB8A8; }
    .request-select { flex: 1; }
    .info-banner {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: #e6fffa;
      border-left: 3px solid #1BB8A8;
      border-radius: 4px;
      padding: 12px 14px;
      font-size: 13px;
      color: #1a6b5f;
      margin-bottom: 16px;
      line-height: 1.5;
    }
    .request-textarea {
      width: 100%;
      min-height: 120px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 14px;
      color: #2d3748;
      font-family: inherit;
      resize: vertical;
      outline: none;
      margin-bottom: 16px;
      box-sizing: border-box;
    }
    .request-textarea:focus { border-color: #1BB8A8; }
    .request-textarea::placeholder { color: #a0aec0; }
    .request-actions { display: flex; justify-content: flex-end; margin-bottom: 16px; }
    .sent-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #dcfce7;
      border: 1px solid #86efac;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 500;
      color: #065f46;
      margin-bottom: 12px;
    }
    .send-btn {
      background: #1BB8A8;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 9px 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.12s;
    }
    .send-btn:hover:not(:disabled) { background: #159a8c; }
    .send-btn:disabled { background: #a0aec0; cursor: not-allowed; }
    .btn-primary { background: #1BB8A8; color: white; border: none; border-radius: 6px; padding: 9px 20px; font-size: 14px; font-weight: 500; cursor: pointer; }
    .btn-primary:hover { background: #159a8c; }
    .back-link-row { padding-top: 8px; border-top: 1px solid #e2e8f0; }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: #718096;
      font-size: 13px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
    }
    .back-link:hover { color: #1BB8A8; }

    /* Supplier Signal Banner */
    .supplier-signal-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 12px 16px;
      border: 1px solid #b2f5ea;
      border-radius: 8px;
      background: #f0fffe;
      margin-bottom: 16px;
    }
    .supplier-signal-banner.signal-active {
      background: #dcfce7;
      border-color: #86efac;
    }
    .signal-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .signal-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .signal-title {
      font-size: 14px;
      font-weight: 600;
      color: #1a3a35;
    }
    .signal-desc {
      font-size: 13px;
      color: #4a5568;
    }
    .signal-on-text {
      font-size: 14px;
      font-weight: 500;
      color: #065f46;
    }
    .btn-signal-on {
      white-space: nowrap;
      padding: 7px 16px;
      border: none;
      border-radius: 6px;
      background: #1BB8A8;
      color: white;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.12s;
    }
    .btn-signal-on:hover { background: #159a8c; }
    .btn-signal-off {
      white-space: nowrap;
      padding: 6px 14px;
      border: 1px solid #86efac;
      border-radius: 6px;
      background: white;
      color: #065f46;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.12s;
    }
    .btn-signal-off:hover { background: #f0fff4; }

    /* Bottom Action Bar */
    .bottom-action-bar {
      position: sticky;
      bottom: 0;
      background: white;
      border-top: 1px solid #e2e8f0;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin: 0 -24px;
    }
    .bid-status-text {
      font-size: 13px;
      color: #718096;
    }
    .bottom-btns {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
    .btn-decline {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 7px 14px;
      border: 1px solid #fc8181;
      border-radius: 6px;
      background: white;
      color: #c53030;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.12s;
    }
    .btn-decline:hover { background: #fff5f5; }
    .btn-intend {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 7px 14px;
      border: 1px solid #1BB8A8;
      border-radius: 6px;
      background: white;
      color: #1BB8A8;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.12s;
    }
    .btn-intend:hover { background: #e6fffa; }
    .btn-submit-bid {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 7px 16px;
      border: none;
      border-radius: 6px;
      background: #1BB8A8;
      color: white;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.12s;
    }
    .btn-submit-bid:hover { background: #159a8c; }
  `]
})
export class ScProjectComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  readonly scState = inject(ScStateService);

  activeTab = signal('suppliers');
  suppliersView = signal<'list' | 'request'>('list');
  project = signal<Project | undefined>(undefined);
  requestSent = signal(false);

  private projectId = signal('');

  lookingForSuppliers = computed(() => this.scState.isLookingForSuppliers(this.projectId()));
  bidStatus = computed(() => this.scState.getBidStatus(this.projectId()));

  setLookingForSuppliers(value: boolean): void {
    this.scState.setLookingForSuppliers(this.projectId(), value);
  }

  setBidStatus(value: BidStatus): void {
    this.scState.setBidStatus(this.projectId(), value);
  }

  sendEstimateRequest(): void {
    this.scState.setEstimateRequested(this.projectId(), true);
    this.requestSent.set(true);
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || 'proj-001';
    this.projectId.set(id);
    this.requestSent.set(this.scState.isEstimateRequested(id));
    this.projectService.getById(id).subscribe(p => this.project.set(p));
  }

  get supplierRows(): SupplierRow[] {
    return [
      { id: 'sp-user', company: this.scState.spCompanyName, contact: this.scState.spUserName, estimate: 'Summit Supplies - Material Estimate.pdf', received: '03/01/2026', avatarColor: '#1BB8A8', initials: 'SB' },
      { id: '1', company: 'Pacific Concrete Supply',   contact: 'Marcus Chen',     estimate: 'Amendement A Combined.pdf', received: '02/18/2026', avatarColor: '#2b6cb0', initials: 'PC' },
      { id: '2', company: 'Urban Greenery Solutions',  contact: 'Jamal Edwards',   estimate: 'Amendement A Combined.pdf', received: '03/02/2026', avatarColor: '#6366f1', initials: 'UG' },
      { id: '3', company: 'AquaPure Technologies',     contact: "Liam O'Brien",    estimate: 'Amendement A Combined.pdf', received: '04/15/2026', avatarColor: '#f59e0b', initials: 'AP' },
      { id: '4', company: 'Bright Minds Education',    contact: 'Noah Thompson',   estimate: 'Amendement A Combined.pdf', received: '05/30/2026', avatarColor: '#ec4899', initials: 'BM' },
      { id: '5', company: 'EcoFriendly Packaging Co.', contact: 'Ava Johnson',     estimate: 'Amendement A Combined.pdf', received: '07/10/2026', avatarColor: '#10b981', initials: 'EP' },
      { id: '6', company: 'Sustainable Farming LLC',   contact: 'Ethan Brown',     estimate: 'Amendement A Combined.pdf', received: '08/05/2026', avatarColor: '#3b82f6', initials: 'SF' },
    ];
  }
}
