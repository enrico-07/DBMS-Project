import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { HeartPulse, ArrowUpRight, Scale, Sparkles, ShieldCheck } from 'lucide-react';
import { PageHeading, RecipeCard } from '@/components/recipe-card';
import { useVault } from '@/components/vault-provider';
import { pageMeta } from '@/lib/metadata';
import { nutritionFAQs } from '@/lib/recipes';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/nutrition')({
  component: Nutrition,
  head: () =>
    pageMeta(
      'Nutrition & Wellbeing Intelligence',
      'Compare illustrative recipe nutrition, analyze macronutrient balance, and explore culinary science FAQs.'
    ),
});

function Nutrition() {
  const { items } = useVault();
  const [firstId, setFirstId] = useState(items[0]?.id ?? '');
  const [secondId, setSecondId] = useState(items[1]?.id ?? items[0]?.id ?? '');

  const recipeA = items.find(r => r.id === firstId);
  const recipeB = items.find(r => r.id === secondId);

  const nutrients = [
    { key: 'calories', label: 'Energy (Calories)', unit: 'kcal', max: 800 },
    { key: 'protein', label: 'Protein', unit: 'g', max: 60 },
    { key: 'carbs', label: 'Carbohydrates', unit: 'g', max: 100 },
    { key: 'fat', label: 'Total Fat', unit: 'g', max: 50 },
    { key: 'fiber', label: 'Dietary Fiber', unit: 'g', max: 15 },
  ] as const;

  return (
    <div className="standard-page">
      <PageHeading
        eyebrow="CULINARY NOURISHMENT & MACRO INTELLIGENCE"
        title="Understand what’s on your plate."
        description="Transparent nutritional data, side-by-side recipe comparisons, and culinary science insights to help you eat well without losing the joy of cooking."
      />

      {/* Medical Boundary & Safety Notice */}
      <div className="wellbeing-note rounded-2xl flex items-start gap-4 p-5 my-6 border border-border shadow-sm">
        <ShieldCheck size={22} className="text-sage shrink-0 mt-0.5" />
        <div>
          <strong className="text-xs font-semibold block text-espresso mb-1">
            Informational Wellness & Non-Diagnostic Boundary
          </strong>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Nutritional metrics in RecipeVault are approximations derived from baseline ingredient references.
            They are intended for everyday home cooking and meal exploration, not clinical treatment or diagnostic medical advice.
          </p>
        </div>
      </div>

      {/* Side-by-Side Recipe Comparison Tool */}
      <section className="bg-card border border-border p-6 rounded-3xl shadow-sm my-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="eyebrow flex items-center gap-1.5">
              <Scale size={13} /> COMPARATIVE ANALYSIS
            </span>
            <h2 className="text-2xl font-serif mt-1">Side-by-Side Nutrition Comparison</h2>
          </div>
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            PER SERVING
          </span>
        </div>

        {/* Recipe Pickers */}
        <div className="comparison-selectors grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Primary Dish
            </label>
            <select
              aria-label="First recipe to compare"
              className="w-full text-xs p-3 rounded-xl border border-border bg-background"
              value={firstId}
              onChange={e => setFirstId(e.target.value)}
            >
              {items.map(r => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.calories} kcal · {r.protein}g protein)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Compare Against
            </label>
            <select
              aria-label="Second recipe to compare"
              className="w-full text-xs p-3 rounded-xl border border-border bg-background"
              value={secondId}
              onChange={e => setSecondId(e.target.value)}
            >
              {items.map(r => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.calories} kcal · {r.protein}g protein)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Visualizer with Progress Bars */}
        <div className="space-y-4">
          {nutrients.map(({ key, label, unit, max }) => {
            const valA = (recipeA as any)?.[key] || 0;
            const valB = (recipeB as any)?.[key] || 0;
            const pctA = Math.min((valA / max) * 100, 100);
            const pctB = Math.min((valB / max) * 100, 100);

            return (
              <div key={key} className="bg-background border border-border p-4 rounded-2xl">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span>{label}</span>
                  <div className="flex gap-6 tabular">
                    <span className="text-clay font-bold">
                      {recipeA?.title.slice(0, 16)}…: {valA} {unit}
                    </span>
                    <span className="text-sage font-bold">
                      {recipeB?.title.slice(0, 16)}…: {valB} {unit}
                    </span>
                  </div>
                </div>

                {/* Comparative Dual Progress Bars */}
                <div className="space-y-1.5">
                  <div className="h-2 w-full bg-border/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-clay transition-all duration-500 rounded-full"
                      style={{ width: `${pctA}%` }}
                    />
                  </div>
                  <div className="h-2 w-full bg-border/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sage transition-all duration-500 rounded-full"
                      style={{ width: `${pctB}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* High-Protein & Plant-Powered Highlights */}
      <section className="recipe-section my-10">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PROTEIN-FOCUSED NOURISHMENT</span>
            <h2>Energizing Dishes for Recovery & Strength</h2>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
            <Link to="/">View all</Link>
          </Button>
        </div>

        <div className="recipe-grid">
          {items
            .filter(r => r.protein >= 15)
            .slice(0, 3)
            .map(r => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
        </div>
      </section>

      {/* Culinary & Nutrition FAQs */}
      <section className="faq-section bg-card border border-border p-8 rounded-3xl shadow-sm my-10">
        <div className="mb-6">
          <span className="eyebrow flex items-center gap-1.5">
            <Sparkles size={14} /> CULINARY SCIENCE & NUTRITION
          </span>
          <h2 className="text-2xl font-serif mt-1">Frequently Asked Questions</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Understanding cooking chemistry, macronutrients, and portion scaling.
          </p>
        </div>

        <div className="space-y-3">
          {nutritionFAQs.map(faq => (
            <details
              key={faq.id}
              className="group border border-border rounded-2xl p-4 bg-background transition-all open:bg-secondary/40"
            >
              <summary className="font-serif text-base font-medium cursor-pointer flex items-center justify-between">
                <span>{faq.question}</span>
                <span className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="text-xs text-muted-foreground leading-relaxed mt-3 pt-3 border-t border-border">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}