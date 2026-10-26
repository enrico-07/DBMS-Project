import { createFileRoute } from '@tanstack/react-router';
import { PageHeading } from '@/components/recipe-card';
import { useVault, type ThemeMode } from '@/components/vault-provider';
import { ThemeSlider } from '@/components/theme-slider';
import { Button } from '@/components/ui/button';
import { pageMeta } from '@/lib/metadata';
import { Sun, Sunset, Moon, Clock, Compass, Database, RotateCcw, UserCheck, ShieldCheck } from 'lucide-react';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
  head: () =>
    pageMeta(
      'Atmosphere & Visual Settings · RecipeVault',
      'Personalize kitchen atmosphere themes, day/night schedules, and culinary visual environments.'
    ),
});

function SettingsPage() {
  const {
    theme,
    setTheme,
    currentUser,
    allUsers,
    switchUser,
    items,
    saved,
    plan,
    pantry,
    resetDatabase,
  } = useVault();

  const themes: Array<{
    id: ThemeMode;
    title: string;
    period: string;
    description: string;
    icon: typeof Sun;
    accent: string;
    badge: string;
  }> = [
    {
      id: 'morning',
      title: 'Morning Sunshine',
      period: '6:00 AM – 12:00 PM',
      description: 'Crisp morning daylight, fresh herb greens, golden dawn tangerines, and clean cool contrast for beginning your day.',
      icon: Sun,
      accent: 'text-amber-600 dark:text-amber-400',
      badge: 'Dawn Air & Dew',
    },
    {
      id: 'sunset',
      title: 'Afternoon & Evening',
      period: '12:00 PM – 7:00 PM',
      description: 'The signature Warm Pantry aesthetic with roasted espresso ink, soft cream backgrounds, and artisan clay terracotta.',
      icon: Sunset,
      accent: 'text-clay',
      badge: 'Warm Artisan Pantry',
    },
    {
      id: 'night',
      title: 'Peaceful Night',
      period: '7:00 PM – 6:00 AM',
      description: 'Cool midnight obsidian slate and gentle glowing moonbeam tones that are soothing and gentle on tired eyes.',
      icon: Moon,
      accent: 'text-orange-400',
      badge: 'Rest & Slumber',
    },
  ];

  return (
    <div className="standard-page settings-page max-w-4xl mx-auto w-full min-w-0 overflow-x-hidden">
      <PageHeading
        eyebrow="VISUAL ENVIRONMENT & TIME"
        title="Kitchen Atmosphere & Settings"
        description="Choose your preferred visual atmosphere or allow RecipeVault to automatically sync with your device's local clock."
      />

      {/* Main Interactive Atmosphere Controller */}
      <div className="bg-card border border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm my-4 sm:my-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-2xs">
                <Sun size={17} />
              </div>
              <h2 className="text-base sm:text-lg font-serif font-semibold text-foreground leading-snug">
                Active Kitchen Atmosphere
              </h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Instant site-wide palette shift across all pages, typography, and controls.
            </p>
          </div>
          <div className="shrink-0 w-full sm:w-auto flex justify-start sm:justify-end">
            <ThemeSlider />
          </div>
        </div>

        {/* Atmosphere Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5">
          {themes.map(t => {
            const Icon = t.icon;
            const isSelected = theme === t.id;

            return (
              <div
                key={t.id}
                role="button"
                tabIndex={0}
                onClick={() => setTheme(t.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setTheme(t.id);
                  }
                }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-secondary/60 shadow-sm ring-1 ring-primary'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-background/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="p-2 rounded-xl bg-background border border-border inline-flex shadow-2xs">
                      <Icon size={18} className={t.accent} />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-background px-2.5 py-0.5 rounded-full border border-border">
                      {t.badge}
                    </span>
                  </div>
                  <h3 className="font-serif text-base font-semibold text-foreground mb-0.5">{t.title}</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2">
                    <Clock size={11} className="shrink-0" />
                    <span>{t.period}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary inline-flex items-center gap-1.5">
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>}
                    {isSelected ? 'Currently Active' : 'Select Atmosphere'}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {isSelected ? 'In use' : 'Tap to switch'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Circadian Rhythm Sync Banner */}
      <div className="bg-secondary/40 border border-border p-4 sm:p-5 rounded-2xl">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-2xs">
            <Compass size={17} />
          </div>
          <h3 className="text-sm sm:text-base font-serif font-semibold text-foreground leading-snug">
            Circadian Rhythm Sync
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          RecipeVault continuously synchronizes with your device's local clock to illuminate your kitchen in harmony with the real world, while preserving your freedom to switch manually anytime.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2.5 border-t border-border/50 text-[11px]">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-background/70 border border-border/50">
            <Sun size={13} className="text-amber-500 shrink-0" />
            <span className="font-medium">Morning: <span className="text-muted-foreground">6 AM – 12 PM</span></span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-background/70 border border-border/50">
            <Sunset size={13} className="text-clay shrink-0" />
            <span className="font-medium">Afternoon: <span className="text-muted-foreground">12 PM – 7 PM</span></span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-background/70 border border-border/50">
            <Moon size={13} className="text-orange-400 shrink-0" />
            <span className="font-medium">Night: <span className="text-muted-foreground">7 PM – 6 AM</span></span>
          </div>
        </div>
      </div>

      {/* Active Cook Persona Section */}
      <div className="bg-card border border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm my-4 sm:my-6">
        <div className="pb-3.5 border-b border-border">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-2xs">
              <UserCheck size={17} />
            </div>
            <h2 className="text-base sm:text-lg font-serif font-semibold text-foreground leading-snug">
              Active Cook Persona
            </h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Switch test accounts to preview meal plans, dietary filters, and collections across different culinary profiles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-4">
          {allUsers.map(user => {
            const isUserActive = currentUser.id === user.id;
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => switchUser(user.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  isUserActive
                    ? 'border-primary bg-secondary/60 shadow-sm ring-1 ring-primary'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-background/80'
                }`}
              >
                <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0 text-xs font-serif shadow-2xs">
                  {user.avatar}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-serif font-semibold text-xs sm:text-sm truncate text-foreground">
                      {user.name}
                    </span>
                    {isUserActive && (
                      <span className="text-[9.5px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0 border border-primary/25">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">{user.role}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Relational Database & State Management Section */}
      <div className="bg-card border border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm mb-12">
        <div className="pb-3.5 border-b border-border">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-2xs">
              <Database size={17} />
            </div>
            <h2 className="text-base sm:text-lg font-serif font-semibold text-foreground leading-snug">
              Relational Database & Storage State
            </h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">
            RecipeVault uses local-first relational caching synchronized with PostgreSQL schemas.
          </p>
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck size={13} />
              <span>Schema Synchronized</span>
            </span>
          </div>
        </div>

        {/* Database Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 sm:my-5">
          <div className="p-3 sm:p-3.5 rounded-xl border border-border bg-secondary/30">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-0.5 tracking-wider">
              Total Recipes
            </span>
            <span className="text-xl font-bold font-serif text-primary block tabular">{items.length}</span>
          </div>
          <div className="p-3 sm:p-3.5 rounded-xl border border-border bg-secondary/30">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-0.5 tracking-wider">
              Saved in Vault
            </span>
            <span className="text-xl font-bold font-serif text-primary block tabular">{saved.length}</span>
          </div>
          <div className="p-3 sm:p-3.5 rounded-xl border border-border bg-secondary/30">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-0.5 tracking-wider">
              Planner Items
            </span>
            <span className="text-xl font-bold font-serif text-primary block tabular">{plan.length}</span>
          </div>
          <div className="p-3 sm:p-3.5 rounded-xl border border-border bg-secondary/30">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-0.5 tracking-wider">
              Pantry Stocked
            </span>
            <span className="text-xl font-bold font-serif text-primary block tabular">{pantry.length}</span>
          </div>
        </div>

        {/* Reset Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3.5 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Want to restart your evaluation demo or restore all initial recipes and planner slots?
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={resetDatabase}
            className="w-full sm:w-auto h-9 text-xs text-destructive hover:bg-destructive/10 border-destructive/25 rounded-full font-semibold gap-1.5 shrink-0 justify-center cursor-pointer"
          >
            <RotateCcw size={13} />
            Reset Database State
          </Button>
        </div>
      </div>
    </div>
  );
}
