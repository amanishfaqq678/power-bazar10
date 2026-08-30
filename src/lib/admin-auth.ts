import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ADMIN_AUTH_STORAGE_KEY = "power-bazar-admin-demo-auth";

// Local/dev fallback demo credentials (kept for developer convenience only)
const DEMO_ADMIN_USERNAME = "admin";
const DEMO_ADMIN_PASSWORD = "admin";

export type AdminLoginValidationResult =
  | { ok: true; code: "SUCCESS"; message: string }
  | {
      ok: false;
      code: "ADMIN_NOT_CONFIGURED" | "INVALID_INPUT" | "INVALID_CREDENTIALS" | "SERVER_ERROR";
      message: string;
    };

const adminDemoLoginInputSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const validateAdminDemoLoginServerFn = createServerFn({ method: "POST" })
  .validator(adminDemoLoginInputSchema)
  .handler(async ({ data }) => {
    const { username, password } = data;
    const normalizedUsername = username.trim().toLowerCase();
    const configuredUsername = (process.env["ADMIN_DEMO_USERNAME"] ?? process.env["ADMIN_USERNAME"] ?? "admin")
      .trim()
      .toLowerCase();
    const configuredPassword = process.env["ADMIN_DEMO_PASSWORD"] ?? process.env["ADMIN_PASSWORD"];

    const diagnostics = {
      runningOnServer: typeof window === "undefined",
      usernameConfigured: Boolean(process.env["ADMIN_DEMO_USERNAME"] ?? process.env["ADMIN_USERNAME"]),
      passwordConfigured: Boolean(process.env["ADMIN_DEMO_PASSWORD"] ?? process.env["ADMIN_PASSWORD"]),
      receivedUsername: Boolean(username && username.trim().length > 0),
      receivedPassword: Boolean(password && password.length > 0),
    };

    console.info("[admin-auth] server validation diagnostics", diagnostics);

    if (!configuredPassword) {
      return {
        ok: false,
        code: "ADMIN_NOT_CONFIGURED",
        message: "Admin demo credentials are not configured on this server.",
      } satisfies AdminLoginValidationResult;
    }

    if (!normalizedUsername || !password) {
      return {
        ok: false,
        code: "INVALID_INPUT",
        message: "Username and password are required.",
      } satisfies AdminLoginValidationResult;
    }

    if (normalizedUsername !== configuredUsername || password !== configuredPassword) {
      return {
        ok: false,
        code: "INVALID_CREDENTIALS",
        message: "Invalid username or password.",
      } satisfies AdminLoginValidationResult;
    }

    return {
      ok: true,
      code: "SUCCESS",
      message: "Login successful.",
    } satisfies AdminLoginValidationResult;
  });

export function isAdminDemoEnabled() {
  // Production auth should not depend on a Vite-only client flag.
  // The server function checks the real server environment directly.
  return true;
}

export async function validateDemoAdminLogin(username: string, password: string): Promise<AdminLoginValidationResult> {
  if (import.meta.env.DEV) {
    const isValid =
      username.trim().toLowerCase() === DEMO_ADMIN_USERNAME && password === DEMO_ADMIN_PASSWORD;

    if (!isValid) {
      return {
        ok: false,
        code: "INVALID_CREDENTIALS",
        message: "Invalid username or password.",
      };
    }

    return {
      ok: true,
      code: "SUCCESS",
      message: "Login successful.",
    };
  }

  try {
    const result = await validateAdminDemoLoginServerFn({
      data: {
        username: username.trim(),
        password,
      },
    });

    if (!result.ok && result.code === "ADMIN_NOT_CONFIGURED") {
      console.warn("[admin-auth] server admin credentials missing", {
        runningOnServer: typeof window === "undefined",
        usernameConfigured: Boolean(process.env["ADMIN_DEMO_USERNAME"] ?? process.env["ADMIN_USERNAME"]),
        passwordConfigured: Boolean(process.env["ADMIN_DEMO_PASSWORD"] ?? process.env["ADMIN_PASSWORD"]),
      });
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    console.error("[admin-auth] server validation failed:", message);
    return {
      ok: false,
      code: "SERVER_ERROR",
      message: "Unable to verify credentials right now. Please try again.",
    };
  }
}

export function isAdminAuthenticated() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY) === "true";
}

export function signInAdminDemo() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, "true");
}

export function signOutAdmin() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
}
