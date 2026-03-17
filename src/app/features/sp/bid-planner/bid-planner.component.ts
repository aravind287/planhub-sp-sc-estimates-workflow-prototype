import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

interface BidProject {
  id: string;
  name: string;
  location: string;
  bidDate: string;
  status: string;
  assignedTo: string;
  isFavorite: boolean;
  gcCompany: string;
  description: string;
  constructionType: string;
  projectType: string;
  buildingUse: string;
  estimatedStartDate: string;
  matchingTrades: string[];
  madePublic: boolean;
}

@Component({
  selector: 'app-bid-planner',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="bid-planner-page">

      <!-- Tab Bar -->
      <div class="tab-bar">
        @for (tab of tabs; track tab.key) {
          <button
            class="tab-btn"
            [class.active]="activeTab() === tab.key"
            (click)="setTab(tab.key)"
          >
            @if (tab.key === 'saved') { <span class="heart-icon">♥</span> }
            {{ tab.label }} ({{ getTabCount(tab.key) }})
          </button>
        }
      </div>

      <!-- Search Row -->
      <div class="search-row">
        <div class="search-input-wrap">
          <input type="text" class="search-input" placeholder="Search by project name" [value]="searchQuery()" (input)="searchQuery.set($any($event.target).value)" />
          <button class="search-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>
        <select class="ph-select">
          <option>Team Member ▾</option>
          <option>Alex Martinez</option>
          <option>Maria Chen</option>
          <option>Tom Bradley</option>
        </select>
      </div>

      <!-- Table Card -->
      <div class="ph-card table-card">

        <!-- Table subheader -->
        <div class="table-subheader">
          <span class="result-label">{{ tabResultLabel() }} | <strong>{{ filteredProjects().length }} total</strong></span>
          <div class="pagination-controls">
            <span class="pagination-label">Go to page</span>
            <input type="number" class="page-input" value="1" min="1" />
            <span class="pagination-label">Page 1 of {{ Math.max(1, Math.ceil(filteredProjects().length / 10)) }}</span>
            <button class="page-arrow" [disabled]="true">‹</button>
            <button class="page-arrow">›</button>
          </div>
        </div>

        <table class="ph-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Status</th>
              <th>Team Members</th>
              <th>Bid Date ↓</th>
              <th>Location</th>
              <th>Takeoff</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            @for (project of filteredProjects(); track project.id) {
              <tr (click)="selectProject(project)" [class.selected]="selectedProject()?.id === project.id">
                <td>
                  <div class="project-name-cell">
                    <span class="proj-name">{{ project.name }}</span>
                    <div class="proj-badges">
                      <span class="badge-planhub">PlanHub</span>
                      @if (project.madePublic) {
                        <span class="badge-public">Made Public</span>
                      }
                    </div>
                  </div>
                </td>
                <td (click)="$event.stopPropagation()">
                  <div class="status-field">
                    <span class="status-field-label">Status</span>
                    <select class="status-select" [value]="project.status" (change)="updateStatus(project, $any($event.target).value)">
                      <option value="saved">Saved</option>
                      <option value="in_progress">In Progress</option>
                      <option value="estimate_shared">Estimate Shared</option>
                      <option value="bid_submitted">Bid Submitted</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                </td>
                <td (click)="$event.stopPropagation()">
                  <div class="assigned-field">
                    <span class="assigned-label">Assigned to</span>
                    <select class="assigned-select" [value]="project.assignedTo" (change)="project.assignedTo = $any($event.target).value">
                      <option value="">Unassigned</option>
                      <option>Alex Martinez</option>
                      <option>Maria Chen</option>
                      <option>Tom Bradley</option>
                    </select>
                  </div>
                </td>
                <td><span class="date-text">{{ formatDate(project.bidDate) }}</span></td>
                <td><span class="location-text">{{ project.location }}</span></td>
                <td (click)="$event.stopPropagation()">
                  <a class="takeoff-link" [routerLink]="['/sp/projects', project.id, 'subcontractors']">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                    Prepare Takeoff
                  </a>
                </td>
                <td (click)="$event.stopPropagation()">
                  <button class="fav-btn" [class.active]="project.isFavorite" (click)="toggleFavorite(project)">
                    {{ project.isFavorite ? '♥' : '♡' }}
                  </button>
                </td>
              </tr>
            }
            @if (filteredProjects().length === 0) {
              <tr>
                <td colspan="7" class="empty-row">No projects in this stage.</td>
              </tr>
            }
          </tbody>
        </table>

        <!-- Bottom pagination -->
        <div class="table-subheader table-footer">
          <span></span>
          <div class="pagination-controls">
            <span class="pagination-label">Go to page</span>
            <input type="number" class="page-input" value="1" min="1" />
            <span class="pagination-label">Page 1 of {{ Math.max(1, Math.ceil(filteredProjects().length / 10)) }}</span>
            <button class="page-arrow" [disabled]="true">‹</button>
            <button class="page-arrow">›</button>
          </div>
        </div>
      </div>

      <!-- Side Panel -->
      @if (selectedProject()) {
        <div class="side-panel">
          <h3 class="side-project-name">{{ selectedProject()!.name }}</h3>
          <p class="side-description">{{ selectedProject()!.description }}</p>
          <a class="btn-primary side-view-btn" [routerLink]="['/sp/projects', selectedProject()!.id, 'subcontractors']" style="text-decoration:none">
            View Project Details
          </a>

          <div class="side-section">
            <h4 class="side-section-title">Matching Trades</h4>
            <div class="trade-tags">
              @for (trade of selectedProject()!.matchingTrades; track trade) {
                <span class="trade-tag">{{ trade }}</span>
              }
            </div>
          </div>

          <div class="side-section">
            <h4 class="side-section-title">Basic Information</h4>
            <div class="info-row">
              <span class="info-label">Construction Type</span>
              <span class="info-value">{{ selectedProject()!.constructionType }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Project Type</span>
              <span class="info-value">{{ selectedProject()!.projectType }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Project Building Use</span>
              <span class="info-value">{{ selectedProject()!.buildingUse }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Estimated Start Date</span>
              <span class="info-value">{{ formatDate(selectedProject()!.estimatedStartDate) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">GC Company</span>
              <span class="info-value">{{ selectedProject()!.gcCompany }}</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .bid-planner-page { position: relative; }

    /* Tab Bar */
    .tab-bar {
      display: flex;
      gap: 0;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .tab-btn {
      padding: 11px 20px;
      border: 1px solid #d1d5db;
      border-right: none;
      background: white;
      font-size: 13px;
      font-weight: 500;
      color: #4a5568;
      cursor: pointer;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: background 0.15s, color 0.15s;
    }
    .tab-btn:first-child { border-radius: 4px 0 0 4px; }
    .tab-btn:last-child { border-right: 1px solid #d1d5db; border-radius: 0 4px 4px 0; }
    .tab-btn:hover:not(.active) { background: #f7fafc; }
    .tab-btn.active {
      background: #1a2e35;
      color: white;
      border-color: #1a2e35;
    }
    .tab-btn.active + .tab-btn { border-left-color: #1a2e35; }
    .heart-icon { font-size: 12px; }

    /* Search Row */
    .search-row {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 16px;
    }
    .search-input-wrap {
      display: flex;
      align-items: center;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      overflow: hidden;
    }
    .search-input {
      padding: 7px 12px;
      border: none;
      outline: none;
      font-size: 13px;
      color: #4a5568;
      width: 220px;
    }
    .search-btn {
      padding: 7px 12px;
      background: #1BB8A8;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    .search-btn:hover { background: #159a8c; }

    /* Table card */
    .table-card { padding: 0; overflow: hidden; }

    /* Table subheader */
    .table-subheader {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 20px;
      border-bottom: 1px solid #e2e8f0;
      background: white;
    }
    .table-footer { border-top: 1px solid #e2e8f0; border-bottom: none; }
    .result-label { font-size: 13px; color: #4a5568; }
    .pagination-controls { display: flex; align-items: center; gap: 8px; }
    .pagination-label { font-size: 13px; color: #4a5568; }
    .page-input {
      width: 48px;
      padding: 4px 8px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 13px;
      text-align: center;
    }
    .page-arrow {
      width: 28px; height: 28px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .page-arrow:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-arrow:hover:not(:disabled) { background: #f7fafc; }

    /* Table */
    .project-name-cell { display: flex; flex-direction: column; gap: 4px; }
    .proj-name { font-weight: 600; color: #2d3748; font-size: 14px; }
    .proj-badges { display: flex; gap: 4px; flex-wrap: wrap; }
    .badge-planhub {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      background: #2d3748;
      color: white;
      font-size: 10px;
      font-weight: 700;
      border-radius: 3px;
    }
    .badge-public {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      background: #e6fffa;
      color: #276749;
      font-size: 10px;
      font-weight: 600;
      border-radius: 3px;
      border: 1px solid #b2f5ea;
    }

    /* Status field */
    .status-field, .assigned-field {
      display: flex;
      flex-direction: column;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      overflow: hidden;
      width: 140px;
    }
    .status-field-label, .assigned-label {
      font-size: 10px;
      color: #718096;
      padding: 3px 8px 0;
      background: white;
    }
    .status-select, .assigned-select {
      border: none;
      outline: none;
      padding: 2px 8px 4px;
      font-size: 13px;
      color: #2d3748;
      background: white;
      cursor: pointer;
      font-weight: 500;
    }

    /* Takeoff */
    .takeoff-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 13px;
      color: #4a5568;
      text-decoration: none;
      white-space: nowrap;
    }
    .takeoff-link:hover { color: #1BB8A8; }

    /* Misc */
    .date-text, .location-text { font-size: 13px; color: #4a5568; white-space: nowrap; }
    .fav-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #cbd5e0;
      line-height: 1;
    }
    .fav-btn.active { color: #fc8181; }
    .empty-row { text-align: center; color: #718096; padding: 40px !important; }
    tr.selected td { background: #f0fffe !important; }

    /* Side Panel */
    .side-panel {
      position: fixed;
      top: 60px;
      right: 0;
      width: 320px;
      height: calc(100vh - 60px);
      background: white;
      border-left: 1px solid #e2e8f0;
      z-index: 50;
      box-shadow: -4px 0 20px rgba(0,0,0,0.08);
      overflow-y: auto;
      padding: 20px;
    }
    .side-project-name {
      font-size: 18px;
      font-weight: 700;
      color: #2d3748;
      margin: 0 0 10px;
    }
    .side-description {
      font-size: 13px;
      color: #718096;
      line-height: 1.5;
      margin: 0 0 16px;
    }
    .side-view-btn {
      display: block;
      text-align: center;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .side-section { margin-bottom: 20px; }
    .side-section-title {
      font-size: 13px;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 10px;
    }
    .trade-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .trade-tag {
      padding: 4px 10px;
      background: #fef3c7;
      color: #92400e;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 8px 0;
      border-bottom: 1px solid #f7fafc;
      gap: 8px;
    }
    .info-label { font-size: 13px; color: #718096; flex-shrink: 0; }
    .info-value { font-size: 13px; font-weight: 600; color: #2d3748; text-align: right; }
  `]
})
export class BidPlannerComponent {
  protected readonly Math = Math;

  activeTab = signal('saved');
  searchQuery = signal('');
  selectedProject = signal<BidProject | null>(null);

  tabs = [
    { key: 'saved',           label: 'Saved' },
    { key: 'in_progress',     label: 'In Progress' },
    { key: 'estimate_shared', label: 'Estimate Shared' },
    { key: 'bid_submitted',   label: 'Bid Submitted' },
    { key: 'won',             label: 'Won' },
    { key: 'lost',            label: 'Lost' },
  ];

  private allProjects: BidProject[] = [
    {
      id: 'proj-001', name: 'Top Pot Doughnuts Foundry Cafe TI', location: 'Seattle, WA',
      bidDate: '2026-04-15', status: 'estimate_shared', assignedTo: 'Alex Martinez',
      isFavorite: true, gcCompany: 'Sellen Construction', madePublic: true,
      description: 'Tenant improvement for a specialty donut café including full kitchen build-out, electrical upgrades, and custom millwork.',
      constructionType: 'Commercial', projectType: 'Tenant Improvement', buildingUse: 'Food & Beverage',
      estimatedStartDate: '2026-05-01',
      matchingTrades: ['Material Estimating', 'Electrical', 'Plumbing'],
    },
    {
      id: 'proj-002', name: 'Private test-8-6', location: 'West Palm Beach, FL',
      bidDate: '2026-12-16', status: 'won', assignedTo: '',
      isFavorite: true, gcCompany: 'Skanska USA Building', madePublic: true,
      description: 'This project calls for the Demolition, New Construction with Site Work of a 123.00 SF Bus Station, Canal.',
      constructionType: 'Civil', projectType: 'Demolition', buildingUse: 'Bus Station',
      estimatedStartDate: '2027-01-15',
      matchingTrades: ['Material Estimating', 'Testing & Inspection Services', 'Scheduling of Work / Construction Progress'],
    },
    {
      id: 'proj-003', name: 'Riverside Commons Phase 2', location: 'Portland, OR',
      bidDate: '2026-05-10', status: 'in_progress', assignedTo: 'Alex Martinez',
      isFavorite: true, gcCompany: 'Turner Construction', madePublic: false,
      description: 'Phase 2 of a 48-unit multi-family residential complex including foundation, framing, MEP rough-in, and finishes.',
      constructionType: 'Residential', projectType: 'New Construction', buildingUse: 'Multi-Family',
      estimatedStartDate: '2026-06-15',
      matchingTrades: ['Material Estimating', 'Concrete', 'Electrical', 'Plumbing'],
    },
    {
      id: 'proj-004', name: 'Harbor View Medical Center', location: 'Tacoma, WA',
      bidDate: '2026-04-30', status: 'in_progress', assignedTo: 'Alex Martinez',
      isFavorite: false, gcCompany: 'DPR Construction', madePublic: false,
      description: '120,000 SF medical facility renovation including OR expansion, HEPA filtration systems, and patient room upgrades.',
      constructionType: 'Healthcare', projectType: 'Renovation', buildingUse: 'Medical Center',
      estimatedStartDate: '2026-07-01',
      matchingTrades: ['HVAC', 'Material Estimating', 'Medical Equipment'],
    },
    {
      id: 'proj-005', name: 'Sunset Ridge Apartments', location: 'Redmond, WA',
      bidDate: '2026-06-01', status: 'saved', assignedTo: 'Maria Chen',
      isFavorite: false, gcCompany: 'Mortenson Construction', madePublic: false,
      description: 'New construction 96-unit apartment complex with Class A fire rating requirement and community amenities.',
      constructionType: 'Residential', projectType: 'New Construction', buildingUse: 'Apartments',
      estimatedStartDate: '2026-08-01',
      matchingTrades: ['Roofing', 'Drywall', 'Flooring', 'Material Estimating'],
    },
    {
      id: 'proj-006', name: 'Eastlake Office Complex', location: 'Seattle, WA',
      bidDate: '2026-02-15', status: 'won', assignedTo: 'Alex Martinez',
      isFavorite: true, gcCompany: 'Balfour Beatty', madePublic: true,
      description: 'Class A office complex, 6 floors, full MEP systems, raised access flooring, and curtain wall facade.',
      constructionType: 'Commercial', projectType: 'New Construction', buildingUse: 'Office',
      estimatedStartDate: '2026-03-15',
      matchingTrades: ['Material Estimating', 'Electrical', 'HVAC'],
    },
    {
      id: 'proj-007', name: 'South Lake Union Hotel', location: 'Seattle, WA',
      bidDate: '2026-01-30', status: 'lost', assignedTo: 'Maria Chen',
      isFavorite: false, gcCompany: 'Walsh Construction', madePublic: false,
      description: '180-room boutique hotel with rooftop amenities, full kitchen, and custom interior finishes.',
      constructionType: 'Hospitality', projectType: 'New Construction', buildingUse: 'Hotel',
      estimatedStartDate: '2026-04-01',
      matchingTrades: ['Material Estimating', 'Flooring', 'Plumbing'],
    },
    {
      id: 'proj-008', name: 'Redmond Tech Campus Phase 1', location: 'Redmond, WA',
      bidDate: '2026-07-15', status: 'saved', assignedTo: 'Alex Martinez',
      isFavorite: false, gcCompany: 'Mortenson Construction', madePublic: false,
      description: 'Phase 1 of a 3-building tech campus with data center, collaborative workspaces, and on-site amenities.',
      constructionType: 'Commercial', projectType: 'New Construction', buildingUse: 'Technology Campus',
      estimatedStartDate: '2026-09-01',
      matchingTrades: ['Material Estimating', 'Electrical', 'Data/Communications'],
    },
    {
      id: 'proj-009', name: 'Bellevue Waterfront Tower', location: 'Bellevue, WA',
      bidDate: '2026-07-01', status: 'saved', assignedTo: 'Maria Chen',
      isFavorite: true, gcCompany: 'Turner Construction', madePublic: false,
      description: '32-story mixed-use tower with retail podium, residential units, and parking structure.',
      constructionType: 'Mixed-Use', projectType: 'New Construction', buildingUse: 'Residential / Retail',
      estimatedStartDate: '2026-10-01',
      matchingTrades: ['Material Estimating', 'Concrete', 'Curtain Wall'],
    },
    {
      id: 'proj-010', name: 'University District Student Housing', location: 'Seattle, WA',
      bidDate: '2026-08-01', status: 'saved', assignedTo: '',
      isFavorite: false, gcCompany: 'Sellen Construction', madePublic: false,
      description: '200-bed student housing facility with shared study spaces, fitness center, and ground-floor retail.',
      constructionType: 'Residential', projectType: 'New Construction', buildingUse: 'Student Housing',
      estimatedStartDate: '2026-11-01',
      matchingTrades: ['Material Estimating', 'Drywall', 'Flooring'],
    },
    {
      id: 'proj-011', name: 'Tacoma Convention Center Expansion', location: 'Tacoma, WA',
      bidDate: '2026-03-15', status: 'bid_submitted', assignedTo: 'Alex Martinez',
      isFavorite: false, gcCompany: 'DPR Construction', madePublic: true,
      description: 'Expansion of existing convention center adding 80,000 SF of exhibition space and pre-function areas.',
      constructionType: 'Commercial', projectType: 'Addition', buildingUse: 'Convention Center',
      estimatedStartDate: '2026-05-15',
      matchingTrades: ['Material Estimating', 'HVAC', 'Electrical', 'Flooring'],
    },
    {
      id: 'proj-012', name: 'Kirkland Medical Clinic TI', location: 'Kirkland, WA',
      bidDate: '2026-06-30', status: 'saved', assignedTo: 'Maria Chen',
      isFavorite: false, gcCompany: 'Skanska USA Building', madePublic: false,
      description: 'Tenant improvement for a 12,000 SF multi-specialty medical clinic with procedure rooms.',
      constructionType: 'Healthcare', projectType: 'Tenant Improvement', buildingUse: 'Medical Clinic',
      estimatedStartDate: '2026-08-15',
      matchingTrades: ['Material Estimating', 'Plumbing', 'Medical Gas'],
    },
    {
      id: 'proj-013', name: 'Bothell Distribution Center', location: 'Bothell, WA',
      bidDate: '2026-01-20', status: 'lost', assignedTo: 'Alex Martinez',
      isFavorite: false, gcCompany: 'Balfour Beatty', madePublic: false,
      description: '450,000 SF logistics distribution center with dock-high loading, cold storage, and office mezzanine.',
      constructionType: 'Industrial', projectType: 'New Construction', buildingUse: 'Distribution Center',
      estimatedStartDate: '2026-03-01',
      matchingTrades: ['Material Estimating', 'Concrete', 'Insulation'],
    },
  ];

  filteredProjects = computed(() => {
    let projects = this.allProjects.filter(p => p.status === this.activeTab());
    if (this.searchQuery()) {
      const q = this.searchQuery().toLowerCase();
      projects = projects.filter(p => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q));
    }
    return projects;
  });

  getTabCount(key: string): number {
    return this.allProjects.filter(p => p.status === key).length;
  }

  tabResultLabel = computed(() => {
    const labels: Record<string, string> = {
      saved: 'Projects your team has saved',
      in_progress: 'Projects in progress',
      estimate_shared: 'Projects with estimate shared',
      bid_submitted: 'Projects with bid submitted',
      won: 'Projects your team has won',
      lost: 'Projects your team has lost',
    };
    return labels[this.activeTab()] ?? 'Projects';
  });

  setTab(key: string) {
    this.activeTab.set(key);
    this.selectedProject.set(null);
  }

  selectProject(project: BidProject) {
    this.selectedProject.set(this.selectedProject()?.id === project.id ? null : project);
  }

  toggleFavorite(project: BidProject) {
    project.isFavorite = !project.isFavorite;
  }

  updateStatus(project: BidProject, status: string) {
    project.status = status;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  }
}
