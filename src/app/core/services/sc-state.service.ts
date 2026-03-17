import { Injectable, signal } from '@angular/core';

export type BidStatus = 'none' | 'intend' | 'submitted' | 'declined';

/**
 * Holds state for the currently logged-in SC (subcontractor) user.
 * Shared between the SC project view and the SP subcontractors tab so
 * that actions taken on the SC side surface immediately on the SP side.
 */
@Injectable({ providedIn: 'root' })
export class ScStateService {
  /** The subcontractor entry this SC user maps to in the SP data */
  readonly scId = 'ue-001';
  readonly scCompanyName = 'Pioneer Electric Co.';

  /** The SP (general contractor / supplier) identity */
  readonly spCompanyName = 'Summit Supplies';
  readonly spUserName = 'Alex Martinez';

  /**
   * looking_for_suppliers state, keyed by projectId.
   * Initialised with true for proj-001 to match the seed data.
   */
  private readonly _lookingForSuppliers = signal<Record<string, boolean>>({ 'proj-001': true });

  /** Bid status per project */
  private readonly _bidStatuses = signal<Record<string, BidStatus>>({});

  readonly lookingForSuppliers = this._lookingForSuppliers.asReadonly();
  readonly bidStatuses = this._bidStatuses.asReadonly();

  isLookingForSuppliers(projectId: string): boolean {
    return this._lookingForSuppliers()[projectId] ?? false;
  }

  setLookingForSuppliers(projectId: string, value: boolean): void {
    this._lookingForSuppliers.update(m => ({ ...m, [projectId]: value }));
  }

  getBidStatus(projectId: string): BidStatus {
    return this._bidStatuses()[projectId] ?? 'none';
  }

  setBidStatus(projectId: string, value: BidStatus): void {
    this._bidStatuses.update(m => ({ ...m, [projectId]: value }));
  }
}
