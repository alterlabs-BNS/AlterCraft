import { useEffect, useState } from 'react';
import { supabase } from './supabase';

/**
 * Customer accounts on Supabase Auth (separate from the ACOS admin AuthContext).
 * Phone OTP is primary for this market; email+password is the fallback.
 * Everything degrades gracefully to a friendly message until Supabase is configured
 * (and, for phone OTP, until an SMS provider is enabled in the Supabase dashboard).
 */
export type Account = {
  id: string;
  phone: string | null;
  email: string | null;
  fullName: string | null;
};

type Result = { ok: true } | { ok: false; error: string };

const NOT_READY: Result = {
  ok: false,
  error: 'Accounts aren’t connected yet — add your Supabase keys (and an SMS provider for OTP) to switch this on.',
};

/** Normalise an Indian phone number to E.164 (+91XXXXXXXXXX). */
export function toE164India(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  if (raw.trim().startsWith('+')) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return `+${digits}`;
}

function mapUser(user: { id: string; phone?: string | null; email?: string | null; user_metadata?: Record<string, unknown> } | null): Account | null {
  if (!user) return null;
  return {
    id: user.id,
    phone: user.phone ?? null,
    email: user.email ?? null,
    fullName: (user.user_metadata?.full_name as string) ?? null,
  };
}

export async function getAccount(): Promise<Account | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return mapUser(data.user ?? null);
}

export async function sendPhoneOtp(phone: string): Promise<Result> {
  if (!supabase) return NOT_READY;
  const { error } = await supabase.auth.signInWithOtp({ phone: toE164India(phone) });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function verifyPhoneOtp(phone: string, token: string): Promise<Result> {
  if (!supabase) return NOT_READY;
  const { error } = await supabase.auth.verifyOtp({ phone: toE164India(phone), token, type: 'sms' });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function signUpEmail(email: string, password: string, fullName: string): Promise<Result> {
  if (!supabase) return NOT_READY;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function signInEmail(email: string, password: string): Promise<Result> {
  if (!supabase) return NOT_READY;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut();
}

/** React hook: current customer session, live-updated on auth changes. */
export function useAccount() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAccount().then((value) => {
      if (!active) return;
      setAccount(value);
      setLoading(false);
    });
    const listener = supabase?.auth.onAuthStateChange((_event, session) => {
      setAccount(mapUser(session?.user ?? null));
    });
    return () => {
      active = false;
      listener?.data.subscription.unsubscribe();
    };
  }, []);

  return { account, loading, configured: Boolean(supabase) };
}
