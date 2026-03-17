import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-estimate-create',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="create-page">
      <div class="page-header">
        @if (fromProjectId()) {
          <a [routerLink]="['/sp/projects', fromProjectId(), 'subcontractors']" class="back-link">← Project</a>
        } @else {
          <a routerLink="/sp/pipeline" class="back-link">← Pipeline</a>
        }
        <h1>Share Estimate</h1>
      </div>

      <div class="ph-card form-card">
        <!-- Attachment -->
        <div class="form-group">
          <label class="form-label">Attachment</label>
          <div class="upload-zone" (click)="triggerFileInput()">
            <div class="upload-icon">📁</div>
            <p class="upload-text">Drag & drop files here, or <span class="upload-link">browse</span></p>
            <p class="upload-hint">PDF, Excel, images up to 50MB each</p>
          </div>
          @for (file of attachedFiles(); track $index) {
            <div class="file-row">
              <span class="file-icon">📄</span>
              <span class="file-name">{{ file }}</span>
              <button class="remove-file-btn" (click)="removeFile($index)">✕</button>
            </div>
          }
        </div>

        <!-- Message -->
        <div class="form-group">
          <label class="form-label">Message <span class="label-hint">(sent via email)</span></label>
          <textarea class="ph-textarea" rows="5" placeholder="Add a message to accompany this estimate..." [value]="message()" (input)="message.set($any($event.target).value)"></textarea>
        </div>

        <!-- Footer -->
        <div class="form-footer">
          <a [routerLink]="fromProjectId() ? ['/sp/projects', fromProjectId(), 'subcontractors'] : ['/sp/pipeline']" class="btn-secondary">Cancel</a>
          <button class="btn-primary send-btn" (click)="sendEstimate()">Send Estimate →</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-page { max-width: 600px; }
    .back-link {
      display: inline-block;
      color: #1BB8A8;
      text-decoration: none;
      font-size: 13px;
      margin-bottom: 8px;
    }
    .back-link:hover { text-decoration: underline; }
    .page-header { margin-bottom: 20px; }
    .page-header h1 { margin: 4px 0 0; font-size: 22px; font-weight: 700; color: #2d3748; }
    .form-card { display: flex; flex-direction: column; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-label { font-size: 13px; font-weight: 500; color: #4a5568; }
    .label-hint { font-size: 12px; color: #a0aec0; font-weight: 400; }
    .upload-zone {
      border: 2px dashed #e2e8f0;
      border-radius: 8px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.15s;
      margin-bottom: 8px;
    }
    .upload-zone:hover { border-color: #1BB8A8; }
    .upload-icon { font-size: 32px; margin-bottom: 8px; }
    .upload-text { font-size: 14px; color: #4a5568; margin: 0 0 4px; }
    .upload-link { color: #1BB8A8; cursor: pointer; }
    .upload-hint { font-size: 12px; color: #a0aec0; margin: 0; }
    .file-row { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f7fafc; border-radius: 6px; margin-bottom: 6px; }
    .file-icon { font-size: 16px; }
    .file-name { flex: 1; font-size: 13px; color: #2d3748; }
    .remove-file-btn { background: none; border: none; color: #a0aec0; cursor: pointer; }
    .ph-textarea {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 14px;
      color: #2d3748;
      resize: vertical;
      font-family: inherit;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }
    .ph-textarea:focus { border-color: #1BB8A8; }
    .form-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding-top: 4px;
    }
    .send-btn { padding: 10px 24px; font-size: 15px; }
  `]
})
export class EstimateCreateComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  fromProjectId = signal<string | null>(null);
  attachedFiles = signal<string[]>([]);
  message = signal('');

  ngOnInit() {
    this.fromProjectId.set(this.route.snapshot.queryParamMap.get('fromProject'));
  }

  triggerFileInput() {
    // File input would be wired to a real <input type="file"> in production
  }

  removeFile(index: number) {
    this.attachedFiles.update(files => files.filter((_, i) => i !== index));
  }

  private backRoute(): string[] {
    const pid = this.fromProjectId();
    return pid ? ['/sp/projects', pid, 'subcontractors'] : ['/sp/pipeline'];
  }

  sendEstimate() {
    alert('Estimate sent successfully!');
    this.router.navigate(this.backRoute());
  }
}
