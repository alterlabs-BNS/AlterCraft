export type ServiceType =
  | 'Material Desk'
  | 'Labour Desk'
  | 'Production Desk'
  | 'Site Control Desk'
  | 'Full Execution Desk';

export type JobStage =
  | 'Lead'
  | 'Requirement Captured'
  | 'BOQ Prepared'
  | 'Quotation Sent'
  | 'Advance Received'
  | 'Work Order Confirmed'
  | 'Material Assigned'
  | 'Labour Assigned'
  | 'Production'
  | 'Site Execution'
  | 'QC'
  | 'Handover'
  | 'Final Payment'
  | 'Closed';

export type PaymentGateStatus = 'Clear' | 'Pending' | 'Blocked' | 'Awaiting 100% Material Payment' | 'Awaiting Labour Advance';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type WorkStatus = 'New' | 'Waiting' | 'Active' | 'Payment Pending' | 'Blocked' | 'Disputed' | 'Completed';
export type CashType = 'Inflow' | 'Outflow';
export type CashBucket =
  | 'Material'
  | 'Labour'
  | 'Transport'
  | 'Tools'
  | 'Rent'
  | 'EMI'
  | 'Personal Survival'
  | 'Business Reserve'
  | 'Profit'
  | 'Debt';

export type Lead = {
  id: string;
  contractorName: string;
  phone: string;
  siteLocation: string;
  leadSource: string;
  workType: string;
  approxBudget: number;
  timeline: string;
  materialPreference: string;
  labourRequired: boolean;
  drawingAvailable: boolean;
  notes: string;
  serviceType: ServiceType;
  status: WorkStatus;
  createdAt: string;
};

export type Job = {
  id: string;
  siteName: string;
  contractorName: string;
  serviceType: ServiceType;
  totalValue: number;
  advanceReceived: number;
  pendingAmount: number;
  paymentGateStatus: PaymentGateStatus;
  currentStage: JobStage;
  workCompleted: string;
  workPending: string;
  materialRequired: string;
  labourRequired: string;
  assignedOwner: string;
  deadline: string;
  blocker: string;
  writtenConfirmation: boolean;
  photosProof: boolean;
  riskLevel: RiskLevel;
  status: WorkStatus;
  nextAction: string;
  createdAt: string;
};

export type PaymentGate = {
  id: string;
  relatedJobId: string;
  serviceType: ServiceType;
  requiredAmount: number;
  receivedAmount: number;
  gateStatus: PaymentGateStatus;
  paymentRule: string;
  nextPaymentDue: string;
  proofAvailable: boolean;
  notes: string;
};

export type CashEntry = {
  id: string;
  date: string;
  type: CashType;
  amount: number;
  bucket: CashBucket | '';
  relatedJobId: string;
  sourceOrPaidTo: string;
  mode: string;
  proof: boolean;
  notes: string;
};

export type Labour = {
  id: string;
  name: string;
  role: string;
  assignedSite: string;
  dailyRate: number;
  paymentType: string;
  attendanceStatus: 'Present' | 'Absent' | 'Half Day' | 'Not Marked';
  advancePaid: number;
  workStatus: WorkStatus;
  reliabilityScore: number;
  notes: string;
};

export type Material = {
  id: string;
  itemName: string;
  relatedJobId: string;
  vendor: string;
  quantity: string;
  rate: number;
  totalCost: number;
  clientPaid: boolean;
  procurementStatus: 'Required' | 'Quoted' | 'Ordered' | 'Received' | 'Used';
  deliveryStatus: 'Pending' | 'In Transit' | 'Delivered' | 'Partial';
  proof: boolean;
  notes: string;
};

export type SiteReport = {
  id: string;
  date: string;
  siteName: string;
  relatedJobId: string;
  labourPresent: string;
  workCompletedToday: string;
  workPending: string;
  materialUsed: string;
  materialRequired: string;
  photosTaken: boolean;
  issues: string;
  nextAction: string;
  updateSent: boolean;
  notes: string;
};

export type Dispute = {
  id: string;
  disputeName: string;
  relatedJobId: string;
  personOrCompany: string;
  amountAtRisk: number;
  assetAtRisk: string;
  documentsAvailable: boolean;
  whatsappProof: boolean;
  witnesses: string;
  currentStatus: string;
  settlementOption: string;
  nextLawfulAction: string;
  deadline: string;
  notes: string;
};

export type OperatorDeskState = {
  leads: Lead[];
  jobs: Job[];
  paymentGates: PaymentGate[];
  cashEntries: CashEntry[];
  labour: Labour[];
  materials: Material[];
  siteReports: SiteReport[];
  disputes: Dispute[];
  updatedAt: string;
};

export type LeadScreen = "lead" | "lead-contact" | "lead-project" | "lead-requirements" | "lead-review";
export type Screen = "dashboard" | LeadScreen | "job" | "payment" | "report" | "dispute" | "team";
export type OperatorRole = "l3-founder" | "l2-manager" | "l1-worker";

export type OperatorUser = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: OperatorRole;
  accessLevel: 1 | 2 | 3;
  status: "active" | "suspended";
  createdAt: string;
};

export type OperatorSession = {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  token?: string;
  mode: "server" | "local";
  role: OperatorRole;
};
