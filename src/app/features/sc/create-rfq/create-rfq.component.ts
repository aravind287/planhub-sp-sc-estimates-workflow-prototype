import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { EstimateService } from '../../../core/services/estimate.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

interface SupplierCard {
  id: string;
  name: string;
  trade: string;
  location: string;
  rating: number;
  pastProjects: number;
  selected: boolean;
  logoInitials: string;
}

@Component({
  selector: 'app-create-rfq',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="create-rfq-page">
      <div class="page-header">
        <a routerLink="/sc/requests" class="back-link">← My Requests</a>
        <h1>Create Material Request</h1>
        <p>Request pricing from multiple suppliers for your material needs</p>
      </div>

      <!-- Progress Indicator -->
      <div class="progress-bar">
        @for (step of steps; track step.num) {
          <div class="progress-step" [class.active]="currentStep() === step.num" [class.completed]="currentStep() > step.num">
            <div class="step-circle">
              @if (currentStep() > step.num) {
                <span>✓</span>
              } @else {
                <span>{{ step.num }}</span>
              }
            </div>
            <span class="step-label">{{ step.label }}</span>
          </div>
          @if (!$last) {
            <div class="progress-line" [class.completed]="currentStep() > step.num"></div>
          }
        }
      </div>

      <!-- Step 1: Request Details -->
      @if (currentStep() === 1) {
        <div class="ph-card step-card">
          <h3>Step 1: Request Details</h3>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Project <span class="required">*</span></label>
              <select class="ph-select full-width" [value]="selectedProject()" (change)="selectedProject.set($any($event.target).value)">
                <option value="">— Select a project —</option>
                @for (p of projects(); track p.id) {
                  <option [value]="p.id">{{ p.name }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Trade Category <span class="required">*</span></label>
              <select class="ph-select full-width" [value]="trade()" (change)="trade.set($any($event.target).value)">
                <option value="">Select trade...</option>
                <option>Electrical</option>
                <option>Plumbing</option>
                <option>HVAC</option>
                <option>Framing</option>
                <option>Concrete</option>
                <option>Drywall</option>
                <option>Roofing</option>
                <option>Flooring</option>
                <option>Insulation</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label class="form-label">Material Scope Description <span class="required">*</span></label>
              <textarea class="ph-textarea full-width" rows="4"
                placeholder="Describe the materials you need pricing for, e.g. 'LED lighting fixtures for 12,000 sq ft office TI including panels, wiring, and smart controls...'"
                [value]="scope()" (input)="scope.set($any($event.target).value)"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Response Due Date <span class="required">*</span></label>
              <input type="date" class="ph-input full-width" [value]="dueDate()" (change)="dueDate.set($any($event.target).value)" />
            </div>
            <div class="form-group">
              <label class="form-label">Notes / Special Requirements</label>
              <textarea class="ph-textarea full-width" rows="3"
                placeholder="Any special requirements, certifications, or notes..."
                [value]="notes()" (input)="notes.set($any($event.target).value)"></textarea>
            </div>
            <div class="form-group full-width">
              <label class="form-label">Specifications / Drawings</label>
              <div class="upload-zone">
                <div class="upload-icon">📁</div>
                <p class="upload-text">Drop specs, drawings, or schedules here or <span class="upload-link">browse</span></p>
                <p class="upload-hint">PDF, DWG, Excel up to 100MB each</p>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Step 2: Select Suppliers -->
      @if (currentStep() === 2) {
        <div class="ph-card step-card">
          <h3>Step 2: Select Suppliers</h3>

          <div class="recommended-section">
            <div class="recommended-header">
              <span class="recommended-title">⭐ Recommended Suppliers</span>
              <span class="recommended-subtitle">Based on trade match, location, and past performance</span>
            </div>
            <div class="supplier-cards">
              @for (supplier of suppliers; track supplier.id) {
                <div class="supplier-card" [class.selected]="supplier.selected" (click)="toggleSupplier(supplier)">
                  <div class="supplier-card-header">
                    <div class="supplier-logo">{{ supplier.logoInitials }}</div>
                    <div class="supplier-header-info">
                      <span class="supplier-name">{{ supplier.name }}</span>
                      <span class="supplier-trade">{{ supplier.trade }}</span>
                    </div>
                    <input type="checkbox" [checked]="supplier.selected" (change)="toggleSupplier(supplier)" (click)="$event.stopPropagation()" />
                  </div>
                  <div class="supplier-card-body">
                    <div class="supplier-meta">
                      <span class="meta-item">📍 {{ supplier.location }}</span>
                      <span class="meta-item">⭐ {{ supplier.rating.toFixed(1) }}</span>
                      <span class="meta-item">{{ supplier.pastProjects }} projects</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="search-more">
            <div class="ph-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input type="text" placeholder="Search all suppliers..." />
            </div>
          </div>

          @if (selectedSuppliers().length > 0) {
            <div class="selected-suppliers-summary">
              <span class="selected-label">Selected Suppliers ({{ selectedSuppliers().length }}):</span>
              <div class="selected-chips">
                @for (sup of selectedSuppliers(); track sup.id) {
                  <span class="sup-chip">
                    {{ sup.name }}
                    <button class="remove-chip" (click)="toggleSupplier(sup); $event.stopPropagation()">✕</button>
                  </span>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Step 3: Review & Send -->
      @if (currentStep() === 3) {
        <div class="ph-card step-card">
          <h3>Step 3: Review & Send</h3>
          <div class="review-section">
            <h4>Request Summary</h4>
            <div class="review-grid">
              <div class="review-item">
                <span class="review-label">Project</span>
                <span class="review-value">{{ getProjectName() }}</span>
              </div>
              <div class="review-item">
                <span class="review-label">Trade</span>
                <span class="review-value">{{ trade() || '—' }}</span>
              </div>
              <div class="review-item full-width">
                <span class="review-label">Material Scope</span>
                <span class="review-value">{{ scope() || '—' }}</span>
              </div>
              <div class="review-item">
                <span class="review-label">Due Date</span>
                <span class="review-value">{{ dueDate() ? formatDate(dueDate()) : '—' }}</span>
              </div>
              @if (notes()) {
                <div class="review-item full-width">
                  <span class="review-label">Notes</span>
                  <span class="review-value">{{ notes() }}</span>
                </div>
              }
            </div>
          </div>
          <div class="review-section">
            <h4>Suppliers to Receive Request ({{ selectedSuppliers().length }})</h4>
            @if (selectedSuppliers().length === 0) {
              <p class="text-secondary">No suppliers selected. Go back to Step 2 to add suppliers.</p>
            } @else {
              <div class="review-suppliers">
                @for (sup of selectedSuppliers(); track sup.id) {
                  <div class="review-supplier-row">
                    <div class="sup-logo-sm">{{ sup.logoInitials }}</div>
                    <span class="sup-name">{{ sup.name }}</span>
                    <span class="sup-trade">{{ sup.trade }}</span>
                    <span class="sup-location">{{ sup.location }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- Navigation Buttons -->
      <div class="step-nav">
        <div class="nav-left">
          @if (currentStep() > 1) {
            <button class="btn-secondary" (click)="prevStep()">← Back</button>
          } @else {
            <a routerLink="/sc/requests" class="btn-secondary">Cancel</a>
          }
        </div>
        <div class="nav-right">
          @if (currentStep() < 3) {
            <button class="btn-primary" (click)="nextStep()">Next →</button>
          } @else {
            <button class="btn-primary send-btn" (click)="sendRequest()" [disabled]="selectedSuppliers().length === 0">
              Send Request ({{ selectedSuppliers().length }} suppliers) →
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-rfq-page { max-width: 860px; }
    .back-link { display: inline-block; color: #1BB8A8; text-decoration: none; font-size: 13px; margin-bottom: 8px; }
    .back-link:hover { text-decoration: underline; }

    .progress-bar {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      padding: 20px 0;
    }
    .progress-step { display: flex; align-items: center; flex-direction: column; gap: 6px; }
    .step-circle {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: #edf2f7;
      color: #718096;
      font-size: 14px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #e2e8f0;
    }
    .progress-step.active .step-circle { background: #1BB8A8; color: white; border-color: #1BB8A8; }
    .progress-step.completed .step-circle { background: #1BB8A8; color: white; border-color: #1BB8A8; }
    .step-label { font-size: 12px; color: #718096; white-space: nowrap; font-weight: 500; }
    .progress-step.active .step-label { color: #1BB8A8; }
    .progress-line {
      flex: 1;
      height: 2px;
      background: #e2e8f0;
      margin-bottom: 20px;
    }
    .progress-line.completed { background: #1BB8A8; }

    .step-card { }
    .step-card h3 { margin: 0 0 20px; font-size: 16px; font-weight: 600; color: #2d3748; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full-width { grid-column: 1 / -1; }
    .form-label { font-size: 13px; font-weight: 500; color: #4a5568; }
    .required { color: #fc8181; }
    .full-width { width: 100%; box-sizing: border-box; }
    .ph-input { border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; font-size: 14px; color: #2d3748; }
    .ph-select { border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; font-size: 14px; background: white; color: #2d3748; }
    .ph-textarea { border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; font-size: 14px; color: #2d3748; resize: vertical; font-family: inherit; }
    .upload-zone {
      border: 2px dashed #e2e8f0; border-radius: 8px; padding: 28px;
      text-align: center; cursor: pointer;
    }
    .upload-zone:hover { border-color: #1BB8A8; }
    .upload-icon { font-size: 28px; margin-bottom: 8px; }
    .upload-text { font-size: 14px; color: #4a5568; margin: 0 0 4px; }
    .upload-link { color: #1BB8A8; cursor: pointer; }
    .upload-hint { font-size: 12px; color: #a0aec0; margin: 0; }

    .recommended-section { margin-bottom: 24px; }
    .recommended-header { margin-bottom: 16px; }
    .recommended-title { font-size: 14px; font-weight: 600; color: #2d3748; }
    .recommended-subtitle { display: block; font-size: 12px; color: #718096; margin-top: 2px; }
    .supplier-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .supplier-card {
      border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;
      cursor: pointer; transition: border-color 0.15s;
    }
    .supplier-card:hover { border-color: #1BB8A8; }
    .supplier-card.selected { border-color: #1BB8A8; background: #f0fffe; }
    .supplier-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .supplier-logo {
      width: 36px; height: 36px; border-radius: 8px;
      background: #1BB8A8; color: white;
      font-size: 11px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .supplier-header-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .supplier-name { font-size: 13px; font-weight: 600; color: #2d3748; }
    .supplier-trade { font-size: 11px; color: #718096; }
    .supplier-meta { display: flex; flex-wrap: wrap; gap: 10px; }
    .meta-item { font-size: 12px; color: #718096; }

    .search-more { margin-bottom: 16px; }
    .selected-suppliers-summary { background: #f9fafb; border-radius: 8px; padding: 14px; margin-top: 16px; }
    .selected-label { font-size: 13px; font-weight: 600; color: #2d3748; display: block; margin-bottom: 8px; }
    .selected-chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .sup-chip {
      display: flex; align-items: center; gap: 4px;
      background: #e6fffa; color: #234e52;
      border-radius: 20px; padding: 4px 10px; font-size: 12px; font-weight: 500;
    }
    .remove-chip { background: none; border: none; font-size: 12px; cursor: pointer; color: #718096; padding: 0; }

    .review-section { margin-bottom: 24px; }
    .review-section h4 { margin: 0 0 14px; font-size: 14px; font-weight: 600; color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    .review-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
    .review-item { display: flex; flex-direction: column; gap: 4px; }
    .review-item.full-width { grid-column: 1 / -1; }
    .review-label { font-size: 11px; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 0.05em; }
    .review-value { font-size: 14px; color: #2d3748; }
    .text-secondary { color: #a0aec0; font-size: 13px; }

    .review-suppliers { display: flex; flex-direction: column; gap: 10px; }
    .review-supplier-row {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 6px;
    }
    .sup-logo-sm {
      width: 28px; height: 28px; border-radius: 6px;
      background: #1BB8A8; color: white; font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .sup-name { font-size: 13px; font-weight: 500; color: #2d3748; flex: 1; }
    .sup-trade { font-size: 12px; color: #718096; }
    .sup-location { font-size: 12px; color: #718096; }

    .step-nav {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 16px; padding-top: 16px;
    }
    .send-btn { padding: 10px 24px; font-size: 15px; }
    .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class CreateRfqComponent {
  private projectService = inject(ProjectService);
  private router = inject(Router);

  currentStep = signal(1);
  projects = signal<Project[]>([]);

  selectedProject = signal('');
  trade = signal('');
  scope = signal('');
  dueDate = signal('');
  notes = signal('');

  steps = [
    { num: 1, label: 'Request Details' },
    { num: 2, label: 'Select Suppliers' },
    { num: 3, label: 'Review & Send' }
  ];

  suppliers: SupplierCard[] = [
    { id: 'sp-001', name: 'Pacific Northwest Electric', trade: 'Electrical', location: 'Seattle, WA', rating: 4.8, pastProjects: 23, selected: false, logoInitials: 'PNE' },
    { id: 'sp-002', name: 'Columbia Concrete Supply', trade: 'Concrete', location: 'Portland, OR', rating: 4.6, pastProjects: 18, selected: false, logoInitials: 'CCS' },
    { id: 'sp-003', name: 'Puget Sound HVAC', trade: 'HVAC', location: 'Tacoma, WA', rating: 4.7, pastProjects: 31, selected: false, logoInitials: 'PSH' },
    { id: 'sp-004', name: 'Pacific Drywall & Insulation', trade: 'Drywall', location: 'Redmond, WA', rating: 4.5, pastProjects: 15, selected: false, logoInitials: 'PDI' },
    { id: 'sp-005', name: 'Seattle Plumbing Solutions', trade: 'Plumbing', location: 'Seattle, WA', rating: 4.9, pastProjects: 42, selected: false, logoInitials: 'SPS' },
    { id: 'sp-006', name: 'Northwest Roofing Supply', trade: 'Roofing', location: 'Bellevue, WA', rating: 4.4, pastProjects: 11, selected: false, logoInitials: 'NRS' }
  ];

  selectedSuppliers = computed(() => this.suppliers.filter(s => s.selected));

  ngOnInit() {
    this.projectService.getAll().subscribe(p => this.projects.set(p));
  }

  toggleSupplier(supplier: SupplierCard) {
    supplier.selected = !supplier.selected;
  }

  getProjectName(): string {
    const p = this.projects().find(p => p.id === this.selectedProject());
    return p?.name || '—';
  }

  nextStep() {
    if (this.currentStep() === 1) {
      if (!this.selectedProject() || !this.scope() || !this.trade()) {
        alert('Please fill in Project, Trade, and Material Scope before proceeding.');
        return;
      }
    }
    if (this.currentStep() < 3) this.currentStep.update(s => s + 1);
  }

  prevStep() {
    if (this.currentStep() > 1) this.currentStep.update(s => s - 1);
  }

  sendRequest() {
    if (this.selectedSuppliers().length === 0) return;
    alert(`Material request sent to ${this.selectedSuppliers().length} supplier(s)! They will receive your request and can submit estimates.`);
    this.router.navigate(['/sc/requests']);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
