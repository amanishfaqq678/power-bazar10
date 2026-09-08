import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import logo from "@/assets/power-bazar-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminUser, signInAdmin } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void getAdminUser().then((user) => {
      if (user) navigate({ to: "/admin/dashboard" });
    });
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signInAdmin(email.trim(), password);
      navigate({ to: "/admin/dashboard" });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
      setIsSubmitting(false);
    }
    setIsSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-[#f5f5f1] px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/home" className="inline-flex items-center gap-3" aria-label="Power Bazar home">
            <img src={logo} alt="Power Bazar" className="h-11 w-auto" />
          </Link>
          <Link to="/home" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Back to site
          </Link>
        </div>

        <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
          <div className="w-full max-w-md rounded-[28px] border border-border bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="flex justify-center">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <img src={logo} alt="Power Bazar" className="h-12 w-auto" />
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">
                <ShieldCheck className="size-3.5" />
                Admin Portal
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">Admin Portal</h1>
              <p className="mt-3 text-sm text-muted-foreground">Secure access to Power Bazar management.</p>
            </div>

            <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your admin email"
                  autoComplete="email"
                  className="h-11 border-border bg-[#f8f8f5] text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="h-11 border-border bg-[#f8f8f5] pr-11 text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error ? (
                <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <Button type="submit" className="h-11 w-full rounded-full font-bold" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
