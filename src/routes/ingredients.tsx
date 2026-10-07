import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Search, Sprout, ArrowUpRight, Check, Sparkles, ShoppingBag } from 'lucide-react';
import { masterIngredients, type IngredientMaster } from '@/lib/recipes';
import { PageHeading } from '@/components/recipe-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useVault } from '@/components/vault-provider';
import { pageMeta } from '@/lib/metadata';

export const Route = createFileRoute('/ingredients')({
  component: Ingredients,
  head: () =>
    pageMeta(
      'Ingredient Intelligence Library',
      'Explore semantic culinary profiles, regional aliases, tested substitutes, and storage science.'
    ),
});

function Ingredients() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All categories');
  const [activeIngredient, setActiveIngredient] = useState<IngredientMaster | null>(null);
  const { items, pantry, togglePantryItem } = useVault();

  const categories = [
    'All categories',
    'Produce',
    'Dairy & Eggs',
    'Legumes',
    'Pantry & Spices',
    'Condiments',
    'Grains & Pasta',
    'Proteins',
  ];

  const filteredIngredients = masterIngredients.filter(i => {
    if (selectedCategory !== 'All categories' && i.category !== selectedCategory) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        i.name.toLowerCase().includes(q) ||
        i.aliases.toLowerCase().includes(q) ||
        i.flavor.toLowerCase().includes(q) ||
        i.commonUses.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="standard-page">
      <PageHeading
        eyebrow="SEMANTIC KNOWLEDGE & CULINARY ONTOLOGY"
        title="Get to know your ingredients."
        description="Every ingredient carries stories, botanical origins, chemical pairings, and reliable substitutes. Treat them as first-class culinary objects."
      />

      {/* Search & Category Filter Row */}
      <div className="flex flex-col md:flex-row gap-3 my-6">
        <div className="search-input flex-1">
          <Search size={18} />
          <Input
            aria-label="Search ingredient library"
            placeholder="Search by ingredient, regional alias (e.g. ceci, garbanzo), or flavor note…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {categories.slice(0, 5).map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              className="rounded-full text-xs whitespace-nowrap"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Ingredient Catalog Grid */}
      <div className="ingredient-library">
        {filteredIngredients.map((ing, index) => {
          const inPantry = pantry.includes(ing.name);
          const recipesUsing = items.filter(r =>
            r.ingredients.some(
              i =>
                i.name.toLowerCase() === ing.name.toLowerCase() ||
                ing.name.toLowerCase().includes(i.name.toLowerCase())
            )
          );

          return (
            <article key={ing.id} className="knowledge-item flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="eyebrow">{ing.category}</span>
                  <button
                    type="button"
                    className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 transition-all ${
                      inPantry
                        ? 'bg-secondary border-sage text-primary font-medium'
                        : 'bg-card border-border text-muted-foreground hover:border-clay'
                    }`}
                    onClick={() => togglePantryItem(ing.name)}
                    title="Toggle in your home pantry"
                  >
                    {inPantry ? <Check size={12} /> : <ShoppingBag size={12} />}
                    {inPantry ? 'In My Pantry' : '+ Add to Pantry'}
                  </button>
                </div>

                <h2 className="text-2xl font-serif">{ing.name}</h2>
                <p className="aliases text-xs text-muted-foreground font-medium mb-3 italic">
                  {ing.aliases}
                </p>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                  {ing.flavor}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  In {recipesUsing.length} {recipesUsing.length === 1 ? 'recipe' : 'recipes'}
                </span>
                <Button
                  variant="link"
                  className="text-xs p-0 gap-1 text-clay hover:underline"
                  onClick={() => setActiveIngredient(ing)}
                >
                  Explore culinary profile <ArrowUpRight size={14} />
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      {filteredIngredients.length === 0 && (
        <EmptyState
          icon={Sprout}
          title="No matching ingredients discovered"
          description={`No ingredient match found for "${query}". Try searching for another botanical alias or clearing your category filters.`}
          actionLabel="Clear Filters"
          customAction={
            <Button
              className="rounded-full bg-clay text-white px-5 text-xs shadow-sm"
              onClick={() => {
                setQuery('');
                setSelectedCategory('All categories');
              }}
            >
              Reset Ingredient Search
            </Button>
          }
        />
      )}

      {/* DETAILED INGREDIENT MODAL */}
      <Dialog open={Boolean(activeIngredient)} onOpenChange={() => setActiveIngredient(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {activeIngredient && (
            <div className="space-y-4">
              <div>
                <span className="eyebrow">{activeIngredient.category}</span>
                <DialogTitle className="text-3xl font-serif mt-1">{activeIngredient.name}</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground italic">
                  Aliases: {activeIngredient.aliases}
                </DialogDescription>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <strong className="text-foreground block font-semibold mb-1">Culinary Character & Flavor:</strong>
                  <p className="text-muted-foreground leading-relaxed">{activeIngredient.flavor}</p>
                </div>

                <div className="bg-secondary p-3.5 rounded-2xl border border-border">
                  <strong className="text-primary block font-semibold mb-1">Reliable Substitute:</strong>
                  <p className="text-espresso leading-relaxed">{activeIngredient.substitute}</p>
                </div>

                <div>
                  <strong className="text-foreground block font-semibold mb-1">Common Uses:</strong>
                  <p className="text-muted-foreground leading-relaxed">{activeIngredient.commonUses}</p>
                </div>

                <div>
                  <strong className="text-foreground block font-semibold mb-1">Storage & Shelf Life:</strong>
                  <p className="text-muted-foreground leading-relaxed">{activeIngredient.storage}</p>
                </div>

                {/* Macro Nutrition per 100g */}
                <div className="bg-card border border-border p-3 rounded-2xl">
                  <strong className="text-foreground block font-semibold mb-2">
                    Nutritional Density (per 100g):
                  </strong>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <strong className="text-sm font-semibold tabular block">{activeIngredient.caloriesPer100g}</strong>
                      <span className="text-[10px] text-muted-foreground">kcal</span>
                    </div>
                    <div>
                      <strong className="text-sm font-semibold tabular block">{activeIngredient.proteinPer100g}g</strong>
                      <span className="text-[10px] text-muted-foreground">Protein</span>
                    </div>
                    <div>
                      <strong className="text-sm font-semibold tabular block">{activeIngredient.carbsPer100g}g</strong>
                      <span className="text-[10px] text-muted-foreground">Carbs</span>
                    </div>
                    <div>
                      <strong className="text-sm font-semibold tabular block">{activeIngredient.fatPer100g}g</strong>
                      <span className="text-[10px] text-muted-foreground">Fat</span>
                    </div>
                  </div>
                </div>

                {/* Recipes Featuring this ingredient */}
                <div className="pt-2">
                  <strong className="text-foreground block font-semibold mb-2">Dishes Featuring this Ingredient:</strong>
                  <div className="space-y-1.5">
                    {items
                      .filter(r =>
                        r.ingredients.some(
                          i =>
                            i.name.toLowerCase() === activeIngredient.name.toLowerCase() ||
                            activeIngredient.name.toLowerCase().includes(i.name.toLowerCase())
                        )
                      )
                      .map(r => (
                        <Button
                          key={r.id}
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full justify-between rounded-xl text-xs"
                        >
                          <Link
                            to="/recipe/$id"
                            params={{ id: r.id }}
                            onClick={() => setActiveIngredient(null)}
                          >
                            <span>{r.title} ({r.cuisine} · {r.time} min)</span>
                            <ArrowUpRight size={13} />
                          </Link>
                        </Button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}