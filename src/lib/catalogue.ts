import { supabase } from './supabase';

/**
 * Typed read-access layer for the Supabase catalogue.
 * Tiles, PDPs, cart and search should all read through these helpers so there is
 * one source of truth (the DB). Every function degrades to empty/null when
 * Supabase is not yet configured, so the UI can render a safe fallback.
 */

export type PurchaseFlow = 'cart' | 'quoted';

export type Category = {
  id: string;
  slug: string;
  name: string;
  flow: PurchaseFlow;
  anchorPricePaise: number | null;
  sortOrder: number;
};

export type ProductImage = {
  url: string;
  alt: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

export type ProductVariant = {
  id: string;
  sku: string;
  label: string;
  options: Record<string, unknown>;
  pricePaise: number;
  inStock: boolean;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  basePricePaise: number | null;
  /** Effective flow: product override if set, else the category's flow. */
  flow: PurchaseFlow;
  highlights: string[];
  specs: Record<string, unknown>;
  images: ProductImage[];
  variants: ProductVariant[];
  categorySlug?: string;
};

/** Format paise as an Indian-rupee string, e.g. 1500000 -> "₹15,000". */
export const formatInrPaise = (paise: number | null | undefined): string =>
  paise == null ? '' : `₹${(Math.round(paise) / 100).toLocaleString('en-IN')}`;

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  flow: PurchaseFlow;
  anchor_price_paise: number | null;
  sort_order: number;
};

const mapCategory = (row: CategoryRow): Category => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  flow: row.flow,
  anchorPricePaise: row.anchor_price_paise,
  sortOrder: row.sort_order,
});

const PRODUCT_SELECT =
  'id, sku, name, slug, subtitle, description, base_price_paise, flow, highlights, specs, ' +
  'category:categories(slug, flow), ' +
  'images:product_images(url, alt, is_primary, sort_order), ' +
  'variants:product_variants(id, sku, label, options, price_paise, in_stock, sort_order)';

/* eslint-disable @typescript-eslint/no-explicit-any */
const mapProduct = (row: any): Product => ({
  id: row.id,
  sku: row.sku,
  name: row.name,
  slug: row.slug,
  subtitle: row.subtitle ?? null,
  description: row.description ?? null,
  basePricePaise: row.base_price_paise ?? null,
  flow: (row.flow as PurchaseFlow | null) ?? (row.category?.flow as PurchaseFlow) ?? 'cart',
  categorySlug: row.category?.slug ?? undefined,
  highlights: Array.isArray(row.highlights) ? row.highlights : [],
  specs: row.specs ?? {},
  images: (row.images ?? [])
    .map((img: any) => ({
      url: img.url,
      alt: img.alt ?? null,
      isPrimary: Boolean(img.is_primary),
      sortOrder: img.sort_order ?? 0,
    }))
    .sort((a: ProductImage, b: ProductImage) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder),
  variants: (row.variants ?? [])
    .map((va: any) => ({
      id: va.id,
      sku: va.sku,
      label: va.label,
      options: va.options ?? {},
      pricePaise: va.price_paise,
      inStock: Boolean(va.in_stock),
    }))
    .sort((a: ProductVariant, b: ProductVariant) => a.pricePaise - b.pricePaise),
});
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function getCategories(): Promise<Category[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name, flow, anchor_price_paise, sort_order')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('[catalogue] getCategories', error.message);
    return [];
  }
  return (data as CategoryRow[]).map(mapCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name, flow, anchor_price_paise, sort_order')
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return null;
  return mapCategory(data as CategoryRow);
}

/** Published products, optionally filtered to one category slug. */
export async function getProducts(categorySlug?: string): Promise<Product[]> {
  if (!supabase) return [];
  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('status', 'published')
    .order('sort_order', { ascending: true });
  if (categorySlug) {
    const category = await getCategoryBySlug(categorySlug);
    if (!category) return [];
    query = query.eq('category_id', category.id);
  }
  const { data, error } = await query;
  if (error) {
    console.error('[catalogue] getProducts', error.message);
    return [];
  }
  return (data ?? []).map(mapProduct);
}

export async function getProductBySlug(categorySlug: string, productSlug: string): Promise<Product | null> {
  if (!supabase) return null;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return null;
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('category_id', category.id)
    .eq('slug', productSlug)
    .eq('status', 'published')
    .maybeSingle();
  if (error || !data) return null;
  return mapProduct(data);
}
