import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "./types";

export type AdminUser = {
  id: string;
  email: string | null;
  role: AppRole;
  fullName: string | null;
};

export async function getAdminUser(): Promise<AdminUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) return null;

  return { id: user.id, email: user.email ?? null, role: profile.role, fullName: profile.full_name };
}

export async function signInAdmin(email: string, password: string): Promise<AdminUser> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const admin = await getAdminUser();
  if (!admin) {
    await supabase.auth.signOut();
    throw new Error("This account is not authorized for the admin portal.");
  }
  return admin;
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function subscribeToAdminAuth(callback: () => void) {
  return supabase.auth.onAuthStateChange(() => callback());
}
