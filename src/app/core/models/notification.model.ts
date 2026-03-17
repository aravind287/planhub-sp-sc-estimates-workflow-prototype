export interface Notification {
  id: string;
  type: 'request_received' | 'estimate_viewed' | 'sc_responded' | 'follow_up_due' | 'estimate_received' | 'estimate_revised' | 'sp_responded';
  message: string;
  projectName: string;
  timestamp: Date;
  read: boolean;
  estimateId?: string;
}
