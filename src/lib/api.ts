import { supabase } from "@/integrations/supabase/client";
import type {
  Category,
  Inquiry,
  InquiryInput,
  InquiryStatus,
  InventoryRow,
  Product,
  ProductImage,
  Order,
} from "./types";
import { notifyNewInquiry } from "@/services/automation";
import { PRODUCT_IMAGE_BUCKET } from "@/config/site";
import { getSupabaseClientConfig } from "@/integrations/supabase/env";

/* ---------------------------------- data access layer ----------------------
 * All database access lives here so presentation components never talk to the
 * database client directly.
 * ------------------------------------------------------------------------- */

const PRODUCT_SELECT = "*, category:categories(id, name, slug)";

function normalizeProduct(product: Product): Product {
  const stockQuantity = Number(product.stock_quantity) || 0;
  const retailPrice =
    product.retail_price == null || !Number.isFinite(Number(product.retail_price))
      ? null
      : Number(product.retail_price);
  return {
    ...product,
    retail_price: retailPrice,
    wholesale_price:
      product.wholesale_price == null || !Number.isFinite(Number(product.wholesale_price))
        ? null
        : Number(product.wholesale_price),
    stock_quantity: stockQuantity,
    availability: !product.is_active || stockQuantity <= 0
      ? "out_of_stock"
      : stockQuantity <= 10
        ? "low_stock"
        : "in_stock",
  };
}

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
    .order("name", { ascending: true });
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
  if (options?.featuredOnly) query = query.eq("is_featured", true);
  query = query.order("created_at", { ascending: true });
  if (options?.limit) query = query.limit(options.limit);
  const { data, error } = await query;
  if (error) {
    logSupabaseFailure("fetchProducts", error);
    throw error;
  }
  return (data ?? []).map((product) => normalizeProduct(product as unknown as Product));
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
  return data ? normalizeProduct(data as unknown as Product) : null;
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
  return data ? normalizeProduct(data as unknown as Product) : null;
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

const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PRODUCT_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function validateProductImage(file: File) {
  if (!ALLOWED_PRODUCT_IMAGE_TYPES.has(file.type)) {
    throw new Error("Please choose a JPEG, PNG, WebP, or GIF image.");
  }
  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    throw new Error("Each product image must be 5 MB or smaller.");
  }
}

function storagePathForProductImage(productId: string, imageUrl: string) {
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
  if (!imageUrl.startsWith(marker)) return null;
  const path = decodeURIComponent(imageUrl.slice(marker.length));
  return path.startsWith(`products/${productId}/`) ? path : null;
}

export async function uploadProductImage(
  productId: string,
  file: File,
  sortOrder: number,
): Promise<ProductImage> {
  validateProductImage(file);
  const extension = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const path = `products/${productId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data: publicUrl } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      image_url: publicUrl.publicUrl,
      alt_text: file.name,
      sort_order: sortOrder,
    })
    .select("*")
    .single();
  if (error) {
    await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
    throw error;
  }
  return data as unknown as ProductImage;
}

export async function deleteProductImage(image: ProductImage) {
  const path = storagePathForProductImage(image.product_id, image.image_url);
  if (path) {
    const { data: sessionData } = await supabase.auth.getSession();
    const { url, publishableKey } = getSupabaseClientConfig();
    if (!sessionData.session?.access_token || !url || !publishableKey) {
      throw new Error("Your admin session has expired. Sign in again to remove this image.");
    }
    const response = await fetch(`${url}/storage/v1/object/${PRODUCT_IMAGE_BUCKET}/${path}`, {
      method: "DELETE",
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Unable to remove the storage image (${response.status}).`);
    }
  }
  const { error } = await supabase.from("product_images").delete().eq("id", image.id);
  if (error) throw error;
}

export async function reorderProductImages(images: ProductImage[]) {
  const results = await Promise.all(
    images.map((image, index) =>
      supabase.from("product_images").update({ sort_order: index }).eq("id", image.id),
    ),
  );
  const error = results.find((result) => result.error)?.error;
  if (error) throw error;
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

  return (data ?? []).map((product) => normalizeProduct(product as unknown as Product));
}

export async function createCodOrder(input: {
  customer_name: string;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  customer_note?: string | null;
  items: Array<{ product_id: string; quantity: number }>;
}): Promise<Order> {
  const { data, error } = await supabase.rpc("create_cod_order", {
    order_input: input,
  });
  if (error) {
    logSupabaseFailure("createCodOrder", error);
    throw error;
  }
  return data as unknown as Order;
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
  retail_price: number | null;
  wholesale_price: number | null;
  is_active: boolean;
  is_featured: boolean;
  stock_quantity: number;
};

export async function createProduct(draft: ProductDraft) {
  const { data, error } = await supabase.from("products").insert(draft).select("id").single();
  if (error) throw error;
  return data as { id: string };
}

export async function updateProduct(id: string, draft: Partial<ProductDraft>) {
  const { error } = await supabase.from("products").update(draft).eq("id", id);
  if (error) throw error;
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
  sort_order?: number;
}) {
  const { id, sort_order: _sortOrder, ...rest } = input;
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
    .select("*, product:products(id, name, sku, stock_quantity, is_active)")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as InventoryRow[];
}

export async function fetchAdminOrders(): Promise<Order[]> {
  const { data, error } = await supabase.from("orders").select("*, items:order_items(*)").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Order[];
}

export async function updateOrderStatus(id: string, order_status: Order["order_status"]) {
  const { error } = await supabase.from("orders").update({ order_status }).eq("id", id);
  if (error) throw error;
}

export async function updatePaymentStatus(id: string, payment_status: Order["payment_status"]) {
  const { error } = await supabase.from("orders").update({ payment_status }).eq("id", id);
  if (error) throw error;
}

export async function updateInventory(
  id: string,
  productId: string,
  values: { quantity: number; low_stock_threshold: number },
) {
  const { error } = await supabase
    .from("products")
    .update({ stock_quantity: values.quantity })
    .eq("id", productId);
  if (error) throw error;
  const { error: productError } = await supabase
    .from("inventory")
    .update({ quantity: values.quantity, low_stock_threshold: values.low_stock_threshold })
    .eq("id", id);
  if (productError) throw productError;
}

/** Uploads to the private product image store and returns a long-lived signed URL. */
export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
