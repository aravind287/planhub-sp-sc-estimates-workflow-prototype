export type BiddingStatus = 'placed_bid' | 'bidding' | 'interested' | 'not_bidding' | 'undecided' | 'no_response';

export type BiddingActivity =
  | 'viewed'
  | 'downloaded_plans'
  | 'declared_bidding'
  | 'submitted_estimate'
  // Recommended additions
  | 'opened_email'           // Opened the estimate notification email
  | 'requested_clarification' // Sent a question or clarification request
  | 'declined_bid'           // Explicitly opted out of bidding
  | 'visited_project';       // Viewed the project page (not just the estimate)

export interface Subcontractor {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  location: string;
  trades: string[];
  activity?: BiddingActivity;
  biddingIntent?: BiddingActivity;
  biddingStatus?: BiddingStatus;
  estimateId?: string;
  estimateStatus?: string;
  estimateAmount?: number;
  lastActivity?: string;
  followUpDate?: string;
  followUpOverdue?: boolean;
  logoInitials?: string;
  looking_for_suppliers?: boolean;
}
