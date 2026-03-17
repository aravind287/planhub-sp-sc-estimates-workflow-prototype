import { Injectable, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Estimate, EstimateStatus, ActivityEntry, EstimateSubmission } from '../models/estimate.model';
import { Subcontractor, BiddingStatus } from '../models/subcontractor.model';

const ELECTRICAL_SUBS_85: EstimateSubmission[] = [
  // 1 awarded
  { subcontractorId: 'sc-001', subcontractorName: 'Pacific Northwest Electric', status: 'awarded', amount: 48500 },
  // 4 negotiating
  { subcontractorId: 'sc-e01', subcontractorName: 'Sound Electric Inc.', status: 'negotiating', amount: 48500 },
  { subcontractorId: 'sc-e02', subcontractorName: 'Capitol Hill Electrical', status: 'negotiating', amount: 48500 },
  { subcontractorId: 'sc-e03', subcontractorName: 'Cascade Power Systems', status: 'negotiating', amount: 48500 },
  { subcontractorId: 'sc-e04', subcontractorName: 'Puget Electrical Group', status: 'negotiating', amount: 48500 },
  // 8 replied
  ...['Rainier Electric', 'Olympic Electrical', 'Emerald City Electric', 'Shoreline Power Co.', 'Bellevue Electrical', 'Redmond Electric', 'Kirkland Power', 'Bothell Electric'].map((name, i) => ({
    subcontractorId: `sc-r${i}`, subcontractorName: name, status: 'replied' as EstimateStatus, amount: 48500
  })),
  // 15 viewed
  ...['Tacoma Electrical', 'Renton Power', 'Auburn Electric', 'Kent Electrical Co.', 'Federal Way Electric', 'Burien Power', 'SeaTac Electric', 'Tukwila Electrical', 'Des Moines Electric', 'Normandy Park Power', 'Mercer Island Electric', 'Medina Electrical', 'Clyde Hill Power', 'Hunts Point Electric', 'Yarrow Point Electrical'].map((name, i) => ({
    subcontractorId: `sc-v${i}`, subcontractorName: name, status: 'viewed' as EstimateStatus, amount: 48500
  })),
  // 35 sent
  ...Array.from({ length: 35 }, (_, i) => ({
    subcontractorId: `sc-s${i}`, subcontractorName: `Regional Electric Co. #${i + 1}`, status: 'sent' as EstimateStatus, amount: 48500
  })),
  // 22 requested
  ...Array.from({ length: 22 }, (_, i) => ({
    subcontractorId: `sc-q${i}`, subcontractorName: `Northwest Contractor #${i + 1}`, status: 'requested' as EstimateStatus
  })),
];

// Subcontractors in the project universe but not yet sent an estimate or requested one.
// These surface under "Haven't Received Estimate" and show no bidding activity.
const UNENGAGED_POOL: Record<string, Subcontractor[]> = {
  'proj-001': [
    { id: 'ue-001', companyName: 'Pioneer Electric Co.',         contactName: 'Ryan Cho',       phone: '(206) 555-1101', email: 'ryan@pioneerelectric.com',    location: 'Seattle, WA',   trades: ['Electrical'],        biddingStatus: 'no_response', activity: 'viewed', logoInitials: 'PEC', looking_for_suppliers: true },
    { id: 'ue-002', companyName: 'Metro Plumbing Group',         contactName: 'Dana Mills',     phone: '(206) 555-1202', email: 'dana@metroplumbing.com',      location: 'Seattle, WA',   trades: ['Plumbing'],          biddingStatus: 'no_response', logoInitials: 'MPG', looking_for_suppliers: true },
    { id: 'ue-003', companyName: 'Seattle HVAC Solutions',       contactName: 'Greg Navarro',   phone: '(206) 555-1303', email: 'greg@seattlehvac.com',        location: 'Seattle, WA',   trades: ['HVAC'],              biddingStatus: 'no_response', logoInitials: 'SHS' },
    { id: 'ue-004', companyName: 'Westside Flooring Co.',        contactName: 'Priya Sharma',   phone: '(425) 555-1404', email: 'priya@westsidefloor.com',     location: 'Bellevue, WA',  trades: ['Flooring'],          biddingStatus: 'no_response', logoInitials: 'WFC' },
    { id: 'ue-005', companyName: 'Capitol Drywall LLC',          contactName: 'Marcus Webb',    phone: '(206) 555-1505', email: 'marcus@capitoldrywall.com',   location: 'Seattle, WA',   trades: ['Drywall'],           biddingStatus: 'no_response', logoInitials: 'CDL', looking_for_suppliers: true },
    { id: 'ue-006', companyName: 'Blue Ridge Painting',          contactName: 'Tanya Brooks',   phone: '(425) 555-1606', email: 'tanya@blueridgepaint.com',    location: 'Kirkland, WA',  trades: ['Painting'],          biddingStatus: 'no_response', logoInitials: 'BRP' },
    { id: 'ue-007', companyName: 'Pacific Tile Works',           contactName: 'Lena Kovacs',    phone: '(206) 555-1707', email: 'lena@pacifictile.com',        location: 'Seattle, WA',   trades: ['Tile'],              biddingStatus: 'no_response', logoInitials: 'PTW' },
    { id: 'ue-008', companyName: 'Northgate Glass & Glazing',    contactName: 'Sam O\'Brien',   phone: '(206) 555-1808', email: 'sam@northgateglass.com',      location: 'Seattle, WA',   trades: ['Glass', 'Glazing'],  biddingStatus: 'no_response', logoInitials: 'NGG' },
    { id: 'ue-009', companyName: 'Olympic Fire Protection',      contactName: 'Carl Dennis',    phone: '(253) 555-1909', email: 'carl@olympicfire.com',        location: 'Tacoma, WA',    trades: ['Fire Protection'],   biddingStatus: 'no_response', logoInitials: 'OFP' },
    { id: 'ue-010', companyName: 'Northwest Low Voltage',        contactName: 'Jessica Tam',    phone: '(425) 555-2010', email: 'jessica@nwlowvoltage.com',    location: 'Redmond, WA',   trades: ['Low Voltage'],       biddingStatus: 'no_response', logoInitials: 'NLV' },
    { id: 'ue-011', companyName: 'Sound Mechanical Services',    contactName: 'Brett Olsen',    phone: '(206) 555-2111', email: 'brett@soundmechanical.com',   location: 'Seattle, WA',   trades: ['Mechanical'],        biddingStatus: 'no_response', logoInitials: 'SMS' },
    { id: 'ue-012', companyName: 'Cascade Security Systems',     contactName: 'Nina Patel',     phone: '(425) 555-2212', email: 'nina@cascadesecurity.com',    location: 'Bellevue, WA',  trades: ['Security'],          biddingStatus: 'no_response', logoInitials: 'CSS' },
    { id: 'ue-013', companyName: 'Emerald City Millwork',        contactName: 'Derek Huang',    phone: '(206) 555-2313', email: 'derek@emeraldmillwork.com',   location: 'Seattle, WA',   trades: ['Millwork'],          biddingStatus: 'no_response', logoInitials: 'ECM' },
    { id: 'ue-014', companyName: 'Rainier Concrete Cutting',     contactName: 'Alicia Ford',    phone: '(253) 555-2414', email: 'alicia@rainierconcrete.com',  location: 'Renton, WA',    trades: ['Concrete'],          biddingStatus: 'no_response', logoInitials: 'RCC' },
    { id: 'ue-015', companyName: 'Puget Acoustics & Ceilings',   contactName: 'Tom Larsen',     phone: '(206) 555-2515', email: 'tom@pugetacoustics.com',      location: 'Seattle, WA',   trades: ['Ceilings'],          biddingStatus: 'no_response', logoInitials: 'PAC' },
  ],
  'proj-002': [
    { id: 'ue-001',    companyName: 'Pioneer Electric Co.',      contactName: 'Ryan Cho',       phone: '(206) 555-1101', email: 'ryan@pioneerelectric.com',    location: 'Seattle, WA',   trades: ['Electrical'],        biddingStatus: 'no_response', activity: 'viewed', logoInitials: 'PEC', looking_for_suppliers: true },
    { id: 'ue-p2-001', companyName: 'Redmond Electric Group',   contactName: 'Paul Kim',       phone: '(425) 555-3001', email: 'paul@redmondelectric.com',    location: 'Redmond, WA',   trades: ['Electrical'],        biddingStatus: 'no_response', logoInitials: 'REG', looking_for_suppliers: true },
    { id: 'ue-p2-002', companyName: 'Eastside HVAC Pros',       contactName: 'Stacy Liu',      phone: '(425) 555-3002', email: 'stacy@eastsidehvac.com',      location: 'Bellevue, WA',  trades: ['HVAC'],              biddingStatus: 'no_response', logoInitials: 'EHP' },
    { id: 'ue-p2-003', companyName: 'Kirkland Finish Carpentry', contactName: 'Ed Torres',     phone: '(425) 555-3003', email: 'ed@kirklandcarpentry.com',    location: 'Kirkland, WA',  trades: ['Carpentry'],         biddingStatus: 'no_response', logoInitials: 'KFC' },
  ],
  'proj-003': [
    { id: 'ue-001',    companyName: 'Pioneer Electric Co.',      contactName: 'Ryan Cho',       phone: '(206) 555-1101', email: 'ryan@pioneerelectric.com',    location: 'Seattle, WA',   trades: ['Electrical'],        biddingStatus: 'no_response', activity: 'viewed', logoInitials: 'PEC', looking_for_suppliers: true },
    { id: 'ue-p3-001', companyName: 'Portland Electric Works',  contactName: 'Diane Wu',       phone: '(503) 555-4001', email: 'diane@pdxelectric.com',       location: 'Portland, OR',  trades: ['Electrical'],        biddingStatus: 'no_response', logoInitials: 'PEW' },
    { id: 'ue-p3-002', companyName: 'Willamette Roofing Co.',   contactName: 'James Scott',    phone: '(503) 555-4002', email: 'james@willametteroof.com',    location: 'Portland, OR',  trades: ['Roofing'],           biddingStatus: 'no_response', logoInitials: 'WRC' },
    { id: 'ue-p3-003', companyName: 'Columbia Painting Group',  contactName: 'Rosa Reyes',     phone: '(503) 555-4003', email: 'rosa@columbiapaint.com',      location: 'Portland, OR',  trades: ['Painting'],          biddingStatus: 'no_response', logoInitials: 'CPG' },
    { id: 'ue-p3-004', companyName: 'Pacific NW Tile & Stone',  contactName: 'Alan Marsh',     phone: '(503) 555-4004', email: 'alan@pnwtile.com',            location: 'Lake Oswego, OR', trades: ['Tile'],            biddingStatus: 'no_response', logoInitials: 'PNT' },
  ],
};

@Injectable({ providedIn: 'root' })
export class EstimateService {
  private estimatesSignal = signal<Estimate[]>([
    {
      id: 'est-001',
      type: 'material_estimate',
      projectId: 'proj-001',
      projectName: 'Top Pot Doughnuts Foundry Cafe TI',
      subcontractorId: 'sc-001',
      subcontractorName: 'Pacific Northwest Electric',
      trade: 'Electrical',
      materialScope: 'LED lighting fixtures, panel upgrades, service entrance equipment',
      amount: 48500,
      status: 'negotiating',
      bidDueDate: '2026-04-15',
      submittedDate: '2026-03-01',
      submittedBy: 'Alex Martinez',
      assignedTo: 'Alex Martinez',
      notes: 'Client requesting LED retrofit package with smart controls integration. Includes 3 alternate options.',
      hasAttachments: true,
      hasAlternates: true,
      followUpDate: '2026-03-20',
      followUpOverdue: false,
      alternateOptions: ['Standard LED package - $42,000', 'Smart dimmer controls add-on - $5,500', 'Emergency backup lighting - $3,200'],
      submissions: ELECTRICAL_SUBS_85,
      activity: [
        { id: 'act-001-1', type: 'request_created', description: 'Material estimate request created by Pacific Northwest Electric', user: 'Jordan Lee', timestamp: new Date('2026-02-20T09:00:00') },
        { id: 'act-001-2', type: 'estimate_submitted', description: 'Estimate submitted for $48,500 including LED fixtures and panel upgrades', user: 'Alex Martinez', timestamp: new Date('2026-03-01T14:30:00') },
        { id: 'act-001-3', type: 'estimate_viewed', description: 'Estimate opened and reviewed by subcontractor', user: 'Jordan Lee', timestamp: new Date('2026-03-02T10:15:00') },
        { id: 'act-001-4', type: 'message', description: 'Subcontractor requested alternate pricing for smart controls integration', user: 'Jordan Lee', timestamp: new Date('2026-03-05T16:00:00') },
        { id: 'act-001-5', type: 'status_change', description: 'Status updated to Negotiating — discussing alternate options', user: 'Alex Martinez', timestamp: new Date('2026-03-08T11:00:00') }
      ]
    },
    {
      id: 'est-002',
      type: 'material_estimate',
      projectId: 'proj-001',
      projectName: 'Top Pot Doughnuts Foundry Cafe TI',
      subcontractorId: 'sc-002',
      subcontractorName: 'Seattle Plumbing Solutions',
      trade: 'Plumbing',
      materialScope: 'Commercial kitchen plumbing fixtures, grease trap, floor drains, water heater',
      amount: 31200,
      status: 'awarded',
      bidDueDate: '2026-04-15',
      submittedDate: '2026-02-28',
      submittedBy: 'Maria Chen',
      assignedTo: 'Maria Chen',
      notes: 'Full commercial kitchen package. Grease trap per code requirements.',
      hasAttachments: true,
      hasAlternates: false,
      awardedValue: 31200,
      winLossReason: 'Competitive pricing and strong local references',
      submissions: [
        { subcontractorId: 'sc-002', subcontractorName: 'Seattle Plumbing Solutions', status: 'awarded', amount: 31200 },
      ],
      activity: [
        { id: 'act-002-1', type: 'request_created', description: 'RFQ submitted for commercial kitchen plumbing package', user: 'David Park', timestamp: new Date('2026-02-15T08:30:00') },
        { id: 'act-002-2', type: 'estimate_submitted', description: 'Estimate submitted for $31,200 — full kitchen package', user: 'Maria Chen', timestamp: new Date('2026-02-28T12:00:00') },
        { id: 'act-002-3', type: 'estimate_viewed', description: 'Estimate reviewed by David Park', user: 'David Park', timestamp: new Date('2026-03-01T09:00:00') },
        { id: 'act-002-4', type: 'call', description: 'Called to discuss installation timeline and crew availability', user: 'Maria Chen', timestamp: new Date('2026-03-03T14:00:00') },
        { id: 'act-002-5', type: 'awarded', description: 'Estimate awarded — contract sent for signature at $31,200', user: 'David Park', timestamp: new Date('2026-03-07T10:00:00') }
      ]
    },
    {
      id: 'est-003',
      type: 'gc_bid',
      projectId: 'proj-001',
      projectName: 'Top Pot Doughnuts Foundry Cafe TI',
      gcCompany: 'Sellen Construction',
      trade: 'General',
      amount: 285000,
      status: 'sent',
      bidDueDate: '2026-04-15',
      submittedDate: '2026-03-10',
      submittedBy: 'Alex Martinez',
      assignedTo: 'Alex Martinez',
      notes: 'Full TI scope including electrical, plumbing, HVAC, and finishes',
      hasAttachments: true,
      hasAlternates: false,
      followUpDate: '2026-03-25',
      followUpOverdue: false,
      activity: [
        { id: 'act-003-1', type: 'request_created', description: 'Bid invitation received from Sellen Construction', user: 'System', timestamp: new Date('2026-02-25T07:00:00') },
        { id: 'act-003-2', type: 'note', description: 'Downloaded and reviewed project plans — 847 pages', user: 'Alex Martinez', timestamp: new Date('2026-03-02T13:00:00') },
        { id: 'act-003-3', type: 'estimate_submitted', description: 'GC bid submitted for $285,000 full TI scope', user: 'Alex Martinez', timestamp: new Date('2026-03-10T16:30:00') },
        { id: 'act-003-4', type: 'follow_up', description: 'Follow-up reminder set for March 25', user: 'Alex Martinez', timestamp: new Date('2026-03-10T16:35:00') }
      ]
    },
    {
      id: 'est-004',
      type: 'material_estimate',
      projectId: 'proj-002',
      projectName: 'Private test-8-6',
      subcontractorId: 'sc-003',
      subcontractorName: 'Cascade Framing Co.',
      trade: 'Framing',
      materialScope: 'Dimensional lumber package: 2x4, 2x6, 2x10, LVL beams, hardware',
      amount: 22800,
      status: 'viewed',
      bidDueDate: '2026-03-28',
      submittedDate: '2026-03-05',
      submittedBy: 'Maria Chen',
      assignedTo: 'Maria Chen',
      notes: 'Complete framing material package per structural drawings. Includes engineered lumber.',
      hasAttachments: true,
      hasAlternates: true,
      followUpDate: '2026-03-15',
      followUpOverdue: true,
      alternateOptions: ['Engineered wood substitute - $1,200 savings', 'Steel connector upgrade - $800 premium'],
      submissions: [
        { subcontractorId: 'sc-003', subcontractorName: 'Cascade Framing Co.', status: 'viewed', amount: 22800, followUpDate: '2026-03-15', followUpOverdue: true },
      ],
      activity: [
        { id: 'act-004-1', type: 'request_created', description: 'Framing material estimate requested', user: 'Sarah Thompson', timestamp: new Date('2026-03-01T10:00:00') },
        { id: 'act-004-2', type: 'estimate_submitted', description: 'Estimate submitted for $22,800 — dimensional lumber package', user: 'Maria Chen', timestamp: new Date('2026-03-05T11:00:00') },
        { id: 'act-004-3', type: 'estimate_viewed', description: 'Estimate opened by Cascade Framing Co.', user: 'Sarah Thompson', timestamp: new Date('2026-03-06T14:00:00') },
        { id: 'act-004-4', type: 'follow_up', description: 'Follow-up overdue — no response since estimate was viewed', user: 'System', timestamp: new Date('2026-03-15T08:00:00') }
      ]
    },
    {
      id: 'est-005',
      type: 'material_estimate',
      projectId: 'proj-003',
      projectName: 'Riverside Commons Phase 2',
      subcontractorId: 'sc-004',
      subcontractorName: 'Columbia Concrete Supply',
      trade: 'Concrete',
      materialScope: 'Ready-mix concrete 4000 PSI, reinforcing steel, form materials, curing compound',
      amount: 187500,
      status: 'replied',
      bidDueDate: '2026-05-10',
      submittedDate: '2026-03-08',
      submittedBy: 'Alex Martinez',
      assignedTo: 'Alex Martinez',
      notes: 'Phase 2 foundation and slab package. 45,000 sq ft of slab area.',
      hasAttachments: true,
      hasAlternates: false,
      followUpDate: '2026-03-22',
      followUpOverdue: false,
      submissions: [
        { subcontractorId: 'sc-004', subcontractorName: 'Columbia Concrete Supply', status: 'replied', amount: 187500, followUpDate: '2026-03-22' },
      ],
      activity: [
        { id: 'act-005-1', type: 'request_created', description: 'Concrete supply RFQ issued for Phase 2 foundation work', user: 'Mike Johnson', timestamp: new Date('2026-02-28T09:00:00') },
        { id: 'act-005-2', type: 'estimate_submitted', description: 'Estimate submitted for $187,500 — includes all ready-mix and reinforcing', user: 'Alex Martinez', timestamp: new Date('2026-03-08T15:00:00') },
        { id: 'act-005-3', type: 'estimate_viewed', description: 'Estimate reviewed by Columbia Concrete Supply team', user: 'Mike Johnson', timestamp: new Date('2026-03-10T11:30:00') },
        { id: 'act-005-4', type: 'message', description: 'Subcontractor replied — requested delivery schedule details', user: 'Mike Johnson', timestamp: new Date('2026-03-12T14:00:00') },
        { id: 'act-005-5', type: 'email', description: 'Sent delivery schedule and pour sequence documentation', user: 'Alex Martinez', timestamp: new Date('2026-03-13T09:00:00') }
      ]
    },
    {
      id: 'est-006',
      type: 'material_estimate',
      projectId: 'proj-003',
      projectName: 'Riverside Commons Phase 2',
      subcontractorId: 'sc-005',
      subcontractorName: 'Northwest Electrical Contractors',
      trade: 'Electrical',
      materialScope: 'Residential electrical rough-in, panels, breakers, wiring — 48 units',
      amount: 94200,
      status: 'preparing',
      bidDueDate: '2026-05-10',
      submittedBy: 'Maria Chen',
      assignedTo: 'Maria Chen',
      notes: 'Multi-family residential package. 48 units with individual 200A service.',
      hasAttachments: false,
      hasAlternates: false,
      submissions: [
        { subcontractorId: 'sc-005', subcontractorName: 'Northwest Electrical Contractors', status: 'preparing', amount: 94200 },
      ],
      activity: [
        { id: 'act-006-1', type: 'request_created', description: 'Electrical package request received for 48-unit complex', user: 'Kim Rodriguez', timestamp: new Date('2026-03-05T10:00:00') },
        { id: 'act-006-2', type: 'status_change', description: 'Estimate assigned to Maria Chen for preparation', user: 'Alex Martinez', timestamp: new Date('2026-03-06T09:00:00') },
        { id: 'act-006-3', type: 'note', description: 'Reviewing plans and measuring takeoffs for all 48 units', user: 'Maria Chen', timestamp: new Date('2026-03-10T14:00:00') }
      ]
    },
    {
      id: 'est-007',
      type: 'gc_bid',
      projectId: 'proj-003',
      projectName: 'Riverside Commons Phase 2',
      gcCompany: 'Turner Construction',
      trade: 'General',
      amount: 4250000,
      status: 'viewed',
      bidDueDate: '2026-05-10',
      submittedDate: '2026-03-12',
      submittedBy: 'Alex Martinez',
      assignedTo: 'Alex Martinez',
      notes: 'Full Phase 2 bid — 48 residential units, common areas, parking structure',
      hasAttachments: true,
      hasAlternates: true,
      followUpDate: '2026-03-26',
      followUpOverdue: false,
      alternateOptions: ['Value engineering on parking structure - $180,000 savings', 'Upgraded finishes package - $95,000 premium'],
      activity: [
        { id: 'act-007-1', type: 'request_created', description: 'ITB received from Turner Construction for Phase 2', user: 'System', timestamp: new Date('2026-02-20T07:00:00') },
        { id: 'act-007-2', type: 'note', description: 'Pre-bid meeting attended — 12 bidders present', user: 'Alex Martinez', timestamp: new Date('2026-03-01T10:00:00') },
        { id: 'act-007-3', type: 'estimate_submitted', description: 'GC bid submitted for $4,250,000 with 2 alternate options', user: 'Alex Martinez', timestamp: new Date('2026-03-12T17:00:00') },
        { id: 'act-007-4', type: 'estimate_viewed', description: 'Bid viewed by Turner Construction estimating team', user: 'System', timestamp: new Date('2026-03-14T09:30:00') }
      ]
    },
    {
      id: 'est-008',
      type: 'material_estimate',
      projectId: 'proj-004',
      projectName: 'Harbor View Medical Center',
      subcontractorId: 'sc-006',
      subcontractorName: 'Puget Sound HVAC',
      trade: 'HVAC',
      materialScope: 'Medical grade HVAC units, ductwork, controls, air handling units for OR and ICU',
      amount: 312000,
      status: 'negotiating',
      bidDueDate: '2026-04-30',
      submittedDate: '2026-03-03',
      submittedBy: 'Alex Martinez',
      assignedTo: 'Alex Martinez',
      notes: 'Special requirements: HEPA filtration, positive/negative pressure rooms, medical gas coordination',
      hasAttachments: true,
      hasAlternates: true,
      followUpDate: '2026-03-18',
      followUpOverdue: false,
      alternateOptions: ['HEPA upgrade for all patient rooms - $28,000', 'BAS integration package - $45,000', 'Energy recovery ventilators - $22,000'],
      submissions: [
        { subcontractorId: 'sc-006', subcontractorName: 'Puget Sound HVAC', status: 'negotiating', amount: 312000, followUpDate: '2026-03-18' },
      ],
      activity: [
        { id: 'act-008-1', type: 'request_created', description: 'Medical HVAC package RFQ issued — critical path item', user: 'Linda Foster', timestamp: new Date('2026-02-22T08:00:00') },
        { id: 'act-008-2', type: 'estimate_submitted', description: 'Estimate submitted for $312,000 — medical grade specification', user: 'Alex Martinez', timestamp: new Date('2026-03-03T14:00:00') },
        { id: 'act-008-3', type: 'estimate_viewed', description: 'Reviewed by Puget Sound HVAC engineering team', user: 'Linda Foster', timestamp: new Date('2026-03-04T11:00:00') },
        { id: 'act-008-4', type: 'call', description: 'Conference call to discuss OR pressure room requirements and lead times', user: 'Alex Martinez', timestamp: new Date('2026-03-06T14:30:00') },
        { id: 'act-008-5', type: 'status_change', description: 'Status moved to Negotiating — value engineering in progress', user: 'Alex Martinez', timestamp: new Date('2026-03-09T10:00:00') }
      ]
    },
    {
      id: 'est-009',
      type: 'material_estimate',
      projectId: 'proj-004',
      projectName: 'Harbor View Medical Center',
      subcontractorId: 'sc-007',
      subcontractorName: 'Tacoma Flooring Specialists',
      trade: 'Flooring',
      materialScope: 'LVT flooring, sheet vinyl for clean rooms, rubber stair treads, adhesives',
      amount: 67800,
      status: 'lost',
      bidDueDate: '2026-04-30',
      submittedDate: '2026-03-01',
      submittedBy: 'Maria Chen',
      assignedTo: 'Maria Chen',
      notes: 'Medical grade flooring per infection control requirements',
      hasAttachments: false,
      hasAlternates: false,
      winLossReason: 'Lost to lower bid — competitor at $58,500',
      competitorInfo: 'Western Flooring Supply — $9,300 less, similar scope',
      submissions: [
        { subcontractorId: 'sc-007', subcontractorName: 'Tacoma Flooring Specialists', status: 'lost', amount: 67800 },
      ],
      activity: [
        { id: 'act-009-1', type: 'request_created', description: 'Medical flooring estimate request received', user: 'Robert Kim', timestamp: new Date('2026-02-18T09:00:00') },
        { id: 'act-009-2', type: 'estimate_submitted', description: 'Estimate submitted for $67,800 — medical grade LVT and sheet vinyl', user: 'Maria Chen', timestamp: new Date('2026-03-01T13:00:00') },
        { id: 'act-009-3', type: 'estimate_viewed', description: 'Estimate reviewed', user: 'Robert Kim', timestamp: new Date('2026-03-02T10:00:00') },
        { id: 'act-009-4', type: 'message', description: 'Requested pricing breakdown by room type', user: 'Robert Kim', timestamp: new Date('2026-03-04T15:00:00') },
        { id: 'act-009-5', type: 'lost', description: 'Estimate lost to Western Flooring Supply at $58,500', user: 'Robert Kim', timestamp: new Date('2026-03-10T14:00:00') }
      ]
    },
    {
      id: 'est-010',
      type: 'material_estimate',
      projectId: 'proj-005',
      projectName: 'Sunset Ridge Apartments',
      subcontractorId: 'sc-008',
      subcontractorName: 'Redmond Roofing Systems',
      trade: 'Roofing',
      materialScope: 'Dimensional shingles, underlayment, ice/water shield, ridge vents, flashings — 96 units',
      amount: 142000,
      status: 'requested',
      bidDueDate: '2026-06-01',
      submittedBy: 'Alex Martinez',
      assignedTo: 'Alex Martinez',
      notes: 'New construction 96-unit apartment complex. Class A fire rating required.',
      hasAttachments: false,
      hasAlternates: false,
      isRequest: true,
      requestId: 'req-010',
      submissions: [
        { subcontractorId: 'sc-008', subcontractorName: 'Redmond Roofing Systems', status: 'requested', amount: 142000 },
      ],
      activity: [
        { id: 'act-010-1', type: 'request_created', description: 'Roofing material estimate requested for 96-unit apartment complex', user: 'Tom Bradley', timestamp: new Date('2026-03-12T08:00:00') },
        { id: 'act-010-2', type: 'note', description: 'Class A fire rating and 30-year warranty required per spec', user: 'Tom Bradley', timestamp: new Date('2026-03-12T08:05:00') },
        { id: 'act-010-3', type: 'follow_up', description: 'Estimate request pending response', user: 'System', timestamp: new Date('2026-03-14T07:00:00') }
      ]
    },
    {
      id: 'est-011',
      type: 'material_estimate',
      projectId: 'proj-005',
      projectName: 'Sunset Ridge Apartments',
      subcontractorId: 'sc-009',
      subcontractorName: 'Pacific Drywall & Insulation',
      trade: 'Drywall',
      materialScope: 'Drywall panels, metal framing, insulation batts, joint compound, tape — 96 units',
      amount: 198400,
      status: 'sent',
      bidDueDate: '2026-06-01',
      submittedDate: '2026-03-11',
      submittedBy: 'Maria Chen',
      assignedTo: 'Maria Chen',
      notes: 'STC-rated walls between units. Sound batt insulation in all party walls.',
      hasAttachments: true,
      hasAlternates: false,
      followUpDate: '2026-03-25',
      followUpOverdue: false,
      submissions: [
        { subcontractorId: 'sc-009', subcontractorName: 'Pacific Drywall & Insulation', status: 'sent', amount: 198400, followUpDate: '2026-03-25' },
      ],
      activity: [
        { id: 'act-011-1', type: 'request_created', description: 'Drywall and insulation package request received', user: 'Amy Wilson', timestamp: new Date('2026-03-03T09:00:00') },
        { id: 'act-011-2', type: 'note', description: 'Takeoff completed — 186,000 sq ft of drywall', user: 'Maria Chen', timestamp: new Date('2026-03-08T14:00:00') },
        { id: 'act-011-3', type: 'estimate_submitted', description: 'Estimate submitted for $198,400 including all materials and delivery', user: 'Maria Chen', timestamp: new Date('2026-03-11T10:00:00') }
      ]
    },
    {
      id: 'est-012',
      type: 'gc_bid',
      projectId: 'proj-004',
      projectName: 'Harbor View Medical Center',
      gcCompany: 'DPR Construction',
      trade: 'General',
      amount: 8750000,
      status: 'negotiating',
      bidDueDate: '2026-04-30',
      submittedDate: '2026-03-08',
      submittedBy: 'Alex Martinez',
      assignedTo: 'Alex Martinez',
      notes: 'Full renovation scope — 120,000 sq ft medical facility. Includes OR expansion.',
      hasAttachments: true,
      hasAlternates: true,
      followUpDate: '2026-03-20',
      followUpOverdue: false,
      alternateOptions: ['Modular OR construction - $320,000 savings', 'Phased construction alternate - reduce owner cost by $185,000'],
      activity: [
        { id: 'act-012-1', type: 'request_created', description: 'ITB received from DPR Construction for Harbor View renovation', user: 'System', timestamp: new Date('2026-02-10T07:00:00') },
        { id: 'act-012-2', type: 'note', description: 'Site walk completed with DPR project team', user: 'Alex Martinez', timestamp: new Date('2026-02-20T13:00:00') },
        { id: 'act-012-3', type: 'estimate_submitted', description: 'GC bid submitted for $8,750,000', user: 'Alex Martinez', timestamp: new Date('2026-03-08T16:00:00') },
        { id: 'act-012-4', type: 'call', description: 'Clarification call on OR design-build scope', user: 'Alex Martinez', timestamp: new Date('2026-03-11T10:00:00') },
        { id: 'act-012-5', type: 'status_change', description: 'DPR shortlisted — entering negotiation phase', user: 'Alex Martinez', timestamp: new Date('2026-03-13T09:00:00') }
      ]
    },
    {
      id: 'est-013',
      type: 'material_estimate',
      projectId: 'proj-002',
      projectName: 'Private test-8-6',
      subcontractorId: 'sc-010',
      subcontractorName: 'Bellevue Plumbing Supply',
      trade: 'Plumbing',
      materialScope: 'Residential plumbing fixtures, PEX piping, water heater, fixtures package',
      amount: 14500,
      status: 'awarded',
      bidDueDate: '2026-03-28',
      submittedDate: '2026-03-02',
      submittedBy: 'Maria Chen',
      assignedTo: 'Maria Chen',
      awardedValue: 14500,
      winLossReason: 'Best pricing, excellent warranty terms',
      notes: 'Standard residential package. Moen fixtures throughout.',
      hasAttachments: false,
      hasAlternates: false,
      submissions: [
        { subcontractorId: 'sc-010', subcontractorName: 'Bellevue Plumbing Supply', status: 'awarded', amount: 14500 },
      ],
      activity: [
        { id: 'act-013-1', type: 'request_created', description: 'Plumbing material estimate requested for single family home', user: 'Chris Adams', timestamp: new Date('2026-02-25T10:00:00') },
        { id: 'act-013-2', type: 'estimate_submitted', description: 'Estimate submitted for $14,500 — complete fixtures package', user: 'Maria Chen', timestamp: new Date('2026-03-02T11:00:00') },
        { id: 'act-013-3', type: 'estimate_viewed', description: 'Reviewed and compared with 2 other estimates', user: 'Chris Adams', timestamp: new Date('2026-03-03T14:00:00') },
        { id: 'act-013-4', type: 'awarded', description: 'Awarded contract at $14,500 — best value', user: 'Chris Adams', timestamp: new Date('2026-03-05T10:00:00') }
      ]
    },
    {
      id: 'est-014',
      type: 'material_estimate',
      projectId: 'proj-005',
      projectName: 'Sunset Ridge Apartments',
      subcontractorId: 'sc-011',
      subcontractorName: 'Eastside Flooring Group',
      trade: 'Flooring',
      materialScope: 'LVP flooring, carpet, tile for bathrooms and kitchens — 96 units',
      amount: 234000,
      status: 'preparing',
      bidDueDate: '2026-06-01',
      submittedBy: 'Maria Chen',
      assignedTo: 'Maria Chen',
      notes: 'Standard unit finish package plus upgraded lobby and common area finishes',
      hasAttachments: false,
      hasAlternates: false,
      submissions: [
        { subcontractorId: 'sc-011', subcontractorName: 'Eastside Flooring Group', status: 'preparing', amount: 234000 },
      ],
      activity: [
        { id: 'act-014-1', type: 'request_created', description: 'Flooring package estimate requested — 96 units plus common areas', user: 'Amy Wilson', timestamp: new Date('2026-03-10T09:00:00') },
        { id: 'act-014-2', type: 'status_change', description: 'Assigned to Maria Chen for takeoff and pricing', user: 'Alex Martinez', timestamp: new Date('2026-03-10T09:30:00') },
        { id: 'act-014-3', type: 'note', description: 'Reviewing finish schedule and common area design drawings', user: 'Maria Chen', timestamp: new Date('2026-03-13T13:00:00') }
      ]
    },
    {
      id: 'est-015',
      type: 'gc_bid',
      projectId: 'proj-002',
      projectName: 'Private test-8-6',
      gcCompany: 'Skanska USA Building',
      trade: 'General',
      amount: 1150000,
      status: 'expired',
      bidDueDate: '2026-02-28',
      submittedDate: '2026-02-20',
      submittedBy: 'Alex Martinez',
      assignedTo: 'Alex Martinez',
      notes: 'Residential new construction. Bid expired — project delayed by owner.',
      hasAttachments: true,
      hasAlternates: false,
      winLossReason: 'Project delayed indefinitely by owner — all bids voided',
      activity: [
        { id: 'act-015-1', type: 'request_created', description: 'ITB received from Skanska for Private test-8-6', user: 'System', timestamp: new Date('2026-01-15T07:00:00') },
        { id: 'act-015-2', type: 'estimate_submitted', description: 'Bid submitted for $1,150,000', user: 'Alex Martinez', timestamp: new Date('2026-02-20T15:00:00') },
        { id: 'act-015-3', type: 'estimate_viewed', description: 'Bid viewed by Skanska estimating team', user: 'System', timestamp: new Date('2026-02-22T10:00:00') },
        { id: 'act-015-4', type: 'status_change', description: 'Project delayed — all bids expired. Owner paused project.', user: 'System', timestamp: new Date('2026-03-05T08:00:00') }
      ]
    },
    {
      id: 'est-016',
      type: 'material_estimate',
      projectId: 'proj-003',
      projectName: 'Riverside Commons Phase 2',
      subcontractorId: 'sc-012',
      subcontractorName: 'Oregon Insulation Systems',
      trade: 'Insulation',
      materialScope: 'Spray foam, batt insulation, rigid insulation board, vapor barriers — 48 units',
      amount: 58900,
      status: 'sent',
      bidDueDate: '2026-05-10',
      submittedDate: '2026-03-09',
      submittedBy: 'Alex Martinez',
      assignedTo: 'Alex Martinez',
      notes: 'Energy code compliant package. R-38 ceiling, R-21 walls per Portland energy code.',
      hasAttachments: true,
      hasAlternates: true,
      followUpDate: '2026-03-24',
      followUpOverdue: false,
      alternateOptions: ['Closed-cell spray foam upgrade - $12,400 premium', 'Rockwool acoustic insulation - $8,200 premium'],
      submissions: [
        { subcontractorId: 'sc-012', subcontractorName: 'Oregon Insulation Systems', status: 'sent', amount: 58900, followUpDate: '2026-03-24' },
      ],
      activity: [
        { id: 'act-016-1', type: 'request_created', description: 'Insulation package request for Riverside Commons Phase 2', user: 'Mike Johnson', timestamp: new Date('2026-03-01T09:00:00') },
        { id: 'act-016-2', type: 'note', description: 'Reviewed energy compliance documentation and Oregon code requirements', user: 'Alex Martinez', timestamp: new Date('2026-03-06T14:00:00') },
        { id: 'act-016-3', type: 'estimate_submitted', description: 'Estimate submitted for $58,900 with 2 alternate upgrade options', user: 'Alex Martinez', timestamp: new Date('2026-03-09T12:00:00') }
      ]
    }
  ]);

  private subcontractors: Subcontractor[] = [
    { id: 'sc-001', companyName: 'Pacific Northwest Electric', contactName: 'Jordan Lee', phone: '(206) 555-0142', email: 'jordan@pnwelectric.com', location: 'Seattle, WA', trades: ['Electrical'], activity: 'declared_bidding', estimateId: 'est-001', estimateStatus: 'negotiating', estimateAmount: 48500, lastActivity: '2026-03-08', followUpDate: '2026-03-20', logoInitials: 'PNE' },
    { id: 'sc-002', companyName: 'Seattle Plumbing Solutions', contactName: 'David Park', phone: '(206) 555-0198', email: 'david@seaplumbing.com', location: 'Seattle, WA', trades: ['Plumbing'], activity: 'submitted_estimate', estimateId: 'est-002', estimateStatus: 'awarded', estimateAmount: 31200, lastActivity: '2026-03-07', logoInitials: 'SPS' },
    { id: 'sc-003', companyName: 'Cascade Framing Co.', contactName: 'Sarah Thompson', phone: '(425) 555-0167', email: 'sarah@cascadeframing.com', location: 'Kirkland, WA', trades: ['Framing'], activity: 'downloaded_plans', estimateId: 'est-004', estimateStatus: 'viewed', estimateAmount: 22800, lastActivity: '2026-03-06', followUpDate: '2026-03-15', followUpOverdue: true, logoInitials: 'CF' },
    { id: 'sc-004', companyName: 'Columbia Concrete Supply', contactName: 'Mike Johnson', phone: '(503) 555-0234', email: 'mike@columbiaconcrete.com', location: 'Portland, OR', trades: ['Concrete'], activity: 'submitted_estimate', estimateId: 'est-005', estimateStatus: 'replied', estimateAmount: 187500, lastActivity: '2026-03-13', followUpDate: '2026-03-22', logoInitials: 'CCS' },
    { id: 'sc-005', companyName: 'Northwest Electrical Contractors', contactName: 'Kim Rodriguez', phone: '(503) 555-0312', email: 'kim@nwelectric.com', location: 'Portland, OR', trades: ['Electrical'], activity: 'viewed', estimateId: 'est-006', estimateStatus: 'preparing', lastActivity: '2026-03-10', logoInitials: 'NEC' },
    { id: 'sc-006', companyName: 'Puget Sound HVAC', contactName: 'Linda Foster', phone: '(253) 555-0089', email: 'linda@pugetsoundhvac.com', location: 'Tacoma, WA', trades: ['HVAC'], activity: 'declared_bidding', estimateId: 'est-008', estimateStatus: 'negotiating', estimateAmount: 312000, lastActivity: '2026-03-09', followUpDate: '2026-03-18', logoInitials: 'PSH' },
    { id: 'sc-007', companyName: 'Tacoma Flooring Specialists', contactName: 'Robert Kim', phone: '(253) 555-0456', email: 'robert@tacomaflooring.com', location: 'Tacoma, WA', trades: ['Flooring'], activity: 'submitted_estimate', estimateId: 'est-009', estimateStatus: 'lost', estimateAmount: 67800, lastActivity: '2026-03-10', logoInitials: 'TFS' },
    { id: 'sc-008', companyName: 'Redmond Roofing Systems', contactName: 'Tom Bradley', phone: '(425) 555-0789', email: 'tom@redmondroofing.com', location: 'Redmond, WA', trades: ['Roofing'], activity: 'viewed', estimateId: 'est-010', estimateStatus: 'requested', lastActivity: '2026-03-12', logoInitials: 'RRS' },
    { id: 'sc-009', companyName: 'Pacific Drywall & Insulation', contactName: 'Amy Wilson', phone: '(425) 555-0234', email: 'amy@pacificdrywall.com', location: 'Redmond, WA', trades: ['Drywall', 'Insulation'], activity: 'submitted_estimate', estimateId: 'est-011', estimateStatus: 'sent', estimateAmount: 198400, lastActivity: '2026-03-11', followUpDate: '2026-03-25', logoInitials: 'PDI' },
    { id: 'sc-010', companyName: 'Bellevue Plumbing Supply', contactName: 'Chris Adams', phone: '(425) 555-0567', email: 'chris@bellevueplumbing.com', location: 'Bellevue, WA', trades: ['Plumbing'], activity: 'submitted_estimate', estimateId: 'est-013', estimateStatus: 'awarded', estimateAmount: 14500, lastActivity: '2026-03-05', logoInitials: 'BPS' },
    { id: 'sc-011', companyName: 'Eastside Flooring Group', contactName: 'Amy Wilson', phone: '(425) 555-0890', email: 'amy@eastsidefloor.com', location: 'Bellevue, WA', trades: ['Flooring'], activity: 'downloaded_plans', estimateId: 'est-014', estimateStatus: 'preparing', estimateAmount: 234000, lastActivity: '2026-03-13', logoInitials: 'EFG' },
    { id: 'sc-012', companyName: 'Oregon Insulation Systems', contactName: 'Mike Johnson', phone: '(503) 555-0678', email: 'mike@oregoninsulation.com', location: 'Portland, OR', trades: ['Insulation'], activity: 'submitted_estimate', estimateId: 'est-016', estimateStatus: 'sent', estimateAmount: 58900, lastActivity: '2026-03-09', followUpDate: '2026-03-24', logoInitials: 'OIS' }
  ];

  getAll(): Observable<Estimate[]> {
    return of(this.estimatesSignal());
  }

  getById(id: string): Observable<Estimate | undefined> {
    return of(this.estimatesSignal().find(e => e.id === id));
  }

  getByProject(projectId: string): Observable<Estimate[]> {
    return of(this.estimatesSignal().filter(e => e.projectId === projectId));
  }

  updateStatus(id: string, status: EstimateStatus): Observable<Estimate | undefined> {
    const estimates = this.estimatesSignal();
    const idx = estimates.findIndex(e => e.id === id);
    if (idx !== -1) {
      const updated = [...estimates];
      updated[idx] = { ...updated[idx], status };
      this.estimatesSignal.set(updated);
      return of(updated[idx]);
    }
    return of(undefined);
  }

  create(estimate: Omit<Estimate, 'id'>): Observable<Estimate> {
    const newEstimate: Estimate = {
      ...estimate,
      id: 'est-' + Date.now()
    };
    this.estimatesSignal.set([...this.estimatesSignal(), newEstimate]);
    return of(newEstimate);
  }

  getSubcontractorsForProject(projectId: string): Observable<Subcontractor[]> {
    const estimates = this.estimatesSignal().filter(e => e.projectId === projectId && e.type === 'material_estimate');
    const result: Subcontractor[] = [];
    const engagedIds = new Set<string>();

    // 1. All subs who appear in estimate submissions (engaged)
    for (const est of estimates) {
      const submissions = est.submissions ?? (est.subcontractorId ? [{ subcontractorId: est.subcontractorId, subcontractorName: est.subcontractorName || '', status: est.status, amount: est.amount }] : []);
      for (const sub of submissions) {
        engagedIds.add(sub.subcontractorId);
        const dir = this.subcontractors.find(sc => sc.id === sub.subcontractorId);
        result.push({
          id: sub.subcontractorId,
          companyName: sub.subcontractorName,
          contactName: dir?.contactName || '—',
          phone: dir?.phone || '—',
          email: dir?.email || '—',
          location: dir?.location || '—',
          trades: dir?.trades ?? [est.trade],
          activity: dir?.activity ?? this.intentFromStatus(sub.status),
          biddingStatus: dir?.biddingStatus ?? this.biddingStatusFromEstimate(sub.status),
          estimateId: est.id,
          estimateStatus: sub.status,
          estimateAmount: sub.amount,
          lastActivity: dir?.lastActivity,
          followUpDate: sub.followUpDate ?? dir?.followUpDate,
          followUpOverdue: sub.followUpOverdue ?? dir?.followUpOverdue,
          logoInitials: dir?.logoInitials ?? sub.subcontractorName.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase(),
        });
      }
    }

    // 2. Unengaged subs from the project pool — no estimate sent or requested yet
    const pool = UNENGAGED_POOL[projectId] ?? [];
    for (const sc of pool) {
      if (!engagedIds.has(sc.id)) {
        result.push({ ...sc });
      }
    }

    // 3. Always ensure Pioneer Electric (the SC demo user) appears on every project
    if (!engagedIds.has('ue-001') && !result.find(s => s.id === 'ue-001')) {
      result.push({
        id: 'ue-001',
        companyName: 'Pioneer Electric Co.',
        contactName: 'Ryan Cho',
        phone: '(206) 555-1101',
        email: 'ryan@pioneerelectric.com',
        location: 'Seattle, WA',
        trades: ['Electrical'],
        biddingStatus: 'no_response',
        activity: 'viewed',
        logoInitials: 'PEC',
        looking_for_suppliers: true,
      });
    }

    return of(result);
  }

  private intentFromStatus(status: EstimateStatus): Subcontractor['activity'] {
    if (['awarded', 'negotiating', 'replied'].includes(status)) return 'submitted_estimate';
    if (status === 'viewed') return 'declared_bidding';
    if (['sent', 'preparing'].includes(status)) return 'downloaded_plans';
    return 'viewed';
  }

  private biddingStatusFromEstimate(status: EstimateStatus): BiddingStatus {
    if (status === 'awarded') return 'placed_bid';
    if (['negotiating', 'replied'].includes(status)) return 'bidding';
    if (status === 'viewed') return 'interested';
    if (status === 'lost') return 'not_bidding';
    if (['sent', 'preparing'].includes(status)) return 'no_response';
    return 'undecided';
  }

  getAllSubcontractors(): Observable<Subcontractor[]> {
    return of(this.subcontractors);
  }
}
