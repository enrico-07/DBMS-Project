import { createFileRoute } from '@tanstack/react-router';
import { PageHeading } from '@/components/recipe-card';
import { useVault, type ThemeMode } from '@/components/vault-provider';
import { ThemeSlider } from '@/components/theme-slider';
import { pageMeta } from '@/lib/metadata';
import { Sun, Sunset, Moon, Sparkles, Clock, Compass } from 'lucide-react';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
  head: () =>
    pageMeta(
      'Atmosphere & Visual Settings · RecipeVault',
      'Personalize kitchen atmosphere themes, day/night schedules, and culinary visual environments.'
    ),
});

function SettingsPage() {
  const { theme, setTheme } = useVault();

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
      title: 'Afternoon & Sunset',
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
    <div className="standard-page max-w-4xl mx-auto">
      <PageHeading
        eyebrow="VISUAL ENVIRONMENT & TIME"
        title="Kitchen Atmosphere & Settings"
        description="Choose your preferred visual atmosphere or allow RecipeVault to automatically sync with your device's local clock."
      />

      {/* Main Interactive Atmosphere Controller */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-sm my-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-primary" />
              <h2 className="text-lg font-serif">Active Kitchen Atmosphere</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Instant site-wide palette shift across all pages, typography, and controls.
            </p>
          </div>
          <ThemeSlider />
        </div>

        {/* Atmosphere Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
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
                className={`p-5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-secondary/60 shadow-sm ring-1 ring-primary'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-background/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2 rounded-xl bg-background border border-border inline-flex">
                      <Icon size={18} className={t.accent} />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-background px-2.5 py-0.5 rounded-full border border-border">
                      {t.badge}
                    </span>
                  </div>
                  <h3 className="font-serif text-base mb-0.5">{t.title}</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2">
                    <Clock size={11} />
                    <span>{t.period}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">
                    {isSelected ? '● Currently Active' : 'Select Atmosphere'}
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

      {/* Auto-schedule explanation banner */}
      <div className="bg-secondary/40 border border-border p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="p-3 bg-card border border-border rounded-xl shrink-0">
          <Compass size={20} className="text-primary" />
        </div>
        <div className="text-xs text-muted-foreground leading-relaxed flex-1">
          <strong className="text-foreground font-semibold block text-sm mb-0.5 font-serif">
            Circadian Rhythm Sync
          </strong>
          RecipeVault continuously observes your local system time (Morning: 6 AM–12 PM, Afternoon: 12 PM–7 PM, Night: 7 PM–6 AM) to automatically illuminate your kitchen in harmony with the real world, while preserving your freedom to switch atmospheres manually whenever you desire.
        </div>
      </div>
    </div>
  );
}
