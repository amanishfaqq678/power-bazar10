export type Availability = "in_stock" | "low_stock" | "out_of_stock";
export type InquiryStatus = "new" | "contacted" | "quoted" | "closed";
export type AppRole = "admin" | "staff";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  sku: string | null;
  price: number | null;
  price_available: boolean;
  availability: Availability;
  stock_quantity: number;
  specifications: Record<string, string>;
  image_url: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
  category?: Pick<Category, "id" | "name" | "slug"> | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
}

export interface InventoryRow {
  id: string;
  product_id: string;
  quantity: number;
  low_stock_threshold: number;
  updated_at: string;
  product?: Pick<Product, "id" | "name" | "sku" | "availability"> | null;
}

export interface Inquiry {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  product_id: string | null;
  quantity: number | null;
  message: string | null;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
  product?: Pick<Product, "id" | "name" | "slug"> | null;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  created_at: string;
}

export interface QuoteItem {
  productId: string;
  productName: string;
  slug: string;
  quantity: number;
  imageUrl: string | null;
  categorySlug: string | null;
}

export interface InquiryInput {
  customer_name: string;
  phone: string;
  email?: string | null;
  product_id?: string | null;
  quantity?: number | null;
  message?: string | null;
  items?: QuoteItem[];
}
