import { supabase } from "@/integrations/supabase/client";
import type {
  Category,
  Inquiry,
  InquiryInput,
  InquiryStatus,
  InventoryRow,
  Product,
  ProductImage,
} from "./types";
import { notifyNewInquiry } from "@/services/automation";
import { PRODUCT_IMAGE_BUCKET } from "@/config/site";

/* ---------------------------------- data access layer ----------------------
 * All database access lives here so presentation components never talk to the
 * database client directly.
 * ------------------------------------------------------------------------- */

const PRODUCT_SELECT = "*, category:categories(id, name, slug)";

function logSupabaseFailure(operation: string, error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message?: string }).message)
        : "Unknown error";

  console.error(`[Power Bazar API] ${operation} failed: ${message}`);
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    logSupabaseFailure("fetchCategories", error);
    throw error;
  }
  return (data ?? []) as unknown as Category[];
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    logSupabaseFailure("fetchCategoryBySlug", error);
    throw error;
  }
  return (data as unknown as Category) ?? null;
}

export async function fetchProducts(options?: {
  categoryId?: string;
  featuredOnly?: boolean;
  limit?: number;
}): Promise<Product[]> {
  let query = supabase.from("products").select(PRODUCT_SELECT);
  if (options?.categoryId) query = query.eq("category_id", options.categoryId);
  if (options?.featuredOnly) query = query.eq("featured", true);
  query = query.order("created_at", { ascending: true });
  if (options?.limit) query = query.limit(options.limit);
  const { data, error } = await query;
  if (error) {
    logSupabaseFailure("fetchProducts", error);
    throw error;
  }
  return (data ?? []) as unknown as Product[];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    logSupabaseFailure("fetchProductBySlug", error);
    throw error;
  }
  return (data as unknown as Product) ?? null;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    logSupabaseFailure("fetchProductById", error);
    throw error;
  }
  return (data as unknown as Product) ?? null;
}

export async function fetchProductImages(productId: string): Promise<ProductImage[]> {
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  if (error) {
    logSupabaseFailure("fetchProductImages", error);
    throw error;
  }
  return (data ?? []) as unknown as ProductImage[];
}

export async function fetchRelatedProducts(
  product: Pick<Product, "id" | "category_id">,
): Promise<Product[]> {
  if (!product.category_id) return [];
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(4);
  if (error) {
    logSupabaseFailure("fetchRelatedProducts", error);
    throw error;
  }
  return (data ?? []) as unknown as Product[];
}

/* ------------------------------- inquiries ------------------------------- */

export async function createInquiry(input: InquiryInput): Promise<Inquiry> {
  const { items, ...rest } = input;
  const { data, error } = await supabase
    .from("inquiries")
    .insert({
      customer_name: rest.customer_name,
      phone: rest.phone,
      email: rest.email ?? null,
      product_id: rest.product_id ?? null,
      quantity: rest.quantity ?? null,
      message: rest.message ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  const inquiry = data as unknown as Inquiry;

  if (items && items.length > 0) {
    const { error: itemsError } = await supabase.from("quote_items").insert(
      items.map((item) => ({
        inquiry_id: inquiry.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
      })),
    );
    if (itemsError) throw itemsError;
  }

  // Integration point for future n8n / WhatsApp automation (no-op today).
  void notifyNewInquiry(inquiry);
  return inquiry;
}

export async function fetchInquiries(status?: InquiryStatus | "all"): Promise<Inquiry[]> {
  let query = supabase
    .from("inquiries")
    .select("*, product:products(id, name, slug)")
    .order("created_at", { ascending: false });
  if (status && status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Inquiry[];
}

export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
  if (error) throw error;
}

/* ------------------------------- admin writes ---------------------------- */

export type ProductDraft = {
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  sku: string | null;
  price: number | null;
  price_available: boolean;
  availability: string;
  stock_quantity: number;
  specifications: Record<string, string>;
  image_url: string | null;
  featured: boolean;
};

export async function createProduct(draft: ProductDraft) {
  const { data, error } = await supabase.from("products").insert(draft).select("id").single();
  if (error) throw error;
  await supabase
    .from("inventory")
    .upsert(
      { product_id: (data as { id: string }).id, quantity: draft.stock_quantity },
      { onConflict: "product_id" },
    );
  return data as { id: string };
}

export async function updateProduct(id: string, draft: Partial<ProductDraft>) {
  const { error } = await supabase.from("products").update(draft).eq("id", id);
  if (error) throw error;
  if (typeof draft.stock_quantity === "number") {
    await supabase
      .from("inventory")
      .upsert({ product_id: id, quantity: draft.stock_quantity }, { onConflict: "product_id" });
  }
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function upsertCategory(input: {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
}) {
  const { id, ...rest } = input;
  if (id) {
    const { error } = await supabase.from("categories").update(rest).eq("id", id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("categories").insert(rest);
  if (error) throw error;
}

export async function deleteCategory(id: string) {
  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  if (countError) throw countError;
  if ((count ?? 0) > 0) {
    throw new Error(
      `This category still has ${count} product(s). Move or delete those products first.`,
    );
  }
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchInventory(): Promise<InventoryRow[]> {
  const { data, error } = await supabase
    .from("inventory")
    .select("*, product:products(id, name, sku, availability)")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as InventoryRow[];
}

export async function updateInventory(
  id: string,
  productId: string,
  values: { quantity: number; low_stock_threshold: number },
) {
  const { error } = await supabase.from("inventory").update(values).eq("id", id);
  if (error) throw error;
  const availability =
    values.quantity <= 0
      ? "out_of_stock"
      : values.quantity <= values.low_stock_threshold
        ? "low_stock"
        : "in_stock";
  const { error: productError } = await supabase
    .from("products")
    .update({ stock_quantity: values.quantity, availability })
    .eq("id", productId);
  if (productError) throw productError;
}

/** Uploads to the private product image store and returns a long-lived signed URL. */
export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data, error: signError } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
  if (signError || !data) throw signError ?? new Error("Could not create image URL");
  return data.signedUrl;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
