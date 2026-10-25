import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Sprout, ArrowUpRight, Check, ShoppingBag, Flame } from "lucide-react";
import { masterIngredients, type IngredientMaster, getIngredientShelfLifeDays } from "@/lib/recipes";
import { EmptyState, PageHeading } from "@/components/recipe-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useVault } from "@/components/vault-provider";
import { pageMeta } from "@/lib/metadata";

export const Route = createFileRoute("/ingredients")({
  component: Ingredients,
  head: () =>
    pageMeta(
      "Pantry",
      "Explore your pantry, semantic culinary profiles, regional aliases, tested substitutes, and storage science.",
    ),
});

function Ingredients() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [activeIngredient, setActiveIngredient] = useState<IngredientMaster | null>(null);
  const { items, pantry, togglePantryItem } = useVault();

  const categories = [
    "All categories",
    "Produce",
    "Dairy & Eggs",
    "Legumes",
    "Pantry & Spices",
    "Condiments",
    "Grains & Pasta",
    "Proteins",
  ];

  const filteredIngredients = masterIngredients.filter((i) => {
    if (selectedCategory !== "All categories" && i.category !== selectedCategory) return false;
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
        eyebrow="PANTRY & CULINARY ONTOLOGY"
        title="Your Pantry."
        description="Every ingredient carries stories, botanical origins, chemical pairings, and reliable substitutes. Stock your home pantry and explore culinary ingredients."
      />

      {/* Search & Category Filter Row */}
      <div className="flex flex-col md:flex-row gap-3 my-5 sm:my-6">
        <div className="search-input flex-1">
          <Search size={18} />
          <Input
            aria-label="Search pantry"
            placeholder="Search pantry by ingredient, regional alias (e.g. ceci, garbanzo), or flavor note…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Categories Strip - Hidden Scrollbar with Full Touch Scroll Functionality */}
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-1 px-0.5 no-scrollbar scroll-smooth">
          {categories.slice(0, 5).map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className={`rounded-full h-9 px-4 text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-all shadow-2xs active:scale-[0.98] ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-sm font-semibold"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Ingredient Catalog Grid */}
      <div className="space-y-3.5 sm:space-y-4">
        {filteredIngredients.map((ing) => {
          const inPantry = pantry.includes(ing.name);
          const recipesUsing = items.filter((r) =>
            r.ingredients.some(
              (i) =>
                i.name.toLowerCase() === ing.name.toLowerCase() ||
                ing.name.toLowerCase().includes(i.name.toLowerCase()),
            ),
          );

          return (
            <article
              key={ing.id}
              className="border border-border/80 bg-card rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-primary/40 transition-all flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="eyebrow">{ing.category}</span>
                  <button
                    type="button"
                    className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1.5 font-medium transition-all shadow-2xs active:scale-95 ${
                      inPantry
                        ? "bg-secondary border-sage text-primary font-semibold"
                        : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                    onClick={() => togglePantryItem(ing.name)}
                    title="Toggle in your home pantry"
                  >
                    {inPantry ? (
                      <Check size={12} className="text-emerald-600 shrink-0" />
                    ) : (
                      <ShoppingBag size={12} className="text-muted-foreground shrink-0" />
                    )}
                    <span>{inPantry ? "In Pantry ✓" : "+ Add to Pantry"}</span>
                  </button>
                </div>

                <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground tracking-tight">
                  {ing.name}
                </h2>
                <p className="aliases text-xs text-muted-foreground font-medium mb-2 italic">
                  Aliases: {ing.aliases}
                </p>

                <p className="text-xs sm:text-[13px] text-muted-foreground line-clamp-2 leading-relaxed mb-1">
                  {ing.flavor}
                </p>
              </div>

              <div className="pt-3 border-t border-border/70 flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted-foreground font-medium" suppressHydrationWarning>
                  In {recipesUsing.length} {recipesUsing.length === 1 ? "recipe" : "recipes"}
                </span>
                <Button
                  variant="link"
                  className="text-xs p-0 h-auto gap-1 text-primary hover:underline font-semibold"
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
              className="rounded-full bg-primary text-primary-foreground px-5 text-xs shadow-sm"
              onClick={() => {
                setQuery("");
                setSelectedCategory("All categories");
              }}
            >
              Reset Pantry Search
            </Button>
          }
        />
      )}

      {/* DETAILED INGREDIENT MODAL */}
      <Dialog open={Boolean(activeIngredient)} onOpenChange={() => setActiveIngredient(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto overflow-x-hidden">
          {activeIngredient && (
            <div className="space-y-4 pr-1 sm:pr-0">
              <div className="pr-10 sm:pr-8">
                <span className="eyebrow">{activeIngredient.category}</span>
                <DialogTitle className="text-2xl sm:text-3xl font-serif font-bold text-foreground mt-0.5">
                  {activeIngredient.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground italic mt-0.5">
                  Aliases: {activeIngredient.aliases}
                </DialogDescription>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <strong className="text-foreground block font-semibold mb-1">
                    Culinary Character & Flavor:
                  </strong>
                  <p className="text-muted-foreground leading-relaxed">{activeIngredient.flavor}</p>
                </div>

                <div className="bg-primary/5 p-3 sm:p-3.5 rounded-xl border border-primary/20">
                  <strong className="text-primary block font-semibold mb-1">
                    Reliable Substitute:
                  </strong>
                  <p className="text-foreground leading-relaxed">{activeIngredient.substitute}</p>
                </div>

                <div>
                  <strong className="text-foreground block font-semibold mb-1">Common Uses:</strong>
                  <p className="text-muted-foreground leading-relaxed">
                    {activeIngredient.commonUses}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <strong className="text-foreground block font-semibold">
                      Storage & Shelf Life:
                    </strong>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-primary border border-border shrink-0">
                      Est. Shelf Life: ~{getIngredientShelfLifeDays(activeIngredient.name)} days
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {activeIngredient.storage}
                  </p>
                </div>

                {/* Macro Nutrition per 100g - Clean Properly Spaced Text */}
                <div className="bg-card border border-border/80 p-3.5 sm:p-4 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <strong className="text-foreground text-xs font-semibold flex items-center gap-1.5">
                      <Flame size={14} className="text-clay shrink-0" />
                      <span>Nutritional Density</span>
                    </strong>
                    <span className="text-[10px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/60 tabular-nums">
                      per 100g
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center py-1">
                    <div>
                      <span className="text-base sm:text-lg font-bold font-serif text-foreground tabular-nums block leading-tight">
                        {activeIngredient.caloriesPer100g}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mt-1">
                        kcal
                      </span>
                    </div>
                    <div>
                      <span className="text-base sm:text-lg font-bold font-serif text-foreground tabular-nums block leading-tight">
                        {activeIngredient.proteinPer100g}g
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mt-1">
                        Protein
                      </span>
                    </div>
                    <div>
                      <span className="text-base sm:text-lg font-bold font-serif text-foreground tabular-nums block leading-tight">
                        {activeIngredient.carbsPer100g}g
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mt-1">
                        Carbs
                      </span>
                    </div>
                    <div>
                      <span className="text-base sm:text-lg font-bold font-serif text-foreground tabular-nums block leading-tight">
                        {activeIngredient.fatPer100g}g
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mt-1">
                        Fat
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recipes Featuring this ingredient */}
                <div className="pt-1">
                  <strong className="text-foreground block font-semibold mb-2">
                    Dishes Featuring this Ingredient:
                  </strong>
                  <div className="space-y-1.5">
                    {items
                      .filter((r) =>
                        r.ingredients.some(
                          (i) =>
                            i.name.toLowerCase() === activeIngredient.name.toLowerCase() ||
                            activeIngredient.name.toLowerCase().includes(i.name.toLowerCase()),
                        ),
                      )
                      .map((r) => (
                        <Button
                          key={r.id}
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full justify-between rounded-xl text-xs hover:border-primary/50"
                        >
                          <Link
                            to="/recipe/$id"
                            params={{ id: r.id }}
                            onClick={() => setActiveIngredient(null)}
                          >
                            <span className="truncate mr-2">
                              {r.title} ({r.cuisine} · {r.time} min)
                            </span>
                            <ArrowUpRight size={13} className="shrink-0" />
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
