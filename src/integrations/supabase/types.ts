export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.15" };
  public: {
    Tables: {
      categories: Table<{
        id: string; name: string; slug: string; description: string | null;
        image_url: string | null; sort_order: number; created_at: string; updated_at: string;
      }>;
      products: Table<{
        id: string; name: string; slug: string; description: string | null;
        category_id: string | null; sku: string | null; retail_price: number | null;
        wholesale_price: number | null; stock_quantity: number; is_active: boolean;
        is_featured: boolean; created_at: string; updated_at: string;
        image_url?: string | null; specifications?: Json;
      }>;
      product_images: Table<{
        id: string; product_id: string; image_url: string; alt_text: string | null;
        sort_order: number; created_at: string;
      }>;
      profiles: Table<{
        id: string; full_name: string | null; role: string; created_at: string; updated_at: string;
      }>;
      quote_items: Table<{
        id: string; inquiry_id?: string; quote_request_id: string | null; product_id: string | null;
        product_name: string | null; quantity: number; target_price?: number | null; created_at?: string;
      }>;
      quote_requests: Table<{
        id: string; company_name: string | null; contact_name: string; email: string | null;
        notes: string | null; phone: string; created_at: string;
      }>;
      user_roles: Table<{
        id: string; user_id: string; role: Database["public"]["Enums"]["app_role"]; created_at: string;
      }>;
      inquiries: Table<{
        id: string; customer_name: string; phone: string; email: string | null;
        product_id: string | null; quantity: number | null; message: string | null;
        status: string; created_at: string; updated_at: string;
      }>;
      inventory: Table<{
        id: string; product_id: string; quantity: number; low_stock_threshold: number;
        created_at: string; updated_at: string;
      }>;
      orders: Table<{
        id: string; order_number: string; customer_name: string; phone: string; email: string | null;
        address: string; city: string; subtotal: number; delivery_fee: number; total: number;
        payment_method: "cod"; payment_status: "pending" | "paid" | "failed" | "refunded";
        order_status: "new" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
        customer_note: string | null; created_at: string; updated_at: string;
      }>;
      order_items: Table<{
        id: string; order_id: string; product_id: string; product_name_snapshot: string;
        unit_price: number; quantity: number; line_total: number; created_at: string;
      }>;
    };
    Views: { [_ in never]: never };
    Functions: {
      has_role: { Args: { _role: Database["public"]["Enums"]["app_role"]; _user_id: string }; Returns: boolean };
      is_staff: { Args: { _user_id: string }; Returns: boolean };
      create_cod_order: { Args: { order_input: Json }; Returns: Json };
      set_updated_at: { Args: Record<string, never>; Returns: unknown };
      sync_inventory_from_product: { Args: Record<string, never>; Returns: unknown };
      sync_product_from_inventory: { Args: Record<string, never>; Returns: unknown };
      prevent_order_financial_mutation: { Args: Record<string, never>; Returns: unknown };
    };
    Enums: { app_role: "admin" | "staff" };
    CompositeTypes: { [_ in never]: never };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals["public"];

export type Tables<
  TableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof DatabaseWithoutInternals },
  TableName extends TableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[TableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[TableNameOrOptions["schema"]]["Views"])
    : never = never,
> = TableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[TableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[TableNameOrOptions["schema"]]["Views"])[TableName] extends { Row: infer R } ? R : never
  : TableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][TableNameOrOptions] extends { Row: infer R } ? R : never : never;

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Update"];
export type Enums<T extends keyof DefaultSchema["Enums"]> = DefaultSchema["Enums"][T];
export type CompositeTypes<T extends keyof DefaultSchema["CompositeTypes"]> = DefaultSchema["CompositeTypes"][T];

export const Constants = {
  public: { Enums: { app_role: ["admin", "staff"] } },
} as const;
