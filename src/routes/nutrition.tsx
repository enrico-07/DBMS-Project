import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { HeartPulse, ArrowUpRight, Scale, ShieldCheck, Coins, ChevronDown, Check } from 'lucide-react';
import { PageHeading, RecipeCard } from '@/components/recipe-card';
import { useVault } from '@/components/vault-provider';
import { pageMeta } from '@/lib/metadata';
import { nutritionFAQs, evaluateRecipeHealthConditions, calculateRecipeCost } from '@/lib/recipes';
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
      <div className="wellbeing-note rounded-2xl p-4 sm:p-5 my-4 sm:my-6 border border-border bg-card/60 shadow-2xs space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={16} />
          </div>
          <h3 className="text-xs font-semibold text-foreground tracking-tight">
            Informational Wellness & Non-Diagnostic Boundary
          </h3>
        </div>
        <p className="text-[11.5px] sm:text-xs text-muted-foreground leading-relaxed pl-0 sm:pl-9.5">
          Nutritional metrics in RecipeVault are approximations derived from baseline ingredient references.
          They are intended for everyday home cooking and meal exploration, not clinical treatment or diagnostic medical advice.
        </p>
      </div>

      {/* Side-by-Side Recipe Comparison Tool */}
      <section className="bg-card border border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm my-6 sm:my-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <span className="eyebrow flex items-center gap-1.5 text-[11px] font-bold text-primary tracking-wider uppercase">
              <Scale size={13} /> Comparative Analysis
            </span>
            <h2 className="text-lg sm:text-2xl font-serif mt-0.5 text-foreground">
              Side-by-Side Nutrition Comparison
            </h2>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground uppercase tracking-wider self-start sm:self-auto border border-border/50">
            Per Serving
          </span>
        </div>

        {/* Recipe Pickers */}
        <div className="comparison-selectors grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-5">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block shrink-0" />
              <span>Primary Dish (A)</span>
            </label>
            <select
              aria-label="First recipe to compare"
              className="w-full text-xs h-10 px-3 rounded-xl border border-border bg-background shadow-2xs font-medium focus:ring-1 focus:ring-primary cursor-pointer truncate"
              value={firstId}
              onChange={e => setFirstId(e.target.value)}
              suppressHydrationWarning
            >
              {items.map(r => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.calories} kcal · {r.protein}g protein)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sage inline-block shrink-0" />
              <span>Compare Against (B)</span>
            </label>
            <select
              aria-label="Second recipe to compare"
              className="w-full text-xs h-10 px-3 rounded-xl border border-border bg-background shadow-2xs font-medium focus:ring-1 focus:ring-primary cursor-pointer truncate"
              value={secondId}
              onChange={e => setSecondId(e.target.value)}
              suppressHydrationWarning
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
        <div className="space-y-3 sm:space-y-3.5">
          {nutrients.map(({ key, label, unit, max }) => {
            const valA = (recipeA as any)?.[key] || 0;
            const valB = (recipeB as any)?.[key] || 0;
            const pctA = Math.min((valA / max) * 100, 100);
            const pctB = Math.min((valB / max) * 100, 100);

            return (
              <div key={key} className="bg-background border border-border p-3 sm:p-4 rounded-2xl shadow-2xs space-y-2.5">
                {/* Nutrient Header */}
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="font-semibold text-xs sm:text-sm text-foreground">{label}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">Daily ref: {max} {unit}</span>
                </div>

                {/* Dish A Metric & Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate max-w-[200px] sm:max-w-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      <span className="truncate font-medium">{recipeA?.title || 'Primary Dish'}</span>
                    </span>
                    <strong className="text-primary font-bold shrink-0 tabular font-mono">
                      {valA} {unit}
                    </strong>
                  </div>
                  <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500 rounded-full"
                      style={{ width: `${pctA}%` }}
                    />
                  </div>
                </div>

                {/* Dish B Metric & Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate max-w-[200px] sm:max-w-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sage shrink-0" />
                      <span className="truncate font-medium">{recipeB?.title || 'Compare Dish'}</span>
                    </span>
                    <strong className="text-sage font-bold shrink-0 tabular font-mono">
                      {valB} {unit}
                    </strong>
                  </div>
                  <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
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

        {/* Health & Economics Comparative Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 mt-6 pt-5 border-t border-border/60">
          {[
            { recipe: recipeA, color: 'primary', label: 'Primary Dish (A)', dotClass: 'bg-primary' },
            { recipe: recipeB, color: 'sage', label: 'Compare Against (B)', dotClass: 'bg-sage' },
          ].map(({ recipe, color, label: dishLabel, dotClass }, i) => (
            <div key={i} className="p-3.5 sm:p-4 rounded-2xl bg-background border border-border shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 text-muted-foreground">
                  <span className={`w-2 h-2 rounded-full ${dotClass}`} /> {dishLabel}
                </span>
                {recipe && (
                  <Link
                    to="/recipe/$id"
                    params={{ id: recipe.id }}
                    className="text-[11px] text-primary hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
                  >
                    View <ArrowUpRight size={12} />
                  </Link>
                )}
              </div>

              <h4 className="font-serif font-semibold text-sm sm:text-base text-foreground leading-snug">
                {recipe?.title || 'No recipe selected'}
              </h4>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-muted/30 border border-border/50 rounded-xl p-2.5">
                  <span className="text-[10.5px] text-muted-foreground block mb-0.5 font-medium">Net Carbs</span>
                  <strong className="text-sm font-mono text-foreground">
                    {Math.max(0, (recipe?.carbs ?? 0) - (recipe?.fiber ?? 0))}g
                  </strong>
                </div>
                <div className="bg-muted/30 border border-border/50 rounded-xl p-2.5">
                  <span className="text-[10.5px] text-muted-foreground block mb-0.5 font-medium">Est. Cost / Serving</span>
                  <strong className="text-sm font-mono text-primary font-bold">
                    ${recipe ? calculateRecipeCost(recipe).costPerServing.toFixed(2) : '0.00'}
                  </strong>
                </div>
              </div>

              {/* Health Badges */}
              <div className="pt-1 border-t border-border/40">
                <span className="text-[10.5px] text-muted-foreground font-semibold block mb-1.5">
                  Health & Diet Suitability:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {recipe && evaluateRecipeHealthConditions(recipe).filter(h => h.isMatch).length > 0 ? (
                    evaluateRecipeHealthConditions(recipe)
                      .filter(h => h.isMatch)
                      .slice(0, 3)
                      .map(h => (
                        <span
                          key={h.conditionId}
                          className="text-[10.5px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-2xs"
                        >
                          <Check size={11} className="text-emerald-600 dark:text-emerald-400" />
                          {h.badge}
                        </span>
                      ))
                  ) : (
                    <span className="text-[10.5px] text-muted-foreground italic">General Balanced Profile</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* High-Protein & Plant-Powered Highlights */}
      <section className="recipe-section my-8 sm:my-10">
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
      <section className="faq-section bg-card border border-border p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-sm my-8 sm:my-10">
        <div className="mb-4 sm:mb-6">
          <span className="eyebrow">
            CULINARY SCIENCE & NUTRITION
          </span>
          <h2 className="text-xl sm:text-2xl font-serif mt-1">Frequently Asked Questions</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Understanding cooking chemistry, macronutrients, and portion scaling.
          </p>
        </div>

        <div className="space-y-2.5 sm:space-y-3">
          {nutritionFAQs.map(faq => (
            <details
              key={faq.id}
              className="group border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-4 bg-background transition-all open:bg-secondary/40"
            >
              <summary className="font-serif text-sm sm:text-base font-medium cursor-pointer flex items-center justify-between gap-3 select-none py-0.5">
                <span>{faq.question}</span>
                <ChevronDown size={16} className="text-muted-foreground group-open:rotate-180 transition-transform shrink-0" />
              </summary>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2.5 pt-2.5 border-t border-border">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}