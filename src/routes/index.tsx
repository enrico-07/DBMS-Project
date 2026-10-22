import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowRight,
  Clock,
  Leaf,
  Sun,
  Soup,
  Utensils,
  Cookie,
  Heart,
  ShoppingBag,
  Flame,
  Check,
  X,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVault } from '@/components/vault-provider';
import { RecipeCard, EmptyState } from '@/components/recipe-card';
import { RecipeGridSkeleton } from '@/components/ui/skeleton-loaders';
import {
  calculatePantryMatch,
  calculateRecommendationScore,
  evaluatePantryFreshness,
  evaluateRecipeHealthConditions,
} from '@/lib/recipes';
import pasta from '@/assets/lemon-pasta.jpg';

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: 'Discover Recipes · RecipeVault' },
      { name: 'description', content: 'A warm, database-driven culinary shelf. Discover recipes, match pantry ingredients, and cook with joy.' },
    ],
  }),
});

function Index() {
  const { items, currentUser, pantry, pantryStockDates, togglePantryItem } = useVault();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All recipes');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [diet, setDiet] = useState('All diets');
  const [time, setTime] = useState('Any time');
  const [cuisineFilter, setCuisineFilter] = useState('All cuisines');
  const [sort, setSort] = useState('Recommended');
  const [pantryMatchOnly, setPantryMatchOnly] = useState(false);
  const [healthMatchOnly, setHealthMatchOnly] = useState(false);
  const [expiringOnly, setExpiringOnly] = useState(false);

  // Freshness Radar Evaluation
  const pantryFreshness = useMemo(() => {
    return evaluatePantryFreshness(pantry, pantryStockDates);
  }, [pantry, pantryStockDates]);

  const expiringSoonItems = useMemo(() => {
    return pantryFreshness.filter(item => item.status === 'expiring' || item.status === 'use-soon');
  }, [pantryFreshness]);

  // Common pantry ingredients to toggle quickly
  const quickPantryOptions = [
    'Artisan Pasta',
    'Extra Virgin Olive Oil',
    'Garlic',
    'Tomatoes',
    'Lemon',
    'Ricotta',
    'Chickpeas',
    'Chicken Breast',
    'Fresh Basil',
  ];

  const categories = [
    { name: 'All recipes', icon: Utensils },
    { name: 'Breakfast', icon: Sun },
    { name: 'Lunch', icon: Leaf },
    { name: 'Dinner', icon: Soup },
    { name: 'Quick & easy', icon: Clock },
    { name: 'Vegetarian', icon: Leaf },
    { name: 'Desserts', icon: Cookie },
  ];

  // Filter and rank recipes
  const processedRecipes = useMemo(() => {
    return items
      .filter(r => r.status !== 'Draft')
      .map(recipe => {
        const pantryMatch = calculatePantryMatch(recipe, pantry);
        const recScore = calculateRecommendationScore(recipe, currentUser);
        return {
          recipe,
          pantryMatch,
          recScore,
        };
      })
      .filter(({ recipe, pantryMatch }) => {
        // Pantry match filter
        if (pantryMatchOnly && pantryMatch.matchPercentage < 50) return false;

        // Category filter
        if (category === 'Quick & easy' && recipe.time > 30) return false;
        if (category === 'Vegetarian' && !['Vegetarian', 'Vegan'].includes(recipe.diet)) return false;
        if (category !== 'All recipes' && category !== 'Quick & easy' && category !== 'Vegetarian' && recipe.category !== category) return false;

        // Diet filter
        if (diet !== 'All diets' && recipe.diet !== diet) return false;

        // Time filter
        if (time !== 'Any time' && recipe.time > Number(time)) return false;

        // Cuisine filter
        if (cuisineFilter !== 'All cuisines' && recipe.cuisine !== cuisineFilter) return false;

        // Health profile match filter
        if (healthMatchOnly && (currentUser.healthConditions?.length ?? 0) > 0) {
          const healthEvals = evaluateRecipeHealthConditions(recipe);
          const matchesUser = healthEvals.some(
            h =>
              h.isMatch &&
              currentUser.healthConditions.some(
                c => c.toLowerCase() === h.conditionId.toLowerCase() || c.toLowerCase() === h.label.toLowerCase()
              )
          );
          if (!matchesUser) return false;
        }

        // Expiring pantry items filter
        if (expiringOnly && expiringSoonItems.length > 0) {
          const expiringNames = expiringSoonItems.map(i => i.name.toLowerCase());
          const usesExpiring = recipe.ingredients.some(i =>
            expiringNames.some(e => i.name.toLowerCase().includes(e) || e.includes(i.name.toLowerCase()))
          );
          if (!usesExpiring) return false;
        }

        // Query search across title, cuisine, description, ingredients, and tags
        if (query.trim()) {
          const q = query.toLowerCase();
          const matches =
            recipe.title.toLowerCase().includes(q) ||
            recipe.cuisine.toLowerCase().includes(q) ||
            recipe.description.toLowerCase().includes(q) ||
            recipe.tags.some(t => t.toLowerCase().includes(q)) ||
            recipe.ingredients.some(i => i.name.toLowerCase().includes(q));
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sort === 'Pantry match') {
          return b.pantryMatch.matchPercentage - a.pantryMatch.matchPercentage;
        }
        if (sort === 'Quickest first') {
          return a.recipe.time - b.recipe.time;
        }
        if (sort === 'Highest rated') {
          return Number(b.recipe.rating) - Number(a.recipe.rating);
        }
        // Default: Recommended (Relational scoring algorithm)
        return b.recScore.score - a.recScore.score;
      });
  }, [items, pantry, currentUser, query, category, diet, time, cuisineFilter, sort, pantryMatchOnly, healthMatchOnly, expiringOnly, expiringSoonItems]);

  const activeFiltersCount =
    (diet !== 'All diets' ? 1 : 0) +
    (time !== 'Any time' ? 1 : 0) +
    (cuisineFilter !== 'All cuisines' ? 1 : 0) +
    (pantryMatchOnly ? 1 : 0) +
    (healthMatchOnly ? 1 : 0) +
    (expiringOnly ? 1 : 0);

  return (
    <div className="discover-page">
      {/* Main Discover Heading */}
      <header className="discover-heading">
        <div>
          <span className="eyebrow mb-1">
            CURATED FOR {currentUser.cookingSkill.toUpperCase()}
          </span>
          <h1>
            A little inspiration<br />
            for your <em>next bite.</em>
          </h1>
          <p>
            Database-backed culinary intelligence meets the warmth of a handwritten family cookbook.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-card border border-border px-3.5 py-1.5 rounded-full text-xs text-muted-foreground shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-clay" />
          <span>Kitchen of {currentUser.name.split(' ')[0]}</span>
        </div>
      </header>

      {/* Search and Filter Row */}
      <div className="search-row">
        <div className="search-input">
          <Search size={19} />
          <Input
            aria-label="Search recipes"
            placeholder="Search by recipe name, pantry ingredient, cuisine, or tag…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className={`filter-button ${filtersOpen || activeFiltersCount > 0 ? 'active' : ''}`}
          onClick={() => setFiltersOpen(!filtersOpen)}
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal size={16} />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Button>
      </div>

      {/* Collapsible Filter Panel */}
      {filtersOpen && (
        <div className="bg-card border border-border p-5 rounded-2xl my-4 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-sm animate-in fade-in">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Dietary Profile</label>
            <select
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
              value={diet}
              onChange={e => setDiet(e.target.value)}
            >
              {['All diets', 'Vegetarian', 'Vegan', 'High protein', 'Gluten-free', 'Balanced'].map(x => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Cuisine Origin</label>
            <select
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
              value={cuisineFilter}
              onChange={e => setCuisineFilter(e.target.value)}
            >
              {['All cuisines', 'Italian', 'Mediterranean', 'American', 'Indian', 'Japanese'].map(x => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Max Cooking Time</label>
            <select
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
              value={time}
              onChange={e => setTime(e.target.value)}
            >
              <option value="Any time">Any time</option>
              <option value="25">Under 25 minutes</option>
              <option value="35">Under 35 minutes</option>
              <option value="60">Under 60 minutes</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <Button
              variant={pantryMatchOnly ? 'default' : 'outline'}
              className="text-xs w-full rounded-lg"
              onClick={() => setPantryMatchOnly(!pantryMatchOnly)}
            >
              {pantryMatchOnly ? '✓ In Pantry Only' : 'Filter by My Pantry'}
            </Button>
            <Button
              variant="ghost"
              className="text-xs"
              onClick={() => {
                setDiet('All diets');
                setTime('Any time');
                setCuisineFilter('All cuisines');
                setQuery('');
                setCategory('All recipes');
                setPantryMatchOnly(false);
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      )}

      {/* "Cook With What You Have" Pantry Overlap Shelf */}
      <section className="pantry-strip">
        <div className="pantry-strip-header">
          <h3>
            <ShoppingBag size={18} className="text-clay" />
            Cook with What You Have
            <span className="text-xs font-normal text-muted-foreground ml-2">
              (Select what’s in your kitchen to see match percentages)
            </span>
          </h3>
          <span className="text-xs font-semibold text-sage">
            {pantry.length} items stocked
          </span>
        </div>
        <div className="pantry-chips">
          {quickPantryOptions.map(name => {
            const hasItem = pantry.includes(name);
            return (
              <button
                key={name}
                type="button"
                className={`pantry-chip ${hasItem ? 'selected' : ''}`}
                onClick={() => togglePantryItem(name)}
              >
                {hasItem && <Check size={12} />}
                {name}
              </button>
            );
          })}
        </div>

        {/* Shelf-Life Freshness Radar Banner */}
        {expiringSoonItems.length > 0 && (
          <div className="mt-4 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="text-base leading-none mt-0.5">⏱</span>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <strong className="text-foreground font-semibold">Pantry Freshness Radar:</strong>
                  <span className="text-amber-900 dark:text-amber-200">
                    {expiringSoonItems.map(i => `${i.name} (${i.daysRemaining}d left)`).join(', ')} should be used soon!
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Avoid food waste: cook recipes incorporating these ingredients before they expire.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant={expiringOnly ? 'default' : 'outline'}
              className={`rounded-full h-7 text-[11px] shrink-0 ${
                expiringOnly
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'border-amber-500/40 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20'
              }`}
              onClick={() => setExpiringOnly(!expiringOnly)}
            >
              {expiringOnly ? '✓ Filtering Expiring Items' : 'Cook With Expiring Items'}
            </Button>
          </div>
        )}
      </section>

      {/* Category Pills & Health Profile Toggle */}
      <div className="category-tabs flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1">
          {categories.map(({ name, icon: Icon }) => (
            <Button
              key={name}
              variant="ghost"
              onClick={() => setCategory(name)}
              className={category === name ? 'category-active' : ''}
            >
              <Icon size={14} className="mr-1.5" />
              {name}
            </Button>
          ))}
        </div>

        {/* My Health Profile Direct Filter */}
        {(currentUser.healthConditions?.length ?? 0) > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHealthMatchOnly(!healthMatchOnly)}
            className={`rounded-full text-xs h-8 px-3 shrink-0 gap-1.5 border transition-all ${
              healthMatchOnly
                ? 'bg-sage text-white border-sage shadow-sm'
                : 'border-sage/40 text-sage hover:bg-sage/10'
            }`}
            title="Filter recipes customized for your metabolic health conditions"
          >
            <ShieldCheck size={13} />
            <span>My Health Profile</span>
            {healthMatchOnly && <Check size={12} />}
          </Button>
        )}
      </div>

      {/* Featured Recipe Hero (Only on pristine discover state) */}
      {!query && category === 'All recipes' && diet === 'All diets' && time === 'Any time' && (
        <section className="featured-recipe">
          <img
            src={pasta}
            alt="Lemon ricotta pasta with fresh basil"
            width={1536}
            height={1024}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <div className="featured-copy">
            <span className="eyebrow">
              RECIPE OF THE DAY
            </span>
            <h2>
              Lemon, ricotta<br />
              & a little sunshine.
            </h2>
            <p>
              Emulsified with starchy pasta water, freshly zested citrus, and fragrant hand-torn basil.
              Simple ingredients, extraordinary comfort.
            </p>
            <div className="featured-meta">
              <span>
                <Clock size={14} className="text-clay" /> 25 minutes
              </span>
              <span>
                <Leaf size={14} className="text-sage" /> Vegetarian
              </span>
              <span>
                <Flame size={14} className="text-honey" /> 485 kcal
              </span>
            </div>
            <div className="mt-5">
              <Button asChild className="rounded-full px-6">
                <Link to="/recipe/$id" params={{ id: 'lemon-ricotta-pasta' }}>
                  Let’s make it <ArrowUpRight size={16} />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Recipe Grid & Sorting */}
      <section className="recipe-section">
        {/* Active Filters Pill Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-4 p-2.5 rounded-2xl bg-muted/40 border border-border">
            <span className="text-xs text-muted-foreground mr-1 font-medium">Active filters:</span>
            {query && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-card border border-border text-foreground">
                "{query}"
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="hover:text-destructive text-muted-foreground transition-colors ml-0.5"
                  title="Remove query filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {category !== 'All recipes' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-card border border-border text-foreground">
                Category: {category}
                <button
                  type="button"
                  onClick={() => setCategory('All recipes')}
                  className="hover:text-destructive text-muted-foreground transition-colors ml-0.5"
                  title="Clear category"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {diet !== 'All diets' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-card border border-border text-foreground">
                Diet: {diet}
                <button
                  type="button"
                  onClick={() => setDiet('All diets')}
                  className="hover:text-destructive text-muted-foreground transition-colors ml-0.5"
                  title="Clear diet filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {cuisineFilter !== 'All cuisines' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-card border border-border text-foreground">
                Cuisine: {cuisineFilter}
                <button
                  type="button"
                  onClick={() => setCuisineFilter('All cuisines')}
                  className="hover:text-destructive text-muted-foreground transition-colors ml-0.5"
                  title="Clear cuisine filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {time !== 'Any time' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-card border border-border text-foreground">
                Max {time} min
                <button
                  type="button"
                  onClick={() => setTime('Any time')}
                  className="hover:text-destructive text-muted-foreground transition-colors ml-0.5"
                  title="Clear time limit"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {pantryMatchOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-sage/20 border border-sage/30 text-foreground font-medium">
                Pantry match only
                <button
                  type="button"
                  onClick={() => setPantryMatchOnly(false)}
                  className="hover:text-destructive text-muted-foreground transition-colors ml-0.5"
                  title="Disable pantry only filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setCategory('All recipes');
                setDiet('All diets');
                setTime('Any time');
                setCuisineFilter('All cuisines');
                setPantryMatchOnly(false);
              }}
              className="text-xs text-clay hover:underline ml-2 font-medium"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="section-heading">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="eyebrow">
                {pantryMatchOnly ? 'PANTRY MATCH RESULTS' : 'RECOMMENDED FOR YOU'}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground tabular-nums">
                {processedRecipes.length} {processedRecipes.length === 1 ? 'recipe' : 'recipes'}
              </span>
            </div>
            <h2>
              {query || category !== 'All recipes' ? 'Search & Filter Results' : 'Made for your kind of cooking'}
              <span className="text-clay">.</span>
            </h2>
          </div>

          <label className="sort-label">
            <span>Sort by:</span>
            <select
              aria-label="Sort recipes"
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="font-medium cursor-pointer"
            >
              <option value="Recommended">Recommended (Relational Match)</option>
              <option value="Pantry match">Highest Pantry Overlap</option>
              <option value="Quickest first">Quickest first</option>
              <option value="Highest rated">Highest rated</option>
            </select>
          </label>
        </div>

        {/* Recipe Cards Grid */}
        <div className="recipe-grid">
          {processedRecipes.map(({ recipe, pantryMatch }) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              pantryMatchPercentage={pantryMatch.matchPercentage}
            />
          ))}
        </div>

        {processedRecipes.length === 0 && (
          <EmptyState
            icon={Search}
            title="No recipes found on this shelf"
            description="No dishes matched your active dietary filters, time limits, or keyword search. Loosen your filters or reset to discover all culinary creations."
            actionLabel="Reset All Filters"
            customAction={
              <Button
                className="rounded-full bg-clay text-white px-6 text-xs shadow-sm hover:bg-clay/90"
                onClick={() => {
                  setQuery('');
                  setCategory('All recipes');
                  setDiet('All diets');
                  setTime('Any time');
                  setCuisineFilter('All cuisines');
                  setPantryMatchOnly(false);
                }}
              >
                Reset All Filters
              </Button>
            }
          />
        )}
      </section>

      {/* Bottom Editorial Banner */}
      <section className="bg-card border border-border rounded-3xl p-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
          <span className="eyebrow">
            <Heart size={14} /> YOUR CULINARY LEGACY
          </span>
          <h2 className="text-2xl mt-1 mb-2 font-serif">Some recipes deserve to be kept forever.</h2>
          <p className="text-sm text-muted-foreground max-width-xl">
            Grandmother’s handwritten card, that weeknight experiment, or your signature Sunday roast.
            Give them a permanent, searchable home in RecipeVault.
          </p>
        </div>
        <Button variant="outline" asChild className="rounded-full px-6 shrink-0">
          <Link to="/create">
            Add a family recipe <ArrowRight size={16} className="ml-2" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
