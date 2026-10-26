import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  User,
  Heart,
  Calendar,
  BookOpen,
  MessageSquare,
  Shield,
  ShieldCheck,
  Clock,
  RotateCcw,
  Check,
  Plus,
  LogIn,
  KeyRound,
  Lock,
  Phone,
  MapPin,
  Save,
  CheckCircle2,
  Sliders,
  Laptop,
  X,
} from 'lucide-react';
import { PageHeading } from '@/components/recipe-card';
import { useVault } from '@/components/vault-provider';
import { ThemeSlider } from '@/components/theme-slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { pageMeta } from '@/lib/metadata';
import { HEALTH_CONDITIONS } from '@/lib/recipes';
import { toast } from 'sonner';

export const Route = createFileRoute('/profile')({
  component: Profile,
  head: () =>
    pageMeta(
      'Kitchen Profile, Security & Preferences · RecipeVault',
      'Personalize kitchen identity, account security, dietary restrictions, and cooking preferences.'
    ),
});

function Profile() {
  const {
    currentUser,
    allUsers,
    switchUser,
    updateUserProfile,
    saved,
    plan,
    items,
    resetDatabase,
  } = useVault();

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

  // Personal details state
  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState(currentUser.role);
  const [bio, setBio] = useState(currentUser.bio);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [location, setLocation] = useState(currentUser.location || '');
  const [targetCookTime, setTargetCookTime] = useState(currentUser.targetCookTime || 30);
  const [cookingSkill, setCookingSkill] = useState(currentUser.cookingSkill || 'Home Cook');

  // Security details state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(currentUser.twoFactorEnabled ?? false);
  const [sessionTimeout, setSessionTimeout] = useState(currentUser.sessionTimeout ?? 60);

  // Preference exclusions state
  const [dislikedInput, setDislikedInput] = useState('');

  const cuisines = ['Italian', 'Mediterranean', 'American', 'Indian', 'Japanese', 'Mexican'];
  const diets = ['Vegetarian', 'Vegan', 'High protein', 'Gluten-free', 'Balanced'];
  const healthConditionsList = Object.values(HEALTH_CONDITIONS);

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Chef name cannot be empty');
      return;
    }
    updateUserProfile({
      name: name.trim(),
      role: role.trim(),
      bio: bio.trim(),
      phone: phone.trim(),
      location: location.trim(),
      targetCookTime: Number(targetCookTime),
      cookingSkill: cookingSkill as any,
    });
    toast.success('Personal profile details saved!');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password should be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    updateUserProfile({
      password: newPassword,
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Account password updated securely.');
  };

  const handleToggle2FA = (checked: boolean) => {
    setTwoFactor(checked);
    updateUserProfile({ twoFactorEnabled: checked });
    toast.success(checked ? 'Two-Factor Authentication enabled.' : 'Two-Factor Authentication disabled.');
  };

  const handleSessionTimeoutChange = (val: number) => {
    setSessionTimeout(val);
    updateUserProfile({ sessionTimeout: val });
    toast.success(`Session timeout updated to ${val} minutes.`);
  };

  const toggleCuisine = (c: string) => {
    const next = currentUser.favoriteCuisines.includes(c)
      ? currentUser.favoriteCuisines.filter(x => x !== c)
      : [...currentUser.favoriteCuisines, c];
    updateUserProfile({ favoriteCuisines: next });
  };

  const toggleDiet = (d: string) => {
    const next = currentUser.dietaryPreferences.includes(d)
      ? currentUser.dietaryPreferences.filter(x => x !== d)
      : [...currentUser.dietaryPreferences, d];
    updateUserProfile({ dietaryPreferences: next });
  };

  const toggleHealth = (h: string) => {
    const next = currentUser.healthConditions.includes(h)
      ? currentUser.healthConditions.filter(x => x !== h)
      : [...currentUser.healthConditions, h];
    updateUserProfile({ healthConditions: next });
  };

  const addDisliked = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dislikedInput.trim()) return;
    if (currentUser.dislikedIngredients.includes(dislikedInput.trim())) return;
    updateUserProfile({
      dislikedIngredients: [...currentUser.dislikedIngredients, dislikedInput.trim()],
    });
    setDislikedInput('');
    toast.success('Disliked ingredient filter added');
  };

  const removeDisliked = (name: string) => {
    updateUserProfile({
      dislikedIngredients: currentUser.dislikedIngredients.filter(x => x !== name),
    });
  };

  return (
    <div className="standard-page profile-page max-w-4xl mx-auto w-full min-w-0 overflow-x-hidden">
      <PageHeading
        eyebrow="ACCOUNT, SECURITY & PREFERENCES"
        title="Kitchen Profile & Account Settings"
        description="Fine-tune your personal identity, login credentials, culinary tastes, and dietary intelligence rules."
        action={
          <Button asChild variant="outline" className="rounded-full gap-1.5 text-xs h-8.5 sm:h-9 px-3.5 sm:px-4 w-full sm:w-auto justify-center shadow-sm">
            <Link to="/login">
              <LogIn size={14} /> Switch / Register
            </Link>
          </Button>
        }
      />

      {/* Active User Persona Banner */}
      <div className="bg-card border border-border p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm my-4 sm:my-6 flex flex-col md:flex-row items-center gap-4 sm:gap-6 w-full min-w-0">
        <span className="avatar w-16 h-16 sm:w-18 sm:h-18 text-2xl sm:text-3xl shrink-0 shadow-sm ring-2 ring-primary/20">
          {currentUser.avatar}
        </span>

        <div className="flex-1 text-center md:text-left min-w-0 w-full">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground tracking-tight">
            {currentUser.name}
          </h2>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2 mt-1.5 mb-2.5">
            <span className="text-[11px] sm:text-xs bg-secondary text-primary px-3 py-0.5 rounded-full font-medium inline-block border border-border/60">
              {currentUser.role}
            </span>
            {currentUser.loginMethod && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {currentUser.loginMethod === 'google' ? 'Google Connected' : 'Email Verified'}
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground max-w-md mx-auto md:mx-0 leading-relaxed mb-2.5">
            {currentUser.bio}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-[11px] text-muted-foreground">
            <span className="font-mono text-[10.5px]">{currentUser.email}</span>
            {currentUser.phone && <span>· {currentUser.phone}</span>}
            {currentUser.location && <span>· {currentUser.location}</span>}
          </div>
        </div>

        {/* Live Relational Stats */}
        <div className="grid grid-cols-3 gap-2.5 w-full md:w-auto border-t md:border-t-0 md:border-l border-border/80 pt-4 md:pt-0 md:pl-6 text-center shrink-0">
          <div className="p-2 sm:p-2.5 rounded-xl bg-secondary/50 md:bg-secondary/30 border border-border/40">
            <strong className="text-xl font-serif text-primary block tabular">{saved.length}</strong>
            <span className="text-[9.5px] sm:text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mt-0.5">
              Saved
            </span>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-secondary/50 md:bg-secondary/30 border border-border/40">
            <strong className="text-xl font-serif text-primary block tabular">{plan.length}</strong>
            <span className="text-[9.5px] sm:text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mt-0.5">
              Planned
            </span>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-secondary/50 md:bg-secondary/30 border border-border/40">
            <strong className="text-xl font-serif text-primary block tabular">
              {items.filter(r => r.createdBy === currentUser.id).length}
            </strong>
            <span className="text-[9.5px] sm:text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mt-0.5">
              Created
            </span>
          </div>
        </div>
      </div>

      {/* Quick Switch Demo Personas Section */}
      <div className="bg-secondary/60 border border-border p-3.5 sm:p-5 rounded-2xl mb-6 sm:mb-8 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3.5">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Quick-Switch Demo Personas
          </span>
          <span className="text-[10.5px] sm:text-[11px] text-muted-foreground">
            Instantly view distinct personalized shelves
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {allUsers.slice(0, 3).map(u => {
            const isActive = currentUser.id === u.id;
            return (
              <button
                key={u.id}
                type="button"
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'border-clay bg-card shadow-sm ring-1 ring-clay'
                    : 'border-border bg-card/60 hover:bg-card'
                }`}
                onClick={() => {
                  switchUser(u.id);
                  setName(u.name);
                  setRole(u.role);
                  setBio(u.bio);
                  setPhone(u.phone || '');
                  setLocation(u.location || '');
                  setTargetCookTime(u.targetCookTime || 30);
                  setCookingSkill(u.cookingSkill || 'Home Cook');
                  setTwoFactor(u.twoFactorEnabled ?? false);
                  setSessionTimeout(u.sessionTimeout ?? 60);
                }}
              >
                <span className="avatar w-8 h-8 text-xs shrink-0 rounded-full mt-0.5 shadow-2xs font-bold">
                  {u.avatar}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <strong className="text-xs font-semibold text-foreground truncate">{u.name}</strong>
                    {isActive && (
                      <span className="text-[9.5px] font-bold text-clay uppercase tracking-wider bg-peach/40 px-2 py-0.5 rounded-full shrink-0 border border-clay/30">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {u.bio}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border mb-5 sm:mb-7 pb-2.5 pt-1 overflow-x-auto no-scrollbar scroll-smooth w-full min-w-0">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`h-9 px-3.5 sm:px-4 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 border whitespace-nowrap cursor-pointer active:scale-[0.98] ${
            activeTab === 'profile'
              ? 'bg-primary text-primary-foreground border-primary shadow-sm font-semibold'
              : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <User size={14} className="shrink-0" /> Profile & Identity
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`h-9 px-3.5 sm:px-4 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 border whitespace-nowrap cursor-pointer active:scale-[0.98] ${
            activeTab === 'security'
              ? 'bg-primary text-primary-foreground border-primary shadow-sm font-semibold'
              : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <Shield size={14} className="shrink-0" /> Security & Auth
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`h-9 px-3.5 sm:px-4 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 border whitespace-nowrap cursor-pointer active:scale-[0.98] ${
            activeTab === 'preferences'
              ? 'bg-primary text-primary-foreground border-primary shadow-sm font-semibold'
              : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <Sliders size={14} className="shrink-0" /> Culinary Tastes
        </button>
      </div>

      {/* TAB 1: Personal Details Form */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSavePersonal} className="space-y-4 sm:space-y-6">
          <div className="bg-card border border-border p-4 sm:p-6 rounded-2xl shadow-sm space-y-4">
            <div className="border-b border-border pb-3.5">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-2xs">
                  <User size={17} />
                </div>
                <h3 className="text-base sm:text-lg font-serif font-semibold text-foreground leading-snug">
                  Personal Information
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Update your display name, contact coordinates, and culinary bio.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Chef Display Name</label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Culinary Title / Specialty</label>
                <Input
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Plant-forward Home Cook"
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Contact Phone</label>
                <Input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 349-2910"
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Kitchen Location</label>
                <Input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Portland, Oregon"
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Cooking Skill Level</label>
                <select
                  value={cookingSkill}
                  onChange={e => setCookingSkill(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="Beginner">Beginner — Learning Kitchen Basics</option>
                  <option value="Home Cook">Home Cook — Confident Weeknight Cook</option>
                  <option value="Seasoned Chef">Seasoned Chef — Advanced Technique & Experiments</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Weeknight Cooking Time Goal (Minutes)</label>
                <Input
                  type="number"
                  min="10"
                  max="180"
                  value={targetCookTime}
                  onChange={e => setTargetCookTime(Number(e.target.value))}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-foreground">Kitchen Bio & Cooking Story</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Tell other cooks about your favorite flavors and kitchen rituals…"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" className="w-full sm:w-auto rounded-full bg-primary text-primary-foreground gap-1.5 text-xs h-9 shadow-xs justify-center">
                <Save size={14} /> Save Profile Changes
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: Security & Credentials */}
      {activeTab === 'security' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Password update form */}
          <form onSubmit={handleUpdatePassword} className="bg-card border border-border p-4 sm:p-6 rounded-2xl shadow-sm space-y-4">
            <div className="border-b border-border pb-3.5">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-2xs">
                  <KeyRound size={17} />
                </div>
                <h3 className="text-base sm:text-lg font-serif font-semibold text-foreground leading-snug">
                  Password & Authentication
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Update your security passphrase for local and device authentication.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Current Passphrase</label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">New Passphrase</label>
                <Input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">Confirm New Passphrase</label>
                <Input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="text-xs h-9 max-w-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" className="w-full sm:w-auto rounded-full bg-primary text-primary-foreground gap-1.5 text-xs h-9 shadow-xs justify-center">
                <Lock size={14} /> Update Security Passphrase
              </Button>
            </div>
          </form>

          {/* Two-Factor Authentication & Session Settings */}
          <div className="bg-card border border-border p-4 sm:p-6 rounded-2xl shadow-sm space-y-4 sm:space-y-5">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-8 h-8 rounded-xl bg-sage/15 text-sage flex items-center justify-center shrink-0 border border-sage/20 shadow-2xs">
                  <ShieldCheck size={17} />
                </div>
                <h3 className="text-base sm:text-lg font-serif font-semibold text-foreground leading-snug">
                  Advanced Security & Session Management
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Protect account access with two-factor verification and idle session limits.
              </p>
            </div>

            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-border bg-background gap-3">
              <div>
                <strong className="text-xs font-semibold block text-foreground">Two-Factor Authentication (2FA)</strong>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Require one-time verification codes when logging in from unrecognized browsers or mobile devices.
                </p>
              </div>
              <Switch checked={twoFactor} onCheckedChange={handleToggle2FA} className="shrink-0" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl border border-border bg-background gap-3">
              <div>
                <strong className="text-xs font-semibold block text-foreground">Inactivity Session Timeout</strong>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Automatically log out session if idle to protect shared family or kitchen tablets.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant={sessionTimeout === 30 ? 'default' : 'outline'}
                  className="text-xs h-8 px-3 rounded-full"
                  onClick={() => handleSessionTimeoutChange(30)}
                >
                  30m
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={sessionTimeout === 60 ? 'default' : 'outline'}
                  className="text-xs h-8 px-3 rounded-full"
                  onClick={() => handleSessionTimeoutChange(60)}
                >
                  60m
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={sessionTimeout === 120 ? 'default' : 'outline'}
                  className="text-xs h-8 px-3 rounded-full"
                  onClick={() => handleSessionTimeoutChange(120)}
                >
                  2h
                </Button>
              </div>
            </div>

            {/* Active Devices Overview */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-secondary/30">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-semibold text-foreground inline-flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-background border border-border/60 flex items-center justify-center text-muted-foreground shrink-0">
                    <Laptop size={13} />
                  </span>
                  <span>Active Session</span>
                </span>
                <span className="text-[10px] text-sage font-bold uppercase tracking-wider bg-secondary px-2.5 py-0.5 rounded-full border border-border shrink-0">
                  Current Device
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pl-8">
                Connected via local browser · Local cache encrypted with AES storage wrapper.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Preferences Grid */}
      {activeTab === 'preferences' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Kitchen Atmosphere & Visual Environment */}
          <section className="bg-card border border-border p-4 sm:p-6 rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-2">
              <div>
                <h3 className="text-base sm:text-lg font-serif mb-0.5">
                  Kitchen Atmosphere
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Toggle between Morning Sunshine (6 AM–12 PM), Afternoon & Evening (12 PM–7 PM), and Peaceful Night (7 PM–6 AM).
                </p>
              </div>
              <div className="shrink-0 w-full sm:w-auto flex justify-start sm:justify-end">
                <ThemeSlider />
              </div>
            </div>
          </section>

          {/* Favorite Cuisines */}
          <section className="bg-card border border-border p-4 sm:p-6 rounded-2xl shadow-sm">
            <h3 className="text-base sm:text-lg font-serif mb-0.5">Favorite Cuisines</h3>
            <p className="text-xs text-muted-foreground mb-3 sm:mb-4">
              Recipes matching these traditions are boosted in your recommendations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {cuisines.map(c => {
                const active = currentUser.favoriteCuisines.includes(c);
                return (
                  <label
                    key={c}
                    className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border cursor-pointer transition-all ${
                      active ? 'border-clay bg-peach/40' : 'border-border bg-background'
                    }`}
                  >
                    <span className="text-xs font-medium">{c}</span>
                    <Switch checked={active} onCheckedChange={() => toggleCuisine(c)} />
                  </label>
                );
              })}
            </div>
          </section>

          {/* Dietary Patterns */}
          <section className="bg-card border border-border p-4 sm:p-6 rounded-2xl shadow-sm">
            <h3 className="text-base sm:text-lg font-serif mb-0.5">Dietary Patterns & Restrictions</h3>
            <p className="text-xs text-muted-foreground mb-3 sm:mb-4">
              Filter recipes according to plant-based, gluten-free, or high-protein lifestyle choices.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {diets.map(d => {
                const active = currentUser.dietaryPreferences.includes(d);
                return (
                  <label
                    key={d}
                    className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border cursor-pointer transition-all ${
                      active ? 'border-sage bg-secondary' : 'border-border bg-background'
                    }`}
                  >
                    <span className="text-xs font-medium">{d}</span>
                    <Switch checked={active} onCheckedChange={() => toggleDiet(d)} />
                  </label>
                );
              })}
            </div>
          </section>

          {/* Disliked Ingredients / Allergen Exclusions */}
          <section className="bg-card border border-border p-4 sm:p-6 rounded-2xl shadow-sm">
            <div className="mb-3.5">
              <h3 className="text-base sm:text-lg font-serif font-semibold text-foreground leading-snug">
                Allergen & Ingredient Exclusions
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Dishes containing these items will have their recommendation score lowered or flagged with a dietary caution.
              </p>
            </div>

            <form onSubmit={addDisliked} className="flex gap-2 w-full max-w-md mb-3">
              <div className="relative flex-1 min-w-0">
                <Input
                  placeholder="e.g. Peanuts, Shellfish, Cilantro…"
                  value={dislikedInput}
                  onChange={e => setDislikedInput(e.target.value)}
                  className="text-xs h-10 rounded-xl bg-background pr-3"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="rounded-xl bg-primary text-primary-foreground shadow-xs h-10 px-4 text-xs font-semibold shrink-0 gap-1.5"
              >
                <Plus size={15} /> Add
              </Button>
            </form>

            {/* Quick-add common suggestions */}
            <div className="mb-3.5">
              <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Quick-add common allergens:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['Peanuts', 'Shellfish', 'Cilantro', 'Dairy', 'Gluten', 'Pork'].map(allergen => {
                  const isAdded = currentUser.dislikedIngredients.includes(allergen);
                  return (
                    <button
                      key={allergen}
                      type="button"
                      disabled={isAdded}
                      onClick={() => {
                        if (!isAdded) {
                          updateUserProfile({
                            dislikedIngredients: [...currentUser.dislikedIngredients, allergen],
                          });
                          toast.success(`Added ${allergen} to exclusions`);
                        }
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                        isAdded
                          ? 'opacity-40 border-border bg-secondary cursor-not-allowed line-through'
                          : 'border-border/80 bg-background hover:bg-secondary text-foreground cursor-pointer active:scale-95'
                      }`}
                    >
                      + {allergen}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active exclusion chips */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
              {currentUser.dislikedIngredients.map(item => (
                <span
                  key={item}
                  className="bg-destructive/10 text-destructive text-xs px-3 py-1.5 rounded-full border border-destructive/25 inline-flex items-center gap-1.5 font-medium shadow-2xs"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeDisliked(item)}
                    className="w-4 h-4 rounded-full inline-flex items-center justify-center hover:bg-destructive/20 text-destructive transition-colors ml-0.5 cursor-pointer"
                    title={`Remove ${item}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {currentUser.dislikedIngredients.length === 0 && (
                <span className="text-xs text-muted-foreground italic py-1">
                  No active exclusions. All ingredients are permitted in recommendations.
                </span>
              )}
            </div>
          </section>

          {/* Clinical Health & Metabolic Intelligence Profiles */}
          <section className="bg-card border border-border p-4 sm:p-6 rounded-2xl shadow-sm">
            <div className="mb-3.5">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-8 h-8 rounded-xl bg-sage/15 text-sage flex items-center justify-center shrink-0 border border-sage/20 shadow-2xs">
                  <ShieldCheck size={17} />
                </div>
                <h3 className="text-base sm:text-lg font-serif font-semibold text-foreground leading-snug">
                  Clinical Health & Metabolic Conditions
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Personalize the culinary recommendation engine for specific medical or metabolic needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {healthConditionsList.map(h => {
                const active = currentUser.healthConditions.some(
                  c => c.toLowerCase() === h.id.toLowerCase() || c.toLowerCase() === h.label.toLowerCase()
                );
                return (
                  <div
                    key={h.id}
                    onClick={() => toggleHealth(h.id)}
                    className={`p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      active ? 'border-sage bg-sage/10 shadow-sm ring-1 ring-sage/30' : 'border-border bg-background hover:border-border/80'
                    }`}
                  >
                    <div className="mb-2">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <span className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                          {h.label}
                        </span>
                        <Switch
                          checked={active}
                          onCheckedChange={() => toggleHealth(h.id)}
                          onClick={e => e.stopPropagation()}
                          className="shrink-0"
                        />
                      </div>
                      <div className="mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-primary border border-border inline-block">
                          {h.badge}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                        {h.description}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-border/50 text-[10.5px] flex items-center justify-between gap-2">
                      <span className="text-muted-foreground inline-flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-sage' : 'bg-muted-foreground/40'}`}></span>
                        {active ? 'Protocol Active' : 'Protocol Standby'}
                      </span>
                      <span className="font-semibold text-primary shrink-0">
                        Adaptive Filter
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-muted-foreground mt-3.5 italic leading-relaxed">
              *RecipeVault clinical note: Health suggestions are generated algorithmically using nutritional data, glycemic analysis, and fiber thresholds. Always consult your healthcare provider or registered dietitian for individualized medical meal planning.
            </p>
          </section>
        </div>
      )}

      {/* Database Reset Action */}
      <div className="mt-8 pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-muted-foreground">
        <span>Relational DBMS Local Store · Referential Integrity Active</span>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs gap-1.5 hover:text-clay h-8"
          onClick={resetDatabase}
        >
          <RotateCcw size={13} /> Reset All Data to Demo Seed
        </Button>
      </div>
    </div>
  );
}