import type * as React from "react";
import { useId } from "react";
import { Shield, AlertTriangle } from "lucide-react";
import { ROLE_DETAILS } from "../constants";
import type { OperatorRole } from "../types";

export function Chip({
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

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9px] font-['JetBrains_Mono'] font-medium tracking-[0.18em] uppercase text-white/25 mb-2 px-0.5">
      {children}
    </div>
  );
}

export function Card({
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

export function Field({
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

export function TextArea({
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

export function WarningBanner({ text, variant = "amber" }: { text: string; variant?: "amber" | "red" }) {
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

export function RoleBadge({ role }: { role: OperatorRole }) {
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

export function ScreenHeader({
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

export function PrimaryButton({
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
