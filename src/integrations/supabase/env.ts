type EnvLookup = string | undefined;

function readFirstAvailable(...keys: string[]): EnvLookup {
  const importMetaEnv = typeof import.meta !== "undefined" ? import.meta.env : undefined;

  for (const key of keys) {
    const valueFromMeta = importMetaEnv && key in importMetaEnv ? importMetaEnv[key as keyof typeof importMetaEnv] : undefined;
    if (typeof valueFromMeta === "string" && valueFromMeta.trim()) {
      return valueFromMeta.trim();
    }

    if (typeof process !== "undefined") {
      const valueFromProcess = process.env?.[key];
      if (typeof valueFromProcess === "string" && valueFromProcess.trim()) {
        return valueFromProcess.trim();
      }
    }
  }

  return undefined;
}

export function getSupabaseClientConfig() {
  const url = readFirstAvailable("VITE_SUPABASE_URL", "SUPABASE_URL");
  const publishableKey = readFirstAvailable(
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "VITE_SUPABASE_ANON_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_ANON_KEY",
  );

  const missing = [
    ...(url ? [] : ["VITE_SUPABASE_URL / SUPABASE_URL"]),
    ...(publishableKey ? [] : ["VITE_SUPABASE_PUBLISHABLE_KEY / VITE_SUPABASE_ANON_KEY / SUPABASE_PUBLISHABLE_KEY / SUPABASE_ANON_KEY"]),
  ];

  return { url, publishableKey, missing };
}
