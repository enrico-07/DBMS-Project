import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ArrowRight,
  UserPlus,
  LogIn,
  Sparkles,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  Mail,
  Lock,
  User,
  HeartHandshake,
  Compass,
  Soup,
  Utensils,
  Sun,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVault } from '@/components/vault-provider';
import { ThemeSlider } from '@/components/theme-slider';
import { RecipeVaultLogo } from '@/components/recipe-vault-logo';
import { pageMeta } from '@/lib/metadata';
import { toast } from 'sonner';

export const Route = createFileRoute('/login')({
  component: LoginPage,
  head: () =>
    pageMeta(
      'Kitchen Sign-In & Registration · RecipeVault',
      'Sign in with your email or Google Account, register your culinary kitchen profile, or switch demo personas.'
    ),
});

export function LoginPage() {
  const { allUsers, switchUser, registerUser, loginUser, loginWithGoogle, resetPassword, currentUser } = useVault();
  const navigate = useNavigate();

  // Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [roleTitle, setRoleTitle] = useState('Home Cook');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Interactive culinary greeting quotes that alternate
  const [selectedInspiration, setSelectedInspiration] = useState(0);
  const inspirations = [
    { quote: 'Good soup is one of the prime necessities of life.', author: 'Louis de Gouy' },
    { quote: 'Cooking is at once child’s play and adult joy.', author: 'Craig Claiborne' },
    { quote: 'To eat is a necessity, but to cook well is an art.', author: 'François de La Rochefoucauld' },
  ];

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const ok = loginUser(email.trim(), password.trim());
      if (ok) {
        toast.success(`Welcome back to your kitchen shelf!`);
        navigate({ to: '/' });
      } else {
        // If account doesn't exist, provide a helpful prompt or offer 1-click register
        const existing = allUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!existing) {
          const auto = registerUser(email.split('@')[0], email.trim(), password.trim());
          toast.success(`New profile registered! Welcome, ${auto.name}.`);
          navigate({ to: '/profile' });
        }
      }
    }, 450);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Please enter your name and email address.');
      return;
    }
    if (password && confirmPassword && password !== confirmPassword) {
      toast.error('Passwords do not match. Please re-enter.');
      return;
    }
    if (!termsAccepted) {
      toast.error('Please accept the culinary privacy policy.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const u = registerUser(name.trim(), email.trim(), password.trim(), {
        role: roleTitle,
        avatar: name.trim().charAt(0).toUpperCase() || 'C',
      });
      toast.success(`Welcome to RecipeVault, Chef ${u.name}! Your kitchen shelf is ready.`);
      navigate({ to: '/' });
    }, 500);
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      setIsGoogleLoading(false);
      const u = loginWithGoogle({
        name: 'Google Culinary Cook',
        email: 'culinary.cook@gmail.com',
        avatar: 'G',
      });
      toast.success(`Google Account connected! Welcome, ${u.name}.`);
      navigate({ to: '/' });
    }, 700);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your account email address.');
      return;
    }
    const sent = resetPassword(email.trim());
    if (sent) {
      setResetSent(true);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Top Floating Atmosphere Toggle */}
      <div className="auth-top-floating-bar">
        <ThemeSlider />
      </div>

      <div className="auth-card-enter bg-card border border-border rounded-3xl max-w-xl w-full shadow-xl overflow-hidden relative">
        {/* Soft top gradient accent */}
        <div className="h-2 w-full bg-gradient-to-r from-clay via-honey to-sage" />

        <div className="p-7 sm:p-10 space-y-6">
          {/* Header & Logo with interactive floating icon */}
          <div className="text-center relative">
            <Link to="/" className="brand justify-center mb-2 inline-flex group">
              <RecipeVaultLogo size={42} className="group-hover:scale-105 transition-transform" />
              RecipeVault<span className="text-clay">.</span>
            </Link>

            <h1 className="text-2xl sm:text-3xl font-serif mt-2">
              {mode === 'login' && 'Welcome back to your kitchen'}
              {mode === 'register' && 'Open your personal kitchen vault'}
              {mode === 'forgot' && 'Reset your culinary access'}
            </h1>

            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {mode === 'login' && 'Relational culinary memory, saved recipes, and pantry intelligence.'}
              {mode === 'register' && 'Personalized recipes, nutritional tracking, and custom cookbook versions.'}
              {mode === 'forgot' && 'Enter your email to receive recovery instructions and a secure temporary pass.'}
            </p>
          </div>

          {/* Google Auth Button (Primary Social CTA) */}
          {mode !== 'forgot' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-full border border-border bg-background hover:bg-secondary/70 text-foreground font-semibold text-xs shadow-sm transition-all hover:border-clay/60 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-clay border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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

              {/* Or divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-border" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  OR WITH EMAIL
                </span>
                <div className="flex-1 border-t border-border" />
              </div>
            </div>
          )}

          {/* Quick Demo Personas Selection (Academic Evaluators & Viva Reviewers) */}
          {mode !== 'forgot' && (
            <div className="bg-secondary/40 border border-border p-3.5 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10.5px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} /> 1-Click Academic Personas
                </span>
                <span className="text-[9.5px] text-muted-foreground">Viva / Demo Fast-Switch</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {allUsers.slice(0, 3).map(u => {
                  const isActive = currentUser.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        isActive
                          ? 'border-clay bg-card shadow-sm ring-1 ring-clay'
                          : 'border-border bg-card/70 hover:bg-card hover:border-clay/40'
                      }`}
                      onClick={() => {
                        switchUser(u.id);
                        navigate({ to: '/' });
                      }}
                    >
                      <span className="avatar w-6 h-6 text-xs mx-auto mb-1">{u.avatar}</span>
                      <strong className="text-[11px] font-semibold block truncate">{u.name.split(' ')[0]}</strong>
                      <span className="text-[9px] text-muted-foreground block truncate">{u.role.split(' ')[0]}</span>
                      {isActive && <Check size={10} className="text-clay mx-auto mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Selector: Login vs Register */}
          {mode !== 'forgot' && (
            <div className="flex rounded-full bg-background border border-border p-1">
              <button
                type="button"
                className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  mode === 'login' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setMode('login')}
              >
                Log in
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  mode === 'register' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setMode('register')}
              >
                Sign up
              </button>
            </div>
          )}

          {/* FORM: Login Mode */}
          {mode === 'login' && (
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5 flex items-center gap-1.5">
                  <Mail size={13} className="text-clay" /> Email Address
                </label>
                <Input
                  type="email"
                  required
                  placeholder="e.g. eric@recipevault.internal"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="text-xs rounded-xl h-10"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Lock size={13} className="text-clay" /> Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-clay hover:underline font-semibold cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="text-xs rounded-xl h-10 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-muted-foreground select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded border-border text-clay focus:ring-clay"
                  />
                  <span>Remember my kitchen session</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-clay text-white gap-2 shadow-sm h-10 text-xs font-semibold hover:bg-clay/90 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={15} /> Continue to RecipeVault
                  </>
                )}
              </Button>
            </form>
          )}

          {/* FORM: Register Mode */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5 flex items-center gap-1.5">
                  <User size={13} className="text-clay" /> Full Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Sofia Chen"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="text-xs rounded-xl h-10"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5 flex items-center gap-1.5">
                  <Mail size={13} className="text-clay" /> Email Address *
                </label>
                <Input
                  type="email"
                  required
                  placeholder="e.g. sofia@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="text-xs rounded-xl h-10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5 flex items-center gap-1.5">
                    <Lock size={13} className="text-clay" /> Password *
                  </label>
                  <Input
                    type="password"
                    required
                    placeholder="Create a password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="text-xs rounded-xl h-10"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                    Confirm Password *
                  </label>
                  <Input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="text-xs rounded-xl h-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  Kitchen Specialty / Role
                </label>
                <select
                  value={roleTitle}
                  onChange={e => setRoleTitle(e.target.value)}
                  className="w-full text-xs rounded-xl h-10 px-3 bg-background border border-border text-foreground"
                >
                  <option value="Home Cook">Home Cook & Everyday Food Lover</option>
                  <option value="Artisan Baker">Artisan Baker & Pastry Explorer</option>
                  <option value="Fitness & Meal Prep">Fitness & Macro Meal Prep</option>
                  <option value="Plant-Based Explorer">Plant-Based / Vegetarian Cook</option>
                  <option value="Culinary Student">Culinary Student & Researcher</option>
                </select>
              </div>

              <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={e => setTermsAccepted(e.target.checked)}
                  className="rounded border-border text-clay focus:ring-clay mt-0.5"
                />
                <span>
                  I agree to store culinary bookmarks and dietary data in accordance with the RecipeVault local privacy architecture.
                </span>
              </label>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-clay text-white gap-2 shadow-sm h-10 text-xs font-semibold hover:bg-clay/90 cursor-pointer"
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

          {/* FORM: Forgot Password Mode */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              {resetSent ? (
                <div className="bg-secondary/60 border border-border p-6 rounded-2xl text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-sage/20 text-sage mx-auto flex items-center justify-center">
                    <Check size={20} />
                  </div>
                  <h3 className="font-serif text-base">Recovery Link Dispatched</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We have dispatched a secure password reset link to <strong>{email}</strong>. Check your inbox or use our academic demo bypass code <code>VAULT-2026</code>.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full text-xs"
                    onClick={() => {
                      setMode('login');
                      setResetSent(false);
                    }}
                  >
                    Return to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5 flex items-center gap-1.5">
                      <Mail size={13} className="text-clay" /> Registered Account Email
                    </label>
                    <Input
                      type="email"
                      required
                      placeholder="e.g. eric@recipevault.internal"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="text-xs rounded-xl h-10"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-full bg-clay text-white gap-2 shadow-sm h-10 text-xs font-semibold hover:bg-clay/90 cursor-pointer"
                  >
                    <KeyRound size={15} /> Dispatch Recovery Instructions
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs text-clay hover:underline font-semibold cursor-pointer"
                    >
                      Remembered your credentials? Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Interactive Culinary Quote Banner */}
          <div
            onClick={() => setSelectedInspiration((selectedInspiration + 1) % inspirations.length)}
            className="p-3.5 bg-background border border-border rounded-2xl cursor-pointer hover:border-clay/40 transition-colors text-center group"
            title="Click for culinary inspiration"
          >
            <p className="text-xs italic text-foreground/80 font-serif mb-0.5">
              "{inspirations[selectedInspiration].quote}"
            </p>
            <span className="text-[10px] text-muted-foreground font-semibold">
              — {inspirations[selectedInspiration].author} (tap for more)
            </span>
          </div>

          {/* Footer security badge */}
          <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-sage" /> Relational Security Active
            </span>
            <Link to="/settings" className="hover:text-foreground">
              Atmosphere & Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
