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
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
      {/* Mobile Warm App Greeting (<768px) */}
      <div className="md:hidden pt-1 pb-3">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-clay tracking-wide uppercase mb-1">
          <span className="w-2 h-2 rounded-full bg-clay" />
          <span>Kitchen of {currentUser.name.split(' ')[0]}</span>
          <span className="text-muted-foreground font-normal">· {currentUser.cookingSkill}</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight leading-tight">
          What are we cooking today?
        </h1>
      </div>

      {/* Main Discover Heading (Desktop >= 768px) */}
      <header className="discover-heading hidden md:flex">
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

      {/* Desktop Collapsible Filter Panel (hidden on mobile) */}
      {filtersOpen && (
        <div className="hidden md:grid bg-card border border-border p-5 rounded-2xl my-4 grid-cols-4 gap-4 shadow-sm animate-in fade-in">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Dietary Profile</label>
            <Select value={diet} onValueChange={setDiet}>
              <SelectTrigger className="w-full text-xs h-9 rounded-xl border-border bg-background">
                <SelectValue placeholder="Dietary Profile" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground shadow-xl p-1">
                {['All diets', 'Vegetarian', 'Vegan', 'High protein', 'Gluten-free', 'Balanced'].map(x => (
                  <SelectItem key={x} value={x} className="rounded-lg text-xs font-medium py-2 px-2.5 cursor-pointer">
                    {x}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Cuisine Origin</label>
            <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
              <SelectTrigger className="w-full text-xs h-9 rounded-xl border-border bg-background">
                <SelectValue placeholder="Cuisine Origin" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground shadow-xl p-1">
                {['All cuisines', 'Italian', 'Mediterranean', 'American', 'Indian', 'Japanese'].map(x => (
                  <SelectItem key={x} value={x} className="rounded-lg text-xs font-medium py-2 px-2.5 cursor-pointer">
                    {x}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Max Cooking Time</label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger className="w-full text-xs h-9 rounded-xl border-border bg-background">
                <SelectValue placeholder="Max Cooking Time" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground shadow-xl p-1">
                <SelectItem value="Any time" className="rounded-lg text-xs font-medium py-2 px-2.5 cursor-pointer">Any time</SelectItem>
                <SelectItem value="25" className="rounded-lg text-xs font-medium py-2 px-2.5 cursor-pointer">Under 25 minutes</SelectItem>
                <SelectItem value="35" className="rounded-lg text-xs font-medium py-2 px-2.5 cursor-pointer">Under 35 minutes</SelectItem>
                <SelectItem value="60" className="rounded-lg text-xs font-medium py-2 px-2.5 cursor-pointer">Under 60 minutes</SelectItem>
              </SelectContent>
            </Select>
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

      {/* Mobile Filter Modal Sheet (<768px) */}
      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent className="md:hidden max-h-[85vh] overflow-y-auto rounded-3xl p-5">
          <DialogTitle className="text-lg font-serif font-bold text-foreground flex items-center justify-between">
            <span>Filter Recipes</span>
            {activeFiltersCount > 0 && (
              <span className="text-xs font-normal text-clay font-sans">
                {activeFiltersCount} active
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Fine-tune recipes by dietary choice, cuisine style, or prep time.
          </DialogDescription>

          <div className="space-y-4 my-2">
            {/* Dietary Profile */}
            <div>
              <span className="text-xs font-semibold text-foreground block mb-2">Dietary Preference</span>
              <div className="flex flex-wrap gap-1.5">
                {['All diets', 'Vegetarian', 'Vegan', 'High protein', 'Gluten-free', 'Balanced'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDiet(d)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      diet === d
                        ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                        : 'bg-card text-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Cuisine */}
            <div>
              <span className="text-xs font-semibold text-foreground block mb-2">Cuisine Origin</span>
              <div className="flex flex-wrap gap-1.5">
                {['All cuisines', 'Italian', 'Mediterranean', 'American', 'Indian', 'Japanese'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCuisineFilter(c)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      cuisineFilter === c
                        ? 'bg-clay text-white border-clay font-semibold shadow-xs'
                        : 'bg-card text-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Cooking Time */}
            <div>
              <span className="text-xs font-semibold text-foreground block mb-2">Max Cooking Time</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Any time', val: 'Any time' },
                  { label: '< 25 minutes', val: '25' },
                  { label: '< 35 minutes', val: '35' },
                  { label: '< 60 minutes', val: '60' },
                ].map(t => (
                  <button
                    key={t.val}
                    type="button"
                    onClick={() => setTime(t.val)}
                    className={`text-xs p-2 rounded-xl border text-center transition-all ${
                      time === t.val
                        ? 'bg-secondary border-primary font-semibold text-primary'
                        : 'bg-card text-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pantry Only Toggle */}
            <div className="pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setPantryMatchOnly(!pantryMatchOnly)}
                className={`w-full text-xs font-medium py-2.5 px-3 rounded-xl border flex items-center justify-between transition-colors ${
                  pantryMatchOnly
                    ? 'bg-sage/15 border-sage text-sage font-bold'
                    : 'bg-card border-border text-foreground'
                }`}
              >
                <span>Only show recipes matching my pantry</span>
                {pantryMatchOnly && <Check size={14} className="text-sage" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-border">
            <Button
              variant="outline"
              className="text-xs flex-1 rounded-full h-10"
              onClick={() => {
                setDiet('All diets');
                setTime('Any time');
                setCuisineFilter('All cuisines');
                setQuery('');
                setCategory('All recipes');
                setPantryMatchOnly(false);
              }}
            >
              Reset All
            </Button>
            <Button
              className="text-xs flex-1 rounded-full h-10 bg-primary text-primary-foreground font-semibold"
              onClick={() => setFiltersOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* "Cook With What You Have" Pantry Overlap Shelf */}
      <section className="pantry-strip">
        <div className="pantry-strip-header">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 w-full">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShoppingBag size={14} />
              </div>
              <h3 className="text-sm sm:text-base font-serif font-semibold text-foreground whitespace-nowrap">
                Cook with What You Have
              </h3>
            </div>
            <Link
              to="/ingredients"
              className="hidden sm:inline-flex text-[11px] font-semibold text-sage hover:text-sage/80 bg-sage/10 px-2.5 py-0.5 rounded-full shrink-0 border border-sage/20 transition-colors whitespace-nowrap"
            >
              {pantry.length} stocked ›
            </Link>
          </div>

          <div className="flex items-center justify-between gap-2 mt-1 sm:mt-0.5 pl-0 sm:pl-9">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select what’s in your kitchen to see match percentages
            </p>
            <Link
              to="/ingredients"
              className="sm:hidden text-[11px] font-semibold text-sage hover:text-sage/80 bg-sage/10 px-2.5 py-0.5 rounded-full shrink-0 border border-sage/20 transition-colors whitespace-nowrap"
            >
              {pantry.length} stocked ›
            </Link>
          </div>
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
      <div className="flex items-center justify-between gap-3 my-3 sm:my-3.5">
        <div className="category-tabs flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-0.5 no-scrollbar scroll-smooth flex-1 min-w-0">
          {categories.map(({ name, icon: Icon }) => (
            <Button
              key={name}
              variant="ghost"
              onClick={() => setCategory(name)}
              className={category === name ? 'category-active' : ''}
            >
              <Icon size={14} className="mr-1.5 shrink-0" />
              <span>{name}</span>
            </Button>
          ))}

          {/* On Mobile: Render Health Profile inline at the end of the scrollable row so it doesn't wrap */}
          {(currentUser.healthConditions?.length ?? 0) > 0 && (
            <Button
              variant="outline"
              onClick={() => setHealthMatchOnly(!healthMatchOnly)}
              className={`sm:!hidden mobile-health-tab rounded-full text-[13px] h-[38px] px-3.5 shrink-0 gap-1.5 border transition-all shadow-2xs font-medium cursor-pointer ${
                healthMatchOnly
                  ? 'bg-sage text-white border-sage shadow-sm font-semibold'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
              title="Filter recipes customized for your metabolic health conditions"
            >
              <ShieldCheck size={14} className={healthMatchOnly ? 'text-white' : 'text-sage'} />
              <span>My Health Profile</span>
              {healthMatchOnly && <Check size={13} />}
            </Button>
          )}
        </div>

        {/* On Laptop/Desktop: Kept neatly docked on the right in perfect horizontal alignment with matching 38px height */}
        {(currentUser.healthConditions?.length ?? 0) > 0 && (
          <Button
            variant="outline"
            onClick={() => setHealthMatchOnly(!healthMatchOnly)}
            className={`hidden sm:inline-flex rounded-full text-[13px] h-[38px] px-4 shrink-0 gap-2 border transition-all shadow-2xs font-medium cursor-pointer ${
              healthMatchOnly
                ? 'bg-sage text-white border-sage shadow-sm font-semibold'
                : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
            title="Filter recipes customized for your metabolic health conditions"
          >
            <ShieldCheck size={14} className={healthMatchOnly ? 'text-white' : 'text-sage'} />
            <span>My Health Profile</span>
            {healthMatchOnly && <Check size={13} />}
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
                <Link
                  to="/recipe/$id"
                  params={{
                    id:
                      items.find(
                        (r) => r.id === 'lemon-herb-pasta' || r.id === 'lemon-ricotta-pasta'
                      )?.id || items[0]?.id || 'lemon-herb-pasta',
                  }}
                >
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

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline whitespace-nowrap">Sort:</span>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger
                aria-label="Sort recipes"
                className="h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-full border-border bg-card text-[11px] sm:text-xs font-semibold text-foreground shadow-2xs hover:border-primary/60 focus:ring-1 focus:ring-primary gap-1.5 w-auto"
              >
                <ArrowUpDown size={12} className="text-primary shrink-0" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent align="end" className="rounded-2xl border-border bg-popover text-popover-foreground shadow-xl p-1.5 min-w-[220px]">
                <SelectItem value="Recommended">
                  Recommended (Relational Match)
                </SelectItem>
                <SelectItem value="Pantry match">
                  Highest Pantry Overlap
                </SelectItem>
                <SelectItem value="Quickest first">
                  Quickest first
                </SelectItem>
                <SelectItem value="Highest rated">
                  Highest rated
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
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
      <section className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 mt-8 sm:mt-12 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 shadow-sm">
        <div>
          <span className="eyebrow">
            <Heart size={14} /> YOUR CULINARY LEGACY
          </span>
          <h2 className="text-xl sm:text-2xl mt-1 mb-2 font-serif font-bold">Some recipes deserve to be kept forever.</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-width-xl">
            Grandmother’s handwritten card, that weeknight experiment, or your signature Sunday roast.
            Give them a permanent, searchable home in RecipeVault.
          </p>
        </div>
        <Button variant="outline" asChild className="rounded-full px-5 sm:px-6 h-9 sm:h-10 text-xs sm:text-sm shrink-0 w-full sm:w-auto">
          <Link to="/create">
            Add a family recipe <ArrowRight size={15} className="ml-2" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
