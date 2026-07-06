import { useEffect, useMemo, useState, type ComponentType } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bot,
  Building2,
  Calculator,
  Camera,
  Check,
  CheckCircle2,
  ClipboardList,
  Factory,
  FileText,
  Gauge,
  Hammer,
  HardHat,
  Home,
  Image,
  Layers3,
  LockKeyhole,
  LogIn,
  MessageSquareText,
  Mic,
  PackageCheck,
  Phone,
  Plus,
  ReceiptText,
  RefreshCw,
  Route,
  Ruler,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  UploadCloud,
  UserRound,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import { Link } from 'react-router';
import { SEOHead } from '../components/seo/SEOHead';
import { siteDetails } from '../data/siteDetails';
import { createWhatsappLink } from '../utils/contact';
import '../styles/contractor-desk.css';

type IconType = ComponentType<{ size?: number; strokeWidth?: number }>;

type AccountRole =
  | 'Interior Designer'
  | 'Architect'
  | 'Builder'
  | 'Developer'
  | 'Contractor'
  | 'Realtor';

type ServiceKey =
  | 'civil-block'
  | 'concrete'
  | 'exterior'
  | 'interior-fitout'
  | 'modular'
  | 'finishing';

type ExecutionKey = 'labour_only' | 'material_only' | 'labour_material' | 'turnkey' | 'white_label';
type FlowStep = 'welcome' | 'signup' | 'service' | 'project' | 'estimate' | 'placed';
type AppMode = 'request' | 'command';
type CommandTab = 'intake' | 'operator' | 'proof' | 'cash' | 'automation';
type OperatorFocus = 'All' | 'Needs contact' | 'Needs scope' | 'Needs token' | 'Needs proof';
type WorkStage =
  | 'Lead'
  | 'Scope'
  | 'BOQ'
  | 'Quote'
  | 'Advance'
  | 'Work Order'
  | 'Material'
  | 'Labour'
  | 'Production'
  | 'Site'
  | 'QC'
  | 'Handover'
  | 'Closed';

type OrderForm = {
  role: AccountRole;
  name: string;
  phone: string;
  company: string;
  city: string;
  service: ServiceKey;
  execution: ExecutionKey;
  area: number;
  propertyType: string;
  startWindow: string;
  materialGrade: string;
  notes: string;
  attachmentNames: string[];
};

type ServiceOption = {
  key: ServiceKey;
  icon: IconType;
  label: string;
  unit: string;
  short: string;
  includes: string[];
  rates: Record<ExecutionKey, number>;
};

type ExecutionOption = {
  key: ExecutionKey;
  icon: IconType;
  label: string;
  short: string;
  detail: string;
};

type CostBreakdownItem = {
  label: string;
  detail: string;
  share: number;
  amount: number;
};

type HandoffChecklistItem = {
  label: string;
  value: string;
  detail: string;
  tone: ReadinessIssue['tone'];
};

type PartnerProject = {
  id: string;
  title: string;
  partner: string;
  phone: string;
  role: AccountRole;
  service: ServiceKey;
  execution: ExecutionKey;
  area: number;
  city: string;
  valueLow: number;
  valueHigh: number;
  token: number;
  stage: WorkStage;
  owner: string;
  paymentGate: 'Pending' | 'Cleared' | 'Blocked';
  proofMissing: number;
  attachments: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type ProofItem = {
  id: string;
  projectId: string;
  type: string;
  actor: string;
  note: string;
  files: string[];
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
};

type CashState = {
  physicalCash: number;
  receivables: number;
  material: number;
  labour: number;
  supervision: number;
  reserve: number;
};

type CashBucket = 'material' | 'labour' | 'supervision' | 'reserve';

type CashAllocationHint = {
  bucket: CashBucket;
  label: string;
  amount: number;
  note: string;
};

type DraftIntent = 'all' | 'work_order' | 'vendor' | 'client' | 'content';

type DraftIntentOption = {
  key: DraftIntent;
  icon: IconType;
  label: string;
  copy: string;
  prompt: string;
};

type AutomationDraft = {
  id: string;
  kind: string;
  projectId: string;
  title: string;
  body: string;
  createdAt: string;
};

type QuickPreset = {
  key: string;
  title: string;
  copy: string;
  patch: Partial<OrderForm>;
};

type ReadinessIssue = {
  label: string;
  detail: string;
  tone: 'warn' | 'danger';
};

type WorkspaceSnapshot = {
  projects: PartnerProject[];
  proofs: ProofItem[];
  cash: CashState;
  drafts: AutomationDraft[];
};

type BackendUser = {
  id: string;
  loginId: string;
  displayName: string;
  company: string;
  phone: string;
  city: string;
  partnerRole: string;
};

type BackendProject = {
  id: string;
  title: string;
  partner?: {
    name?: string;
    phone?: string;
    role?: string;
    city?: string;
  };
  service: ServiceKey;
  execution: ExecutionKey;
  area: number;
  city?: string;
  valueLow: number;
  valueHigh: number;
  token: number;
  stage: WorkStage;
  owner?: string;
  paymentGate: PartnerProject['paymentGate'];
  proofMissing: number;
  attachments: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type BackendWorkspace = {
  user: BackendUser;
  projects: BackendProject[];
};

const steps: FlowStep[] = ['welcome', 'signup', 'service', 'project', 'estimate', 'placed'];
const workStages: WorkStage[] = [
  'Lead',
  'Scope',
  'BOQ',
  'Quote',
  'Advance',
  'Work Order',
  'Material',
  'Labour',
  'Production',
  'Site',
  'QC',
  'Handover',
  'Closed',
];

const roleOptions: AccountRole[] = [
  'Interior Designer',
  'Architect',
  'Builder',
  'Developer',
  'Contractor',
  'Realtor',
];

const serviceOptions: ServiceOption[] = [
  {
    key: 'civil-block',
    icon: HardHat,
    label: 'Civil and Block Work',
    unit: 'sq ft',
    short: 'Masonry, blockwork, plaster and basic site civil execution.',
    includes: ['masonry team', 'site supervision', 'block and plaster planning'],
    rates: { labour_only: 95, material_only: 155, labour_material: 245, turnkey: 315, white_label: 285 },
  },
  {
    key: 'concrete',
    icon: Layers3,
    label: 'Concrete and Base Work',
    unit: 'sq ft',
    short: 'Concrete support work, flooring base, PCC and RCC coordination.',
    includes: ['concrete crew', 'pour planning', 'material coordination'],
    rates: { labour_only: 120, material_only: 210, labour_material: 330, turnkey: 420, white_label: 385 },
  },
  {
    key: 'exterior',
    icon: Building2,
    label: 'Exterior Execution',
    unit: 'sq ft',
    short: 'Elevation, facade finishing, waterproofing and outdoor finishing.',
    includes: ['surface prep', 'exterior team', 'finish coordination'],
    rates: { labour_only: 85, material_only: 145, labour_material: 225, turnkey: 290, white_label: 265 },
  },
  {
    key: 'interior-fitout',
    icon: Hammer,
    label: 'Interior Fitout',
    unit: 'sq ft',
    short: 'False ceiling, paint, electrical, plumbing, paneling and site fitout.',
    includes: ['multi-trade crew', 'site tracker', 'stage-wise execution'],
    rates: { labour_only: 145, material_only: 310, labour_material: 455, turnkey: 620, white_label: 560 },
  },
  {
    key: 'modular',
    icon: Factory,
    label: 'Modular Manufacturing',
    unit: 'sq ft',
    short: 'Wardrobes, kitchens, counters, panels and factory-made furniture.',
    includes: ['production support', 'hardware guidance', 'installation crew'],
    rates: { labour_only: 180, material_only: 780, labour_material: 980, turnkey: 1250, white_label: 1120 },
  },
  {
    key: 'finishing',
    icon: Sparkles,
    label: 'Finishing Package',
    unit: 'sq ft',
    short: 'Paint, polish, lights, final repair, cleaning and handover finishing.',
    includes: ['finish team', 'QC checklist', 'handover support'],
    rates: { labour_only: 65, material_only: 125, labour_material: 185, turnkey: 245, white_label: 225 },
  },
];

const executionOptions: ExecutionOption[] = [
  {
    key: 'labour_only',
    icon: Users,
    label: 'Labour Only',
    short: 'Team and supervisor',
    detail: 'Partner provides material. AlterCraft provides verified manpower and site execution control.',
  },
  {
    key: 'material_only',
    icon: PackageCheck,
    label: 'Material Only',
    short: 'Supply and sourcing',
    detail: 'AlterCraft sources required material, hardware or manufactured items for the project.',
  },
  {
    key: 'labour_material',
    icon: WalletCards,
    label: 'Labour + Material',
    short: 'Most common',
    detail: 'AlterCraft manages both procurement and execution with stage-wise billing discipline.',
  },
  {
    key: 'turnkey',
    icon: BadgeCheck,
    label: 'Turnkey Execution',
    short: 'Complete delivery',
    detail: 'AlterCraft takes the project from scope confirmation to execution, QC and handover.',
  },
  {
    key: 'white_label',
    icon: ShieldCheck,
    label: 'White-Label',
    short: 'For designers',
    detail: 'Designer or builder keeps the client relationship. AlterCraft executes in the background.',
  },
];

const quickPresets: QuickPreset[] = [
  {
    key: 'designer-white-label',
    title: 'Designer has client',
    copy: 'White-label execution, site team, BOQ and proof trail.',
    patch: {
      role: 'Interior Designer',
      service: 'interior-fitout',
      execution: 'white_label',
      area: 900,
      propertyType: 'Residential apartment',
      materialGrade: 'As per designer BOQ',
      notes: 'Designer wants AlterCraft to execute in the background with stage-wise proof.',
    },
  },
  {
    key: 'builder-labour',
    title: 'Builder needs labour',
    copy: 'Crew, supervisor and stage control without material supply.',
    patch: {
      role: 'Builder',
      service: 'civil-block',
      execution: 'labour_only',
      area: 2500,
      propertyType: 'Builder floor / shell work',
      materialGrade: 'Material supplied by builder',
      notes: 'Builder needs dependable labour and supervision for site execution.',
    },
  },
  {
    key: 'developer-turnkey',
    title: 'Developer wants turnkey',
    copy: 'Concrete, exterior, interiors and handover coordination.',
    patch: {
      role: 'Developer',
      service: 'concrete',
      execution: 'turnkey',
      area: 5000,
      propertyType: 'Multi-unit development',
      materialGrade: 'Standard commercial grade',
      notes: 'Developer wants one execution partner for scope, material, labour and proof.',
    },
  },
];

const areaPresets = [
  { label: 'Studio / room', area: 250, note: 'Small room, repair or single-space scope.' },
  { label: 'Apartment', area: 1200, note: 'Apartment-scale interior or fitout scope.' },
  { label: 'Builder floor', area: 2500, note: 'Builder floor or multi-room execution scope.' },
  { label: 'Commercial', area: 5000, note: 'Commercial or multi-zone execution scope.' },
];

const scopeSignalOptions = [
  'BOQ available',
  'Site photos available',
  'Client drawings pending',
  'Need site survey',
  'Material brand not final',
  'Fast handover required',
];

const commandTabs: Array<{ key: CommandTab; icon: IconType; label: string }> = [
  { key: 'intake', icon: ClipboardList, label: 'New Job' },
  { key: 'operator', icon: Gauge, label: 'Projects' },
  { key: 'proof', icon: Camera, label: 'Proof' },
  { key: 'cash', icon: LockKeyhole, label: 'Money' },
  { key: 'automation', icon: Bot, label: 'Drafts' },
];

const operatorFocusOptions: OperatorFocus[] = ['All', 'Needs contact', 'Needs scope', 'Needs token', 'Needs proof'];

const draftIntentOptions: DraftIntentOption[] = [
  {
    key: 'all',
    icon: Bot,
    label: 'Full packet',
    copy: 'Work order, vendor, client and content text.',
    prompt: 'Prepare the full local handoff packet from this project note.',
  },
  {
    key: 'work_order',
    icon: ClipboardList,
    label: 'Work order',
    copy: 'Scope, gate and execution note.',
    prompt: 'Prepare a work order with scope, payment gate and next execution step.',
  },
  {
    key: 'vendor',
    icon: Users,
    label: 'Vendor push',
    copy: 'Proof request for site or supply team.',
    prompt: 'Prepare a vendor message asking for proof, counts and dispatch or site action.',
  },
  {
    key: 'client',
    icon: MessageSquareText,
    label: 'Client update',
    copy: 'Clear status message for the partner/client.',
    prompt: 'Prepare a client update with current stage, pending gate and next action.',
  },
  {
    key: 'content',
    icon: Sparkles,
    label: 'Content',
    copy: 'Short reel or post idea from the site note.',
    prompt: 'Prepare a short content script from the project status and site proof angle.',
  },
];

const defaultForm: OrderForm = {
  role: 'Interior Designer',
  name: '',
  phone: '',
  company: '',
  city: 'Ghaziabad / Delhi NCR',
  service: 'interior-fitout',
  execution: 'labour_material',
  area: 1200,
  propertyType: 'Residential apartment',
  startWindow: 'Within 15 days',
  materialGrade: 'Standard commercial grade',
  notes: '',
  attachmentNames: [],
};

const defaultCash: CashState = {
  physicalCash: 45000,
  receivables: 125000,
  material: 28000,
  labour: 12000,
  supervision: 0,
  reserve: 5000,
};

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AlterCraft Contractor Desk',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Android, Web',
  url: 'https://www.altercraft.in/ContractorDesk/',
  description:
    'B2B Contractor Desk app for designers, builders, architects, developers, realtors and contractors to request, estimate, track, prove and control AlterCraft execution work.',
  creator: {
    '@type': 'Organization',
    name: siteDetails.legalName,
    url: 'https://www.altercraft.in/',
  },
};

const formatMoney = (value: number) => `INR ${Math.round(value).toLocaleString('en-IN')}`;
const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(new Date(value));

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
}

function phoneDigits(value: string) {
  return value.replace(/\D/g, '');
}

function normalizeArea(value: number) {
  if (!Number.isFinite(value)) return 50;
  return Math.min(Math.max(Math.round(value / 50) * 50, 50), 100000);
}

function getReadinessIssues(form: OrderForm): ReadinessIssue[] {
  const issues: ReadinessIssue[] = [];
  if (!form.name.trim()) {
    issues.push({ label: 'Name missing', detail: 'Add a partner name so AlterCraft knows who owns this request.', tone: 'danger' });
  }
  if (phoneDigits(form.phone).length < 10) {
    issues.push({ label: 'Phone missing', detail: 'A callable number is needed before the request can be sent.', tone: 'danger' });
  }
  if (!form.city.trim()) {
    issues.push({ label: 'City missing', detail: 'Add the city or site zone before crew planning.', tone: 'warn' });
  }
  if (form.area < 50) {
    issues.push({ label: 'Area too low', detail: 'Use at least 50 sq ft or mark it as a repair/inspection note.', tone: 'danger' });
  }
  if (form.area > 25000) {
    issues.push({ label: 'Large scope', detail: 'Large work areas need phase-wise BOQ and a site call before execution.', tone: 'warn' });
  }
  if (!form.company.trim()) {
    issues.push({ label: 'Company optional', detail: 'Studio or firm name improves white-label handoff and billing clarity.', tone: 'warn' });
  }
  if (!form.attachmentNames.length) {
    issues.push({ label: 'No scope evidence', detail: 'Attach drawings, BOQ, photos or add a local handoff signal for a sharper quote.', tone: 'warn' });
  }
  if (form.notes.trim().length < 18) {
    issues.push({ label: 'Thin site note', detail: 'Add site condition, client expectation or deadline so ops can act faster.', tone: 'warn' });
  }
  return issues;
}

function getReadinessScore(issues: ReadinessIssue[]) {
  const penalty = issues.reduce((sum, issue) => sum + (issue.tone === 'danger' ? 24 : 9), 0);
  return Math.max(20, 100 - penalty);
}

function getConfidenceLabel(score: number) {
  if (score >= 82) return 'High confidence';
  if (score >= 62) return 'Workable draft';
  return 'Needs cleanup';
}

function getNextHandoffAction(form: OrderForm, estimate: ReturnType<typeof useEstimate>) {
  if (phoneDigits(form.phone).length < 10) return 'Add a callable partner phone number before sending this to AlterCraft.';
  if (!form.attachmentNames.length) return 'Add BOQ/photos, mark survey needed or share drawings before quote freeze.';
  if (form.notes.trim().length < 18) return 'Add one clear site note about access, client expectation or deadline.';
  return `Send the brief and keep ${formatMoney(estimate.token)} token ready for payment-gate confirmation.`;
}

function getHandoffChecklist(form: OrderForm, estimate: ReturnType<typeof useEstimate>): HandoffChecklistItem[] {
  const contactReady = phoneDigits(form.phone).length >= 10;
  const scopeReady = form.attachmentNames.length > 0;
  const noteReady = form.notes.trim().length >= 18;

  return [
    {
      label: 'Contact',
      value: contactReady ? 'Ready' : 'Missing',
      detail: contactReady ? `${form.name || 'Partner'} can be called for scope freeze.` : 'Add a callable phone before handoff.',
      tone: contactReady ? 'ok' : 'danger',
    },
    {
      label: 'Scope evidence',
      value: scopeReady ? `${form.attachmentNames.length} saved` : 'Needed',
      detail: scopeReady ? form.attachmentNames.slice(0, 3).join(', ') : 'Add BOQ, photos, drawings or survey-needed signal.',
      tone: scopeReady ? 'ok' : 'warn',
    },
    {
      label: 'Site note',
      value: noteReady ? 'Useful' : 'Thin',
      detail: noteReady ? 'Ops has enough context for first call.' : 'Add access, deadline or client expectation.',
      tone: noteReady ? 'ok' : 'warn',
    },
    {
      label: 'Payment gate',
      value: formatMoney(estimate.token),
      detail: 'Pending until AlterCraft confirms token and execution slot.',
      tone: 'warn',
    },
  ];
}

function getProjectAction(project: PartnerProject, proofs: ProofItem[]) {
  const pendingProofs = proofs.filter((proof) => proof.projectId === project.id && proof.status === 'Pending').length;
  if (project.paymentGate !== 'Cleared') return 'Collect token or clear payment gate';
  if (project.proofMissing > 0) return `Capture ${project.proofMissing} missing proof item${project.proofMissing > 1 ? 's' : ''}`;
  if (pendingProofs > 0) return 'Review pending proof before stage movement';
  if (project.stage === 'Closed') return 'Archive and prepare handover record';
  return `Move from ${project.stage} to ${workStages[Math.min(workStages.indexOf(project.stage) + 1, workStages.length - 1)]}`;
}

function getProofRecipe(project?: PartnerProject) {
  if (!project) return ['Front site photo', 'Material count', 'Supervisor note'];
  if (project.execution === 'material_only') return ['Loading photo', 'Bill / challan', 'Quantity count'];
  if (project.service === 'modular') return ['Factory piece photo', 'Hardware count', 'Installation angle'];
  if (project.service === 'concrete') return ['Pour area photo', 'Material batch', 'Level / curing note'];
  return ['Before photo', 'Progress angle', 'Finish / defect closeup'];
}

function roundCashHint(value: number) {
  if (value <= 0) return 0;
  return Math.max(500, Math.floor(value / 500) * 500);
}

function getCashAllocationHints(freeCash: number): CashAllocationHint[] {
  const spendable = Math.max(0, freeCash);
  if (spendable <= 0) return [];

  return [
    {
      bucket: 'material',
      label: 'Material buffer',
      amount: Math.min(spendable, roundCashHint(spendable * 0.5)),
      note: 'Keep procurement controlled before site work moves.',
    },
    {
      bucket: 'labour',
      label: 'Labour advance',
      amount: Math.min(spendable, roundCashHint(spendable * 0.3)),
      note: 'Hold crew scheduling money separate from material.',
    },
    {
      bucket: 'reserve',
      label: 'Site reserve',
      amount: Math.min(spendable, roundCashHint(spendable * 0.15)),
      note: 'Protect small site surprises without touching core buckets.',
    },
  ].filter((hint) => hint.amount > 0);
}

function getDraftIntent(intent: DraftIntent) {
  return draftIntentOptions.find((option) => option.key === intent) ?? draftIntentOptions[0];
}

function getVoiceNoteReadiness(note: string, project?: PartnerProject) {
  const cleaned = note.trim();
  const words = cleaned ? cleaned.split(/\s+/).filter(Boolean).length : 0;
  const hasUsefulSignal = /(payment|proof|material|labou?r|deadline|handover|client|site|boq|photo|vendor|dispatch)/i.test(cleaned);

  if (!project) {
    return {
      label: 'No project',
      detail: 'Pick a local project before generating drafts.',
      tone: 'danger' as const,
    };
  }

  if (words < 6) {
    return {
      label: 'Thin note',
      detail: 'Add site condition, payment, proof, material or deadline context.',
      tone: 'warn' as const,
    };
  }

  if (!hasUsefulSignal) {
    return {
      label: 'Needs signal',
      detail: 'Mention payment, proof, site, material, BOQ or handover.',
      tone: 'warn' as const,
    };
  }

  return {
    label: 'Draft-ready',
    detail: `${words} words with usable site context.`,
    tone: 'ok' as const,
  };
}

function getProjectSignals(project: PartnerProject) {
  return [
    {
      label: 'Contact',
      value: phoneDigits(project.phone).length >= 10 ? 'Ready' : 'Missing',
      tone: phoneDigits(project.phone).length >= 10 ? 'ok' : 'danger',
    },
    {
      label: 'Files',
      value: project.attachments.length ? `${project.attachments.length}` : 'Need',
      tone: project.attachments.length ? 'ok' : 'warn',
    },
    {
      label: 'Payment',
      value: project.paymentGate,
      tone: project.paymentGate === 'Cleared' ? 'ok' : project.paymentGate === 'Blocked' ? 'danger' : 'warn',
    },
    {
      label: 'Proof',
      value: project.proofMissing ? `${project.proofMissing} left` : 'Ready',
      tone: project.proofMissing ? 'warn' : 'ok',
    },
  ];
}

function getProjectTriageTags(project: PartnerProject): OperatorFocus[] {
  const tags: OperatorFocus[] = [];
  if (phoneDigits(project.phone).length < 10) tags.push('Needs contact');
  if (!project.attachments.length) tags.push('Needs scope');
  if (project.paymentGate !== 'Cleared') tags.push('Needs token');
  if (project.proofMissing > 0) tags.push('Needs proof');
  return tags;
}

function appendNote(current: string, addition: string) {
  if (current.toLowerCase().includes(addition.toLowerCase())) return current;
  return current.trim() ? `${current.trim()}\n${addition}` : addition;
}

function appendUniqueItems(current: string[], additions: string[]) {
  const seen = new Set(current.map((item) => item.toLowerCase()));
  const next = [...current];
  additions.forEach((addition) => {
    const value = addition.trim();
    if (!value || seen.has(value.toLowerCase())) return;
    seen.add(value.toLowerCase());
    next.push(value);
  });
  return next;
}

async function copyTextToClipboard(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the textarea copy path for Android WebView and older browsers.
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? { ...(fallback as object), ...JSON.parse(saved) } as T : fallback;
  } catch {
    return fallback;
  }
}

function readStoredArray<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function getService(key: ServiceKey) {
  return serviceOptions.find((service) => service.key === key) ?? serviceOptions[0];
}

function getExecution(key: ExecutionKey) {
  return executionOptions.find((execution) => execution.key === key) ?? executionOptions[2];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function readNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeServiceKey(value: unknown): ServiceKey {
  const text = readString(value);
  return (
    serviceOptions.find((service) => service.key === text || service.label === text)?.key ??
    'interior-fitout'
  );
}

function normalizeExecutionKey(value: unknown): ExecutionKey {
  const text = readString(value);
  return (
    executionOptions.find((execution) => execution.key === text || execution.label === text)?.key ??
    'labour_material'
  );
}

function normalizeRole(value: unknown): AccountRole {
  const text = readString(value);
  return roleOptions.includes(text as AccountRole) ? (text as AccountRole) : 'Contractor';
}

function normalizeStage(value: unknown): WorkStage {
  const text = readString(value);
  return workStages.includes(text as WorkStage) ? (text as WorkStage) : 'Lead';
}

function normalizePaymentGate(value: unknown): PartnerProject['paymentGate'] {
  const text = readString(value);
  if (text === 'Cleared' || text === 'Blocked' || text === 'Pending') return text;
  return 'Pending';
}

function normalizeProofStatus(value: unknown): ProofItem['status'] {
  const text = readString(value);
  if (text === 'Approved' || text === 'Rejected' || text === 'Pending') return text;
  return 'Pending';
}

function estimateProjectValue(service: ServiceKey, execution: ExecutionKey, area: number) {
  const subtotal = getService(service).rates[execution] * area;
  return {
    valueLow: subtotal * 0.9,
    valueHigh: subtotal * 1.16,
    token: Math.min(Math.max(subtotal * 0.015, 2500), 25000),
  };
}

function getCostBreakdown(execution: ExecutionKey, subtotal: number): CostBreakdownItem[] {
  const splits: Record<ExecutionKey, Array<Omit<CostBreakdownItem, 'amount'>>> = {
    labour_only: [
      { label: 'Crew and supervisor', detail: 'Skilled manpower, helper crew and daily execution lead.', share: 75 },
      { label: 'Site control', detail: 'Attendance, coordination, measurement checks and proof discipline.', share: 25 },
    ],
    material_only: [
      { label: 'Material and sourcing', detail: 'Procurement lane, vendor coordination and brand/grade handling.', share: 85 },
      { label: 'Logistics and QC', detail: 'Loading, delivery checks, quantity trail and acceptance proof.', share: 15 },
    ],
    labour_material: [
      { label: 'Labour execution', detail: 'Trade crew, site supervisor and milestone execution.', share: 35 },
      { label: 'Material supply', detail: 'Core material procurement as per grade and verified quantities.', share: 50 },
      { label: 'Supervision and QC', detail: 'Measurement, daily proof, rework control and handover checks.', share: 15 },
    ],
    turnkey: [
      { label: 'Labour execution', detail: 'Multi-trade crew and site scheduling.', share: 30 },
      { label: 'Material supply', detail: 'Procurement, vendor movement and quantity planning.', share: 45 },
      { label: 'Supervision and QC', detail: 'Site command, proof trail, measurement and handover checks.', share: 15 },
      { label: 'Coordination reserve', detail: 'Buffer for sequencing, access gaps and coordination overhead.', share: 10 },
    ],
    white_label: [
      { label: 'Execution crew', detail: 'Behind-the-brand labour and site handling.', share: 32 },
      { label: 'Material/procurement', detail: 'Procurement support when the partner asks AlterCraft to source.', share: 43 },
      { label: 'Partner ops and proof', detail: 'Update trail, approval-ready notes and client-facing proof support.', share: 15 },
      { label: 'Reserve', detail: 'Coordination buffer before the final BOQ locks the scope.', share: 10 },
    ],
  };

  return splits[execution].map((item) => ({
    ...item,
    amount: subtotal * (item.share / 100),
  }));
}

function normalizeCash(value: unknown): CashState {
  const record = isRecord(value) ? value : {};
  return {
    physicalCash: readNumber(record.physicalCash, defaultCash.physicalCash),
    receivables: readNumber(record.receivables, defaultCash.receivables),
    material: readNumber(record.material, defaultCash.material),
    labour: readNumber(record.labour, defaultCash.labour),
    supervision: readNumber(record.supervision, defaultCash.supervision),
    reserve: readNumber(record.reserve, defaultCash.reserve),
  };
}

function normalizeProject(value: unknown): PartnerProject | null {
  if (!isRecord(value)) return null;
  const service = normalizeServiceKey(value.serviceKey ?? value.service);
  const execution = normalizeExecutionKey(value.executionKey ?? value.execution);
  const area = normalizeArea(readNumber(value.area, 500));
  const estimated = estimateProjectValue(service, execution, area);
  const id = readString(value.id, makeId('CD'));
  const partner = readString(value.partner, 'Restored Partner');
  const now = new Date().toISOString();

  return {
    id,
    title: readString(value.title, `${getService(service).label} - ${area.toLocaleString('en-IN')} sq ft`),
    partner,
    phone: readString(value.phone),
    role: normalizeRole(value.role),
    service,
    execution,
    area,
    city: readString(value.city, 'Delhi NCR'),
    valueLow: readNumber(value.valueLow, estimated.valueLow),
    valueHigh: readNumber(value.valueHigh, estimated.valueHigh),
    token: readNumber(value.token, estimated.token),
    stage: normalizeStage(value.stage),
    owner: readString(value.owner, 'AlterCraft Ops'),
    paymentGate: normalizePaymentGate(value.paymentGate),
    proofMissing: Math.max(0, readNumber(value.proofMissing, 0)),
    attachments: Array.isArray(value.attachments) ? value.attachments.map((item) => readString(item)).filter(Boolean) : [],
    notes: readString(value.notes),
    createdAt: readString(value.createdAt, now),
    updatedAt: readString(value.updatedAt, now),
  };
}

function normalizeProof(value: unknown): ProofItem | null {
  if (!isRecord(value)) return null;
  const projectId = readString(value.projectId);
  if (!projectId) return null;
  return {
    id: readString(value.id, makeId('PF')),
    projectId,
    type: readString(value.type, 'Restored proof'),
    actor: readString(value.actor, 'Site supervisor'),
    note: readString(value.note),
    files: Array.isArray(value.files) ? value.files.map((item) => readString(item)).filter(Boolean) : [],
    status: normalizeProofStatus(value.status),
    createdAt: readString(value.createdAt, new Date().toISOString()),
  };
}

function normalizeDraft(value: unknown): AutomationDraft | null {
  if (!isRecord(value)) return null;
  const body = readString(value.body);
  if (!body) return null;
  return {
    id: readString(value.id, makeId('DR')),
    kind: readString(value.kind, 'Restored Draft'),
    projectId: readString(value.projectId, 'RESTORED'),
    title: readString(value.title, 'Restored automation draft'),
    body,
    createdAt: readString(value.createdAt, new Date().toISOString()),
  };
}

function parseWorkspaceSnapshot(raw: string): WorkspaceSnapshot | null {
  try {
    const parsed = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    const projects = Array.isArray(parsed.projects) ? parsed.projects.map(normalizeProject).filter((project): project is PartnerProject => Boolean(project)) : [];
    const proofs = Array.isArray(parsed.proofs) ? parsed.proofs.map(normalizeProof).filter((proof): proof is ProofItem => Boolean(proof)) : [];
    const drafts = Array.isArray(parsed.drafts) ? parsed.drafts.map(normalizeDraft).filter((draft): draft is AutomationDraft => Boolean(draft)) : [];
    if (!projects.length && !proofs.length && !drafts.length && !isRecord(parsed.cash)) return null;
    return { projects, proofs, cash: normalizeCash(parsed.cash), drafts };
  } catch {
    return null;
  }
}

function useEstimate(form: OrderForm) {
  return useMemo(() => {
    const service = getService(form.service);
    const execution = getExecution(form.execution);
    const area = Number.isFinite(form.area) && form.area > 0 ? form.area : 0;
    const rate = service.rates[form.execution];
    const subtotal = rate * area;
    const low = subtotal * 0.9;
    const high = subtotal * 1.16;
    const token = Math.min(Math.max(subtotal * 0.015, 2500), 25000);
    const timelineDays = Math.max(3, Math.ceil(area / 420) + (form.execution === 'turnkey' ? 7 : 3));

    return {
      service,
      execution,
      area,
      rate,
      subtotal,
      low,
      high,
      token,
      timeline: `${timelineDays}-${timelineDays + 5} working days after scope freeze`,
    };
  }, [form]);
}

function buildOrderMessage(form: OrderForm, orderId: string, estimate: ReturnType<typeof useEstimate>) {
  const readinessScore = getReadinessScore(getReadinessIssues(form));
  return [
    'Hi AlterCraft, I want to place a Contractor Desk request.',
    `Order ID: ${orderId}`,
    `Partner: ${form.name || 'Not filled'} (${form.role})`,
    `Company: ${form.company || 'Not filled'}`,
    `Phone: ${form.phone || 'Not filled'}`,
    `Location: ${form.city}`,
    `Service: ${getService(form.service).label}`,
    `Execution: ${getExecution(form.execution).label}`,
    `Area: ${form.area} sq ft`,
    `Approx rate: ${formatMoney(estimate.rate)} / sq ft`,
    `Indicative range: ${formatMoney(estimate.low)} - ${formatMoney(estimate.high)}`,
    `Timeline: ${estimate.timeline}`,
    `Start: ${form.startWindow}`,
    `Scope evidence: ${form.attachmentNames.length ? form.attachmentNames.join(', ') : 'No files or handoff signals yet'}`,
    `Handoff readiness: ${readinessScore}% (${getConfidenceLabel(readinessScore)})`,
    `Next action: ${getNextHandoffAction(form, estimate)}`,
    `Notes: ${form.notes || 'No extra notes yet'}`,
  ].join('\n');
}

function makeProjectFromForm(form: OrderForm, estimate: ReturnType<typeof useEstimate>, orderId?: string): PartnerProject {
  const now = new Date().toISOString();
  return {
    id: orderId || makeId('CD'),
    title: `${getService(form.service).label} - ${form.area.toLocaleString('en-IN')} sq ft`,
    partner: form.company || form.name || 'New B2B Partner',
    phone: form.phone,
    role: form.role,
    service: form.service,
    execution: form.execution,
    area: estimate.area,
    city: form.city,
    valueLow: estimate.low,
    valueHigh: estimate.high,
    token: estimate.token,
    stage: 'Lead',
    owner: 'AlterCraft Ops',
    paymentGate: 'Pending',
    proofMissing: 3,
    attachments: form.attachmentNames,
    notes: form.notes,
    createdAt: now,
    updatedAt: now,
  };
}

function buildSeedProjects(): PartnerProject[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'CD-SAMPLE-2400',
      title: 'Sample interior fitout - 2,400 sq ft',
      partner: 'Sample Architect Partner',
      phone: '',
      role: 'Architect',
      service: 'interior-fitout',
      execution: 'white_label',
      area: 2400,
      city: 'Delhi NCR',
      valueLow: 1200000,
      valueHigh: 1480000,
      token: 25000,
      stage: 'Quote',
      owner: 'AlterCraft Ops',
      paymentGate: 'Pending',
      proofMissing: 4,
      attachments: ['sample-boq.pdf', 'site-photos.zip'],
      notes: 'Sample project for work desk testing. Replace with live partner work after team sync is added.',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function asAccountRole(value?: string): AccountRole {
  return roleOptions.includes(value as AccountRole) ? value as AccountRole : 'Contractor';
}

function mapBackendProject(project: BackendProject): PartnerProject {
  return {
    id: project.id,
    title: project.title,
    partner: project.partner?.name || 'Partner user',
    phone: project.partner?.phone || '',
    role: asAccountRole(project.partner?.role),
    service: project.service,
    execution: project.execution,
    area: project.area,
    city: project.city || project.partner?.city || 'Ghaziabad / Delhi NCR',
    valueLow: project.valueLow,
    valueHigh: project.valueHigh,
    token: project.token,
    stage: project.stage,
    owner: project.owner || 'AlterCraft Desk',
    paymentGate: project.paymentGate,
    proofMissing: project.proofMissing,
    attachments: project.attachments || [],
    notes: project.notes || '',
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export default function ContractorDesk() {
  const [mode, setMode] = useState<AppMode>('request');
  const [step, setStep] = useState<FlowStep>('welcome');
  const [commandTab, setCommandTab] = useState<CommandTab>('intake');
  const [form, setForm] = useState<OrderForm>(() =>
    readStored<OrderForm>('altercraft-contractor-desk-form', defaultForm),
  );
  const [projects, setProjects] = useState<PartnerProject[]>(() =>
    readStoredArray<PartnerProject>('altercraft-contractor-desk-projects', buildSeedProjects()),
  );
  const [proofs, setProofs] = useState<ProofItem[]>(() =>
    readStoredArray<ProofItem>('altercraft-contractor-desk-proofs', []),
  );
  const [cash, setCash] = useState<CashState>(() =>
    readStored<CashState>('altercraft-contractor-desk-cash', defaultCash),
  );
  const [drafts, setDrafts] = useState<AutomationDraft[]>(() =>
    readStoredArray<AutomationDraft>('altercraft-contractor-desk-drafts', []),
  );
  const [backendApiBase, setBackendApiBase] = useState(() =>
    readStored<string>('altercraft-contractor-desk-api-base', 'http://127.0.0.1:8788'),
  );
  const [backendToken, setBackendToken] = useState(() =>
    readStored<string>('altercraft-contractor-desk-token', ''),
  );
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [backendMessage, setBackendMessage] = useState('Local device mode.');
  const [backendBusy, setBackendBusy] = useState(false);
  const [orderId, setOrderId] = useState('');
  const estimate = useEstimate(form);
  const stepIndex = steps.indexOf(step);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    window.localStorage.setItem('altercraft-contractor-desk-form', JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    window.localStorage.setItem('altercraft-contractor-desk-projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    window.localStorage.setItem('altercraft-contractor-desk-proofs', JSON.stringify(proofs));
  }, [proofs]);

  useEffect(() => {
    window.localStorage.setItem('altercraft-contractor-desk-cash', JSON.stringify(cash));
  }, [cash]);

  useEffect(() => {
    window.localStorage.setItem('altercraft-contractor-desk-drafts', JSON.stringify(drafts));
  }, [drafts]);

  useEffect(() => {
    window.localStorage.setItem('altercraft-contractor-desk-api-base', backendApiBase);
  }, [backendApiBase]);

  useEffect(() => {
    if (backendToken) {
      window.localStorage.setItem('altercraft-contractor-desk-token', backendToken);
    } else {
      window.localStorage.removeItem('altercraft-contractor-desk-token');
    }
  }, [backendToken]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0 });
      document.querySelector<HTMLElement>('.contractor-phone-frame .contractor-screen')?.scrollTo({ top: 0, left: 0 });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [mode, step, commandTab]);

  const updateForm = <K extends keyof OrderForm>(key: K, value: OrderForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const applyPreset = (patch: Partial<OrderForm>) => {
    setForm((current) => ({ ...current, ...patch }));
    setStep('signup');
  };

  const goNext = () => setStep(steps[Math.min(stepIndex + 1, steps.length - 1)]);
  const goBack = () => setStep(steps[Math.max(stepIndex - 1, 0)]);

  const saveProject = (nextProject?: PartnerProject) => {
    const project = nextProject ?? makeProjectFromForm(form, estimate);
    setProjects((current) => {
      const existingIndex = current.findIndex((item) => item.id === project.id);
      if (existingIndex >= 0) {
        return current.map((item) => (item.id === project.id ? project : item));
      }
      return [project, ...current];
    });
    void syncProjectToBackend(project);
    return project.id;
  };

  const placeOrder = () => {
    const nextId = makeId('CD');
    saveProject(makeProjectFromForm(form, estimate, nextId));
    setOrderId(nextId);
    setStep('placed');
  };

  const updateProject = (projectId: string, patch: Partial<PartnerProject>) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? { ...project, ...patch, updatedAt: new Date().toISOString() }
          : project,
      ),
    );
  };

  const addProof = (proof: Omit<ProofItem, 'id' | 'status' | 'createdAt'>) => {
    const nextProof: ProofItem = {
      ...proof,
      id: makeId('PF'),
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    setProofs((current) => [nextProof, ...current]);
    updateProject(proof.projectId, {
      proofMissing: Math.max(0, (projects.find((project) => project.id === proof.projectId)?.proofMissing ?? 1) - 1),
    });
  };

  const updateProofStatus = (proofId: string, status: ProofItem['status']) => {
    setProofs((current) => current.map((proof) => (proof.id === proofId ? { ...proof, status } : proof)));
  };

  const addDraft = (draft: Omit<AutomationDraft, 'id' | 'createdAt'>) => {
    setDrafts((current) => [
      { ...draft, id: makeId('DR'), createdAt: new Date().toISOString() },
      ...current,
    ]);
  };

  const restoreWorkspace = (snapshot: WorkspaceSnapshot) => {
    setProjects(snapshot.projects.length ? snapshot.projects : buildSeedProjects());
    setProofs(snapshot.proofs);
    setCash(snapshot.cash);
    setDrafts(snapshot.drafts);
    setCommandTab('operator');
    setMode('command');
  };

  const loadBackendWorkspace = async (token = backendToken) => {
    if (!token) {
      setBackendMessage('Login required.');
      return;
    }
    setBackendBusy(true);
    try {
      const response = await fetch(`${backendApiBase.replace(/\/$/, '')}/api/contractor-desk/my-workspace`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const workspace = await response.json() as BackendWorkspace & { error?: string };
      if (!response.ok) throw new Error(workspace.error || 'Could not load workspace.');
      setBackendUser(workspace.user);
      setProjects(workspace.projects.length ? workspace.projects.map(mapBackendProject) : []);
      setBackendMessage(`Loaded ${workspace.projects.length} project(s) for ${workspace.user.loginId}.`);
    } catch (error) {
      setBackendMessage(error instanceof Error ? error.message : 'Could not load workspace.');
    } finally {
      setBackendBusy(false);
    }
  };

  const loginToBackend = async () => {
    setBackendBusy(true);
    try {
      const response = await fetch(`${backendApiBase.replace(/\/$/, '')}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ loginId, password: loginPassword }),
      });
      const session = await response.json() as { token: string; user: BackendUser; error?: string };
      if (!response.ok) throw new Error(session.error || 'Login failed.');
      setBackendToken(session.token);
      setBackendUser(session.user);
      setBackendMessage(`Logged in as ${session.user.loginId}.`);
      await loadBackendWorkspace(session.token);
    } catch (error) {
      setBackendMessage(error instanceof Error ? error.message : 'Login failed.');
    } finally {
      setBackendBusy(false);
    }
  };

  const logoutBackend = () => {
    setBackendToken('');
    setBackendUser(null);
    setBackendMessage('Local device mode.');
  };

  const syncProjectToBackend = async (project: PartnerProject) => {
    if (!backendToken) return;
    try {
      const response = await fetch(`${backendApiBase.replace(/\/$/, '')}/api/contractor-desk/projects`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${backendToken}`,
        },
        body: JSON.stringify({
          id: project.id,
          title: project.title,
          role: project.role,
          name: project.partner,
          phone: project.phone,
          company: project.partner,
          city: project.city,
          service: project.service,
          execution: project.execution,
          area: project.area,
          notes: project.notes,
          attachments: project.attachments,
          valueLow: project.valueLow,
          valueHigh: project.valueHigh,
          token: project.token,
          stage: project.stage,
          paymentGate: project.paymentGate,
          proofMissing: project.proofMissing,
          status: 'User draft',
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Backend sync failed.');
      }
      setBackendMessage(`Synced ${project.id}.`);
    } catch (error) {
      setBackendMessage(error instanceof Error ? error.message : 'Saved locally. Backend sync failed.');
    }
  };

  const whatsappLink = createWhatsappLink(buildOrderMessage(form, orderId || 'Draft', estimate));

  return (
    <main className="contractor-app-shell">
      <SEOHead
        title="Contractor Desk by AlterCraft | B2B Execution Operating App"
        description="Contractor Desk by AlterCraft helps designers, builders and partners request, estimate and track execution work with AlterCraft."
        canonical="https://www.altercraft.in/ContractorDesk/"
        jsonLd={[productSchema]}
      />

      <section className="contractor-phone-frame" aria-label="Contractor Desk app">
        <header className="contractor-app-topbar">
          <Link to="/" className="contractor-app-brand" aria-label="AlterCraft home">
            <span>
              <img src="/altercraft-logo-mark.png" alt="" />
            </span>
            <div>
              <strong>Contractor Desk</strong>
              <small>{mode === 'request' ? 'Execution partner app' : 'Project work desk'}</small>
            </div>
          </Link>
          <button
            type="button"
            className="contractor-icon-button"
            onClick={() => {
              setMode(mode === 'request' ? 'command' : 'request');
              if (mode === 'request') setCommandTab('operator');
            }}
            aria-label={mode === 'request' ? 'Open work desk' : 'Open request flow'}
          >
            {mode === 'request' ? <Gauge size={18} /> : <Home size={18} />}
          </button>
        </header>

        <div className="contractor-mode-switch" role="tablist" aria-label="Contractor Desk mode">
          <button type="button" className={mode === 'request' ? 'is-active' : ''} onClick={() => setMode('request')}>
            Request
          </button>
          <button type="button" className={mode === 'command' ? 'is-active' : ''} onClick={() => setMode('command')}>
            Work Desk
          </button>
        </div>

        <BackendAccountStrip
          apiBase={backendApiBase}
          setApiBase={setBackendApiBase}
          loginId={loginId}
          setLoginId={setLoginId}
          loginPassword={loginPassword}
          setLoginPassword={setLoginPassword}
          user={backendUser}
          message={backendMessage}
          busy={backendBusy}
          hasToken={Boolean(backendToken)}
          onLogin={loginToBackend}
          onLoad={() => loadBackendWorkspace()}
          onLogout={logoutBackend}
        />

        {mode === 'request' ? (
          <>
            <div className="contractor-progress" aria-label={`Step ${stepIndex + 1} of ${steps.length}`}>
              <span style={{ width: `${progress}%` }} />
            </div>

            {step === 'welcome' && (
              <WelcomeScreen onNext={goNext} onCommand={() => setMode('command')} onPreset={applyPreset} />
            )}
            {step === 'signup' && (
              <SignupScreen form={form} updateForm={updateForm} onNext={goNext} onBack={goBack} />
            )}
            {step === 'service' && (
              <ServiceScreen form={form} updateForm={updateForm} onNext={goNext} onBack={goBack} />
            )}
            {step === 'project' && (
              <ProjectScreen form={form} updateForm={updateForm} estimate={estimate} onNext={goNext} onBack={goBack} />
            )}
            {step === 'estimate' && (
              <EstimateScreen form={form} estimate={estimate} onBack={goBack} onPlaceOrder={placeOrder} onSaveDraft={() => saveProject()} />
            )}
            {step === 'placed' && (
              <PlacedScreen
                form={form}
                estimate={estimate}
                orderId={orderId}
                whatsappLink={whatsappLink}
                onBack={() => setStep('estimate')}
                onCommand={() => {
                  setMode('command');
                  setCommandTab('operator');
                }}
              />
            )}
          </>
        ) : (
          <CommandCenter
            tab={commandTab}
            setTab={setCommandTab}
            form={form}
            updateForm={updateForm}
            estimate={estimate}
            projects={projects}
            proofs={proofs}
            cash={cash}
            drafts={drafts}
            saveProject={() => saveProject()}
            updateProject={updateProject}
            addProof={addProof}
            updateProofStatus={updateProofStatus}
            setCash={setCash}
            addDraft={addDraft}
            restoreWorkspace={restoreWorkspace}
          />
        )}
      </section>
    </main>
  );
}

function BackendAccountStrip({
  apiBase,
  setApiBase,
  loginId,
  setLoginId,
  loginPassword,
  setLoginPassword,
  user,
  message,
  busy,
  hasToken,
  onLogin,
  onLoad,
  onLogout,
}: {
  apiBase: string;
  setApiBase: (value: string) => void;
  loginId: string;
  setLoginId: (value: string) => void;
  loginPassword: string;
  setLoginPassword: (value: string) => void;
  user: BackendUser | null;
  message: string;
  busy: boolean;
  hasToken: boolean;
  onLogin: () => void;
  onLoad: () => void;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (user) {
    return (
      <div className="contractor-account-strip is-connected">
        <span>
          <UserRound size={15} />
          <strong>{user.loginId}</strong>
          <small>{message}</small>
        </span>
        <button type="button" onClick={onLoad} disabled={busy}>
          <RefreshCw size={15} /> Load
        </button>
        <button type="button" onClick={onLogout}>
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className={open ? 'contractor-account-strip is-open' : 'contractor-account-strip'}>
      <button type="button" className="contractor-account-toggle" onClick={() => setOpen((current) => !current)}>
        <LogIn size={15} />
        <span>{hasToken ? 'Saved login session' : 'Partner login'}</span>
      </button>
      <small>{message}</small>
      {open ? (
        <div className="contractor-account-form">
          <input value={apiBase} onChange={(event) => setApiBase(event.target.value)} aria-label="Backend URL" />
          <input value={loginId} onChange={(event) => setLoginId(event.target.value)} placeholder="Login ID" aria-label="Login ID" />
          <input
            value={loginPassword}
            onChange={(event) => setLoginPassword(event.target.value)}
            placeholder="Password"
            aria-label="Password"
            type="password"
          />
          <button type="button" onClick={onLogin} disabled={busy || !loginId || !loginPassword}>
            <LockKeyhole size={15} /> Login
          </button>
          {hasToken ? (
            <button type="button" onClick={onLoad} disabled={busy}>
              <RefreshCw size={15} /> Load
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function WelcomeScreen({
  onNext,
  onCommand,
  onPreset,
}: {
  onNext: () => void;
  onCommand: () => void;
  onPreset: (patch: Partial<OrderForm>) => void;
}) {
  const promiseItems = [
    { icon: ClipboardList, label: 'New job' },
    { icon: Gauge, label: 'Project tracker' },
    { icon: Camera, label: 'Site proof' },
    { icon: LockKeyhole, label: 'Money control' },
    { icon: Bot, label: 'Message drafts' },
  ];

  return (
    <section className="contractor-screen contractor-welcome-screen">
      <div className="contractor-hero-visual" aria-hidden="true">
        <div className="contractor-stack is-blue" />
        <div className="contractor-stack is-green" />
        <div className="contractor-stack is-amber" />
      </div>
      <p className="contractor-eyebrow">B2B infra execution partner</p>
      <h1>Bring the project. AlterCraft executes the work.</h1>
      <p className="contractor-lede">
        Create a project request, estimate it, save it into the work desk, then track
        execution, site proof, payment status and ready-to-send messages in one app.
      </p>

      <div className="contractor-promise-grid is-five">
        {promiseItems.map((item) => (
          <article key={item.label}>
            <item.icon size={18} />
            <span>{item.label}</span>
          </article>
        ))}
      </div>

      <div className="contractor-preset-grid" aria-label="Quick start request presets">
        {quickPresets.map((preset) => (
          <button type="button" key={preset.key} className="contractor-preset-card" onClick={() => onPreset(preset.patch)}>
            <Sparkles size={16} />
            <span>
              <strong>{preset.title}</strong>
              <small>{preset.copy}</small>
            </span>
          </button>
        ))}
      </div>

      <button type="button" className="contractor-main-button" onClick={onNext}>
        Start request <ArrowRight size={18} />
      </button>
      <button type="button" className="contractor-secondary-button contractor-inline-button" onClick={onCommand}>
        Open work desk
      </button>
    </section>
  );
}

function SignupScreen({
  form,
  updateForm,
  onNext,
  onBack,
}: {
  form: OrderForm;
  updateForm: <K extends keyof OrderForm>(key: K, value: OrderForm[K]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const issues = getReadinessIssues(form).filter((issue) =>
    ['Name missing', 'Phone missing', 'City missing', 'Company optional'].includes(issue.label),
  );

  return (
    <section className="contractor-screen">
      <ScreenTitle icon={LogIn} eyebrow="Account" title="Create your partner account" />

      <div className="contractor-role-grid">
        {roleOptions.map((role) => (
          <button
            type="button"
            key={role}
            className={form.role === role ? 'is-selected' : ''}
            onClick={() => updateForm('role', role)}
          >
            <Check size={14} />
            {role}
          </button>
        ))}
      </div>

      <div className="contractor-form-grid">
        <Field label="Your name" value={form.name} placeholder="Ranjeet Sharma" icon={UserRound} onChange={(value) => updateForm('name', value)} />
        <Field label="Phone" value={form.phone} placeholder="8817503658" icon={Phone} inputMode="tel" onChange={(value) => updateForm('phone', value)} />
        <Field label="Company / studio" value={form.company} placeholder="Studio, builder firm or agency" icon={Store} onChange={(value) => updateForm('company', value)} />
        <Field label="Project city" value={form.city} placeholder="Ghaziabad / Noida / Delhi NCR" icon={Building2} onChange={(value) => updateForm('city', value)} />
      </div>

      <ReadinessPanel issues={issues} title="Account readiness" compact />

      <FooterActions onBack={onBack} onNext={onNext} nextLabel="Choose service" />
    </section>
  );
}

function ServiceScreen({
  form,
  updateForm,
  onNext,
  onBack,
}: {
  form: OrderForm;
  updateForm: <K extends keyof OrderForm>(key: K, value: OrderForm[K]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const service = getService(form.service);
  const execution = getExecution(form.execution);

  return (
    <section className="contractor-screen">
      <ScreenTitle icon={ClipboardList} eyebrow="Scope" title="Pick the service lane" />

      <div className="contractor-service-rail" aria-label="Selected service lane">
        <div>
          <span>Selected lane</span>
          <strong>{service.label}</strong>
          <small>
            {execution.label} - {formatMoney(service.rates[form.execution])} / {service.unit}
          </small>
        </div>
        <button type="button" onClick={onNext}>
          Area
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="contractor-option-list">
        {serviceOptions.map((service) => (
          <button
            type="button"
            key={service.key}
            className={form.service === service.key ? 'contractor-option is-selected' : 'contractor-option'}
            onClick={() => updateForm('service', service.key)}
          >
            <service.icon size={21} />
            <span>
              <strong>{service.label}</strong>
              <small>{service.short}</small>
            </span>
            <em>From {formatMoney(Math.min(...Object.values(service.rates)))} / {service.unit}</em>
          </button>
        ))}
      </div>

      <ScreenTitle icon={WalletCards} eyebrow="Execution type" title="How should AlterCraft engage?" compact />

      <div className="contractor-execution-grid">
        {executionOptions.map((execution) => (
          <button
            type="button"
            key={execution.key}
            className={form.execution === execution.key ? 'is-selected' : ''}
            onClick={() => updateForm('execution', execution.key)}
          >
            <execution.icon size={18} />
            <strong>{execution.label}</strong>
            <span>{execution.short}</span>
          </button>
        ))}
      </div>

      <div className="contractor-capability-card">
        <span>{service.label} + {execution.label}</span>
        <strong>{formatMoney(service.rates[form.execution])} / {service.unit}</strong>
        <p>{execution.detail}</p>
        <div className="contractor-include-strip">
          {service.includes.map((item) => (
            <span key={item}>
              <Check size={14} />
              {item}
            </span>
          ))}
        </div>
      </div>
      <FooterActions onBack={onBack} onNext={onNext} nextLabel="Add project area" />
    </section>
  );
}

function ProjectScreen({
  form,
  updateForm,
  estimate,
  onNext,
  onBack,
}: {
  form: OrderForm;
  updateForm: <K extends keyof OrderForm>(key: K, value: OrderForm[K]) => void;
  estimate: ReturnType<typeof useEstimate>;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <section className="contractor-screen">
      <ScreenTitle icon={Ruler} eyebrow="Project" title="Enter approximate work area" />
      <ProjectDetails form={form} updateForm={updateForm} estimate={estimate} />
      <FooterActions onBack={onBack} onNext={onNext} nextLabel="Review estimate" />
    </section>
  );
}

function ProjectDetails({
  form,
  updateForm,
  estimate,
}: {
  form: OrderForm;
  updateForm: <K extends keyof OrderForm>(key: K, value: OrderForm[K]) => void;
  estimate: ReturnType<typeof useEstimate>;
}) {
  const addScopeSignal = (signal: string) => {
    updateForm('attachmentNames', appendUniqueItems(form.attachmentNames, [signal]));
  };
  const removeScopeSignal = (signal: string) => {
    updateForm('attachmentNames', form.attachmentNames.filter((item) => item !== signal));
  };

  return (
    <>
      <div className="contractor-area-panel">
        <label htmlFor="work-area">Approx work area</label>
        <div>
          <input
            id="work-area"
            type="number"
            min="50"
            step="50"
            value={form.area}
            onChange={(event) => updateForm('area', Number(event.target.value))}
            onBlur={() => updateForm('area', normalizeArea(form.area))}
          />
          <span>sq ft</span>
        </div>
        <input
          type="range"
          min="100"
          max="10000"
          step="50"
          value={Math.min(Math.max(form.area, 100), 10000)}
          onChange={(event) => updateForm('area', Number(event.target.value))}
          aria-label="Approx work area slider"
        />
      </div>

      <div className="contractor-area-presets" aria-label="Area quick presets">
        {areaPresets.map((preset) => (
          <button
            type="button"
            key={preset.label}
            className={Math.abs(form.area - preset.area) < 50 ? 'is-selected' : ''}
            onClick={() => {
              updateForm('area', preset.area);
              updateForm('notes', appendNote(form.notes, preset.note));
            }}
          >
            <strong>{preset.label}</strong>
            <span>{preset.area.toLocaleString('en-IN')} sq ft</span>
          </button>
        ))}
        <button
          type="button"
          className="is-assist"
          onClick={() => {
            updateForm('area', 500);
            updateForm('notes', appendNote(form.notes, 'Customer is not sure about exact area. AlterCraft should confirm measurement before final quote.'));
          }}
        >
          <strong>Not sure</strong>
          <span>Use survey assumption</span>
        </button>
      </div>

      <div className="contractor-form-grid">
        <Field label="Property type" value={form.propertyType} placeholder="Apartment, villa, office, shop" icon={Building2} onChange={(value) => updateForm('propertyType', value)} />
        <Field label="Start window" value={form.startWindow} placeholder="Immediate / 15 days / next month" icon={Calculator} onChange={(value) => updateForm('startWindow', value)} />
        <Field label="Material grade" value={form.materialGrade} placeholder="Economy, standard, premium" icon={PackageCheck} onChange={(value) => updateForm('materialGrade', value)} />
      </div>

      <label className="contractor-file-box">
        <UploadCloud size={18} />
        <span>
          <strong>Drawings / BOQ / photos</strong>
          <small>{form.attachmentNames.length ? form.attachmentNames.join(', ') : 'Attach files or add local scope signals'}</small>
        </span>
        <input
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.dwg"
          onChange={(event) =>
            updateForm(
              'attachmentNames',
              appendUniqueItems(
                form.attachmentNames,
                Array.from(event.currentTarget.files ?? []).map((file) => file.name),
              ),
            )
          }
        />
      </label>

      <div className="contractor-scope-evidence">
        <div className="contractor-list-head">
          <h2>Scope evidence</h2>
          <span>{form.attachmentNames.length ? `${form.attachmentNames.length} saved` : 'Optional'}</span>
        </div>
        <div className="contractor-scope-buttons">
          {scopeSignalOptions.map((signal) => (
            <button
              type="button"
              key={signal}
              className={form.attachmentNames.includes(signal) ? 'is-selected' : ''}
              onClick={() => addScopeSignal(signal)}
              disabled={form.attachmentNames.includes(signal)}
            >
              <Plus size={14} />
              {signal}
            </button>
          ))}
        </div>
        {form.attachmentNames.length > 0 && (
          <div className="contractor-scope-chips" aria-label="Saved local scope evidence">
            {form.attachmentNames.map((item) => (
              <button type="button" key={item} onClick={() => removeScopeSignal(item)} aria-label={`Remove ${item}`}>
                {item}
                <X size={13} />
              </button>
            ))}
          </div>
        )}
        <p>Only file names and handoff signals are saved for now. Real file upload can be added later.</p>
      </div>

      <label className="contractor-textarea">
        <span>Notes, drawings or site condition</span>
        <textarea
          value={form.notes}
          placeholder="Example: builder floor renovation, drawings available, client wants fast execution..."
          rows={4}
          onChange={(event) => updateForm('notes', event.target.value)}
        />
      </label>

      <div className="contractor-live-estimate">
        <span>Live indicative range</span>
        <strong>{formatMoney(estimate.low)} - {formatMoney(estimate.high)}</strong>
        <small>Final quote after scope, BOQ, site photos and material grade verification.</small>
      </div>

      <ReadinessPanel issues={getReadinessIssues(form)} title="Scope readiness" />
    </>
  );
}

function EstimateScreen({
  form,
  estimate,
  onBack,
  onPlaceOrder,
  onSaveDraft,
}: {
  form: OrderForm;
  estimate: ReturnType<typeof useEstimate>;
  onBack: () => void;
  onPlaceOrder: () => void;
  onSaveDraft: () => void;
}) {
  const issues = getReadinessIssues(form);
  const blockers = issues.filter((issue) => issue.tone === 'danger');
  const readinessScore = getReadinessScore(issues);
  const costBreakdown = getCostBreakdown(form.execution, estimate.subtotal);
  const rows = [
    ['Partner type', form.role],
    ['Service', estimate.service.label],
    ['Execution', estimate.execution.label],
    ['Area', `${estimate.area.toLocaleString('en-IN')} sq ft`],
    ['Rate', `${formatMoney(estimate.rate)} / sq ft`],
    ['Timeline', estimate.timeline],
    ['Booking token', formatMoney(estimate.token)],
  ];

  return (
    <section className="contractor-screen">
      <ScreenTitle icon={Calculator} eyebrow="Estimate" title="Indicative quote is ready" />

      <div className="contractor-quote-card">
        <span>Estimated project range</span>
        <strong>{formatMoney(estimate.low)} - {formatMoney(estimate.high)}</strong>
        <p>
          {getConfidenceLabel(readinessScore)}. This is a fast B2B planning estimate. Final rate depends on drawings, site access,
          measurement, material brand, quantity and payment milestones.
        </p>
      </div>

      <div className="contractor-breakdown-card">
        <div className="contractor-list-head">
          <h2>Indicative cost split</h2>
          <span>{estimate.execution.label}</span>
        </div>
        <div className="contractor-breakdown-total">
          <span>Planning base before range buffer</span>
          <strong>{formatMoney(estimate.subtotal)}</strong>
        </div>
        <div className="contractor-breakdown-list">
          {costBreakdown.map((item) => (
            <article key={item.label} className="contractor-breakdown-row">
              <div>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </div>
              <em>{item.share}%</em>
              <small>{formatMoney(item.amount)}</small>
              <i aria-hidden="true">
                <b style={{ width: `${item.share}%` }} />
              </i>
            </article>
          ))}
        </div>
        <p>Final split locks after BOQ, site access, brand selection, quantity verification and payment milestone approval.</p>
      </div>

      <ReadinessPanel issues={issues} title={`Order readiness ${readinessScore}%`} />

      <div className="contractor-summary-list">
        {rows.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <div className="contractor-include-strip">
        {estimate.service.includes.map((item) => (
          <span key={item}>
            <Check size={14} />
            {item}
          </span>
        ))}
      </div>

      <button type="button" className="contractor-secondary-button contractor-inline-button" onClick={onSaveDraft}>
        Save project draft
      </button>
      <FooterActions
        onBack={onBack}
        onNext={onPlaceOrder}
        nextLabel="Place request"
        nextIcon={Send}
        disabled={blockers.length > 0}
        disabledReason={blockers.length > 0 ? 'Add name, phone and valid area before placing the request.' : undefined}
      />
    </section>
  );
}

function PlacedScreen({
  form,
  estimate,
  orderId,
  whatsappLink,
  onBack,
  onCommand,
}: {
  form: OrderForm;
  estimate: ReturnType<typeof useEstimate>;
  orderId: string;
  whatsappLink: string;
  onBack: () => void;
  onCommand: () => void;
}) {
  const [briefCopyState, setBriefCopyState] = useState<'idle' | 'copied' | 'manual'>('idle');
  const orderBrief = buildOrderMessage(form, orderId || 'Draft', estimate);
  const handoffChecklist = getHandoffChecklist(form, estimate);
  const handoffScore = getReadinessScore(getReadinessIssues(form));
  const nextHandoffAction = getNextHandoffAction(form, estimate);

  const copyOrderBrief = async () => {
    setBriefCopyState((await copyTextToClipboard(orderBrief)) ? 'copied' : 'manual');
  };

  return (
    <section className="contractor-screen contractor-placed-screen">
      <div className="contractor-success-mark">
        <Check size={34} />
      </div>
      <p className="contractor-eyebrow">Request placed</p>
      <h1>{orderId}</h1>
      <p className="contractor-lede">
        Contractor Desk prepared the order summary for {form.company || form.name || 'your team'} and saved it into the work desk.
      </p>

      <div className="contractor-quote-card">
        <span>Current estimate</span>
        <strong>{formatMoney(estimate.low)} - {formatMoney(estimate.high)}</strong>
        <p>{estimate.service.label} - {estimate.execution.label} - {estimate.area.toLocaleString('en-IN')} sq ft</p>
      </div>

      <div className="contractor-handoff-panel">
        <div className="contractor-list-head">
          <h2>Handoff readiness</h2>
          <span>{handoffScore}%</span>
        </div>
        <div className="contractor-handoff-next">
          <strong>Next action</strong>
          <p>{nextHandoffAction}</p>
        </div>
        <div className="contractor-handoff-grid">
          {handoffChecklist.map((item) => (
            <article key={item.label} className={`is-${item.tone}`}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.detail}</small>
            </article>
          ))}
        </div>
      </div>

      <div className="contractor-next-steps">
        <article>
          <span>1</span>
          <strong>Scope call</strong>
          <small>AlterCraft checks service lane, city, access and expected start date.</small>
        </article>
        <article>
          <span>2</span>
          <strong>Files or survey</strong>
          <small>Drawings, photos, BOQ or a site measurement convert the estimate into a quote.</small>
        </article>
        <article>
          <span>3</span>
          <strong>Payment gate</strong>
          <small>Token clears the execution slot, material lane and labour scheduling.</small>
        </article>
        <article>
          <span>4</span>
          <strong>Proof-led work</strong>
          <small>Execution moves through site proof, payment checks and handover tracking.</small>
        </article>
      </div>

      <a className="contractor-main-button" href={whatsappLink}>
        Send to AlterCraft <Send size={18} />
      </a>
      <button type="button" className="contractor-secondary-button contractor-inline-button" onClick={copyOrderBrief}>
        {briefCopyState === 'copied' ? 'Brief copied' : briefCopyState === 'manual' ? 'Copy manually below' : 'Copy order brief'} <FileText size={18} />
      </button>
      {briefCopyState === 'manual' && (
        <label className="contractor-manual-copy">
          <span>Manual copy fallback</span>
          <textarea readOnly rows={8} value={orderBrief} onFocus={(event) => event.currentTarget.select()} />
        </label>
      )}
      <button type="button" className="contractor-secondary-button contractor-inline-button" onClick={onCommand}>
        Open work desk
      </button>
      <button type="button" className="contractor-secondary-button contractor-inline-button" onClick={onBack}>
        Edit estimate
      </button>
    </section>
  );
}

function CommandCenter({
  tab,
  setTab,
  form,
  updateForm,
  estimate,
  projects,
  proofs,
  cash,
  drafts,
  saveProject,
  updateProject,
  addProof,
  updateProofStatus,
  setCash,
  addDraft,
  restoreWorkspace,
}: {
  tab: CommandTab;
  setTab: (tab: CommandTab) => void;
  form: OrderForm;
  updateForm: <K extends keyof OrderForm>(key: K, value: OrderForm[K]) => void;
  estimate: ReturnType<typeof useEstimate>;
  projects: PartnerProject[];
  proofs: ProofItem[];
  cash: CashState;
  drafts: AutomationDraft[];
  saveProject: () => string;
  updateProject: (projectId: string, patch: Partial<PartnerProject>) => void;
  addProof: (proof: Omit<ProofItem, 'id' | 'status' | 'createdAt'>) => void;
  updateProofStatus: (proofId: string, status: ProofItem['status']) => void;
  setCash: (updater: (cash: CashState) => CashState) => void;
  addDraft: (draft: Omit<AutomationDraft, 'id' | 'createdAt'>) => void;
  restoreWorkspace: (snapshot: WorkspaceSnapshot) => void;
}) {
  return (
    <>
      <nav className="contractor-command-tabs" aria-label="Contractor Desk work sections">
        {commandTabs.map((item) => (
          <button
            type="button"
            key={item.key}
            className={tab === item.key ? 'is-active' : ''}
            onClick={() => setTab(item.key)}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </nav>

      {tab === 'intake' && (
        <IntakeModule form={form} updateForm={updateForm} estimate={estimate} projects={projects} saveProject={saveProject} />
      )}
      {tab === 'operator' && (
        <OperatorModule projects={projects} proofs={proofs} updateProject={updateProject} />
      )}
      {tab === 'proof' && (
        <ProofModule projects={projects} proofs={proofs} addProof={addProof} updateProofStatus={updateProofStatus} />
      )}
      {tab === 'cash' && <CashModule projects={projects} cash={cash} setCash={setCash} updateProject={updateProject} />}
      {tab === 'automation' && (
        <AutomationModule
          projects={projects}
          proofs={proofs}
          cash={cash}
          drafts={drafts}
          addDraft={addDraft}
          onRestoreSnapshot={restoreWorkspace}
        />
      )}
    </>
  );
}

function IntakeModule({
  form,
  updateForm,
  estimate,
  projects,
  saveProject,
}: {
  form: OrderForm;
  updateForm: <K extends keyof OrderForm>(key: K, value: OrderForm[K]) => void;
  estimate: ReturnType<typeof useEstimate>;
  projects: PartnerProject[];
  saveProject: () => string;
}) {
  const [savedId, setSavedId] = useState('');
  const issues = getReadinessIssues(form);
  const score = getReadinessScore(issues);

  return (
    <section className="contractor-screen contractor-module-screen">
      <ScreenTitle icon={ClipboardList} eyebrow="New project" title="Capture scope, files and site details" />
      <div className="contractor-module-note">
        <FileText size={17} />
        This test app saves details on this device. Team login and real file upload can be added after the workflow is approved.
      </div>

      <div className="contractor-intake-score">
        <Gauge size={18} />
        <span>
          <strong>{getConfidenceLabel(score)} - {score}%</strong>
          <small>Better contact, files and site notes produce a tighter B2B handoff.</small>
        </span>
      </div>

      <ProjectDetails form={form} updateForm={updateForm} estimate={estimate} />

      <button
        type="button"
        className="contractor-main-button contractor-inline-button"
        onClick={() => setSavedId(saveProject())}
      >
        Save project draft <Plus size={17} />
      </button>
      {savedId && <p className="contractor-soft-note">Saved into work desk as {savedId}.</p>}

      <ProjectList projects={projects} compact />
    </section>
  );
}

function OperatorModule({
  projects,
  proofs,
  updateProject,
}: {
  projects: PartnerProject[];
  proofs: ProofItem[];
  updateProject: (projectId: string, patch: Partial<PartnerProject>) => void;
}) {
  const [query, setQuery] = useState('');
  const [gateFilter, setGateFilter] = useState<'All' | PartnerProject['paymentGate']>('All');
  const [focusFilter, setFocusFilter] = useState<OperatorFocus>('All');
  const activeProjects = projects.filter((project) => project.stage !== 'Closed');
  const blocked = projects.filter((project) => project.paymentGate === 'Blocked').length;
  const pendingProof = proofs.filter((proof) => proof.status === 'Pending').length + projects.reduce((sum, project) => sum + project.proofMissing, 0);
  const pipeline = projects.reduce((sum, project) => sum + project.valueLow, 0);
  const focusCounts = operatorFocusOptions.reduce<Record<OperatorFocus, number>>((counts, focus) => {
    counts[focus] = focus === 'All' ? projects.length : projects.filter((project) => getProjectTriageTags(project).includes(focus)).length;
    return counts;
  }, { All: 0, 'Needs contact': 0, 'Needs scope': 0, 'Needs token': 0, 'Needs proof': 0 });
  const normalizedQuery = query.trim().toLowerCase();
  const visibleProjects = projects.filter((project) => {
    const matchesGate = gateFilter === 'All' || project.paymentGate === gateFilter;
    const matchesFocus = focusFilter === 'All' || getProjectTriageTags(project).includes(focusFilter);
    const haystack = [
      project.id,
      project.partner,
      project.city,
      project.role,
      project.title,
      getService(project.service).label,
      getExecution(project.execution).label,
    ].join(' ').toLowerCase();
    return matchesGate && matchesFocus && (!normalizedQuery || haystack.includes(normalizedQuery));
  });
  const actionQueue = visibleProjects
    .filter((project) => project.stage !== 'Closed')
    .slice(0, 4)
    .map((project) => ({ project, action: getProjectAction(project, proofs) }));

  const advanceStage = (project: PartnerProject) => {
    const nextIndex = Math.min(workStages.indexOf(project.stage) + 1, workStages.length - 1);
    updateProject(project.id, { stage: workStages[nextIndex] });
  };

  return (
    <section className="contractor-screen contractor-module-screen">
      <ScreenTitle icon={Gauge} eyebrow="Projects" title="See active work, blockers and next action" />

      <div className="contractor-kpi-grid">
        <KpiCard label="Active" value={activeProjects.length.toString()} note="live or open projects" />
        <KpiCard label="Blocked" value={blocked.toString()} note="payment gate issues" tone={blocked ? 'danger' : 'ok'} />
        <KpiCard label="Proof" value={pendingProof.toString()} note="missing or pending items" tone={pendingProof ? 'warn' : 'ok'} />
        <KpiCard label="Pipeline" value={formatMoney(pipeline)} note="indicative low value" />
      </div>

      <div className="contractor-filter-panel">
        <div className="contractor-triage-strip" aria-label="Project filters">
          {operatorFocusOptions.map((focus) => (
            <button
              type="button"
              key={focus}
              className={focusFilter === focus ? 'is-active' : ''}
              onClick={() => setFocusFilter(focus)}
            >
              <span>{focus}</span>
              <strong>{focusCounts[focus]}</strong>
            </button>
          ))}
        </div>
        <label className="contractor-field">
          <span>Search projects</span>
          <div>
            <ClipboardList size={17} />
            <input
              value={query}
              placeholder="Partner, order ID, city, service..."
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </label>
        <label className="contractor-select-field">
          <span>Payment gate</span>
          <select value={gateFilter} onChange={(event) => setGateFilter(event.target.value as 'All' | PartnerProject['paymentGate'])}>
            <option value="All">All gates</option>
            <option value="Pending">Pending</option>
            <option value="Cleared">Cleared</option>
            <option value="Blocked">Blocked</option>
          </select>
        </label>
        <small>{visibleProjects.length} of {projects.length} project(s) visible</small>
      </div>

      <div className="contractor-action-queue">
        <div className="contractor-list-head">
          <h2>Next action queue</h2>
          <span>{actionQueue.length}</span>
        </div>
        {actionQueue.map(({ project, action }) => (
          <article key={project.id} className="contractor-action-card">
            <Route size={16} />
            <span>
              <strong>{action}</strong>
              <small>{project.id} - {project.partner}</small>
            </span>
          </article>
        ))}
      </div>

      <div className="contractor-board">
        {visibleProjects.length === 0 ? (
          <EmptyState title="No matching projects" copy="Clear search or change payment gate or triage filter to see more work." />
        ) : visibleProjects.map((project) => (
          <article key={project.id} className="contractor-project-card">
            <div className="contractor-project-head">
              <span>{project.id}</span>
              <GatePill status={project.paymentGate} />
            </div>
            <h2>{project.title}</h2>
            <p>{project.partner} - {project.city}</p>
            <ProjectSignalStrip project={project} />
            <div className="contractor-stage-meter">
              <span style={{ width: `${((workStages.indexOf(project.stage) + 1) / workStages.length) * 100}%` }} />
            </div>
            <div className="contractor-mini-row">
              <strong>{project.stage}</strong>
              <small>{formatMoney(project.valueLow)}+</small>
            </div>
            <div className="contractor-card-actions">
              <button type="button" onClick={() => advanceStage(project)}>
                <Route size={15} />
                Advance
              </button>
              <button
                type="button"
                onClick={() =>
                  updateProject(project.id, {
                    paymentGate: project.paymentGate === 'Cleared' ? 'Blocked' : 'Cleared',
                  })
                }
              >
                <RefreshCw size={15} />
                Gate
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProofModule({
  projects,
  proofs,
  addProof,
  updateProofStatus,
}: {
  projects: PartnerProject[];
  proofs: ProofItem[];
  addProof: (proof: Omit<ProofItem, 'id' | 'status' | 'createdAt'>) => void;
  updateProofStatus: (proofId: string, status: ProofItem['status']) => void;
}) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '');
  const [type, setType] = useState('Site progress');
  const [actor, setActor] = useState('Site supervisor');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [proofMessage, setProofMessage] = useState('');
  const selectedProject = projects.find((project) => project.id === projectId);
  const proofRecipe = getProofRecipe(selectedProject);

  const applyProofRecipe = (item: string) => {
    const stage = selectedProject?.stage ?? 'current stage';
    setType(item);
    setNote((current) => appendNote(current, `${item} captured for ${selectedProject?.id ?? 'selected project'} at ${stage} stage.`));
    setProofMessage(`${item} proof template loaded. Add a file name or keep the note before creating proof.`);
  };

  const submitProof = () => {
    if (!projectId) return;
    if (!files.length && note.trim().length < 8) {
      setProofMessage('Add at least a file or a clear note before creating proof.');
      return;
    }
    addProof({ projectId, type, actor, note, files });
    setNote('');
    setFiles([]);
    setProofMessage('Proof item added to the verification trail.');
  };

  return (
    <section className="contractor-screen contractor-module-screen">
      <ScreenTitle icon={Camera} eyebrow="Site proof" title="Add proof before work moves ahead" />

      <div className="contractor-form-grid">
        <label className="contractor-select-field">
          <span>Project</span>
          <select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.id} - {project.partner}</option>
            ))}
          </select>
        </label>
        <Field label="Proof type" value={type} placeholder="Loading proof / site progress / defect" icon={Image} onChange={setType} />
        <Field label="Actor" value={actor} placeholder="Vendor / labour lead / supervisor" icon={Users} onChange={setActor} />
      </div>

      <div className="contractor-proof-recipe">
        {proofRecipe.map((item) => (
          <button type="button" key={item} onClick={() => applyProofRecipe(item)}>
            <Check size={14} />
            {item}
          </button>
        ))}
      </div>

      <label className="contractor-file-box">
        <UploadCloud size={18} />
        <span>
          <strong>Photo or video proof</strong>
          <small>{files.length ? files.join(', ') : 'File names are stored locally in this prototype'}</small>
        </span>
        <input
          type="file"
          multiple
          accept="image/*,video/*,.pdf"
          onChange={(event) => setFiles(Array.from(event.currentTarget.files ?? []).map((file) => file.name))}
        />
      </label>

      <label className="contractor-textarea">
        <span>Proof note</span>
        <textarea value={note} rows={3} placeholder="Angle, stage, defect, material count, next action..." onChange={(event) => setNote(event.target.value)} />
      </label>

      <button type="button" className="contractor-main-button contractor-inline-button" onClick={submitProof}>
        Add proof item <Camera size={17} />
      </button>
      {proofMessage && (
        <p className={proofMessage.startsWith('Proof item') ? 'contractor-inline-success' : 'contractor-inline-warning'}>
          {proofMessage}
        </p>
      )}

      <div className="contractor-proof-list">
        {proofs.length === 0 ? (
          <EmptyState title="No proof uploaded yet" copy="Add site, vendor or labour proof to start the verification trail." />
        ) : (
          proofs.map((proof) => (
            <article key={proof.id} className="contractor-proof-card">
              <div>
                <span>{proof.type}</span>
                <h3>{projects.find((project) => project.id === proof.projectId)?.partner ?? proof.projectId}</h3>
                <p>{proof.actor} - {proof.note || 'No note added'}</p>
                <small>{proof.files.length ? proof.files.join(', ') : 'No file names'} - {formatShortDate(proof.createdAt)}</small>
              </div>
              <GatePill status={proof.status === 'Approved' ? 'Cleared' : proof.status === 'Rejected' ? 'Blocked' : 'Pending'} />
              <div className="contractor-card-actions">
                <button type="button" onClick={() => updateProofStatus(proof.id, 'Approved')}>
                  <CheckCircle2 size={15} />
                  Approve
                </button>
                <button type="button" onClick={() => updateProofStatus(proof.id, 'Rejected')}>
                  <AlertTriangle size={15} />
                  Reject
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function CashModule({
  projects,
  cash,
  setCash,
  updateProject,
}: {
  projects: PartnerProject[];
  cash: CashState;
  setCash: (updater: (cash: CashState) => CashState) => void;
  updateProject: (projectId: string, patch: Partial<PartnerProject>) => void;
}) {
  const [amount, setAmount] = useState(5000);
  const [bucket, setBucket] = useState<CashBucket>('material');
  const [cashMessage, setCashMessage] = useState('');
  const allocated = cash.material + cash.labour + cash.supervision + cash.reserve;
  const freeCash = cash.physicalCash - allocated;
  const locked = cash.physicalCash <= 0 || freeCash <= 0;
  const pendingTokens = projects.filter((project) => project.paymentGate !== 'Cleared').reduce((sum, project) => sum + project.token, 0);
  const firstPendingProject = projects.find((project) => project.paymentGate !== 'Cleared');
  const allocationHints = getCashAllocationHints(freeCash);

  const updateCashValue = (key: keyof CashState, value: number) =>
    setCash((current) => ({ ...current, [key]: Number.isFinite(value) ? value : 0 }));

  const allocate = () => {
    if (!Number.isFinite(amount) || amount <= 0) {
      setCashMessage('Enter a positive allocation amount.');
      return;
    }
    if (amount > Math.max(freeCash, 0)) {
      setCashMessage('Allocation blocked. Add physical cash or reduce the amount first.');
      return;
    }
    setCash((current) => ({ ...current, [bucket]: current[bucket] + amount }));
    setCashMessage(`${formatMoney(amount)} allocated to ${bucket}.`);
  };

  const collectFirstToken = () => {
    if (!firstPendingProject) {
      setCashMessage('No pending payment gate found.');
      return;
    }
    setCash((current) => ({ ...current, physicalCash: current.physicalCash + firstPendingProject.token }));
    updateProject(firstPendingProject.id, { paymentGate: 'Cleared' });
    setCashMessage(`${firstPendingProject.id} token collected and payment gate cleared.`);
  };

  const applyAllocationHint = (hint: CashAllocationHint) => {
    setBucket(hint.bucket);
    setAmount(hint.amount);
    setCashMessage(`${hint.label} selected for ${formatMoney(hint.amount)}. Tap Allocate to lock it into ${hint.bucket}.`);
  };

  return (
    <section className="contractor-screen contractor-module-screen">
      <ScreenTitle icon={LockKeyhole} eyebrow="Money control" title="Separate cash, pending money and work budgets" />

      <div className={locked ? 'contractor-cash-alert is-locked' : 'contractor-cash-alert'}>
        {locked ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
        <span>
          <strong>{locked ? (freeCash < 0 ? 'Payment gate lockdown' : 'No free cash available') : 'Cash gate stable'}</strong>
          <small>{locked ? 'Collect token, reduce allocations or add physical cash before new procurement.' : 'Unlocked cash can move only after bucket allocation.'}</small>
        </span>
      </div>

      <div className="contractor-cash-grid">
        <NumberBox label="Physical cash" value={cash.physicalCash} onChange={(value) => updateCashValue('physicalCash', value)} />
        <NumberBox label="Receivables" value={cash.receivables} onChange={(value) => updateCashValue('receivables', value)} />
        <KpiCard label="Free cash" value={formatMoney(freeCash)} note="after envelopes" tone={freeCash < 0 ? 'danger' : freeCash === 0 ? 'warn' : 'ok'} />
        <KpiCard label="Pending tokens" value={formatMoney(pendingTokens)} note="not yet cleared" tone={pendingTokens ? 'warn' : 'ok'} />
      </div>

      <div className="contractor-envelope-grid">
        <EnvelopeCard label="Material" value={cash.material} icon={PackageCheck} />
        <EnvelopeCard label="Labour" value={cash.labour} icon={Users} />
        <EnvelopeCard label="Supervision" value={cash.supervision} icon={HardHat} />
        <EnvelopeCard label="Reserve" value={cash.reserve} icon={ShieldCheck} />
      </div>

      <article className={firstPendingProject ? 'contractor-token-card' : 'contractor-token-card is-clear'}>
        <WalletCards size={18} />
        <span>
          <strong>{firstPendingProject ? 'Next token gate' : 'All token gates clear'}</strong>
          <small>
            {firstPendingProject
              ? `${firstPendingProject.id} - ${firstPendingProject.partner} needs ${formatMoney(firstPendingProject.token)} before execution movement.`
              : 'No local project is waiting on a token collection.'}
          </small>
        </span>
        {firstPendingProject && (
          <button type="button" onClick={collectFirstToken}>
            Collect token
          </button>
        )}
      </article>

      {allocationHints.length > 0 && (
        <div className="contractor-quick-allocation" aria-label="Quick cash allocation hints">
          {allocationHints.map((hint) => (
            <button type="button" key={hint.label} onClick={() => applyAllocationHint(hint)}>
              <strong>{hint.label}</strong>
              <span>{formatMoney(hint.amount)}</span>
              <small>{hint.note}</small>
            </button>
          ))}
        </div>
      )}

      <div className="contractor-allocation-row">
        <input type="number" value={amount} min="0" step="500" onChange={(event) => setAmount(Number(event.target.value))} />
        <select value={bucket} onChange={(event) => setBucket(event.target.value as CashBucket)}>
          <option value="material">Material</option>
          <option value="labour">Labour</option>
          <option value="supervision">Supervision</option>
          <option value="reserve">Reserve</option>
        </select>
        <button type="button" onClick={allocate}>Allocate</button>
      </div>
      {cashMessage && (
        <p className={cashMessage.includes('blocked') || cashMessage.includes('positive') ? 'contractor-inline-warning' : 'contractor-inline-success'}>
          {cashMessage}
        </p>
      )}
    </section>
  );
}

function AutomationModule({
  projects,
  proofs,
  cash,
  drafts,
  addDraft,
  onRestoreSnapshot,
}: {
  projects: PartnerProject[];
  proofs: ProofItem[];
  cash: CashState;
  drafts: AutomationDraft[];
  addDraft: (draft: Omit<AutomationDraft, 'id' | 'createdAt'>) => void;
  onRestoreSnapshot: (snapshot: WorkspaceSnapshot) => void;
}) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '');
  const [draftIntent, setDraftIntent] = useState<DraftIntent>('all');
  const [voiceNote, setVoiceNote] = useState('Client wants fast handover, material payment pending, site photos required today.');
  const [copiedId, setCopiedId] = useState('');
  const [draftManualCopy, setDraftManualCopy] = useState<{ id: string; text: string } | null>(null);
  const [snapshotCopied, setSnapshotCopied] = useState(false);
  const [snapshotImport, setSnapshotImport] = useState('');
  const [snapshotImportMessage, setSnapshotImportMessage] = useState('');
  const selectedProject = projects.find((project) => project.id === projectId) ?? projects[0];
  const selectedIntent = getDraftIntent(draftIntent);
  const noteReadiness = getVoiceNoteReadiness(voiceNote, selectedProject);
  const generatedDraftCount = draftIntent === 'all' ? 4 : 1;

  const generateDrafts = () => {
    if (!selectedProject) return;
    const base = `${selectedProject.partner} / ${selectedProject.title}`;
    const draftsToAdd = [
      {
        intent: 'work_order' as DraftIntent,
        kind: 'Work Order',
        title: `Work order draft - ${selectedProject.id}`,
        body: `Scope: ${base}. Execution: ${getExecution(selectedProject.execution).label}. Area: ${selectedProject.area} sq ft. Stage: ${selectedProject.stage}. Start only after payment gate is clear and BOQ is confirmed. Next action: ${getProjectAction(selectedProject, proofs)}.`,
      },
      {
        intent: 'vendor' as DraftIntent,
        kind: 'Vendor Message',
        title: `Vendor proof request - ${selectedProject.id}`,
        body: `Please share proof for ${base}: front angle, side angle, detail finish, material count and supervisor note before dispatch or stage approval.`,
      },
      {
        intent: 'client' as DraftIntent,
        kind: 'Client Update',
        title: `Client progress update - ${selectedProject.id}`,
        body: `Your project is at ${selectedProject.stage}. Payment gate: ${selectedProject.paymentGate}. Next action: ${getProjectAction(selectedProject, proofs)}. AlterCraft will keep proof-led execution visible before the next movement.`,
      },
      {
        intent: 'content' as DraftIntent,
        kind: 'Reel Script',
        title: `Content prompt - ${selectedProject.id}`,
        body: `Hook: One app to order labour, material and execution. Visuals: site photo, BOQ, proof upload, payment gate, handover. CTA: Contractor Desk by AlterCraft. Keep the story local and field-real.`,
      },
    ];

    draftsToAdd
      .filter((draft) => draftIntent === 'all' || draft.intent === draftIntent)
      .forEach((draft) => addDraft({
        kind: draft.kind,
        title: draft.title,
        projectId: selectedProject.id,
        body: `${draft.body}\n\nDraft intent: ${selectedIntent.label}.\nVoice note context: ${voiceNote}`,
      }));
  };

  const applyDraftIntent = (option: DraftIntentOption) => {
    setDraftIntent(option.key);
    setVoiceNote((current) => appendNote(current, option.prompt));
  };

  const copyDraft = async (draft: AutomationDraft) => {
    const text = `${draft.title}\n\n${draft.body}`;
    if (await copyTextToClipboard(text)) {
      setCopiedId(draft.id);
      setDraftManualCopy(null);
    } else {
      setCopiedId('');
      setDraftManualCopy({ id: draft.id, text });
    }
  };

  const copyWorkspaceSnapshot = async () => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      app: 'AlterCraft Contractor Desk',
      note: 'Local workspace snapshot. This is a manual backup, not an online account sync.',
      totals: {
        projects: projects.length,
        proofs: proofs.length,
        drafts: drafts.length,
        pipelineLow: projects.reduce((sum, project) => sum + project.valueLow, 0),
        pendingTokens: projects
          .filter((project) => project.paymentGate !== 'Cleared')
          .reduce((sum, project) => sum + project.token, 0),
      },
      cash,
      projects: projects.map((project) => ({
        id: project.id,
        partner: project.partner,
        role: project.role,
        phone: project.phone,
        city: project.city,
        serviceKey: project.service,
        service: getService(project.service).label,
        executionKey: project.execution,
        execution: getExecution(project.execution).label,
        area: project.area,
        stage: project.stage,
        paymentGate: project.paymentGate,
        proofMissing: project.proofMissing,
        valueLow: project.valueLow,
        valueHigh: project.valueHigh,
        token: project.token,
        attachments: project.attachments,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        estimatedRange: `${formatMoney(project.valueLow)} - ${formatMoney(project.valueHigh)}`,
        nextAction: getProjectAction(project, proofs),
        notes: project.notes,
      })),
      proofs,
      drafts: drafts.map((draft) => ({
        kind: draft.kind,
        projectId: draft.projectId,
        title: draft.title,
        body: draft.body,
        createdAt: draft.createdAt,
      })),
    };

    setSnapshotCopied(await copyTextToClipboard(JSON.stringify(snapshot, null, 2)));
  };

  const previewSnapshotImport = () => {
    const snapshot = parseWorkspaceSnapshot(snapshotImport);
    if (!snapshot) {
      setSnapshotImportMessage('Could not read this snapshot. Paste JSON copied from Contractor Desk.');
      return;
    }
    setSnapshotImportMessage(
      `Snapshot ready: ${snapshot.projects.length} project(s), ${snapshot.proofs.length} proof item(s), ${snapshot.drafts.length} draft(s).`,
    );
  };

  const restoreSnapshotImport = () => {
    const snapshot = parseWorkspaceSnapshot(snapshotImport);
    if (!snapshot) {
      setSnapshotImportMessage('Restore blocked. Snapshot JSON is missing or invalid.');
      return;
    }
    onRestoreSnapshot(snapshot);
    setSnapshotImportMessage('Workspace restored locally. Review Projects before using it.');
  };

  return (
    <section className="contractor-screen contractor-module-screen">
      <ScreenTitle icon={Bot} eyebrow="Message drafts" title="Turn site notes into ready messages" />
      <div className="contractor-module-note">
        <Mic size={17} />
        These are built-in message templates. They are not sent anywhere automatically.
      </div>

      <label className="contractor-select-field">
        <span>Project</span>
        <select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.id} - {project.partner}</option>
          ))}
        </select>
      </label>

      <div className="contractor-draft-intents" aria-label="Local draft type">
        {draftIntentOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              type="button"
              key={option.key}
              className={draftIntent === option.key ? 'is-active' : undefined}
              onClick={() => applyDraftIntent(option)}
            >
              <Icon size={15} />
              <span>
                <strong>{option.label}</strong>
                <small>{option.copy}</small>
              </span>
            </button>
          );
        })}
      </div>

      <div className="contractor-kpi-grid contractor-draft-readiness">
        <KpiCard label="Draft intent" value={selectedIntent.label} note={`${generatedDraftCount} local draft${generatedDraftCount > 1 ? 's' : ''} on generate`} tone="ok" />
        <KpiCard label="Note quality" value={noteReadiness.label} note={noteReadiness.detail} tone={noteReadiness.tone} />
      </div>

      <label className="contractor-textarea">
        <span>Voice note / rough instruction</span>
        <textarea value={voiceNote} rows={4} onChange={(event) => setVoiceNote(event.target.value)} />
      </label>

      <button type="button" className="contractor-main-button contractor-inline-button" onClick={generateDrafts}>
        Generate {selectedIntent.label.toLowerCase()} <MessageSquareText size={17} />
      </button>

      <div className="contractor-export-card">
        <FileText size={18} />
        <span>
          <strong>Workspace handoff snapshot</strong>
          <small>Copy local projects, proof, cash and draft records as JSON for manual backup or team handoff.</small>
        </span>
        <button type="button" onClick={copyWorkspaceSnapshot}>
          {snapshotCopied ? 'Snapshot copied' : 'Copy snapshot'}
        </button>
      </div>

      <label className="contractor-textarea contractor-snapshot-import">
        <span>Restore snapshot JSON</span>
        <textarea
          value={snapshotImport}
          rows={4}
          placeholder="Paste a Contractor Desk workspace snapshot here..."
          onChange={(event) => setSnapshotImport(event.target.value)}
        />
      </label>
      <div className="contractor-card-actions contractor-snapshot-actions">
        <button type="button" onClick={previewSnapshotImport}>
          <ReceiptText size={15} />
          Preview snapshot
        </button>
        <button type="button" onClick={restoreSnapshotImport}>
          <RefreshCw size={15} />
          Restore locally
        </button>
      </div>
      {snapshotImportMessage && (
        <p className={snapshotImportMessage.includes('blocked') || snapshotImportMessage.includes('Could not') ? 'contractor-inline-warning' : 'contractor-inline-success'}>
          {snapshotImportMessage}
        </p>
      )}

      <div className="contractor-draft-list">
        {drafts.length === 0 ? (
          <EmptyState title="No message drafts yet" copy="Create work-order, vendor, client or content text from a project note." />
        ) : (
          drafts.map((draft) => (
            <article key={draft.id} className="contractor-draft-card">
              <span>{draft.kind} - {formatShortDate(draft.createdAt)}</span>
              <h3>{draft.title}</h3>
              <p>{draft.body}</p>
              <div className="contractor-card-actions contractor-draft-actions">
                <button type="button" onClick={() => copyDraft(draft)}>
                  <FileText size={15} />
                  {copiedId === draft.id ? 'Copied' : draftManualCopy?.id === draft.id ? 'Copy manually below' : 'Copy text'}
                </button>
              </div>
              {draftManualCopy?.id === draft.id && (
                <label className="contractor-manual-copy">
                  <span>Manual copy fallback</span>
                  <textarea value={draftManualCopy.text} rows={6} readOnly />
                </label>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function ProjectList({ projects, compact = false }: { projects: PartnerProject[]; compact?: boolean }) {
  return (
    <div className={compact ? 'contractor-project-list is-compact' : 'contractor-project-list'}>
      <div className="contractor-list-head">
        <h2>Saved projects</h2>
        <span>{projects.length}</span>
      </div>
      {projects.map((project) => (
        <article key={project.id} className="contractor-project-card">
          <div className="contractor-project-head">
            <span>{project.id}</span>
            <GatePill status={project.paymentGate} />
          </div>
          <h2>{project.title}</h2>
          <p>{project.partner} - {project.role}</p>
          <ProjectSignalStrip project={project} />
          <div className="contractor-mini-row">
            <strong>{project.stage}</strong>
            <small>{formatMoney(project.valueLow)} - {formatMoney(project.valueHigh)}</small>
          </div>
        </article>
      ))}
    </div>
  );
}

function ProjectSignalStrip({ project }: { project: PartnerProject }) {
  return (
    <div className="contractor-signal-strip">
      {getProjectSignals(project).map((signal) => (
        <span key={signal.label} className={`is-${signal.tone}`}>
          <strong>{signal.label}</strong>
          {signal.value}
        </span>
      ))}
    </div>
  );
}

function KpiCard({ label, value, note, tone = 'neutral' }: { label: string; value: string; note: string; tone?: 'neutral' | 'ok' | 'warn' | 'danger' }) {
  return (
    <article className={`contractor-kpi-card is-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function EnvelopeCard({ label, value, icon: Icon }: { label: string; value: number; icon: IconType }) {
  return (
    <article className="contractor-envelope-card">
      <Icon size={18} />
      <span>{label}</span>
      <strong>{formatMoney(value)}</strong>
    </article>
  );
}

function NumberBox({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="contractor-number-box">
      <span>{label}</span>
      <input type="number" value={value} min="0" step="500" onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function GatePill({ status }: { status: PartnerProject['paymentGate'] }) {
  return <em className={`contractor-gate-pill is-${status.toLowerCase()}`}>{status}</em>;
}

function EmptyState({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="contractor-empty-state">
      <ReceiptText size={22} />
      <strong>{title}</strong>
      <p>{copy}</p>
    </div>
  );
}

function ReadinessPanel({
  issues,
  title,
  compact = false,
}: {
  issues: ReadinessIssue[];
  title: string;
  compact?: boolean;
}) {
  const score = getReadinessScore(issues);
  const visibleIssues = compact ? issues.slice(0, 3) : issues;

  return (
    <div className={compact ? 'contractor-readiness-panel is-compact' : 'contractor-readiness-panel'}>
      <div className="contractor-readiness-head">
        <span>
          <ShieldCheck size={16} />
          {title}
        </span>
        <strong>{issues.length ? `${score}%` : 'Clear'}</strong>
      </div>
      {visibleIssues.length === 0 ? (
        <p className="contractor-inline-success">This request has enough detail for a clean first handoff.</p>
      ) : (
        <div className="contractor-readiness-list">
          {visibleIssues.map((issue) => (
            <article key={`${issue.label}-${issue.detail}`} className={`contractor-issue is-${issue.tone}`}>
              {issue.tone === 'danger' ? <AlertTriangle size={15} /> : <FileText size={15} />}
              <span>
                <strong>{issue.label}</strong>
                <small>{issue.detail}</small>
              </span>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function ScreenTitle({
  icon: Icon,
  eyebrow,
  title,
  compact = false,
}: {
  icon: IconType;
  eyebrow: string;
  title: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'contractor-screen-title is-compact' : 'contractor-screen-title'}>
      <span>
        <Icon size={18} />
      </span>
      <div>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  icon: Icon,
  inputMode,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  icon: IconType;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  onChange: (value: string) => void;
}) {
  return (
    <label className="contractor-field">
      <span>{label}</span>
      <div>
        <Icon size={17} />
        <input
          value={value}
          placeholder={placeholder}
          inputMode={inputMode}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </label>
  );
}

function FooterActions({
  onBack,
  onNext,
  nextLabel,
  nextIcon: NextIcon = ArrowRight,
  disabled = false,
  disabledReason,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
  nextIcon?: IconType;
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <div className="contractor-footer-actions">
      <button type="button" className="contractor-back-button" onClick={onBack}>
        <ArrowLeft size={17} />
        Back
      </button>
      <button type="button" className="contractor-main-button" onClick={onNext} disabled={disabled}>
        {nextLabel}
        <NextIcon size={17} />
      </button>
      {disabled && disabledReason && <p className="contractor-footer-warning">{disabledReason}</p>}
    </div>
  );
}
