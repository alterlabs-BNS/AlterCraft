import type * as React from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useNavigate, useParams } from "react-router";
import operatorDeskStyles from "../styles/operator-desk-figma.css?raw";
import {
  LayoutDashboard, UserPlus, Briefcase, Wallet, FileText,
  Shield, AlertTriangle, CheckCircle2, ChevronRight,
  DollarSign, Send, Check, Circle, AlertCircle, Camera,
  Users, ArrowLeft, House, RotateCcw,
} from "lucide-react";

type LeadScreen = "lead" | "lead-contact" | "lead-project" | "lead-requirements" | "lead-review";
type Screen = "dashboard" | LeadScreen | "job" | "payment" | "report" | "dispute" | "team";
type OperatorRole = "l3-founder" | "l2-manager" | "l1-worker";

const SCREEN_PATHS: Record<Screen, string> = {
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

const SCREEN_LABELS: Record<Screen, string> = {
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

const screenFromParam = (param?: string): Screen => {
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

type OperatorUser = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: OperatorRole;
  accessLevel: 1 | 2 | 3;
  status: "active" | "suspended";
  createdAt: string;
};

type OperatorSession = {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  token?: string;
  mode: "server" | "local";
  role: OperatorRole;
  accessLevel: 1 | 2 | 3;
};

const OPERATOR_SESSION_KEY = "altercraft-operator-desk-session";
const OPERATOR_API_BASE_KEY = "altercraft-operator-desk-api-base";
const OPERATOR_LEAD_DRAFT_KEY = "altercraft-operator-desk-lead-draft";
const OPERATOR_LEAD_META_KEY = "altercraft-operator-desk-lead-meta";
const OPERATOR_LEADS_KEY = "altercraft-operator-desk-leads";

type LeadFormState = {
  clientName: string;
  phone: string;
  location: string;
  source: string;
  workType: string;
  budget: string;
  timeline: string;
  materialPreference: string;
  notes: string;
};

type SavedLead = LeadFormState & {
  id: string;
  services: string[];
  status: string;
  labourRequired: string;
  drawingAvailable: string;
  createdAt: string;
};

type LeadMetaState = {
  services: string[];
  leadStatus: string;
  labour: string;
  drawing: string;
};

const DEFAULT_LEAD_META: LeadMetaState = {
  services: ["Full Execution Desk"],
  leadStatus: "Hot Lead",
  labour: "Yes",
  drawing: "No",
};

const EMPTY_LEAD_FORM: LeadFormState = {
  clientName: "",
  phone: "",
  location: "",
  source: "",
  workType: "",
  budget: "",
  timeline: "",
  materialPreference: "",
  notes: "",
};

const readLeadDraft = (): LeadFormState => {
  if (typeof window === "undefined") return EMPTY_LEAD_FORM;
  try {
    const raw = window.localStorage.getItem(OPERATOR_LEAD_DRAFT_KEY);
    return raw ? { ...EMPTY_LEAD_FORM, ...(JSON.parse(raw) as Partial<LeadFormState>) } : EMPTY_LEAD_FORM;
  } catch {
    return EMPTY_LEAD_FORM;
  }
};

const readLeadMeta = (): LeadMetaState => {
  if (typeof window === "undefined") return DEFAULT_LEAD_META;
  try {
    const raw = window.localStorage.getItem(OPERATOR_LEAD_META_KEY);
    return raw ? { ...DEFAULT_LEAD_META, ...(JSON.parse(raw) as Partial<LeadMetaState>) } : DEFAULT_LEAD_META;
  } catch {
    return DEFAULT_LEAD_META;
  }
};

const saveLeadRecord = (lead: SavedLead) => {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(OPERATOR_LEADS_KEY);
    const existing = raw ? (JSON.parse(raw) as SavedLead[]) : [];
    window.localStorage.setItem(OPERATOR_LEADS_KEY, JSON.stringify([lead, ...existing]));
  } catch {
    window.localStorage.setItem(OPERATOR_LEADS_KEY, JSON.stringify([lead]));
  }
};
const ROLE_DETAILS: Record<OperatorRole, { label: string; shortLabel: string; level: 1 | 2 | 3; copy: string }> = {
  "l3-founder": {
    label: "L3 Founder",
    shortLabel: "Founder",
    level: 3,
    copy: "Full control over users, money, jobs and system settings.",
  },
  "l2-manager": {
    label: "L2 Manager",
    shortLabel: "Manager",
    level: 2,
    copy: "Can manage workers and daily execution, but cannot change founder control.",
  },
  "l1-worker": {
    label: "L1 Worker",
    shortLabel: "Worker",
    level: 1,
    copy: "Can update assigned work, reports and proof without admin controls.",
  },
};

const normalizeRole = (role?: string): OperatorRole =>
  role === "l3-founder" || role === "l2-manager" || role === "l1-worker" ? role : "l1-worker";

const accessLevelFor = (role: OperatorRole): 1 | 2 | 3 => ROLE_DETAILS[role].level;

const canManageUsers = (role: OperatorRole) => accessLevelFor(role) >= 2;

const normalizeUser = (user: Partial<OperatorUser> | undefined, fallback: OperatorSession): OperatorUser => {
  const role = normalizeRole(user?.role || fallback.role);
  return {
    id: user?.id || fallback.id || `local-${Date.now()}`,
    name: user?.name || fallback.name,
    phone: user?.phone || fallback.phone,
    email: user?.email || fallback.email,
    role,
    accessLevel: user?.accessLevel || accessLevelFor(role),
    status: user?.status || "active",
    createdAt: user?.createdAt || new Date().toISOString(),
  };
};

const readOperatorSession = (): OperatorSession | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(OPERATOR_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OperatorSession>;
    const role = normalizeRole(parsed.role || "l3-founder");
    return {
      name: parsed.name || "Contractor Operator",
      phone: parsed.phone || "Not provided",
      email: parsed.email,
      token: parsed.token,
      mode: parsed.mode || "local",
      role,
      accessLevel: parsed.accessLevel || accessLevelFor(role),
      id: parsed.id,
    };
  } catch {
    return null;
  }
};

const writeOperatorSession = (session: OperatorSession | null) => {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(OPERATOR_SESSION_KEY);
    return;
  }
  window.localStorage.setItem(OPERATOR_SESSION_KEY, JSON.stringify(session));
};

const operatorApiBase = () => {
  if (typeof window === "undefined") return "http://localhost:8787";
  return window.localStorage.getItem(OPERATOR_API_BASE_KEY) || "http://localhost:8787";
};

const operatorDeskRuntimeStyles = `${operatorDeskStyles}
:host {
  --font-size: 15px;
  --background: #0b0b0d;
  --foreground: #f0f0f2;
  --card: #131315;
  --border: #1f1f23;
  --ring: #e8a93a;
  display: block;
  width: 100%;
  min-height: 100dvh;
  background: #050506;
  color-scheme: dark;
  -webkit-font-smoothing: antialiased;
  text-rendering: geometricPrecision;
  font-synthesis: none;
}

:host *,
:host *::before,
:host *::after {
  -webkit-font-smoothing: antialiased;
  text-rendering: geometricPrecision;
}

:host button,
:host input,
:host textarea {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

:host img {
  image-rendering: auto;
}

:host svg {
  shape-rendering: geometricPrecision;
}

.operator-desk-shadow-root {
  min-height: 100dvh;
  background: #050506;
  overflow: hidden;
}
`;

// ─── Atomic components ────────────────────────────────────────────────────────

function Chip({
  label,
  color,
}: {
  label: string;
  color: "amber" | "red" | "green" | "blue" | "gray";
}) {
  const c = {
    amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    red: "bg-red-500/15 text-red-400 border-red-500/30",
    green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    blue: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    gray: "bg-white/5 text-white/40 border-white/10",
  }[color];
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-medium border tracking-wider uppercase ${c}`}
    >
      {label}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9px] font-['JetBrains_Mono'] font-medium tracking-[0.18em] uppercase text-white/25 mb-2 px-0.5">
      {children}
    </div>
  );
}

function Card({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`bg-[#131315] border border-[#1f1f23] rounded-[5px] ${onClick ? "cursor-pointer hover:border-white/15 transition-colors active:bg-white/5" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  required = false,
  error,
  inputMode,
  autoComplete,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  error?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
}) {
  const fieldId = useId();
  return (
    <div>
      <label htmlFor={fieldId} className="block text-[9px] font-['JetBrains_Mono'] tracking-[0.15em] uppercase text-white/42 mb-1.5">
        {label}{required ? <span className="text-amber-400"> *</span> : null}
      </label>
      <input
        id={fieldId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        required={required}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`w-full min-h-11 bg-[#0f0f12] border rounded px-3 py-2.5 text-[13px] font-['JetBrains_Mono'] text-white/82 placeholder-white/22 focus:outline-none transition-colors ${error ? "border-red-500/60 focus:border-red-400" : "border-[#29292e] focus:border-amber-500/65"}`}
      />
      {error ? (
        <div id={`${fieldId}-error`} className="mt-1 text-[9px] font-['JetBrains_Mono'] text-red-400" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}

function TextArea({
  label,
  placeholder,
  rows = 3,
  danger = false,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  rows?: number;
  danger?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const fieldId = useId();
  return (
    <div>
      <label htmlFor={fieldId} className="block text-[9px] font-['JetBrains_Mono'] tracking-[0.15em] uppercase text-white/42 mb-1.5">
        {label}
      </label>
      <textarea
        id={fieldId}
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className={`w-full bg-[#0f0f12] border rounded px-3 py-2.5 text-[12px] font-['JetBrains_Mono'] text-white/82 placeholder-white/22 focus:outline-none resize-none transition-colors leading-relaxed ${danger ? "border-red-500/25 focus:border-red-500/50" : "border-[#29292e] focus:border-amber-500/65"}`}
      />
    </div>
  );
}

function WarningBanner({ text, variant = "amber" }: { text: string; variant?: "amber" | "red" }) {
  const styles = variant === "red"
    ? "bg-red-500/8 border-red-500/25 text-red-400/90"
    : "bg-amber-500/8 border-amber-500/25 text-amber-400/90";
  const Icon = variant === "red" ? Shield : AlertTriangle;
  return (
    <div className={`flex items-start gap-2.5 border rounded-[5px] px-3 py-2.5 ${styles}`}>
      <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-current" />
      <span className="text-[10px] font-['JetBrains_Mono'] leading-relaxed tracking-wide font-medium">
        {text}
      </span>
    </div>
  );
}

function RoleBadge({ role }: { role: OperatorRole }) {
  const detail = ROLE_DETAILS[role];
  const color =
    role === "l3-founder"
      ? "bg-amber-500/15 text-amber-400 border-amber-500/35"
      : role === "l2-manager"
      ? "bg-blue-500/15 text-blue-400 border-blue-500/35"
      : "bg-white/5 text-white/42 border-white/12";

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-['JetBrains_Mono'] font-medium border tracking-wider uppercase ${color}`}>
      {detail.label}
    </span>
  );
}

function ScreenHeader({
  brand,
  title,
  sub,
}: {
  brand: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="bg-[#0b0b0d] border-b border-[#1a1a1e] px-4 py-3.5 sticky top-0 z-10">
      <div className="text-[9px] font-['JetBrains_Mono'] tracking-[0.22em] uppercase text-amber-400/60 mb-0.5">
        {brand}
      </div>
      <h1 className="text-[18px] font-['Barlow_Condensed'] font-bold tracking-widest text-white leading-none uppercase">
        {title}
      </h1>
      {sub && (
        <div className="text-[9px] font-['JetBrains_Mono'] text-white/25 tracking-widest uppercase mt-0.5">
          {sub}
        </div>
      )}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  danger = false,
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full min-h-12 font-['Barlow_Condensed'] font-bold text-[15px] tracking-[0.12em] uppercase py-3.5 rounded-[5px] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        danger
          ? "bg-red-600 hover:bg-red-500 text-white"
          : "bg-amber-500 hover:bg-amber-400 text-black"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Screen 1: Dashboard ─────────────────────────────────────────────────────

function Dashboard({
  setScreen,
  session,
  onSignOut,
}: {
  setScreen: (s: Screen) => void;
  session: OperatorSession;
  onSignOut: () => void;
}) {
  const [checked, setChecked] = useState<number[]>([0, 2]);

  const toggle = (i: number) =>
    setChecked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));

  const checklist = [
    "Labour attendance updated",
    "Material requirement updated",
    "Photos uploaded",
    "Payment follow-up done",
    "Written confirmation sent",
  ];

  const kpis = [
    { label: "Active Jobs", value: "3", sub: "+1 this week", color: "text-white" },
    { label: "Payment Pending", value: "₹2.1L", sub: "2 invoices due", color: "text-amber-400" },
    { label: "Labour Deployed", value: "14", sub: "Across 2 sites", color: "text-white" },
    { label: "Blocked Sites", value: "1", sub: "Devala — cash hold", color: "text-red-400" },
  ];

  const actions = [
    { label: "New Lead", icon: UserPlus, screen: "lead" as Screen },
    { label: "Create Work Order", icon: Briefcase, screen: "job" as Screen },
    { label: "Add Site Report", icon: FileText, screen: "report" as Screen },
    canManageUsers(session.role)
      ? { label: "Manage Team", icon: Users, screen: "team" as Screen }
      : { label: "Log Payment", icon: DollarSign, screen: "payment" as Screen },
  ];

  const jobs = [
    {
      name: "Empro Motor Office",
      service: "Full Execution Desk",
      stage: "Site Execution",
      gate: "Gate Cleared",
      gateColor: "green" as const,
      next: "QC Inspection — 20 Jun",
      risk: "LOW",
      riskColor: "green" as const,
      value: "₹4,20,000",
    },
    {
      name: "Devala Site",
      service: "Site Control Desk",
      stage: "Material Procurement",
      gate: "Advance Pending",
      gateColor: "red" as const,
      next: "Collect 30% advance — BLOCKED",
      risk: "HIGH",
      riskColor: "red" as const,
      value: "₹1,85,000",
    },
    {
      name: "Current Shop Production",
      service: "Production Desk",
      stage: "Production",
      gate: "50% Received",
      gateColor: "amber" as const,
      next: "Submit milestone invoice",
      risk: "MED",
      riskColor: "amber" as const,
      value: "₹92,500",
    },
  ];

  return (
    <div className="flex flex-col pb-6">
      {/* Header */}
      <div className="bg-[#0b0b0d] border-b border-[#1a1a1e] px-4 py-3.5 sticky top-0 z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="w-10 h-10 rounded-[8px] bg-[#f8f4ee] border border-amber-500/25 p-1.5 shrink-0 shadow-[0_10px_26px_rgba(0,0,0,0.28)]">
              <img src="/altercraft-logo-mark.png" alt="" className="w-full h-full object-contain" />
            </span>
            <div className="min-w-0">
              <div className="text-[9px] font-['JetBrains_Mono'] tracking-[0.22em] uppercase text-amber-400/60 mb-0.5">
                AlterCraft
              </div>
              <h1 className="text-[18px] font-['Barlow_Condensed'] font-bold tracking-widest text-white leading-none uppercase">
                Contractor Desk
              </h1>
              <div className="text-[9px] font-['JetBrains_Mono'] text-white/25 tracking-widest uppercase mt-0.5">
                Powered by AlterLabs
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-['JetBrains_Mono'] text-white/25 uppercase tracking-wider">
              18 Jun 2026
            </div>
            <div className="flex items-center gap-1.5 justify-end mt-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-['JetBrains_Mono'] text-emerald-400 tracking-wider">ACTIVE</span>
            </div>
            <div className="mt-1.5 flex justify-end">
              <RoleBadge role={session.role} />
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="text-[9px] font-['JetBrains_Mono'] text-white/35 tracking-wider uppercase mt-2"
            >
              {session.name || "Operator"} · Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-2">
          {kpis.map((k) => (
            <Card key={k.label} className="p-3">
              <div className="text-[9px] font-['JetBrains_Mono'] tracking-[0.12em] uppercase text-white/30 mb-2">
                {k.label}
              </div>
              <div className={`text-[26px] font-['Barlow_Condensed'] font-bold leading-none ${k.color}`}>
                {k.value}
              </div>
              <div className="text-[10px] font-['JetBrains_Mono'] text-white/25 mt-1.5">{k.sub}</div>
            </Card>
          ))}
        </div>

        {/* Payment Gate Warning */}
        <WarningBanner text="NO WORK STARTS WITHOUT PAYMENT GATE" />

        {/* Quick Actions */}
        <div>
          <SectionLabel>Quick Actions</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {actions.map((a) => (
              <button
                key={a.label}
                onClick={() => setScreen(a.screen)}
                className="flex items-center gap-2.5 bg-[#131315] border border-[#1f1f23] hover:border-amber-500/35 hover:bg-amber-500/5 rounded-[5px] px-3 py-3 transition-colors active:scale-95 text-left"
              >
                <a.icon className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] font-['JetBrains_Mono'] text-white/60 leading-tight">
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Jobs */}
        <div>
          <SectionLabel>Active Jobs — 3 Running</SectionLabel>
          <div className="flex flex-col gap-2">
            {jobs.map((job) => (
              <Card key={job.name} onClick={() => setScreen("job")} className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-[14px] font-['Barlow_Condensed'] font-bold text-white tracking-wider leading-none">
                      {job.name.toUpperCase()}
                    </div>
                    <div className="text-[10px] font-['JetBrains_Mono'] text-white/30 mt-1">
                      {job.service}
                    </div>
                  </div>
                  <span className="text-[12px] font-['JetBrains_Mono'] font-medium text-white/45 ml-2 shrink-0">
                    {job.value}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  <Chip label={job.stage} color="blue" />
                  <Chip label={job.gate} color={job.gateColor} />
                  <Chip label={`RISK ${job.risk}`} color={job.riskColor} />
                </div>
                <div className="flex items-center gap-1.5 border-t border-[#1a1a1e] pt-2">
                  <ChevronRight className="w-3 h-3 text-amber-400/70 shrink-0" />
                  <span className="text-[10px] font-['JetBrains_Mono'] text-amber-400/70 leading-tight">
                    {job.next}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Dispute Alert */}
        <button
          onClick={() => setScreen("dispute")}
          className="flex items-center gap-3 bg-red-500/8 border border-red-500/25 hover:border-red-500/45 rounded-[5px] px-3 py-2.5 transition-colors w-full text-left"
        >
          <Shield className="w-4 h-4 text-red-400 shrink-0" />
          <div className="flex-1">
            <div className="text-[10px] font-['JetBrains_Mono'] font-medium text-red-400 tracking-wider">
              ACTIVE DISPUTE — Devala Site
            </div>
            <div className="text-[10px] font-['JetBrains_Mono'] text-white/30 mt-0.5">
              ₹68,000 at risk · Open dispute file →
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-red-400/50" />
        </button>

        {/* Daily Checklist */}
        <div>
          <SectionLabel>
            Daily Checklist — {checked.length}/{checklist.length} Done
          </SectionLabel>
          <Card>
            {checklist.map((item, i) => (
              <button
                key={item}
                onClick={() => toggle(i)}
                className="flex items-center gap-3 w-full px-3 py-2.5 border-b border-[#191919] last:border-0 hover:bg-white/2 transition-colors text-left"
              >
                <div
                  className={`w-3.5 h-3.5 rounded-sm border shrink-0 flex items-center justify-center transition-colors ${
                    checked.includes(i)
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-white/20"
                  }`}
                >
                  {checked.includes(i) && (
                    <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />
                  )}
                </div>
                <span
                  className={`text-[11px] font-['JetBrains_Mono'] flex-1 ${
                    checked.includes(i)
                      ? "text-white/25 line-through"
                      : "text-white/60"
                  }`}
                >
                  {item}
                </span>
                {checked.includes(i) ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-white/12 shrink-0" />
                )}
              </button>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 2: New Contractor Lead ───────────────────────────────────────────

function NewLead({ step, setScreen }: { step: LeadScreen; setScreen: (screen: Screen) => void }) {
  const [initialMeta] = useState<LeadMetaState>(() => readLeadMeta());
  const [services, setServices] = useState<string[]>(initialMeta.services);
  const [leadStatus, setLeadStatus] = useState(initialMeta.leadStatus);
  const [labour, setLabour] = useState(initialMeta.labour);
  const [drawing, setDrawing] = useState(initialMeta.drawing);
  const [form, setForm] = useState<LeadFormState>(() => readLeadDraft());
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormState | "services", string>>>({});
  const [saveMessage, setSaveMessage] = useState("");

  const allServices = ["Material Desk", "Labour Desk", "Production Desk", "Site Control Desk", "Full Execution Desk"];
  const statuses = ["Hot Lead", "Warm", "Cold", "Follow-Up", "Converted"];
  const requiredFields: Array<keyof LeadFormState> = ["clientName", "phone", "location", "workType"];
  const completedRequired = requiredFields.filter((field) => form[field].trim()).length;
  const leadSteps: Array<{ id: LeadScreen; label: string; title: string }> = [
    { id: "lead", label: "Service", title: "Choose Service" },
    { id: "lead-contact", label: "Contact", title: "Client & Site" },
    { id: "lead-project", label: "Project", title: "Project Scope" },
    { id: "lead-requirements", label: "Needs", title: "Requirements" },
    { id: "lead-review", label: "Review", title: "Review & Save" },
  ];
  const stepIndex = Math.max(0, leadSteps.findIndex((item) => item.id === step));

  useEffect(() => {
    const hasDraft = Object.values(form).some((value) => value.trim());
    if (hasDraft) window.localStorage.setItem(OPERATOR_LEAD_DRAFT_KEY, JSON.stringify(form));
    else window.localStorage.removeItem(OPERATOR_LEAD_DRAFT_KEY);
  }, [form]);

  useEffect(() => {
    window.localStorage.setItem(OPERATOR_LEAD_META_KEY, JSON.stringify({ services, leadStatus, labour, drawing }));
  }, [drawing, labour, leadStatus, services]);

  const updateField = (field: keyof LeadFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSaveMessage("");
  };

  const toggleService = (service: string) => {
    setServices((current) => current.includes(service) ? current.filter((item) => item !== service) : [...current, service]);
    setErrors((current) => ({ ...current, services: undefined }));
  };

  const continueToNextStep = () => {
    const nextErrors: Partial<Record<keyof LeadFormState | "services", string>> = {};
    if (step === "lead" && !services.length) nextErrors.services = "Select at least one service desk.";
    if (step === "lead-contact") {
      if (!form.clientName.trim()) nextErrors.clientName = "Add the client or contractor name.";
      if (form.phone.replace(/\D/g, "").length < 10) nextErrors.phone = "Enter a valid 10-digit phone number.";
      if (!form.location.trim()) nextErrors.location = "Add the site location.";
    }
    if (step === "lead-project" && !form.workType.trim()) nextErrors.workType = "Describe the work type.";

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setSaveMessage("Complete the highlighted details to continue.");
      return;
    }

    setErrors({});
    setSaveMessage("");
    const nextStep = leadSteps[stepIndex + 1];
    if (nextStep) setScreen(nextStep.id);
  };

  const clearDraft = () => {
    setForm(EMPTY_LEAD_FORM);
    setServices(["Full Execution Desk"]);
    setLeadStatus("Hot Lead");
    setLabour("Yes");
    setDrawing("No");
    setErrors({});
    setSaveMessage("");
    window.localStorage.removeItem(OPERATOR_LEAD_DRAFT_KEY);
    window.localStorage.removeItem(OPERATOR_LEAD_META_KEY);
    setScreen("lead");
  };

  const submitLead = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof LeadFormState | "services", string>> = {};
    if (!form.clientName.trim()) nextErrors.clientName = "Add the client or contractor name.";
    if (form.phone.replace(/\D/g, "").length < 10) nextErrors.phone = "Enter a valid 10-digit phone number.";
    if (!form.location.trim()) nextErrors.location = "Add the site location.";
    if (!form.workType.trim()) nextErrors.workType = "Describe the work type.";
    if (!services.length) nextErrors.services = "Select at least one service desk.";

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setSaveMessage("Check the highlighted fields before saving this lead.");
      return;
    }

    const lead: SavedLead = {
      ...form,
      id: `OD-LEAD-${Date.now().toString().slice(-6)}`,
      services,
      status: leadStatus,
      labourRequired: labour,
      drawingAvailable: drawing,
      createdAt: new Date().toISOString(),
    };
    saveLeadRecord(lead);
    window.localStorage.removeItem(OPERATOR_LEAD_DRAFT_KEY);
    window.localStorage.removeItem(OPERATOR_LEAD_META_KEY);
    setForm(EMPTY_LEAD_FORM);
    setServices(DEFAULT_LEAD_META.services);
    setLeadStatus(DEFAULT_LEAD_META.leadStatus);
    setLabour(DEFAULT_LEAD_META.labour);
    setDrawing(DEFAULT_LEAD_META.drawing);
    setErrors({});
    setSaveMessage(`${lead.id} saved on this device.`);
  };

  return (
    <form className="flex flex-col pb-8" onSubmit={submitLead} noValidate>
      <ScreenHeader brand={`AlterCraft · New Lead · Step ${stepIndex + 1} of ${leadSteps.length}`} title={leadSteps[stepIndex].title} />

      <div className="px-4 pt-4 flex flex-col gap-5">
        <Card className="p-3 bg-[#101012]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-['JetBrains_Mono'] text-white/65">Required details</div>
              <div className="text-[9px] font-['JetBrains_Mono'] text-white/32 mt-1">
                {completedRequired}/4 complete · Draft saved
              </div>
            </div>
            <button type="button" onClick={clearDraft} className="min-h-10 px-3 border border-[#29292e] rounded flex items-center gap-1.5 text-[9px] font-['JetBrains_Mono'] uppercase tracking-wider text-white/45" aria-label="Clear saved lead draft">
              <RotateCcw className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-amber-400 transition-all" style={{ width: `${((stepIndex + 1) / leadSteps.length) * 100}%` }} />
          </div>
          <div className="grid grid-cols-5 gap-1 mt-2">
            {leadSteps.map((item, index) => (
              <div key={item.id} className={`text-center text-[7px] font-['JetBrains_Mono'] uppercase tracking-wide ${index <= stepIndex ? "text-amber-400" : "text-white/20"}`}>
                {item.label}
              </div>
            ))}
          </div>
        </Card>

        {saveMessage ? (
          <div className={`border rounded-[5px] px-3 py-3 ${Object.keys(errors).length ? "bg-red-500/8 border-red-500/25 text-red-300" : "bg-emerald-500/8 border-emerald-500/25 text-emerald-300"}`} role="status">
            <div className="flex items-center gap-2 text-[10px] font-['JetBrains_Mono']">
              {Object.keys(errors).length ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{saveMessage}</span>
            </div>
            {!Object.keys(errors).length ? (
              <button type="button" onClick={() => setScreen("dashboard")} className="mt-2 text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider text-emerald-200 underline underline-offset-4">
                Return to dashboard
              </button>
            ) : null}
          </div>
        ) : null}

        {step === "lead" ? (
          <>
            <div>
              <SectionLabel>Select Service Desk</SectionLabel>
              {errors.services ? <div className="mb-2 text-[9px] font-['JetBrains_Mono'] text-red-400">{errors.services}</div> : null}
              <div className="flex flex-col gap-1.5">
                {allServices.map((service) => {
                  const active = services.includes(service);
                  return (
                    <button type="button" key={service} onClick={() => toggleService(service)} className={`flex items-center gap-3 min-h-11 px-3 py-2.5 rounded-[5px] border text-left transition-colors ${active ? "bg-amber-500/10 border-amber-500/40" : "bg-[#131315] border-[#29292e] hover:border-white/20"}`}>
                      <div className={`w-4 h-4 rounded-sm border shrink-0 flex items-center justify-center ${active ? "bg-amber-400 border-amber-400" : "border-white/25"}`}>
                        {active ? <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} /> : null}
                      </div>
                      <span className={`text-[12px] font-['JetBrains_Mono'] ${active ? "text-amber-400" : "text-white/55"}`}>{service}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <SectionLabel>Lead Status</SectionLabel>
              <div className="flex gap-1.5 flex-wrap">
                {statuses.map((status) => (
                  <button type="button" key={status} onClick={() => setLeadStatus(status)} className={`min-h-10 px-3 rounded text-[10px] font-['JetBrains_Mono'] font-medium border tracking-wider uppercase ${leadStatus === status ? "bg-amber-500/15 border-amber-500/40 text-amber-400" : "bg-[#131315] border-[#29292e] text-white/40"}`}>
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {step === "lead-contact" ? (
          <div>
            <SectionLabel>Contact & Site Info</SectionLabel>
            <div className="flex flex-col gap-3">
              <Field label="Contractor / Client Name" placeholder="e.g. Rajan Mehta" value={form.clientName} onChange={(value) => updateField("clientName", value)} required error={errors.clientName} autoComplete="name" />
              <Field label="Phone Number" placeholder="10-digit mobile number" type="tel" value={form.phone} onChange={(value) => updateField("phone", value)} required error={errors.phone} inputMode="tel" autoComplete="tel" />
              <Field label="Site Location" placeholder="Locality, city or site address" value={form.location} onChange={(value) => updateField("location", value)} required error={errors.location} autoComplete="street-address" />
              <Field label="Lead Source" placeholder="WhatsApp / Referral / Walk-in" value={form.source} onChange={(value) => updateField("source", value)} />
            </div>
          </div>
        ) : null}

        {step === "lead-project" ? (
          <div>
            <SectionLabel>Project Details</SectionLabel>
            <div className="flex flex-col gap-3">
              <Field label="Work Type" placeholder="Flooring / False Ceiling / Full Interior" value={form.workType} onChange={(value) => updateField("workType", value)} required error={errors.workType} />
              <Field label="Approximate Budget" placeholder="INR 0,00,000" value={form.budget} onChange={(value) => updateField("budget", value)} inputMode="numeric" />
              <Field label="Timeline" placeholder="Start month and expected duration" value={form.timeline} onChange={(value) => updateField("timeline", value)} />
              <Field label="Material Preference" placeholder="Premium / Mid-range / Client source" value={form.materialPreference} onChange={(value) => updateField("materialPreference", value)} />
            </div>
          </div>
        ) : null}

        {step === "lead-requirements" ? (
          <>
            <div>
              <SectionLabel>Labour & Documentation</SectionLabel>
              <div className="flex flex-col gap-4">
                {[
                  { label: "Labour Required", options: ["Yes", "No", "TBD"], value: labour, setValue: setLabour },
                  { label: "Drawing / Measurement Available", options: ["Yes", "No", "Partial"], value: drawing, setValue: setDrawing },
                ].map((group) => (
                  <div key={group.label}>
                    <div className="text-[9px] font-['JetBrains_Mono'] tracking-[0.15em] uppercase text-white/42 mb-1.5">{group.label}</div>
                    <div className="flex gap-2">
                      {group.options.map((option) => (
                        <button type="button" key={option} onClick={() => group.setValue(option)} className={`flex-1 min-h-11 rounded-[5px] border text-[11px] font-['JetBrains_Mono'] ${group.value === option ? "bg-amber-500/12 border-amber-500/40 text-amber-400" : "bg-[#131315] border-[#29292e] text-white/40"}`}>
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <TextArea label="Notes" placeholder="Client expectations, sourcing notes, site access details..." rows={5} value={form.notes} onChange={(value) => updateField("notes", value)} />
          </>
        ) : null}

        {step === "lead-review" ? (
          saveMessage && !Object.keys(errors).length ? (
            <PrimaryButton onClick={clearDraft}>Start Another Lead</PrimaryButton>
          ) : (
            <>
              <div>
                <SectionLabel>Service</SectionLabel>
                <Card className="p-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[12px] font-['JetBrains_Mono'] text-white/75">{services.join(", ")}</div>
                    <div className="text-[9px] font-['JetBrains_Mono'] text-amber-400 mt-1 uppercase">{leadStatus}</div>
                  </div>
                  <button type="button" onClick={() => setScreen("lead")} className="text-[9px] font-['JetBrains_Mono'] text-white/40 uppercase">Edit</button>
                </Card>
              </div>
              {[
                { label: "Client & Site", edit: "lead-contact" as LeadScreen, rows: [["Client", form.clientName], ["Phone", form.phone], ["Location", form.location], ["Source", form.source]] },
                { label: "Project", edit: "lead-project" as LeadScreen, rows: [["Work", form.workType], ["Budget", form.budget], ["Timeline", form.timeline], ["Material", form.materialPreference]] },
                { label: "Requirements", edit: "lead-requirements" as LeadScreen, rows: [["Labour", labour], ["Drawing", drawing], ["Notes", form.notes]] },
              ].map((section) => (
                <div key={section.label}>
                  <div className="flex items-center justify-between mb-2 px-0.5">
                    <SectionLabel>{section.label}</SectionLabel>
                    <button type="button" onClick={() => setScreen(section.edit)} className="text-[9px] font-['JetBrains_Mono'] text-white/40 uppercase">Edit</button>
                  </div>
                  <Card className="divide-y divide-[#202025]">
                    {section.rows.map(([label, value]) => (
                      <div key={label} className="flex items-start justify-between gap-4 px-3 py-2.5">
                        <span className="text-[9px] font-['JetBrains_Mono'] uppercase tracking-wider text-white/30">{label}</span>
                        <span className="text-[11px] font-['JetBrains_Mono'] text-white/70 text-right break-words max-w-[68%]">{value || "Not provided"}</span>
                      </div>
                    ))}
                  </Card>
                </div>
              ))}
              <WarningBanner text="Review the phone number and site location before saving. The record will be available on this device." />
              <PrimaryButton type="submit">Save Lead</PrimaryButton>
            </>
          )
        ) : (
          <PrimaryButton onClick={continueToNextStep}>Continue to {leadSteps[stepIndex + 1]?.label || "Review"}</PrimaryButton>
        )}
      </div>
    </form>
  );
}

// ─── Screen 3: Job / Site Detail ─────────────────────────────────────────────

function JobDetail({ setScreen }: { setScreen: (s: Screen) => void }) {
  const stages = [
    "Lead", "BOQ", "Quotation", "Advance", "Work Order",
    "Material", "Production", "Site Execution", "QC", "Handover",
    "Final Payment", "Closed",
  ];
  const current = 7;

  const meta = [
    { label: "Client", value: "Empro Industries Pvt Ltd" },
    { label: "Service Type", value: "Full Execution Desk" },
    { label: "Job Owner", value: "Arjun Verma — Site Lead" },
    { label: "Deadline", value: "30 Jun 2026" },
    { label: "Blocker", value: "None" },
    { label: "Written Confirmation", value: "Signed · 10 Jun 2026", accent: "green" },
    { label: "Photos / Proof", value: "12 uploaded · Day 8", accent: "green" },
    { label: "Next Action", value: "QC Inspection — 20 Jun 2026", accent: "amber" },
  ];

  return (
    <div className="flex flex-col pb-8">
      <div className="bg-[#0b0b0d] border-b border-[#1a1a1e] px-4 py-3.5 sticky top-0 z-10">
        <div className="text-[9px] font-['JetBrains_Mono'] tracking-[0.22em] uppercase text-amber-400/60 mb-0.5">
          AlterCraft · Job Detail
        </div>
        <h1 className="text-[18px] font-['Barlow_Condensed'] font-bold tracking-widest text-white leading-none uppercase">
          Empro Motor Office
        </h1>
        <div className="flex gap-1.5 mt-2">
          <Chip label="Site Execution" color="amber" />
          <Chip label="Full Execution Desk" color="blue" />
          <Chip label="Risk: Low" color="green" />
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Financial summary */}
        <div>
          <SectionLabel>Financial Summary</SectionLabel>
          <Card className="p-3">
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[
                { label: "Total Value", value: "₹4,20,000", color: "text-white" },
                { label: "Advance Rcvd", value: "₹1,26,000", color: "text-emerald-400" },
                { label: "Pending", value: "₹2,94,000", color: "text-amber-400" },
              ].map((f) => (
                <div key={f.label}>
                  <div className="text-[9px] font-['JetBrains_Mono'] text-white/25 uppercase tracking-wider mb-1">
                    {f.label}
                  </div>
                  <div className={`text-[15px] font-['Barlow_Condensed'] font-bold ${f.color}`}>
                    {f.value}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#1f1f23] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "30%" }} />
              </div>
              <span className="text-[9px] font-['JetBrains_Mono'] text-white/30 whitespace-nowrap">
                30% RECEIVED
              </span>
            </div>
          </Card>
        </div>

        {/* Payment Gate */}
        <div className="flex items-center gap-2.5 bg-emerald-500/8 border border-emerald-500/25 rounded-[5px] px-3 py-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] font-['JetBrains_Mono'] font-medium text-emerald-400 tracking-wider">
              PAYMENT GATE CLEARED
            </div>
            <div className="text-[9px] font-['JetBrains_Mono'] text-emerald-400/50 mt-0.5">
              Work authorized — all deployments active
            </div>
          </div>
        </div>

        {/* Meta table */}
        <div>
          <SectionLabel>Job Details</SectionLabel>
          <Card>
            {meta.map((row) => (
              <div
                key={row.label}
                className="flex items-start justify-between px-3 py-2.5 border-b border-[#191919] last:border-0"
              >
                <span className="text-[10px] font-['JetBrains_Mono'] text-white/30">
                  {row.label}
                </span>
                <span
                  className={`text-[11px] font-['JetBrains_Mono'] font-medium text-right ml-3 ${
                    row.accent === "green"
                      ? "text-emerald-400"
                      : row.accent === "amber"
                      ? "text-amber-400"
                      : "text-white/65"
                  }`}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </Card>
        </div>

        {/* Timeline */}
        <div>
          <SectionLabel>Project Timeline</SectionLabel>
          <Card className="p-3">
            <div className="flex flex-wrap gap-x-0 gap-y-1.5">
              {stages.map((stage, i) => (
                <div key={stage} className="flex items-center">
                  <span
                    className={`text-[10px] font-['JetBrains_Mono'] px-1.5 py-0.5 rounded transition-colors ${
                      i < current
                        ? "text-white/20 line-through"
                        : i === current
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 font-medium"
                        : "text-white/20"
                    }`}
                  >
                    {stage}
                  </span>
                  {i < stages.length - 1 && (
                    <span className="text-white/12 text-[10px] px-0.5">›</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setScreen("report")}
            className="flex-1 bg-[#131315] border border-[#1f1f23] hover:border-white/20 text-white/70 font-['Barlow_Condensed'] font-semibold text-[13px] tracking-wide uppercase py-3.5 rounded-[5px] transition-colors"
          >
            Add Site Report
          </button>
          <button
            onClick={() => setScreen("payment")}
            className="flex-1 bg-amber-500/12 border border-amber-500/35 hover:bg-amber-500/20 text-amber-400 font-['Barlow_Condensed'] font-semibold text-[13px] tracking-wide uppercase py-3.5 rounded-[5px] transition-colors"
          >
            Log Payment
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 4: Payment Gate + Cash Allocation ────────────────────────────────

function PaymentGate() {
  const buckets = [
    { label: "Material", pct: 35, amount: "₹73,500", color: "bg-blue-500" },
    { label: "Labour", pct: 20, amount: "₹42,000", color: "bg-amber-500" },
    { label: "Transport", pct: 5, amount: "₹10,500", color: "bg-purple-500" },
    { label: "Tools", pct: 5, amount: "₹10,500", color: "bg-cyan-500" },
    { label: "Rent", pct: 8, amount: "₹16,800", color: "bg-orange-500" },
    { label: "EMI", pct: 7, amount: "₹14,700", color: "bg-pink-500" },
    { label: "Personal Survival", pct: 5, amount: "₹10,500", color: "bg-red-500" },
    { label: "Business Reserve", pct: 8, amount: "₹16,800", color: "bg-emerald-500" },
    { label: "Profit", pct: 5, amount: "₹10,500", color: "bg-green-400" },
    { label: "Debt Repayment", pct: 2, amount: "₹4,200", color: "bg-slate-400" },
  ];

  const gateRules = [
    {
      desk: "Material Desk",
      rule: "100% material cost + sourcing fee — collected before procurement",
      chip: "100% UPFRONT" as const,
    },
    {
      desk: "Labour Desk",
      rule: "1–3 days labour advance per deployment cycle",
      chip: "ROLLING ADV" as const,
    },
    {
      desk: "Production Desk",
      rule: "50% + 30% + 15% + 5% milestone gates",
      chip: "4 MILESTONES" as const,
    },
    {
      desk: "Site Control Desk",
      rule: "Weekly or monthly advance per signed agreement",
      chip: "PERIODIC" as const,
    },
    {
      desk: "Full Execution Desk",
      rule: "Custom milestone payment schedule per BOQ",
      chip: "CUSTOM" as const,
    },
  ];

  return (
    <div className="flex flex-col pb-8">
      <ScreenHeader brand="AlterCraft · Cash" title="Payment Gate + Cash" />

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Incoming cash card */}
        <Card className="p-4">
          <div className="text-[9px] font-['JetBrains_Mono'] text-white/25 uppercase tracking-widest mb-2 text-center">
            Incoming Cash — Devala Site Advance
          </div>
          <div className="text-[32px] font-['Barlow_Condensed'] font-bold text-white text-center leading-none">
            ₹2,10,000
          </div>
          <div className="text-[10px] font-['JetBrains_Mono'] text-amber-400/60 mt-1.5 text-center">
            Received · 18 Jun 2026 · Assignment pending
          </div>
        </Card>

        <WarningBanner text="INCOMING CASH IS OXYGEN, NOT FREEDOM. ASSIGN IT BEFORE SPENDING." />

        {/* Cash Allocation */}
        <div>
          <SectionLabel>Cash Allocation Buckets</SectionLabel>
          <Card className="p-3">
            {/* Stacked bar */}
            <div className="flex h-2 rounded-full overflow-hidden mb-3.5">
              {buckets.map((b) => (
                <div
                  key={b.label}
                  className={`${b.color} opacity-85`}
                  style={{ width: `${b.pct}%` }}
                />
              ))}
            </div>
            <div className="flex flex-col divide-y divide-[#191919]">
              {buckets.map((b) => (
                <div key={b.label} className="flex items-center gap-2.5 py-2">
                  <div className={`w-2 h-2 rounded-full ${b.color} shrink-0`} />
                  <span className="text-[11px] font-['JetBrains_Mono'] text-white/55 flex-1">
                    {b.label}
                  </span>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-white/25 w-7 text-right">
                    {b.pct}%
                  </span>
                  <span className="text-[11px] font-['JetBrains_Mono'] font-medium text-white/70 w-16 text-right">
                    {b.amount}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Gate Rules */}
        <div>
          <SectionLabel>Payment Gate Rules by Desk</SectionLabel>
          <div className="flex flex-col gap-2">
            {gateRules.map((r) => (
              <Card key={r.desk} className="px-3 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-[12px] font-['Barlow_Condensed'] font-bold text-amber-400 tracking-widest uppercase">
                    {r.desk}
                  </div>
                  <Chip label={r.chip} color="gray" />
                </div>
                <div className="text-[11px] font-['JetBrains_Mono'] text-white/45 leading-relaxed">
                  {r.rule}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <PrimaryButton>
          <DollarSign className="w-4 h-4" />
          Log Payment
        </PrimaryButton>
      </div>
    </div>
  );
}

// ─── Screen 5: Daily Site Report ─────────────────────────────────────────────

function SiteReport({ setScreen }: { setScreen: (s: Screen) => void }) {
  const [photosTaken, setPhotosTaken] = useState(true);
  const [updateSent, setUpdateSent] = useState(false);

  return (
    <div className="flex flex-col pb-8">
      <div className="bg-[#0b0b0d] border-b border-[#1a1a1e] px-4 py-3.5 sticky top-0 z-10">
        <div className="text-[9px] font-['JetBrains_Mono'] tracking-[0.22em] uppercase text-amber-400/60 mb-0.5">
          AlterCraft · Reports
        </div>
        <h1 className="text-[18px] font-['Barlow_Condensed'] font-bold tracking-widest text-white leading-none uppercase">
          Daily Site Report
        </h1>
        <button
          onClick={() => setScreen("dispute")}
          className="mt-2 text-[10px] font-['JetBrains_Mono'] text-red-400/70 hover:text-red-400 transition-colors flex items-center gap-1"
        >
          <Shield className="w-3 h-3" />
          Open Dispute Protection File →
        </button>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Metadata */}
        <div>
          <SectionLabel>Report Metadata</SectionLabel>
          <div className="flex flex-col gap-3">
            <Field label="Site Name" placeholder="Empro Motor Office" />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Date" placeholder="18 Jun 2026" />
              <Field label="Labour Present" placeholder="8 of 14" />
            </div>
          </div>
        </div>

        {/* Work Summary */}
        <div>
          <SectionLabel>Work Summary</SectionLabel>
          <div className="flex flex-col gap-3">
            <TextArea
              label="Work Completed Today"
              placeholder="False ceiling grid complete — Bay A & B. Flooring tiles laid — 60% west wing."
              rows={3}
            />
            <TextArea
              label="Pending Work"
              placeholder="East wing flooring, electrical first fix — est. 2 days remaining"
              rows={2}
            />
          </div>
        </div>

        {/* Material */}
        <div>
          <SectionLabel>Material Status</SectionLabel>
          <div className="flex flex-col gap-3">
            <Field label="Material Used Today" placeholder="120 tiles 600×600, 8 bags cement" />
            <Field label="Material Required Tomorrow" placeholder="60 tiles, conduit 25mm × 50m" />
          </div>
        </div>

        {/* Issues */}
        <TextArea
          label="Issues / Blockers"
          placeholder="Log site issues, delays, material shortage, labour absences, client instructions..."
          rows={2}
          danger
        />

        {/* Proof & Communication */}
        <div>
          <SectionLabel>Proof & Communication</SectionLabel>
          <Card>
            {[
              {
                label: "Photos Taken",
                sub: photosTaken ? "12 photos ready to upload" : "Required before submit",
                value: photosTaken,
                set: setPhotosTaken,
                icon: Camera,
              },
              {
                label: "Update Sent to Client",
                sub: updateSent ? "WhatsApp sent · 6:15 PM" : "No verbal — written only",
                value: updateSent,
                set: setUpdateSent,
                icon: Send,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 px-3 py-3 border-b border-[#191919] last:border-0"
              >
                <button
                  onClick={() => item.set(!item.value)}
                  className="relative shrink-0 transition-colors"
                  style={{ width: 40, height: 22 }}
                >
                  <div
                    className={`absolute inset-0 rounded-full border transition-colors ${
                      item.value
                        ? "bg-emerald-500 border-emerald-500"
                        : "bg-transparent border-white/20"
                    }`}
                  />
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                      item.value ? "left-5 bg-white" : "left-0.5 bg-white/30"
                    }`}
                  />
                </button>
                <item.icon className="w-3.5 h-3.5 text-white/25 shrink-0" />
                <div className="flex-1">
                  <div className="text-[11px] font-['JetBrains_Mono'] text-white/65">
                    {item.label}
                  </div>
                  <div className="text-[10px] font-['JetBrains_Mono'] text-white/25 mt-0.5">
                    {item.sub}
                  </div>
                </div>
                {item.value ? (
                  <Chip label="Done" color="green" />
                ) : (
                  <Chip label="Pending" color="red" />
                )}
              </div>
            ))}
          </Card>
        </div>

        <Field
          label="Next Action"
          placeholder="Electrical supervisor on-site — 7 AM sharp"
        />

        <PrimaryButton>
          <Send className="w-4 h-4" />
          Submit Site Report
        </PrimaryButton>
      </div>
    </div>
  );
}

// ─── Screen 6: Dispute Protection File ───────────────────────────────────────

function DisputeProtection() {
  const evidence = [
    { item: "Signed Work Order", secured: true },
    { item: "Payment Invoice #14", secured: true },
    { item: "WhatsApp Chat Export (148 msgs)", secured: true },
    { item: "Site Photos — Day 1–12", secured: true },
    { item: "Bank Transfer Proof", secured: true },
    { item: "Written Confirmation Email", secured: false },
    { item: "Witness Statement", secured: false },
  ];

  const secured = evidence.filter((e) => e.secured).length;

  const disputeMeta = [
    { label: "Dispute Name", value: "Devala Site — Payment Default" },
    { label: "Related Job", value: "Devala Warehouse Project" },
    { label: "Party Involved", value: "Devala Constructions Pvt Ltd" },
    { label: "Amount at Risk", value: "₹68,000", accent: "red" },
    { label: "Current Status", value: "Negotiation Stage", accent: "amber" },
    { label: "Settlement Offered", value: "₹50,000 partial — pending", accent: "amber" },
    { label: "Deadline", value: "25 Jun 2026", accent: "red" },
  ];

  return (
    <div className="flex flex-col pb-8">
      <div className="bg-[#0b0b0d] border-b border-[#1a1a1e] px-4 py-3.5 sticky top-0 z-10">
        <div className="text-[9px] font-['JetBrains_Mono'] tracking-[0.22em] uppercase text-red-400/60 mb-0.5">
          AlterCraft · Legal
        </div>
        <h1 className="text-[18px] font-['Barlow_Condensed'] font-bold tracking-widest text-white leading-none uppercase">
          Dispute Protection File
        </h1>
        <div className="flex gap-1.5 mt-2">
          <Chip label="Active Dispute" color="red" />
          <Chip label="Negotiation" color="amber" />
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Doctrine */}
        <div className="flex items-start gap-2.5 bg-red-500/8 border border-red-500/25 rounded-[5px] px-3 py-3">
          <Shield className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-[9px] font-['JetBrains_Mono'] text-red-400/50 uppercase tracking-widest mb-1">
              Doctrine
            </div>
            <div className="text-[11px] font-['JetBrains_Mono'] text-red-300/85 leading-relaxed font-medium">
              NO EMOTIONAL FIGHT. EVIDENCE FIRST. SETTLEMENT FIRST. LAWFUL ESCALATION ONLY.
            </div>
          </div>
        </div>

        {/* Dispute Details */}
        <div>
          <SectionLabel>Dispute Details</SectionLabel>
          <Card>
            {disputeMeta.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-3 py-2.5 border-b border-[#191919] last:border-0"
              >
                <span className="text-[10px] font-['JetBrains_Mono'] text-white/28">
                  {row.label}
                </span>
                <span
                  className={`text-[11px] font-['JetBrains_Mono'] font-medium text-right ml-3 ${
                    row.accent === "red"
                      ? "text-red-400"
                      : row.accent === "amber"
                      ? "text-amber-400"
                      : "text-white/65"
                  }`}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </Card>
        </div>

        {/* Evidence Tracker */}
        <div>
          <SectionLabel>
            Evidence Tracker — {secured}/{evidence.length} Secured
          </SectionLabel>
          <div className="mb-2">
            <div className="h-1 bg-[#1f1f23] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${(secured / evidence.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {evidence.map((ev) => (
              <div
                key={ev.item}
                className="flex items-center gap-2.5 px-3 py-2.5 bg-[#131315] border border-[#1f1f23] rounded-[5px]"
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center ${
                    ev.secured ? "bg-emerald-500 border-emerald-500" : "border-white/20"
                  }`}
                >
                  {ev.secured && (
                    <Check className="w-2 h-2 text-black" strokeWidth={3} />
                  )}
                </div>
                <span
                  className={`text-[11px] font-['JetBrains_Mono'] flex-1 ${
                    ev.secured ? "text-white/65" : "text-white/28"
                  }`}
                >
                  {ev.item}
                </span>
                {ev.secured ? (
                  <Chip label="Secured" color="green" />
                ) : (
                  <Chip label="Missing" color="red" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Escalation */}
        <div>
          <SectionLabel>Next Lawful Action</SectionLabel>
          <Card className="p-3 border-red-500/18 bg-red-500/5">
            <div className="text-[9px] font-['JetBrains_Mono'] text-red-400/50 uppercase tracking-widest mb-1">
              Escalation Path
            </div>
            <div className="text-[12px] font-['JetBrains_Mono'] text-red-300 leading-relaxed">
              Send legal notice via advocate — 25 Jun 2026 if settlement not reached
            </div>
            <div className="text-[10px] font-['JetBrains_Mono'] text-white/28 mt-1.5">
              Consumer Forum filing ready as fallback. No verbal threats.
            </div>
          </Card>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 bg-[#131315] border border-[#1f1f23] hover:border-white/20 text-white/65 font-['Barlow_Condensed'] font-semibold text-[13px] tracking-widest uppercase py-3.5 rounded-[5px] transition-colors">
            Add Evidence
          </button>
          <button className="flex-1 bg-red-600/12 border border-red-500/30 hover:bg-red-600/22 text-red-400 font-['Barlow_Condensed'] font-semibold text-[13px] tracking-widest uppercase py-3.5 rounded-[5px] transition-colors">
            Escalate
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Bottom Navigation ────────────────────────────────────────────────────────

function TeamManagement({ session }: { session: OperatorSession }) {
  const [users, setUsers] = useState<OperatorUser[]>([]);
  const [message, setMessage] = useState("Loading team access...");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "l1-worker" as OperatorRole,
  });

  const canManage = session.mode === "server" && canManageUsers(session.role) && Boolean(session.token);
  const roleOptions: OperatorRole[] = session.role === "l3-founder"
    ? ["l2-manager", "l1-worker"]
    : ["l1-worker"];

  const authHeaders = () => ({
    "content-type": "application/json",
    authorization: `Bearer ${session.token || ""}`,
  });

  const loadUsers = async () => {
    if (!canManage) {
      setMessage(
        session.mode === "local"
          ? "Team management needs the OperatorDesk server. This device is currently in offline mode."
          : "Your access level cannot manage team accounts."
      );
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`${operatorApiBase()}/api/operator-desk/users`, {
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error("Could not load team users.");
      const data = (await response.json()) as { users?: Partial<OperatorUser>[] };
      setUsers((data.users || []).map((user) => normalizeUser(user, session)));
      setMessage("Team access loaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load team users.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [canManage, session.token, session.role, session.mode]);

  const createUser = async () => {
    if (!canManage) return;
    const cleanEmail = form.email.trim().toLowerCase();
    if (!form.name.trim() || !cleanEmail) {
      setMessage("Name and email are required to create an operator.");
      return;
    }

    setBusy(true);
    setMessage("Creating operator access...");
    try {
      const response = await fetch(`${operatorApiBase()}/api/operator-desk/users`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: cleanEmail,
          password: form.password || "OperatorDesk#2026",
          role: form.role,
        }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(error.error || "Could not create operator.");
      }

      setForm({ name: "", phone: "", email: "", password: "", role: roleOptions[0] || "l1-worker" });
      setMessage("Operator access created.");
      await loadUsers();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create operator.");
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (user: OperatorUser) => {
    if (!canManage || user.id === session.id) return;
    const nextStatus = user.status === "active" ? "suspended" : "active";
    setBusy(true);
    try {
      const response = await fetch(`${operatorApiBase()}/api/operator-desk/users/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(error.error || "Could not update operator.");
      }

      setUsers((current) => current.map((item) => (item.id === user.id ? { ...item, status: nextStatus } : item)));
      setMessage(`Operator ${nextStatus === "active" ? "activated" : "suspended"}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update operator.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col pb-6">
      <ScreenHeader brand="AlterCraft Access" title="Team Control" sub={ROLE_DETAILS[session.role].label} />

      <div className="px-4 pt-4 flex flex-col gap-4">
        <WarningBanner
          text="L3 Founder has full control. L2 Manager can create and manage workers. L1 Worker cannot access account controls."
        />

        <div>
          <SectionLabel>Create Operator</SectionLabel>
          <Card className="p-3">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Name"
                className="bg-[#0f0f12] border border-[#1f1f23] rounded px-3 py-2.5 text-[12px] font-['JetBrains_Mono'] text-white/75 placeholder-white/18 focus:outline-none focus:border-amber-500/50"
              />
              <input
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                placeholder="Phone"
                className="bg-[#0f0f12] border border-[#1f1f23] rounded px-3 py-2.5 text-[12px] font-['JetBrains_Mono'] text-white/75 placeholder-white/18 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <input
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="Email"
              className="w-full mb-2 bg-[#0f0f12] border border-[#1f1f23] rounded px-3 py-2.5 text-[12px] font-['JetBrains_Mono'] text-white/75 placeholder-white/18 focus:outline-none focus:border-amber-500/50"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Temp password"
                type="password"
                className="bg-[#0f0f12] border border-[#1f1f23] rounded px-3 py-2.5 text-[12px] font-['JetBrains_Mono'] text-white/75 placeholder-white/18 focus:outline-none focus:border-amber-500/50"
              />
              <select
                value={form.role}
                onChange={(event) => setForm((current) => ({ ...current, role: normalizeRole(event.target.value) }))}
                className="bg-[#0f0f12] border border-[#1f1f23] rounded px-3 py-2.5 text-[12px] font-['JetBrains_Mono'] text-white/75 focus:outline-none focus:border-amber-500/50"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>{ROLE_DETAILS[role].label}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={!canManage || busy}
              onClick={createUser}
              className="mt-3 w-full bg-amber-500 text-black font-['Barlow_Condensed'] font-bold text-[13px] tracking-widest uppercase py-3 rounded-[5px] disabled:opacity-50"
            >
              Create Access
            </button>
          </Card>
        </div>

        <div>
          <SectionLabel>Current Team</SectionLabel>
          <div className="flex flex-col gap-2">
            {users.map((user) => (
              <Card key={user.id} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[14px] font-['Barlow_Condensed'] font-bold text-white tracking-wider leading-none uppercase">
                      {user.name}
                    </div>
                    <div className="text-[10px] font-['JetBrains_Mono'] text-white/30 mt-1 break-all">
                      {user.email || user.phone || "No contact saved"}
                    </div>
                  </div>
                  <RoleBadge role={user.role} />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-[#1a1a1e] pt-2">
                  <span className={`text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider ${user.status === "active" ? "text-emerald-400" : "text-red-400"}`}>
                    {user.status}
                  </span>
                  <button
                    type="button"
                    disabled={busy || user.id === session.id}
                    onClick={() => toggleStatus(user)}
                    className="text-[10px] font-['JetBrains_Mono'] text-white/45 uppercase tracking-wider disabled:opacity-30"
                  >
                    {user.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </div>
              </Card>
            ))}
            {!users.length ? (
              <Card className="p-3">
                <div className="text-[11px] font-['JetBrains_Mono'] text-white/38 leading-relaxed">
                  {message}
                </div>
              </Card>
            ) : null}
          </div>
        </div>

        <div className="text-[9px] font-['JetBrains_Mono'] text-white/28 leading-relaxed">
          {message}
        </div>
      </div>
    </div>
  );
}

function AppNavigationBar({
  screen,
  onBack,
  onHome,
}: {
  screen: Screen;
  onBack: () => void;
  onHome: () => void;
}) {
  const isHome = screen === "dashboard";
  return (
    <div className="h-14 shrink-0 bg-[#09090b] border-b border-[#202025] flex items-center px-2 gap-2">
      <button
        type="button"
        onClick={onBack}
        disabled={isHome}
        className="w-11 h-11 rounded-[5px] border border-[#29292e] flex items-center justify-center text-white/65 disabled:text-white/15 disabled:border-white/5 active:bg-white/5"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="min-w-0 flex-1 px-1">
        <div className="text-[8px] font-['JetBrains_Mono'] uppercase tracking-[0.2em] text-amber-400/60">Operator Desk</div>
        <div className="text-[14px] font-['Barlow_Condensed'] font-bold tracking-widest uppercase text-white truncate">{SCREEN_LABELS[screen]}</div>
      </div>
      <button
        type="button"
        onClick={onHome}
        className={`min-w-11 h-11 px-3 rounded-[5px] border flex items-center justify-center gap-1.5 ${isHome ? "border-amber-500/35 bg-amber-500/10 text-amber-400" : "border-[#29292e] text-white/65 active:bg-white/5"}`}
        aria-label="Go to dashboard"
        aria-current={isHome ? "page" : undefined}
      >
        <House className="w-4 h-4" />
        <span className="text-[9px] font-['JetBrains_Mono'] uppercase tracking-wider">Home</span>
      </button>
    </div>
  );
}

function BottomNav({
  screen,
  setScreen,
  session,
}: {
  screen: Screen;
  setScreen: (s: Screen) => void;
  session: OperatorSession;
}) {
  const tabs = [
    { id: "dashboard" as Screen, label: "Dashboard", icon: LayoutDashboard },
    { id: "lead" as Screen, label: "Leads", icon: UserPlus },
    { id: "job" as Screen, label: "Jobs", icon: Briefcase },
    { id: "payment" as Screen, label: "Cash", icon: Wallet },
    canManageUsers(session.role)
      ? { id: "team" as Screen, label: "Team", icon: Users }
      : { id: "report" as Screen, label: "Reports", icon: FileText },
  ];

  const active: Screen = screen.startsWith("lead-")
    ? "lead"
    : tabs.some((tab) => tab.id === screen)
      ? screen
      : "report";

  return (
    <div className="border-t border-[#1a1a1e] bg-[#090909] flex shrink-0">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            type="button"
            key={tab.id}
            onClick={() => setScreen(tab.id)}
            aria-current={isActive ? "page" : undefined}
            className={`flex-1 min-h-14 flex flex-col items-center justify-center gap-1 py-2 transition-colors active:scale-95 ${
              isActive ? "text-amber-400" : "text-white/22 hover:text-white/40"
            }`}
          >
            <tab.icon
              className="w-4 h-4"
              strokeWidth={isActive ? 2.5 : 1.5}
            />
            <span className="text-[9px] font-['JetBrains_Mono'] uppercase tracking-widest leading-none">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

function LoginGate({ onSignedIn }: { onSignedIn: (session: OperatorSession) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Sign in to start a private OperatorDesk session on this device.");
  const [busy, setBusy] = useState(false);

  const signIn = async (mode: "signup" | "login") => {
    const cleanName = name.trim() || "Contractor Operator";
    const cleanPhone = phone.trim() || "Not provided";
    const cleanEmail = email.trim().toLowerCase();

    setBusy(true);
    setStatus("Checking OperatorDesk access...");

    try {
      const response = await fetch(`${operatorApiBase()}/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail || `${cleanPhone.replace(/\D/g, "") || "operator"}@local.contractor`,
          password: password || "OperatorDesk#2026",
        }),
      });

      if (!response.ok) {
        throw new Error("OperatorDesk access check failed");
      }

      const data = (await response.json()) as { token?: string; user?: Partial<OperatorUser> };
      const serverUser = normalizeUser(data.user, {
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        mode: "server",
        role: "l1-worker",
        accessLevel: 1,
      });
      const nextSession: OperatorSession = {
        id: serverUser.id,
        name: serverUser.name,
        phone: serverUser.phone,
        email: serverUser.email,
        token: data.token,
        mode: "server",
        role: serverUser.role,
        accessLevel: serverUser.accessLevel,
      };
      writeOperatorSession(nextSession);
      onSignedIn(nextSession);
      return;
    } catch {
      const nextSession: OperatorSession = {
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        mode: "local",
        role: "l3-founder",
        accessLevel: 3,
      };
      writeOperatorSession(nextSession);
      setStatus("Cloud sync is unavailable right now, so this device will continue in private offline mode.");
      onSignedIn(nextSession);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050506]">
      <div className="relative overflow-hidden border-b border-[#1a1a1e]" style={{ flex: "0 0 60%" }}>
        <div className="absolute inset-0 bg-amber-500/8" />
        <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-amber-500/15" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-blue-500/10" />
        <div className="relative z-10 h-full flex flex-col justify-between p-5">
          <div className="flex items-start gap-3">
            <span className="w-12 h-12 rounded-[9px] bg-[#f8f4ee] border border-amber-500/25 p-1.5 shrink-0 shadow-[0_14px_34px_rgba(0,0,0,0.35)]">
              <img src="/altercraft-logo-mark.png" alt="" className="w-full h-full object-contain" />
            </span>
            <div>
              <div className="text-[9px] font-['JetBrains_Mono'] tracking-[0.22em] uppercase text-amber-400/70 mb-1">
                Contractor Desk
              </div>
              <h1 className="text-[32px] font-['Barlow_Condensed'] font-bold tracking-widest text-white leading-none uppercase">
                Operator Access
              </h1>
              <div className="text-[10px] font-['JetBrains_Mono'] text-white/35 tracking-widest uppercase mt-1">
                Powered by AlterLabs
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              ["Payment Gate", "Blocks risky work"],
              ["Proof Vault", "Photos and scope"],
              ["Cash Desk", "Bucket discipline"],
              ["Site Reports", "Daily control"],
            ].map(([title, copy]) => (
              <Card key={title} className="p-3 bg-[#111113]/80">
                <div className="text-[10px] font-['Barlow_Condensed'] font-bold tracking-widest text-white uppercase">
                  {title}
                </div>
                <div className="text-[9px] font-['JetBrains_Mono'] text-white/28 mt-1">
                  {copy}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-3 justify-center">
        <div>
          <div className="text-[9px] font-['JetBrains_Mono'] tracking-[0.18em] uppercase text-white/35 mb-2">
            Signup / Login
          </div>
          <div className="text-[9px] font-['JetBrains_Mono'] text-white/25 leading-relaxed mb-2">
            The first server account becomes L3 Founder. Managers and workers should be created from Team Control.
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name"
              className="bg-[#0f0f12] border border-[#1f1f23] rounded px-3 py-2.5 text-[12px] font-['JetBrains_Mono'] text-white/75 placeholder-white/18 focus:outline-none focus:border-amber-500/50"
            />
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Phone"
              className="bg-[#0f0f12] border border-[#1f1f23] rounded px-3 py-2.5 text-[12px] font-['JetBrains_Mono'] text-white/75 placeholder-white/18 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email, optional"
            className="w-full mt-2 bg-[#0f0f12] border border-[#1f1f23] rounded px-3 py-2.5 text-[12px] font-['JetBrains_Mono'] text-white/75 placeholder-white/18 focus:outline-none focus:border-amber-500/50"
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password, if assigned"
            type="password"
            className="w-full mt-2 bg-[#0f0f12] border border-[#1f1f23] rounded px-3 py-2.5 text-[12px] font-['JetBrains_Mono'] text-white/75 placeholder-white/18 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => signIn("signup")}
            className="bg-amber-500 text-black font-['Barlow_Condensed'] font-bold text-[13px] tracking-widest uppercase py-3 rounded-[5px] disabled:opacity-60"
          >
            Create
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => signIn("login")}
            className="bg-[#131315] border border-[#1f1f23] text-white/70 font-['Barlow_Condensed'] font-bold text-[13px] tracking-widest uppercase py-3 rounded-[5px] disabled:opacity-60"
          >
            Login
          </button>
        </div>
        <div className="text-[9px] font-['JetBrains_Mono'] text-white/28 leading-relaxed">
          {status}
        </div>
      </div>
    </div>
  );
}

function ContractorDeskMobileApp({
  routeScreen,
  onRouteChange,
}: {
  routeScreen: Screen;
  onRouteChange: (screen: Screen, replace?: boolean) => void;
}) {
  const [screen, setScreen] = useState<Screen>(routeScreen);
  const [trail, setTrail] = useState<Screen[]>(routeScreen === "dashboard" ? ["dashboard"] : ["dashboard", routeScreen]);
  const [session, setSession] = useState<OperatorSession | null>(() => readOperatorSession());
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setScreen(routeScreen);
    setTrail((current) => {
      const existingIndex = current.lastIndexOf(routeScreen);
      if (existingIndex >= 0) return current.slice(0, existingIndex + 1);
      return routeScreen === "dashboard" ? ["dashboard"] : [...current, routeScreen];
    });
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [routeScreen]);

  const navigateTo = (nextScreen: Screen, replace = false) => {
    if (nextScreen === screen) {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      return;
    }
    setScreen(nextScreen);
    setTrail((current) => nextScreen === "dashboard" ? ["dashboard"] : [...current.filter((item, index) => item !== nextScreen || index === 0), nextScreen]);
    onRouteChange(nextScreen, replace);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const goBack = () => {
    if (trail.length <= 1) {
      navigateTo("dashboard", true);
      return;
    }
    const previous = trail[trail.length - 2];
    setTrail((current) => current.slice(0, -1));
    setScreen(previous);
    onRouteChange(previous, true);
  };

  const signOut = () => {
    writeOperatorSession(null);
    setSession(null);
    setScreen("dashboard");
    setTrail(["dashboard"]);
    onRouteChange("dashboard", true);
  };

  const renderScreen = () => {
    switch (screen) {
      case "dashboard":
        return session ? <Dashboard setScreen={navigateTo} session={session} onSignOut={signOut} /> : null;
      case "lead":
      case "lead-contact":
      case "lead-project":
      case "lead-requirements":
      case "lead-review":
        return <NewLead step={screen} setScreen={navigateTo} />;
      case "job":
        return <JobDetail setScreen={navigateTo} />;
      case "payment":
        return <PaymentGate />;
      case "report":
        return <SiteReport setScreen={navigateTo} />;
      case "dispute":
        return <DisputeProtection />;
      case "team":
        return session ? <TeamManagement session={session} /> : null;
    }
  };

  return (
    <div
      className="min-h-screen bg-[#050506] flex flex-col overflow-hidden"
      style={{
        minHeight: "100svh",
        paddingTop: "env(safe-area-inset-top)",
        paddingRight: "env(safe-area-inset-right)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
      }}
    >
      {session ? <AppNavigationBar screen={screen} onBack={goBack} onHome={() => navigateTo("dashboard")} /> : null}

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain" style={{ scrollbarWidth: "none" }}>
        {session ? renderScreen() : <LoginGate onSignedIn={(nextSession) => {
          setSession(nextSession);
          navigateTo("dashboard", true);
        }} />}
      </div>

      {session ? <BottomNav screen={screen} setScreen={navigateTo} session={session} /> : null}
    </div>
  );
}

export default function OperatorDesk() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<Root | null>(null);
  const navigate = useNavigate();
  const params = useParams<{ screen?: string }>();
  const routeScreen = screenFromParam(params.screen);
  const navigateScreen = useCallback((nextScreen: Screen, replace = false) => {
    navigate(`/operator-desk/${SCREEN_PATHS[nextScreen]}`, { replace });
  }, [navigate]);

  useEffect(() => {
    document.body.classList.add("operator-desk-active");

    const host = hostRef.current;
    if (!host) {
      return () => document.body.classList.remove("operator-desk-active");
    }

    const shadowRoot = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = "";

    const style = document.createElement("style");
    style.textContent = operatorDeskRuntimeStyles;

    const mount = document.createElement("div");
    mount.className = "operator-desk-shadow-root";
    shadowRoot.append(style, mount);

    const root = createRoot(mount);
    rootRef.current = root;

    return () => {
      document.body.classList.remove("operator-desk-active");
      root.unmount();
      rootRef.current = null;
      shadowRoot.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    rootRef.current?.render(<ContractorDeskMobileApp routeScreen={routeScreen} onRouteChange={navigateScreen} />);
  }, [navigateScreen, routeScreen]);

  return <div ref={hostRef} />;
}
