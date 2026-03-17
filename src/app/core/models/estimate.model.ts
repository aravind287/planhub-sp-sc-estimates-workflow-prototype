export type EstimateType = 'gc_bid' | 'material_estimate';

export interface EstimateSubmission {
  subcontractorId: string;
  subcontractorName: string;
  status: EstimateStatus;
  amount?: number;
  followUpDate?: string;
  followUpOverdue?: boolean;
}

export type EstimateStatus =
  | 'requested'
  | 'preparing'
  | 'sent'
  | 'viewed'
  | 'replied'
  | 'negotiating'
  | 'awarded'
  | 'lost'
  | 'expired'
  | 'archived';

export interface ActivityEntry {
  id: string;
  type: 'request_created' | 'estimate_submitted' | 'estimate_viewed' | 'follow_up' | 'message' | 'status_change' | 'awarded' | 'lost' | 'note' | 'call' | 'email';
  description: string;
  user: string;
  timestamp: Date;
}

export interface Estimate {
  id: string;
  type: EstimateType;
  projectId: string;
  projectName: string;
  subcontractorId?: string;
  subcontractorName?: string;
  gcCompany?: string;
  materialScope?: string;
  trade: string;
  amount?: number;
  status: EstimateStatus;
  bidDueDate: string;
  submittedDate?: string;
  submittedBy: string;
  assignedTo?: string;
  notes?: string;
  hasAttachments: boolean;
  hasAlternates: boolean;
  followUpDate?: string;
  followUpOverdue?: boolean;
  winLossReason?: string;
  competitorInfo?: string;
  awardedValue?: number;
  activity: ActivityEntry[];
  isRequest?: boolean;
  requestId?: string;
  alternateOptions?: string[];
  submissions?: EstimateSubmission[];
}
