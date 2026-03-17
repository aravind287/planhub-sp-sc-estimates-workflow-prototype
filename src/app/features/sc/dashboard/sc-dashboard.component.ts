import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface BidProject {
  id: string;
  name: string;
  gc: string;
  location: string;
  bidDue: string;
  topMatch: boolean;
  status: 'Invited' | 'Bidding' | 'Submitted' | 'Declined' | 'Won' | 'Lost';
}

@Component({
  selector: 'app-sc-dashboard',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="bid-board-wrap">
      <!-- Header -->
      <div class="page-header-row">
        <div class="page-header">
          <h1>Project Finder</h1>
          <p>Projects you've been invited to bid on</p>
        </div>
      </div>

      <!-- Filter Row -->
      <div class="filter-row">
        <div class="ph-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search projects..." [(ngModel)]="searchQuery" (input)="filterProjects()" />
        </div>
      </div>

      <!-- Project List -->
      <div class="ph-card projects-card">
        @for (project of filteredProjects(); track project.id) {
          <div class="project-row">
            <div class="project-main">
              <div class="project-name-row">
                <span class="project-name">{{ project.name }}</span>
                @if (project.topMatch) {
                  <span class="top-match-pill">Top Match</span>
                }
              </div>
              <div class="project-meta">
                <span class="meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M3 9h18M9 21V9"/>
                  </svg>
                  {{ project.gc }}
                </span>
                <span class="meta-sep">·</span>
                <span class="meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {{ project.location }}
                </span>
                <span class="meta-sep">·</span>
                <span class="meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Bid Due: {{ project.bidDue }}
                </span>
              </div>
            </div>
            <div class="project-right">
              <span class="status-badge status-{{ project.status.toLowerCase() }}">{{ project.status }}</span>
              <a class="btn-view" [routerLink]="['/sc/projects', project.id]">View Project</a>
            </div>
          </div>
        }
        @if (filteredProjects().length === 0) {
          <div class="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p>No projects match your filters.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .bid-board-wrap {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .page-header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    .page-header h1 {
      font-size: 22px;
      font-weight: 700;
      color: #2d3748;
      margin: 0 0 4px;
    }
    .page-header p {
      color: #718096;
      font-size: 14px;
      margin: 0;
    }
    /* Stats */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .stat-icon-wrap {
      width: 44px; height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .stat-number { font-size: 26px; font-weight: 700; color: #2d3748; line-height: 1; }
    .stat-label { font-size: 13px; color: #718096; margin-top: 2px; }
    /* Filter */
    .filter-row {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }
    .ph-search {
      display: flex;
      align-items: center;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0 12px;
      background: white;
      gap: 8px;
    }
    .ph-search input {
      border: none;
      outline: none;
      padding: 8px 0;
      font-size: 14px;
      width: 220px;
      color: #2d3748;
    }
    .ph-search input::placeholder { color: #a0aec0; }
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
    /* Projects Card */
    .projects-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0;
      overflow: hidden;
    }
    .project-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #f0f4f8;
      gap: 16px;
    }
    .project-row:last-child { border-bottom: none; }
    .project-row:hover { background: #fafbfc; }
    .project-main { flex: 1; min-width: 0; }
    .project-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 5px;
    }
    .project-name {
      font-size: 15px;
      font-weight: 600;
      color: #2d3748;
    }
    .top-match-pill {
      background: #e6fffa;
      color: #1BB8A8;
      border: 1px solid #b2f5ea;
      border-radius: 12px;
      padding: 2px 9px;
      font-size: 11px;
      font-weight: 600;
    }
    .project-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #718096;
    }
    .meta-sep { color: #cbd5e0; font-size: 13px; }
    .project-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    /* Status badges */
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }
    .status-invited { background: #ebf8ff; color: #2b6cb0; }
    .status-bidding { background: #faf5ff; color: #6b46c1; }
    .status-submitted { background: #f0fff4; color: #276749; }
    .status-declined { background: #fff5f5; color: #c53030; }
    .status-won { background: #e6fffa; color: #1BB8A8; }
    .status-lost { background: #f7fafc; color: #718096; }
    .btn-view {
      padding: 6px 14px;
      border: 1px solid #1BB8A8;
      border-radius: 5px;
      color: #1BB8A8;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      background: white;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.12s;
    }
    .btn-view:hover { background: #e6fffa; }
    .empty-state {
      padding: 48px;
      text-align: center;
      color: #a0aec0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .empty-state p { margin: 0; font-size: 14px; }
  `]
})
export class ScDashboardComponent {
  searchQuery = '';
  statusFilter = 'All';

  allProjects: BidProject[] = [
    {
      id: 'proj-001',
      name: 'Orange Coast College Pool & Aquatics Center',
      gc: 'Hensel Phelps Construction',
      location: 'Costa Mesa, CA',
      bidDue: 'Mar 28, 2026',
      topMatch: true,
      status: 'Invited'
    },
    {
      id: 'proj-002',
      name: 'Riverside Commons Phase 2 Mixed-Use',
      gc: 'Turner Construction Company',
      location: 'Riverside, CA',
      bidDue: 'Apr 10, 2026',
      topMatch: false,
      status: 'Bidding'
    },
    {
      id: 'proj-003',
      name: 'Sunset Ridge Apartments — 96 Units',
      gc: 'Clark Construction Group',
      location: 'Irvine, CA',
      bidDue: 'Apr 22, 2026',
      topMatch: true,
      status: 'Invited'
    },
    {
      id: 'proj-004',
      name: 'Harbor View Medical Center Expansion',
      gc: 'DPR Construction',
      location: 'Long Beach, CA',
      bidDue: 'Mar 14, 2026',
      topMatch: false,
      status: 'Submitted'
    },
    {
      id: 'proj-005',
      name: 'Downtown LA Office Tower Renovation',
      gc: 'Skanska USA Building',
      location: 'Los Angeles, CA',
      bidDue: 'Feb 28, 2026',
      topMatch: false,
      status: 'Declined'
    },
    {
      id: 'proj-006',
      name: 'Anaheim Convention Center Upgrade',
      gc: 'McCarthy Building Companies',
      location: 'Anaheim, CA',
      bidDue: 'May 05, 2026',
      topMatch: true,
      status: 'Bidding'
    }
  ];

  filteredProjects = signal<BidProject[]>(this.allProjects);

  filterProjects() {
    let result = this.allProjects;
    if (this.statusFilter !== 'All') {
      result = result.filter(p => p.status === this.statusFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.gc.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      );
    }
    this.filteredProjects.set(result);
  }
}
