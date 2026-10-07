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
  Sparkles,
  ShoppingBag,
  Flame,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVault } from '@/components/vault-provider';
import { RecipeCard, EmptyState } from '@/components/recipe-card';
import { calculatePantryMatch, calculateRecommendationScore } from '@/lib/recipes';
import pasta from '@/assets/lemon-pasta.jpg';
import { LoginPage } from './login';

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
  const { items, currentUser, pantry, togglePantryItem, isAuthenticated } = useVault();

  // If the user has not logged in yet, present the welcoming Login / Sign-up portal first!
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All recipes');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [diet, setDiet] = useState('All diets');
  const [time, setTime] = useState('Any time');
  const [cuisineFilter, setCuisineFilter] = useState('All cuisines');
  const [sort, setSort] = useState('Recommended');
  const [pantryMatchOnly, setPantryMatchOnly] = useState(false);

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
  }, [items, pantry, currentUser, query, category, diet, time, cuisineFilter, sort, pantryMatchOnly]);

  const activeFiltersCount =
    (diet !== 'All diets' ? 1 : 0) +
    (time !== 'Any time' ? 1 : 0) +
    (cuisineFilter !== 'All cuisines' ? 1 : 0) +
    (pantryMatchOnly ? 1 : 0);

  return (
    <div className="discover-page">
      {/* Main Discover Heading */}
      <header className="discover-heading">
        <div>
          <span className="eyebrow mb-1">
            <Sparkles size={13} /> CURATED FOR {currentUser.cookingSkill.toUpperCase()}
          </span>
          <h1>
            A little inspiration<br />
            for your <em>next bite.</em>
          </h1>
          <p>
            Database-backed culinary intelligence meets the warmth of a handwritten family cookbook.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full text-xs text-muted-foreground shadow-sm">
          <Heart size={14} className="text-clay fill-clay" />
          <span>Personalized for {currentUser.name.split(' ')[0]}</span>
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
      </section>

      {/* Category Pills */}
      <div className="category-tabs">
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

      {/* Featured Recipe Hero (Only on pristine discover state) */}
      {!query && category === 'All recipes' && diet === 'All diets' && time === 'Any time' && (
        <section className="featured-recipe">
          <img src={pasta} alt="Lemon ricotta pasta with fresh basil" width={1536} height={1024} />
          <div className="featured-copy">
            <span className="eyebrow">
              <Sparkles size={13} /> RECIPE OF THE DAY
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
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {pantryMatchOnly ? 'PANTRY MATCH RESULTS' : 'RECOMMENDED FOR YOU'}
            </span>
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
