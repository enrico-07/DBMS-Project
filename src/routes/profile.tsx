import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  User,
  Heart,
  Calendar,
  BookOpen,
  MessageSquare,
  Sparkles,
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
} from 'lucide-react';
import { PageHeading } from '@/components/recipe-card';
import { useVault } from '@/components/vault-provider';
import { ThemeSlider } from '@/components/theme-slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { pageMeta } from '@/lib/metadata';
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
  const healthFilters = ['Heart-Healthy / Balanced', 'Muscle Growth / Fitness', 'Anti-inflammatory', 'Low Sodium'];

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
    <div className="standard-page profile-page max-w-4xl mx-auto">
      <PageHeading
        eyebrow="ACCOUNT, SECURITY & PREFERENCES"
        title="Kitchen Profile & Account Settings"
        description="Fine-tune your personal identity, login credentials, culinary tastes, and dietary intelligence rules."
        action={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="rounded-full gap-1.5 text-xs">
              <Link to="/login">
                <LogIn size={14} /> Switch / Register
              </Link>
            </Button>
          </div>
        }
      />

      {/* Active User Persona Banner */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-sm my-6 flex flex-col md:flex-row items-center gap-6">
        <span className="avatar w-16 h-16 text-2xl shrink-0">{currentUser.avatar}</span>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
            <h2 className="text-2xl font-serif">{currentUser.name}</h2>
            <span className="text-xs bg-secondary text-primary px-3 py-1 rounded-full font-medium inline-block w-fit mx-auto md:mx-0">
              {currentUser.role}
            </span>
            {currentUser.loginMethod && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-peach/60 text-clay border border-clay/20 w-fit mx-auto md:mx-0">
                {currentUser.loginMethod === 'google' ? 'Google Account Connected' : 'Email Verified'}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground max-w-lg mb-2">{currentUser.bio}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[11px] text-muted-foreground">
            <span>{currentUser.email}</span>
            {currentUser.phone && <span>· {currentUser.phone}</span>}
            {currentUser.location && <span>· {currentUser.location}</span>}
          </div>
        </div>

        {/* Live Relational Stats */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 text-center shrink-0">
          <div>
            <strong className="text-xl font-serif text-clay block tabular">{saved.length}</strong>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase">Saved</span>
          </div>
          <div>
            <strong className="text-xl font-serif text-clay block tabular">{plan.length}</strong>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase">Planned</span>
          </div>
          <div>
            <strong className="text-xl font-serif text-clay block tabular">
              {items.filter(r => r.createdBy === currentUser.id).length}
            </strong>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase">Created</span>
          </div>
        </div>
      </div>

      {/* Quick Switch Demo Personas Section */}
      <div className="bg-secondary/60 border border-border p-5 rounded-2xl mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={13} /> Quick-Switch Academic Personas
          </span>
          <span className="text-[11px] text-muted-foreground">
            Instantly view distinct personalized shelves
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {allUsers.slice(0, 3).map(u => (
            <button
              key={u.id}
              type="button"
              className={`p-3 rounded-xl border text-left transition-all ${
                currentUser.id === u.id
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
              <div className="flex items-center gap-2 mb-1">
                <span className="avatar w-6 h-6 text-xs">{u.avatar}</span>
                <strong className="text-xs font-semibold">{u.name}</strong>
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                {u.bio}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border mb-6 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-clay text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-card'
          }`}
        >
          <User size={14} /> Personal Details & Identity
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'bg-clay text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-card'
          }`}
        >
          <Shield size={14} /> Security & Account Credentials
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'preferences'
              ? 'bg-clay text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-card'
          }`}
        >
          <Sliders size={14} /> Culinary Tastes & Exclusions
        </button>
      </div>

      {/* TAB 1: Personal Details Form */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSavePersonal} className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-serif">Personal Information</h3>
                <p className="text-xs text-muted-foreground">
                  Update your display name, contact coordinates, and culinary bio.
                </p>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Joined: {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Active Member'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Chef Display Name</label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Culinary Title / Specialty</label>
                <Input
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Plant-forward Home Cook"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Contact Phone</label>
                <Input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 349-2910"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Kitchen Location</label>
                <Input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Portland, Oregon"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Cooking Skill Level</label>
                <select
                  value={cookingSkill}
                  onChange={e => setCookingSkill(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-foreground">Kitchen Bio & Cooking Story</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Tell other cooks about your favorite flavors and kitchen rituals…"
              />
            </div>

            <div className="flex justify-end pt-3">
              <Button type="submit" className="rounded-full bg-clay text-white gap-1.5 text-xs">
                <Save size={14} /> Save Profile Changes
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: Security & Credentials */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Password update form */}
          <form onSubmit={handleUpdatePassword} className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-serif flex items-center gap-2">
                  <KeyRound size={16} className="text-clay" />
                  Password & Authentication
                </h3>
                <p className="text-xs text-muted-foreground">
                  Update your security passphrase for local and device authentication.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Current Passphrase</label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">New Passphrase</label>
                <Input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">Confirm New Passphrase</label>
                <Input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="text-xs max-w-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" className="rounded-full bg-clay text-white gap-1.5 text-xs">
                <Lock size={14} /> Update Security Passphrase
              </Button>
            </div>
          </form>

          {/* Two-Factor Authentication & Session Settings */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-5">
            <h3 className="text-lg font-serif flex items-center gap-2">
              <ShieldCheck size={16} className="text-sage" />
              Advanced Security & Session Management
            </h3>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
              <div>
                <strong className="text-xs font-semibold block text-foreground">Two-Factor Authentication (2FA)</strong>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Require one-time verification codes when logging in from unrecognized browsers or mobile devices.
                </p>
              </div>
              <Switch checked={twoFactor} onCheckedChange={handleToggle2FA} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-background gap-3">
              <div>
                <strong className="text-xs font-semibold block text-foreground">Inactivity Session Timeout</strong>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Automatically log out session if idle to protect shared family or kitchen tablets.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={sessionTimeout === 30 ? 'default' : 'outline'}
                  className="text-xs h-8 rounded-full"
                  onClick={() => handleSessionTimeoutChange(30)}
                >
                  30m
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={sessionTimeout === 60 ? 'default' : 'outline'}
                  className="text-xs h-8 rounded-full"
                  onClick={() => handleSessionTimeoutChange(60)}
                >
                  60m
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={sessionTimeout === 120 ? 'default' : 'outline'}
                  className="text-xs h-8 rounded-full"
                  onClick={() => handleSessionTimeoutChange(120)}
                >
                  2h
                </Button>
              </div>
            </div>

            {/* Active Devices Overview */}
            <div className="p-4 rounded-xl border border-border bg-secondary/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Laptop size={14} className="text-muted-foreground" /> Active Session
                </span>
                <span className="text-[10px] text-sage font-bold uppercase tracking-wider bg-secondary px-2 py-0.5 rounded-full border border-border">
                  Current Device
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Connected via Chrome / Desktop · Local browser cache encrypted with AES storage wrapper.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Preferences Grid */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          {/* Kitchen Atmosphere & Visual Environment */}
          <section className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-serif mb-1 flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" />
                  Kitchen Atmosphere
                </h3>
                <p className="text-xs text-muted-foreground">
                  Toggle between Morning Sunshine (6 AM–12 PM), Afternoon & Sunset (12 PM–7 PM), and Peaceful Night (7 PM–6 AM).
                </p>
              </div>
              <ThemeSlider />
            </div>
          </section>

          {/* Favorite Cuisines */}
          <section className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-serif mb-1">Favorite Cuisines</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Recipes matching these traditions are boosted in your recommendations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {cuisines.map(c => {
                const active = currentUser.favoriteCuisines.includes(c);
                return (
                  <label
                    key={c}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
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
          <section className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-serif mb-1">Dietary Patterns & Restrictions</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Filter recipes according to plant-based, gluten-free, or high-protein lifestyle choices.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {diets.map(d => {
                const active = currentUser.dietaryPreferences.includes(d);
                return (
                  <label
                    key={d}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
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
          <section className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-serif mb-1">Allergen & Disliked Ingredient Exclusions</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Dishes containing these ingredients will have their recommendation score lowered or flagged.
            </p>

            <form onSubmit={addDisliked} className="flex gap-2 max-w-md mb-4">
              <Input
                placeholder="e.g. Peanuts, Cilantro, Shellfish…"
                value={dislikedInput}
                onChange={e => setDislikedInput(e.target.value)}
                className="text-xs"
              />
              <Button type="submit" size="sm" className="rounded-full bg-clay text-white">
                <Plus size={14} className="mr-1" /> Add
              </Button>
            </form>

            <div className="flex flex-wrap gap-2">
              {currentUser.dislikedIngredients.map(item => (
                <span
                  key={item}
                  className="bg-destructive/10 text-destructive text-xs px-3 py-1 rounded-full border border-destructive/20 flex items-center gap-1.5"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeDisliked(item)}
                    className="hover:font-bold ml-1 text-destructive"
                    title={`Remove ${item}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {currentUser.dislikedIngredients.length === 0 && (
                <span className="text-xs text-muted-foreground italic">
                  No active exclusions. You will see all recipes.
                </span>
              )}
            </div>
          </section>

          {/* Health-Oriented Wellness Profiles */}
          <section className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={18} className="text-sage" />
              <h3 className="text-lg font-serif">Wellness & Nutritional Goals</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Informational filters to highlight recipes matching specific wellness aims.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {healthFilters.map(h => {
                const active = currentUser.healthConditions.includes(h);
                return (
                  <label
                    key={h}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      active ? 'border-sage bg-secondary' : 'border-border bg-background'
                    }`}
                  >
                    <span className="text-xs font-medium">{h}</span>
                    <Switch checked={active} onCheckedChange={() => toggleHealth(h)} />
                  </label>
                );
              })}
            </div>

            <p className="text-[11px] text-muted-foreground mt-4 italic">
              *RecipeVault informational disclaimer: Wellness goals are filtered strictly based on publicly available nutritional benchmarks and do not constitute clinical guidance.
            </p>
          </section>
        </div>
      )}

      {/* Database Reset Action */}
      <div className="mt-10 pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>Relational DBMS Local Store · Referential Integrity Active</span>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs gap-1 hover:text-clay"
          onClick={resetDatabase}
        >
          <RotateCcw size={13} /> Reset All Data to Demo Seed
        </Button>
      </div>
    </div>
  );
}