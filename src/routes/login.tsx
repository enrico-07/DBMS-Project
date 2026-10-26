import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  ArrowRight,
  ArrowLeft,
  UserPlus,
  LogIn,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Compass,
  Utensils,
  Shield,
  ChefHat,
  Sparkles,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVault } from "@/components/vault-provider";
import { ThemeSlider } from "@/components/theme-slider";
import { RecipeVaultLogo } from "@/components/recipe-vault-logo";
import { pageMeta } from "@/lib/metadata";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { mode?: "login" | "register" | "forgot" } => ({
    mode:
      search.mode === "register" || search.mode === "forgot" || search.mode === "login"
        ? (search.mode as "login" | "register" | "forgot")
        : undefined,
  }),
  component: LoginPage,
  head: () =>
    pageMeta(
      "Kitchen Sign-In & Registration · RecipeVault",
      "Sign in with your email or Google Account, register your culinary kitchen profile, or switch demo personas.",
    ),
});

interface PasswordStrength {
  score: number;
  label: "Weak" | "Fair" | "Good" | "Strong" | "";
  color: string;
  hasLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

function calculatePasswordStrength(pass: string): PasswordStrength {
  if (!pass) {
    return {
      score: 0,
      label: "",
      color: "bg-muted",
      hasLength: false,
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      hasSpecial: false,
    };
  }

  const hasLength = pass.length >= 8;
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecial = /[^A-Za-z0-9]/.test(pass);

  let criteriaMet = 0;
  if (hasLength) criteriaMet++;
  if (hasUpper) criteriaMet++;
  if (hasNumber) criteriaMet++;
  if (hasSpecial) criteriaMet++;

  let score = 1;
  let label: "Weak" | "Fair" | "Good" | "Strong" = "Weak";
  let color = "bg-rose-500";

  if (!hasLength) {
    score = 1;
    label = "Weak";
    color = "bg-rose-500";
  } else if (criteriaMet <= 2) {
    score = 2;
    label = "Fair";
    color = "bg-amber-500";
  } else if (criteriaMet === 3) {
    score = 3;
    label = "Good";
    color = "bg-blue-500";
  } else {
    score = 4;
    label = "Strong";
    color = "bg-emerald-500";
  }

  return {
    score,
    label,
    color,
    hasLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
  };
}

function PasswordStrengthIndicator({ strength }: { strength: PasswordStrength }) {
  if (!strength.label) return null;

  return (
    <div className="space-y-2 pt-1 animate-in fade-in-50 duration-200">
      {/* 4 segmented bars */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4].map((step) => {
          const isFilled = strength.score >= step;
          let barBg = "bg-muted";
          if (isFilled) {
            if (strength.score === 1) barBg = "bg-rose-500";
            else if (strength.score === 2) barBg = "bg-amber-500";
            else if (strength.score === 3) barBg = "bg-blue-500";
            else barBg = "bg-emerald-500";
          }
          return (
            <div
              key={step}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${barBg}`}
            />
          );
        })}
      </div>

      {/* Label and Checklist */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">Password strength:</span>
        <span
          className={`font-semibold ${
            strength.score === 1
              ? "text-rose-500"
              : strength.score === 2
                ? "text-amber-500"
                : strength.score === 3
                  ? "text-blue-500"
                  : "text-emerald-500"
          }`}
        >
          {strength.label}
        </span>
      </div>

      {/* 4 requirement chips */}
      <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
        <div
          className={`flex items-center gap-1.5 ${
            strength.hasLength
              ? "text-emerald-600 dark:text-emerald-400 font-medium"
              : "text-muted-foreground"
          }`}
        >
          {strength.hasLength ? (
            <Check size={12} className="text-emerald-500 shrink-0" />
          ) : (
            <div className="w-2.5 h-2.5 rounded-full border border-muted-foreground/40 shrink-0" />
          )}
          <span>8+ characters</span>
        </div>
        <div
          className={`flex items-center gap-1.5 ${
            strength.hasUpper
              ? "text-emerald-600 dark:text-emerald-400 font-medium"
              : "text-muted-foreground"
          }`}
        >
          {strength.hasUpper ? (
            <Check size={12} className="text-emerald-500 shrink-0" />
          ) : (
            <div className="w-2.5 h-2.5 rounded-full border border-muted-foreground/40 shrink-0" />
          )}
          <span>Uppercase letter</span>
        </div>
        <div
          className={`flex items-center gap-1.5 ${
            strength.hasNumber
              ? "text-emerald-600 dark:text-emerald-400 font-medium"
              : "text-muted-foreground"
          }`}
        >
          {strength.hasNumber ? (
            <Check size={12} className="text-emerald-500 shrink-0" />
          ) : (
            <div className="w-2.5 h-2.5 rounded-full border border-muted-foreground/40 shrink-0" />
          )}
          <span>Number (0-9)</span>
        </div>
        <div
          className={`flex items-center gap-1.5 ${
            strength.hasSpecial
              ? "text-emerald-600 dark:text-emerald-400 font-medium"
              : "text-muted-foreground"
          }`}
        >
          {strength.hasSpecial ? (
            <Check size={12} className="text-emerald-500 shrink-0" />
          ) : (
            <div className="w-2.5 h-2.5 rounded-full border border-muted-foreground/40 shrink-0" />
          )}
          <span>Special character</span>
        </div>
      </div>
    </div>
  );
}

const REMEMBERED_STORAGE_KEY = "recipevault_remembered_auth";
const DEMO_RECOVERY_CODE = "784912";

function LoginPage() {
  const search = Route.useSearch();
  const {
    allUsers,
    switchUser,
    registerUser,
    loginUser,
    loginWithGoogle,
    resetPassword,
    currentUser,
    lastVisitedRoute,
  } = useVault();
  const navigate = useNavigate();

  const targetRoute = lastVisitedRoute && lastVisitedRoute !== "/login" ? lastVisitedRoute : "/";

  // Auth Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<"login" | "register" | "forgot">(
    search.mode || "login",
  );

  // Sync mode when URL search param changes
  useEffect(() => {
    if (search.mode && (search.mode === "login" || search.mode === "register" || search.mode === "forgot")) {
      setMode(search.mode);
    }
  }, [search.mode]);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [roleTitle, setRoleTitle] = useState("Home Cook");
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password flow sub-steps: 'email' | 'code' | 'newPassword'
  const [forgotStep, setForgotStep] = useState<"email" | "code" | "newPassword">("email");
  const [enteredCode, setEnteredCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Load remembered login on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBERED_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email) setEmail(parsed.email);
        if (typeof parsed.rememberMe === "boolean") setRememberMe(parsed.rememberMe);
      }
    } catch (e) {
      console.warn("Storage read error", e);
    }
  }, []);

  // Helper to persist remember me state
  const handleRememberPersistence = (emailValue: string) => {
    try {
      if (rememberMe) {
        localStorage.setItem(
          REMEMBERED_STORAGE_KEY,
          JSON.stringify({
            email: emailValue.trim(),
            rememberMe: true,
            timestamp: new Date().toISOString(),
          }),
        );
      } else {
        localStorage.removeItem(REMEMBERED_STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Storage write error", e);
    }
  };

  // Password strength calculations
  const registerStrength = useMemo(() => calculatePasswordStrength(password), [password]);
  const newPasswordStrength = useMemo(() => calculatePasswordStrength(newPassword), [newPassword]);

  // Handle Login
  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      handleRememberPersistence(email);

      const ok = loginUser(email.trim(), password.trim());
      if (ok) {
        toast.success("Welcome back to your kitchen vault!");
        navigate({ to: targetRoute as any });
      } else {
        const auto = registerUser(
          email.split("@")[0] ?? email.trim(),
          email.trim(),
          password.trim(),
        );
        toast.success(`Welcome, Chef ${auto.name}! Your kitchen profile is active.`);
        navigate({ to: targetRoute as any });
      }
    }, 400);
  };

  // Handle Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your chef name.");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    if (password.length < 6) {
      toast.error("Please enter a password with at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please verify both entries.");
      return;
    }
    if (!termsAccepted) {
      toast.error("Please agree to the culinary storage terms.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      handleRememberPersistence(email);

      const newUser = registerUser(name.trim(), email.trim(), password.trim(), {
        role: roleTitle,
        avatar: name.trim().charAt(0).toUpperCase() || "C",
      });
      toast.success(`Account created! Welcome to RecipeVault, Chef ${newUser.name}.`);
      navigate({ to: targetRoute as any });
    }, 450);
  };

  // Handle Google OAuth
  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      setIsGoogleLoading(false);
      toast.info(
        "Google OAuth is configured for deployment review. Please sign in with any email or use the 1-Click Demo Personas below.",
        { duration: 5000 },
      );
    }, 350);
  };

  // Handle Recovery Email Dispatch
  const handleSendRecoveryCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your registered account email.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const userExists = resetPassword(email.trim());
      if (userExists) {
        setForgotStep("code");
        toast.success(`Recovery code dispatched! Check demo code below.`);
      }
    }, 400);
  };

  // Handle Code Verification
  const handleVerifyRecoveryCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredCode.trim()) {
      toast.error("Please enter the 6-digit recovery code.");
      return;
    }
    if (
      enteredCode.trim() !== DEMO_RECOVERY_CODE &&
      enteredCode.trim().toUpperCase() !== "VAULT-2026"
    ) {
      toast.error("Invalid recovery code. For demo review, use code 784912 or VAULT-2026.");
      return;
    }

    toast.success("Recovery code verified! Set your new password.");
    setForgotStep("newPassword");
  };

  // Handle New Password Submission
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match. Please re-enter.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const updated = resetPassword(email.trim(), newPassword.trim());
      if (updated) {
        handleRememberPersistence(email);
        navigate({ to: targetRoute as any });
      }
    }, 450);
  };

  return (
    <div className="auth-page-container">
      {/* Top Floating Atmosphere Toggle */}
      <div className="auth-top-floating-bar">
        <ThemeSlider />
      </div>

      {/* Main Auth Card Container - Clean border, NO yellow/golden line */}
      <div className="auth-card-enter bg-card border border-border/80 rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-xl overflow-hidden relative">
        <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
          {/* Header & Logo */}
          <div className="text-center relative">
            <Link to="/" className="brand justify-center mb-2 inline-flex group">
              <RecipeVaultLogo size={40} className="group-hover:scale-105 transition-transform" />
              RecipeVault<span className="text-clay">.</span>
            </Link>

            <h1 className="text-2xl sm:text-3xl font-serif mt-2 text-foreground font-semibold">
              {mode === "login" && "Welcome back to your kitchen"}
              {mode === "register" && "Create your kitchen account"}
              {mode === "forgot" && "Reset your password"}
            </h1>

            <p className="text-xs text-muted-foreground mt-1.5 max-w-sm mx-auto leading-relaxed">
              {mode === "login" &&
                "Access your saved recipes, customized cookbook versions, and meal schedules."}
              {mode === "register" &&
                "Join RecipeVault to build personalized recipe collections and track culinary macros."}
              {mode === "forgot" &&
                "Follow the guided steps below to verify your identity and restore access."}
            </p>
          </div>

          {/* Dedicated Tab Switcher (Sign In vs Create Account) */}
          {mode !== "forgot" && (
            <div className="flex rounded-xl bg-secondary/70 p-1 border border-border">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Google Auth CTA */}
          {mode !== "forgot" && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border bg-background hover:bg-secondary/60 text-foreground font-semibold text-xs shadow-sm transition-all hover:border-clay/50 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-clay border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-border" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  or continue with email
                </span>
                <div className="flex-1 border-t border-border" />
              </div>
            </div>
          )}

          {/* MODE: SIGN IN */}
          {mode === "login" && (
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                  <Mail size={13} className="text-clay" /> Email Address
                </label>
                <Input
                  type="email"
                  required
                  placeholder="e.g. eric@recipevault.internal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs rounded-xl h-10"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Lock size={13} className="text-clay" /> Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setForgotStep("email");
                    }}
                    className="text-[11px] text-clay hover:underline font-semibold cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-xs rounded-xl h-10 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Option */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-clay focus:ring-clay cursor-pointer"
                  />
                  <span>Remember my login on this device</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-clay text-white gap-2 shadow-sm h-10 text-xs font-semibold hover:bg-clay/90 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={15} /> Sign In to Kitchen
                  </>
                )}
              </Button>
            </form>
          )}

          {/* MODE: CREATE ACCOUNT (SIGN UP) */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                  <User size={13} className="text-clay" /> Chef Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Sofia Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs rounded-xl h-10"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                  <Mail size={13} className="text-clay" /> Email Address *
                </label>
                <Input
                  type="email"
                  required
                  placeholder="e.g. sofia@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs rounded-xl h-10"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                  <ChefHat size={13} className="text-clay" /> Culinary Specialty
                </label>
                <select
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full text-xs rounded-xl h-10 px-3 bg-background border border-border text-foreground"
                >
                  <option value="Home Cook">Home Cook & Everyday Food Lover</option>
                  <option value="Artisan Baker">Artisan Baker & Pastry Explorer</option>
                  <option value="Fitness & Macro Meal Prep">Fitness & Macro Meal Prep</option>
                  <option value="Plant-Based Explorer">Plant-Based / Vegetarian Cook</option>
                  <option value="Culinary Student">Culinary Student & Researcher</option>
                </select>
              </div>

              {/* Password with Active Strength Feature */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                  <Lock size={13} className="text-clay" /> Create Password *
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-xs rounded-xl h-10 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Live Password Strength Meter */}
                <PasswordStrengthIndicator strength={registerStrength} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center justify-between">
                  <span>Confirm Password *</span>
                  {confirmPassword && (
                    <span
                      className={`text-[10px] font-semibold ${
                        password === confirmPassword ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="text-xs rounded-xl h-10 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-clay focus:ring-clay cursor-pointer"
                  />
                  <span>Remember me on this device</span>
                </label>
              </div>

              {/* Privacy Terms */}
              <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="rounded border-border text-clay focus:ring-clay mt-0.5 cursor-pointer"
                />
                <span className="leading-relaxed">
                  I agree to store culinary bookmarks and dietary preferences in accordance with the
                  RecipeVault privacy architecture.
                </span>
              </label>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-clay text-white gap-2 shadow-sm h-10 text-xs font-semibold hover:bg-clay/90 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus size={15} /> Create Kitchen Account
                  </>
                )}
              </Button>
            </form>
          )}

          {/* MODE: FORGOT PASSWORD & RECOVERY FLOW */}
          {mode === "forgot" && (
            <div className="space-y-4">
              {/* Back to sign in link */}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setForgotStep("email");
                }}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold cursor-pointer mb-1"
              >
                <ArrowLeft size={13} /> Back to Sign In
              </button>

              {/* STEP 1: Enter email */}
              {forgotStep === "email" && (
                <form onSubmit={handleSendRecoveryCode} className="space-y-4">
                  <div className="p-3.5 bg-secondary/50 border border-border/70 rounded-xl space-y-1">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <KeyRound size={13} className="text-clay" /> Step 1 of 3: Identify Account
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Enter the email registered with your RecipeVault account. We will dispatch a
                      verification code.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                      <Mail size={13} className="text-clay" /> Registered Account Email
                    </label>
                    <Input
                      type="email"
                      required
                      placeholder="e.g. eric@recipevault.internal"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-xs rounded-xl h-10"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-clay text-white gap-2 shadow-sm h-10 text-xs font-semibold hover:bg-clay/90 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <KeyRound size={15} /> Dispatch Recovery Code
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* STEP 2: Verify Recovery Code */}
              {forgotStep === "code" && (
                <form onSubmit={handleVerifyRecoveryCode} className="space-y-4">
                  <div className="p-3.5 bg-secondary/50 border border-border/70 rounded-xl space-y-1">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <KeyRound size={13} className="text-clay" /> Step 2 of 3: Enter Verification Code
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      A 6-digit code was dispatched to <strong>{email}</strong>.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center justify-between">
                      <span>Verification Code</span>
                      <button
                        type="button"
                        onClick={() => setEnteredCode(DEMO_RECOVERY_CODE)}
                        className="text-[11px] text-clay hover:underline font-semibold cursor-pointer"
                      >
                        Auto-fill demo code (784912)
                      </button>
                    </label>
                    <Input
                      type="text"
                      required
                      placeholder="Enter 6-digit code e.g. 784912"
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value)}
                      className="text-xs rounded-xl h-10 text-center tracking-widest font-mono font-semibold"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setForgotStep("email")}
                      className="rounded-xl text-xs flex-1"
                    >
                      Change Email
                    </Button>
                    <Button
                      type="submit"
                      className="rounded-xl bg-clay text-white text-xs font-semibold flex-1 hover:bg-clay/90"
                    >
                      Verify Code
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 3: Set New Password */}
              {forgotStep === "newPassword" && (
                <form onSubmit={handleSaveNewPassword} className="space-y-4">
                  <div className="p-3.5 bg-secondary/50 border border-border/70 rounded-xl space-y-1">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Lock size={13} className="text-clay" /> Step 3 of 3: Choose New Password
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Create a strong new password for your kitchen profile.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                      <Lock size={13} className="text-clay" /> New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        required
                        placeholder="Enter strong new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="text-xs rounded-xl h-10 pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    {/* Active Strong Password Meter on Reset */}
                    <PasswordStrengthIndicator strength={newPasswordStrength} />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center justify-between">
                      <span>Confirm New Password</span>
                      {confirmNewPassword && (
                        <span
                          className={`text-[10px] font-semibold ${
                            newPassword === confirmNewPassword
                              ? "text-emerald-500"
                              : "text-rose-500"
                          }`}
                        >
                          {newPassword === confirmNewPassword
                            ? "Passwords match"
                            : "Passwords do not match"}
                        </span>
                      )}
                    </label>
                    <Input
                      type="password"
                      required
                      placeholder="Repeat new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="text-xs rounded-xl h-10"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-clay text-white gap-2 shadow-sm h-10 text-xs font-semibold hover:bg-clay/90 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check size={15} /> Save New Password & Sign In
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* 1-Click Demo Personas (Review & Viva fast switcher) */}
          {mode !== "forgot" && (
            <div className="bg-secondary/40 border border-border/70 p-4 rounded-2xl space-y-3">
              {/* Header with large, prominent icon and clear hierarchy */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-clay/15 text-clay flex items-center justify-center shrink-0">
                  <Compass size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-foreground">1-Click Demo Personas</h3>
                    <span className="text-[10px] font-semibold text-clay bg-clay/10 px-2 py-0.5 rounded-full shrink-0">
                      Instant Review
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Select a persona to test customized diets and pantry states
                  </p>
                </div>
              </div>

              {/* Persona selection list - Clean, comfortable, highly legible mobile cards */}
              <div className="space-y-2">
                {allUsers.slice(0, 3).map((u) => {
                  const isActive = currentUser.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? "border-clay bg-clay/10 ring-1 ring-clay/40 shadow-xs"
                          : "border-border/70 bg-card/80 hover:bg-card hover:border-clay/40"
                      }`}
                      onClick={() => {
                        switchUser(u.id);
                        toast.success(`Switched active cook to ${u.name}`);
                        navigate({ to: targetRoute as any });
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-clay/15 text-clay font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {u.avatar || u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground truncate">{u.name}</span>
                            {isActive && (
                              <span className="text-[9.5px] font-semibold text-clay bg-clay/15 px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                <Check size={10} /> Active
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground block truncate">{u.role}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-clay shrink-0 pl-2">
                        <span>Switch</span>
                        <ArrowRight size={13} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Continue as Guest Cook - Full width, clean, comfortable touch target with zero overflow */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    if (allUsers[0]) {
                      switchUser(allUsers[0].id);
                    }
                    navigate({ to: "/" });
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-border bg-background/60 hover:bg-secondary/60 text-foreground/80 hover:text-foreground text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Utensils size={15} className="text-clay shrink-0" />
                  <span>Continue as Guest Cook</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer security status & Settings Link - Structured, natural alignment with visible icons */}
          <div className="pt-3 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <span className="font-medium text-foreground/90">Relational Security Active</span>
            </div>

            <Link
              to="/settings"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-clay transition-colors font-medium"
            >
              <Sparkles size={14} className="text-clay shrink-0" />
              <span>Atmosphere & Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
