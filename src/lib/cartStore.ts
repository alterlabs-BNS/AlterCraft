import { useSyncExternalStore } from 'react';
import { formatInrPaise, type Product } from './catalogue';

/**
 * App-wide cart backed by a tiny external store (no Provider needed).
 * Any component calls useCart(); actions are plain functions. Persists to
 * localStorage so the cart survives reloads and is shared across pages.
 * Checkout wiring (Razorpay) comes later; today the drawer hands off to WhatsApp.
 */
export type CartItem = {
  key: string; // productId + variant
  productId: string;
  variantId: string | null;
  sku: string;
  name: string;
  image: string | null;
  options: Record<string, unknown>;
  pricePaise: number;
  quantity: number;
};

const STORAGE_KEY = 'altercraft-cart-v1';
const EMPTY: CartItem[] = [];

let items: CartItem[] = loadInitial();
const listeners = new Set<() => void>();

function loadInitial(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(raw) ? (raw as CartItem[]) : [];
  } catch {
    return [];
  }
}

function commit(next: CartItem[]) {
  items = next;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
  listeners.forEach((listener) => listener());
}

export function addToCart(product: Product, variantId: string | null = null, quantity = 1) {
  const variant = product.variants.find((entry) => entry.id === variantId) ?? null;
  const pricePaise = variant?.pricePaise ?? product.basePricePaise ?? 0;
  const key = `${product.id}:${variantId ?? 'base'}`;
  const existing = items.find((entry) => entry.key === key);

  if (existing) {
    commit(items.map((entry) => (entry.key === key ? { ...entry, quantity: entry.quantity + quantity } : entry)));
    return;
  }

  commit([
    ...items,
    {
      key,
      productId: product.id,
      variantId,
      sku: variant?.sku ?? product.sku,
      name: product.name,
      image: product.images[0]?.url ?? null,
      options: variant?.options ?? {},
      pricePaise,
      quantity,
    },
  ]);
}

export function setQuantity(key: string, quantity: number) {
  commit(
    quantity <= 0
      ? items.filter((entry) => entry.key !== key)
      : items.map((entry) => (entry.key === key ? { ...entry, quantity } : entry)),
  );
}

export function removeFromCart(key: string) {
  commit(items.filter((entry) => entry.key !== key));
}

export function clearCart() {
  commit([]);
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function useCart() {
  const current = useSyncExternalStore(
    subscribe,
    () => items,
    () => EMPTY,
  );
  const count = current.reduce((total, entry) => total + entry.quantity, 0);
  const subtotalPaise = current.reduce((total, entry) => total + entry.pricePaise * entry.quantity, 0);
  return {
    items: current,
    count,
    subtotalPaise,
    subtotalLabel: formatInrPaise(subtotalPaise),
  };
}
