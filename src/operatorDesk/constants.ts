import type { CashBucket, JobStage, ServiceType, WorkStatus } from './types';

export const serviceTypes: ServiceType[] = [
  'Material Desk',
  'Labour Desk',
  'Production Desk',
  'Site Control Desk',
  'Full Execution Desk',
];

export const jobStages: JobStage[] = [
  'Lead',
  'Requirement Captured',
  'BOQ Prepared',
  'Quotation Sent',
  'Advance Received',
  'Work Order Confirmed',
  'Material Assigned',
  'Labour Assigned',
  'Production',
  'Site Execution',
  'QC',
  'Handover',
  'Final Payment',
  'Closed',
];

export const workStatuses: WorkStatus[] = [
  'New',
  'Waiting',
  'Active',
  'Payment Pending',
  'Blocked',
  'Disputed',
  'Completed',
];

export const cashBuckets: CashBucket[] = [
  'Material',
  'Labour',
  'Transport',
  'Tools',
  'Rent',
  'EMI',
  'Personal Survival',
  'Business Reserve',
  'Profit',
  'Debt',
];

export const labourRoles = [
  'Carpenter',
  'Helper',
  'Painter',
  'Electrician',
  'Supervisor',
  'ACP Worker',
  'False Ceiling Worker',
  'Polish Worker',
  'Hardware Fitter',
  'Specialist',
];

export const doctrineRules = [
  'Partners bring the project. AlterCraft executes the work.',
  'Contractor Desk is for partners. OperatorDesk is for internal control.',
  'No verbal-only scope.',
  'No undocumented asset.',
  'No site movement without payment gate.',
  'No labour dispatch without advance or written exception.',
  'No material purchase without material payment or approved allocation.',
  'No cash without bucket.',
  'No job without owner and next action.',
  'No stage movement without proof or written reason.',
  'No handover without final payment status and proof.',
  'No fake backend, fake upload, fake login or fake sync claim.',
  'GitHub stores code and docs, not live customer records.',
  'Incoming cash is oxygen, not freedom.',
];

export const futureUpgradeNotes = [
  'Hosted central database',
  'Authentication and partner login portal',
  'Vendor database',
  'Labour QR attendance',
  'WhatsApp update automation',
  'PDF work order and site report exports',
  'Photo/file upload',
  'Cloud data sync',
  'Payment reminders',
  'Role-based access',
];

import type { Screen, LeadScreen, OperatorRole } from './types';

export const SCREEN_PATHS: Record<Screen, string> = {
  dashboard: "dashboard",
  lead: "leads",
  "lead-contact": "lead-contact",
  "lead-project": "lead-project",
  "lead-requirements": "lead-requirements",
  "lead-review": "lead-review",
  job: "jobs",
  payment: "cash",
  report: "site-reports",
  dispute: "disputes",
  team: "team",
};

export const SCREEN_LABELS: Record<Screen, string> = {
  dashboard: "Dashboard",
  lead: "New Lead",
  "lead-contact": "Lead Contact",
  "lead-project": "Project Details",
  "lead-requirements": "Requirements",
  "lead-review": "Review Lead",
  job: "Job Detail",
  payment: "Payment Gate",
  report: "Site Report",
  dispute: "Dispute File",
  team: "Team Control",
};

export const screenFromParam = (param?: string): Screen => {
  const normalized = (param || "dashboard").toLowerCase();
  const aliases: Record<string, Screen> = {
    dashboard: "dashboard",
    lead: "lead",
    leads: "lead",
    "lead-contact": "lead-contact",
    "lead-project": "lead-project",
    "lead-requirements": "lead-requirements",
    "lead-review": "lead-review",
    job: "job",
    jobs: "job",
    payment: "payment",
    payments: "payment",
    cash: "payment",
    report: "report",
    reports: "report",
    "site-report": "report",
    "site-reports": "report",
    dispute: "dispute",
    disputes: "dispute",
    team: "team",
    settings: "team",
  };
  return aliases[normalized] || "dashboard";
};

export const OPERATOR_SESSION_KEY = "altercraft-operator-desk-session";
export const OPERATOR_API_BASE_KEY = "altercraft-operator-desk-api-base";
export const OPERATOR_LEAD_DRAFT_KEY = "altercraft-operator-desk-lead-draft";
export const OPERATOR_LEAD_META_KEY = "altercraft-operator-desk-lead-meta";
export const OPERATOR_LEADS_KEY = "altercraft-operator-desk-leads";

export const ROLE_DETAILS: Record<OperatorRole, { label: string; shortLabel: string; level: 1 | 2 | 3; copy: string }> = {
  "l3-founder": {
    label: "L3 Founder",
    shortLabel: "L3",
    level: 3,
    copy: "Full visibility and write privileges across all site execution, payments and team controls.",
  },
  "l2-manager": {
    label: "L2 Manager",
    shortLabel: "L2",
    level: 2,
    copy: "Add jobs, assign tasks, view leads and check reports. Cannot clear payment gates.",
  },
  "l1-worker": {
    label: "L1 Worker",
    shortLabel: "L1",
    level: 1,
    copy: "Check checklist, add daily site reports, request materials. Restricted view permissions.",
  },
};

export const normalizeRole = (role?: string): OperatorRole =>
  role === "l3-founder" || role === "l2-manager" ? role : "l1-worker";

export const accessLevelFor = (role: OperatorRole): 1 | 2 | 3 => ROLE_DETAILS[role].level;
export const canManageUsers = (role: OperatorRole) => accessLevelFor(role) >= 2;
