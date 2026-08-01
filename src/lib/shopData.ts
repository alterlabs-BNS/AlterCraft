import { isSupabaseConfigured } from './supabase';
import {
  getCategories,
  getProducts,
  getProductBySlug,
  type Category,
  type Product,
} from './catalogue';
import { getLocalProduct, getLocalProducts, localCategories } from './localCatalogue';

/**
 * Unified catalogue access for the storefront.
 * Prefers the live Supabase catalogue; falls back to local data (src/data/beds.ts)
 * whenever Supabase is unconfigured or returns nothing. UI code imports ONLY from
 * here, so switching to live data is automatic once keys + rows exist.
 */
export type { Category, Product, ProductImage, ProductVariant, PurchaseFlow } from './catalogue';
export { formatInrPaise } from './catalogue';

export const catalogueSource = (): 'supabase' | 'local' => (isSupabaseConfigured ? 'supabase' : 'local');

export async function loadCategories(): Promise<Category[]> {
  if (isSupabaseConfigured) {
    const remote = await getCategories();
    if (remote.length) return remote;
  }
  return localCategories;
}

export async function loadProducts(categorySlug?: string): Promise<Product[]> {
  if (isSupabaseConfigured) {
    const remote = await getProducts(categorySlug);
    if (remote.length) return remote;
  }
  return getLocalProducts(categorySlug);
}

export async function loadProductBySlug(
  categorySlug: string,
  productSlug: string,
): Promise<Product | null> {
  if (isSupabaseConfigured) {
    const remote = await getProductBySlug(categorySlug, productSlug);
    if (remote) return remote;
  }
  return getLocalProduct(productSlug);
}

/** Look up a product by slug alone (PDP route uses /shop/p/:slug). */
export async function loadProductAnyCategory(productSlug: string): Promise<Product | null> {
  const all = await loadProducts();
  return all.find((product) => product.slug === productSlug) ?? null;
}
