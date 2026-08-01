import { supabase } from './supabase';

/**
 * Durable lead capture.
 *
 * Fixes the June-2026 audit's P0 #2 (leads were localStorage-only). Call this on
 * every quote / enquiry / "Book a Design Visit" submit BEFORE opening WhatsApp,
 * so the business always has a server-side record even if the user never presses
 * Send. Never throws — returns { ok } so the caller can still fall back to
 * WhatsApp on failure.
 *
 * Anyone may INSERT into `leads` (public RLS policy `leads_insert`); only staff
 * can read them back.
 */
export type LeadSource =
  | 'quote_form'
  | 'ai_planner'
  | 'design_visit'
  | 'product_enquiry'
  | 'whatsapp'
  | 'web';

export type LeadInput = {
  source?: LeadSource;
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  serviceInterest?: string;
  message?: string;
  productId?: string;
  categorySlug?: string;
  bookingAmountPaise?: number;
  landingPage?: string;
  utm?: Record<string, string>;
};

/** Pull utm_* params from the current URL, if any. */
export function readUtmFromUrl(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    if (key.startsWith('utm_')) utm[key] = value;
  }
  return utm;
}

export async function createLead(
  input: LeadInput,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!supabase) return { ok: false, error: 'Supabase not configured' };

  const row = {
    source: input.source ?? 'web',
    name: input.name ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    city: input.city ?? null,
    service_interest: input.serviceInterest ?? null,
    message: input.message ?? null,
    product_id: input.productId ?? null,
    category_slug: input.categorySlug ?? null,
    booking_amount_paise: input.bookingAmountPaise ?? null,
    landing_page:
      input.landingPage ?? (typeof window !== 'undefined' ? window.location.pathname : null),
    utm: input.utm ?? readUtmFromUrl(),
  };

  const { data, error } = await supabase.from('leads').insert(row).select('id').single();
  if (error) {
    console.error('[leads] createLead', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true, id: data?.id as string };
}
