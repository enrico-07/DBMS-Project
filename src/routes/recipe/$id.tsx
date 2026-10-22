import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import {
  Bookmark,
  Clock,
  Users,
  Star,
  Minus,
  Plus,
  ArrowLeft,
  Check,
  Pencil,
  Trash2,
  Share2,
  ChefHat,
  History,
  RotateCcw,
  Flame,
  MessageSquare,
  X,
  Play,
  Pause,
  Timer,
  Bell,
  ArrowLeftRight,
  ShieldCheck,
  HeartPulse,
  Undo2,
  Volume2,
  CheckCircle2,
  Printer,
  Coins,
  Receipt,
  PiggyBank,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useVault } from '@/components/vault-provider';
import { CookingModeModal } from '@/components/cooking-mode-modal';
import {
  scaledQuantity,
  masterIngredients,
  type IngredientMaster,
  evaluateRecipeHealthConditions,
  ingredientSubstitutions,
  type IngredientSubstitution,
  HEALTH_CONDITIONS,
  calculateRecipeCost,
} from '@/lib/recipes';
import { pageMeta } from '@/lib/metadata';
import { toast } from 'sonner';
import pasta from '@/assets/lemon-pasta.jpg';

export const Route = createFileRoute('/recipe/$id')({
  component: RecipeDetail,
  head: ({ params }) =>
    pageMeta(
      params.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      'Ingredients, serving scaling, step-by-step cooking mode, version history and nutrition.'
    ),
});

function RecipeDetail() {
  const { id } = Route.useParams();
  const {
    items,
    saved,
    toggleSave,
    collections,
    addToCollection,
    deleteRecipe,
    versions,
    restoreRecipeVersion,
    reviews,
    addReview,
    currentUser,
  } = useVault();

  const recipe = items.find(r => r.id === id);
  const navigate = useNavigate();

  // Local interaction states
  const [servings, setServings] = useState(recipe?.servings ?? 2);
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [cookingMode, setCookingMode] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Modals
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientMaster | null>(null);

  // Review Form
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  // Ingredient Substitution State
  const [activeSwaps, setActiveSwaps] = useState<Record<string, IngredientSubstitution>>({});
  const [substitutionModalIngredient, setSubstitutionModalIngredient] = useState<string | null>(null);

  // Multi-Timer State
  type KitchenTimer = {
    id: string;
    label: string;
    totalSeconds: number;
    remainingSeconds: number;
    isRunning: boolean;
    stepNumber?: number | undefined;
  };

  const [timers, setTimers] = useState<KitchenTimer[]>([]);

  // Web Audio Synthetic Pleasant Kitchen Chime
  const playChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 - E5 - G5 - C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 0.85);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.9);
      });
    } catch (e) {
      console.warn('Audio chime error', e);
    }
  };

  // Timer Tick Hook
  useEffect(() => {
    const hasRunning = timers.some(t => t.isRunning && t.remainingSeconds > 0);
    if (!hasRunning) return;

    const interval = setInterval(() => {
      setTimers(prev =>
        prev.map(t => {
          if (!t.isRunning || t.remainingSeconds <= 0) return t;
          const nextSec = t.remainingSeconds - 1;
          if (nextSec === 0) {
            playChime();
            toast.success(`⏰ Kitchen Timer Done: "${t.label}" has finished!`, {
              duration: 7000,
            });
            return { ...t, remainingSeconds: 0, isRunning: false };
          }
          return { ...t, remainingSeconds: nextSec };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [timers]);

  const startOrAddTimer = (label: string, minutes: number, stepNumber?: number) => {
    const existing = timers.find(t => t.stepNumber === stepNumber && stepNumber !== undefined);
    if (existing) {
      setTimers(prev => prev.map(t => (t.id === existing.id ? { ...t, isRunning: true } : t)));
      toast.info(`Resumed timer for Step ${stepNumber}`);
      return;
    }
    const newTimer: KitchenTimer = {
      id: `timer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label,
      totalSeconds: minutes * 60,
      remainingSeconds: minutes * 60,
      isRunning: true,
      stepNumber,
    };
    setTimers(prev => [...prev, newTimer]);
    toast.success(`Started ${minutes}-minute timer: ${label}`);
  };

  const togglePauseTimer = (timerId: string) => {
    setTimers(prev =>
      prev.map(t => (t.id === timerId ? { ...t, isRunning: !t.isRunning } : t))
    );
  };

  const addOneMinute = (timerId: string) => {
    setTimers(prev =>
      prev.map(t =>
        t.id === timerId
          ? {
              ...t,
              totalSeconds: t.totalSeconds + 60,
              remainingSeconds: t.remainingSeconds + 60,
              isRunning: true,
            }
          : t
      )
    );
  };

  const resetTimer = (timerId: string) => {
    setTimers(prev =>
      prev.map(t => (t.id === timerId ? { ...t, remainingSeconds: t.totalSeconds, isRunning: false } : t))
    );
  };

  const removeTimer = (timerId: string) => {
    setTimers(prev => prev.filter(t => t.id !== timerId));
  };

  const formatTimerDisplay = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Macro Deltas from Active Swaps
  const macroDeltas = useMemo(() => {
    let calorieDelta = 0;
    let proteinDelta = 0;
    let carbsDelta = 0;
    let fatDelta = 0;
    let fiberDelta = 0;

    Object.values(activeSwaps).forEach(swap => {
      calorieDelta += swap.calorieDelta;
      proteinDelta += swap.proteinDelta;
      carbsDelta += swap.carbsDelta;
      fatDelta += swap.fatDelta;
      fiberDelta += swap.fiberDelta;
    });

    return { calorieDelta, proteinDelta, carbsDelta, fatDelta, fiberDelta };
  }, [activeSwaps]);

  const effectiveCalories = Math.max(0, (recipe?.calories ?? 0) + macroDeltas.calorieDelta);
  const effectiveProtein = Math.max(0, (recipe?.protein ?? 0) + macroDeltas.proteinDelta);
  const effectiveCarbs = Math.max(0, (recipe?.carbs ?? 0) + macroDeltas.carbsDelta);
  const effectiveFat = Math.max(0, (recipe?.fat ?? 0) + macroDeltas.fatDelta);
  const effectiveFiber = Math.max(0, (recipe?.fiber ?? 4) + macroDeltas.fiberDelta);
  const effectiveNetCarbs = Math.max(0, effectiveCarbs - effectiveFiber);

  const healthEvals = useMemo(() => {
    if (!recipe) return [];
    return evaluateRecipeHealthConditions(recipe);
  }, [recipe]);

  const userHealthMatches = useMemo(() => {
    return healthEvals.filter(h =>
      h.isMatch &&
      currentUser.healthConditions?.some(
        c => c.toLowerCase() === h.conditionId.toLowerCase() || c.toLowerCase() === h.label.toLowerCase()
      )
    );
  }, [healthEvals, currentUser.healthConditions]);

  const costData = useMemo(() => {
    if (!recipe) return null;
    return calculateRecipeCost(recipe);
  }, [recipe]);

  const scaledBatchCost = useMemo(() => {
    if (!costData) return 0;
    return Math.round(costData.costPerServing * servings * 100) / 100;
  }, [costData, servings]);

  if (!recipe) {
    return (
      <div className="standard-page text-center py-20">
        <h1 className="text-3xl font-serif mb-4">Recipe not found</h1>
        <p className="text-muted-foreground mb-6">This recipe might have been moved or removed from the vault.</p>
        <Button asChild className="rounded-full">
          <Link to="/">Back to Discover</Link>
        </Button>
      </div>
    );
  }

  const recipeVersions = versions.filter(v => v.recipeId === id);
  const recipeReviews = reviews.filter(r => r.recipeId === id);
  const isSaved = saved.includes(id);

  // Handle ingredient chip click
  const handleIngredientClick = (name: string) => {
    const found = masterIngredients.find(
      i =>
        i.name.toLowerCase() === name.toLowerCase() ||
        name.toLowerCase().includes(i.name.toLowerCase()) ||
        i.name.toLowerCase().includes(name.toLowerCase())
    );
    if (found) {
      setSelectedIngredient(found);
    } else {
      setSelectedIngredient({
        id: 'temp',
        name,
        aliases: 'Kitchen staple',
        category: 'Pantry & Spices',
        flavor: 'Natural culinary flavor',
        substitute: 'Any closely matching ingredient in the same food family.',
        storage: 'Store according to food safety guidelines in a cool, dry place or refrigerate.',
        commonUses: 'Everyday home cooking.',
        caloriesPer100g: 100,
        proteinPer100g: 2,
        carbsPer100g: 10,
        fatPer100g: 1,
        fiberPer100g: 1,
      });
    }
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Please share a few words about your cooking experience.');
      return;
    }
    addReview(id, newRating, newComment.trim());
    setNewComment('');
    setReviewOpen(false);
  };

  return (
    <div className="standard-page detail-page printable-recipe-card">
      {/* Breadcrumbs for Crisp Culinary Context */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
        <Link to="/" className="hover:text-primary transition-colors font-medium">Discover</Link>
        <span>/</span>
        <span className="capitalize">{recipe.category}</span>
        <span>/</span>
        <span className="text-foreground font-semibold truncate max-w-xs">{recipe.title}</span>
      </nav>

      {/* Top Action Bar */}
      <div className="detail-actions">
        <Button asChild variant="ghost" className="rounded-full gap-2">
          <Link to="/">
            <ArrowLeft size={16} /> Back to Discover
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {recipeVersions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-1.5 text-xs"
              onClick={() => setHistoryOpen(true)}
            >
              <History size={14} />
              Revisions ({recipeVersions.length})
            </Button>
          )}

          <Button asChild variant="ghost" size="icon" title="Edit recipe" className="rounded-full">
            <Link to="/create" search={{ edit: id }}>
              <Pencil size={16} />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Delete recipe"
            aria-label="Delete recipe"
            className="rounded-full text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={16} />
          </Button>

          <Button
            variant="outline"
            className="rounded-full gap-1.5 text-xs"
            onClick={() => window.print()}
            title="Print printable recipe card"
          >
            <Printer size={15} /> Print
          </Button>

          <Button
            variant="outline"
            className="rounded-full gap-1.5 text-xs"
            onClick={async () => {
              try {
                const text = `${recipe.title}\n${recipe.description}\n\nIngredients (${servings} servings):\n${recipe.ingredients
                  .map(i => `• ${scaledQuantity(i.quantity, recipe.servings, servings)} ${i.unit} ${i.name}`)
                  .join('\n')}\n\nDirections:\n${recipe.steps.map(s => `${s.stepNumber}. ${s.instruction}`).join('\n')}`;
                await navigator.clipboard.writeText(text);
                toast.success('Complete recipe formatted & copied to clipboard!');
              } catch {
                toast.error('Could not copy automatically. Please copy manually.');
              }
            }}
          >
            <Share2 size={15} /> Copy Recipe
          </Button>
        </div>
      </div>

      {/* Intro Header */}
      <div className="detail-intro">
        <div className="flex items-center gap-2 mb-2">
          <span className="eyebrow">
            {recipe.cuisine} Cuisine · {recipe.category}
          </span>
          <span className="text-xs text-muted-foreground">· {recipe.visibility}</span>
        </div>

        <h1>{recipe.title}</h1>
        <p suppressHydrationWarning>{recipe.description}</p>

        {/* Metadata Badges */}
        <div className="detail-meta">
          <span className="flex items-center gap-1.5">
            <Clock size={15} className="text-clay" />
            <strong className="tabular">{recipe.time} min</strong> total
          </span>

          <span className="flex items-center gap-1.5">
            <Users size={15} className="text-clay" />
            <strong className="tabular">{recipe.servings} servings</strong> original
          </span>

          <span className="flex items-center gap-1.5 rating tabular">
            <Star size={15} fill="currentColor" />
            <strong>{recipe.rating}</strong> ({recipe.ratingCount} reviews)
          </span>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-peach text-clay border border-clay/20 shadow-xs">
            {recipe.diet}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-secondary/80 border border-border text-foreground">
            {recipe.difficulty}
          </span>
        </div>
      </div>

      {/* Hero Cover Image */}
      <img
        className="detail-cover"
        src={recipe.image || pasta}
        alt={recipe.title}
        width={1536}
        height={1024}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        onError={e => {
          (e.currentTarget as HTMLImageElement).src = pasta;
        }}
      />

      {/* Action Toolbar */}
      <div className="detail-toolbar">
        <span className="text-xs text-muted-foreground">
          Origin: <strong className="text-foreground">{recipe.source}</strong> · Created by{' '}
          <strong className="text-foreground">{recipe.createdBy === currentUser.id ? 'You' : recipe.createdBy}</strong>
        </span>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            className={`rounded-full gap-2 ${isSaved ? 'is-saved' : ''}`}
            onClick={() => {
              toggleSave(id);
              toast.success(isSaved ? 'Removed from cookbook' : 'Tucked into your cookbook!');
            }}
          >
            <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
            {isSaved ? 'Saved in Cookbook' : 'Save Recipe'}
          </Button>

          <Button
            variant="outline"
            className="rounded-full gap-1.5"
            onClick={() => setCollectionOpen(true)}
          >
            Add to Collection
          </Button>

          <Button
            className="rounded-full gap-2 bg-clay text-white shadow-md hover:bg-clay/90"
            onClick={() => {
              setCookingMode(true);
              setActiveStepIndex(0);
            }}
          >
            <ChefHat size={16} /> Start Cooking Mode
          </Button>
        </div>
      </div>

      {/* Main Two-Column Content Grid */}
      <div className="recipe-details-grid">
        {/* Left Column: Scalable Ingredients & Nutrition */}
        <section>
          <div className="section-heading">
            <div>
              <span className="eyebrow">WHAT GOES IN</span>
              <h2>Ingredients</h2>
            </div>

            {/* Non-destructive Serving Scaler */}
            <div className="serving-stepper">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Decrease servings"
                disabled={servings <= 1}
                onClick={() => setServings(s => s - 1)}
              >
                <Minus size={14} />
              </Button>
              <span className="tabular">{servings} servings</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Increase servings"
                disabled={servings >= 24}
                onClick={() => setServings(s => s + 1)}
              >
                <Plus size={14} />
              </Button>
            </div>
          </div>

          {/* Active Substitutions Banner if any */}
          {Object.keys(activeSwaps).length > 0 && (
            <div className="mb-4 p-3 bg-secondary/70 border border-border rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ArrowLeftRight size={14} className="text-clay shrink-0" />
                <span>
                  <strong>{Object.keys(activeSwaps).length} active ingredient substitution(s)</strong>
                  <span className="text-[11px] text-muted-foreground block">
                    Macros and scaled recipe quantities adjusted dynamically.
                  </span>
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-clay hover:bg-clay/10"
                onClick={() => {
                  setActiveSwaps({});
                  toast.info('All ingredient substitutions cleared');
                }}
              >
                <Undo2 size={12} /> Reset to Original
              </Button>
            </div>
          )}

          {/* Ingredient Checkoff List */}
          <ul className="ingredient-list">
            {recipe.ingredients.map(i => {
              const isChecked = checkedIngredients.includes(i.name);
              const swap = activeSwaps[i.name];
              const availableSubstitutions = ingredientSubstitutions.filter(
                s => s.originalIngredient.toLowerCase() === i.name.toLowerCase()
              );
              const displayQuantity = swap
                ? scaledQuantity(i.quantity * swap.conversionRatio, recipe.servings, servings)
                : scaledQuantity(i.quantity, recipe.servings, servings);
              const displayUnit = swap ? swap.targetUnit : i.unit;
              const displayName = swap ? swap.substituteName : i.name;

              return (
                <li key={i.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-border/50">
                  <label className="flex items-start gap-2.5 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        setCheckedIngredients(prev =>
                          prev.includes(i.name) ? prev.filter(x => x !== i.name) : [...prev, i.name]
                        )
                      }
                      className="mt-1"
                    />
                    <div className={isChecked ? 'line-through text-muted-foreground' : ''}>
                      <span className="text-sm">
                        <strong data-testid={`quantity-${i.name}`} className="tabular mr-1.5 font-semibold text-foreground">
                          {displayQuantity} {displayUnit}
                        </strong>
                        <span className="font-medium text-foreground">{displayName}</span>
                        {swap && (
                          <span className="text-[11px] text-clay ml-1.5 font-semibold bg-peach/60 px-1.5 py-0.5 rounded">
                            (Swapped for {i.name})
                          </span>
                        )}
                        {!swap && i.preparationState && (
                          <span className="text-xs text-muted-foreground ml-1.5 font-normal italic">
                            ({i.preparationState})
                          </span>
                        )}
                      </span>
                    </div>
                  </label>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    {availableSubstitutions.length > 0 && (
                      <Button
                        type="button"
                        variant={swap ? 'secondary' : 'outline'}
                        size="sm"
                        className="h-7 text-[11px] rounded-full px-2.5 gap-1"
                        onClick={() => setSubstitutionModalIngredient(i.name)}
                        title={`Explore healthy substitutes for ${i.name}`}
                      >
                        <ArrowLeftRight size={11} />
                        {swap ? 'Change Swap' : 'Swap'}
                      </Button>
                    )}

                    <button
                      type="button"
                      className="ingredient-chip-trigger"
                      onClick={() => handleIngredientClick(i.name)}
                      title={`View culinary info and substitutes for ${i.name}`}
                    >
                      Glossary ⓘ
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Nutritional Breakdown Panel */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="eyebrow">A LITTLE NOURISHMENT</span>
                <h3 className="font-serif text-xl">Nutritional Values</h3>
              </div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                ESTIMATED · PER SERVING
              </span>
            </div>

            <div className="nutrition-grid">
              <div>
                <strong className="tabular">{effectiveCalories}<small>kcal</small></strong>
                <span>Energy</span>
                {macroDeltas.calorieDelta !== 0 && (
                  <span className={`text-[10px] font-bold ${macroDeltas.calorieDelta < 0 ? 'text-sage' : 'text-clay'}`}>
                    {macroDeltas.calorieDelta > 0 ? `+${macroDeltas.calorieDelta}` : macroDeltas.calorieDelta} kcal
                  </span>
                )}
              </div>
              <div>
                <strong className="tabular">{effectiveProtein}<small>g</small></strong>
                <span>Protein</span>
                {macroDeltas.proteinDelta !== 0 && (
                  <span className={`text-[10px] font-bold ${macroDeltas.proteinDelta > 0 ? 'text-sage' : 'text-clay'}`}>
                    {macroDeltas.proteinDelta > 0 ? `+${macroDeltas.proteinDelta}g` : `${macroDeltas.proteinDelta}g`}
                  </span>
                )}
              </div>
              <div>
                <strong className="tabular">{effectiveCarbs}<small>g</small></strong>
                <span>Carbs</span>
                {macroDeltas.carbsDelta !== 0 && (
                  <span className={`text-[10px] font-bold ${macroDeltas.carbsDelta < 0 ? 'text-sage' : 'text-clay'}`}>
                    {macroDeltas.carbsDelta > 0 ? `+${macroDeltas.carbsDelta}g` : `${macroDeltas.carbsDelta}g`}
                  </span>
                )}
              </div>
              <div>
                <strong className="tabular">{effectiveFat}<small>g</small></strong>
                <span>Fat</span>
                {macroDeltas.fatDelta !== 0 && (
                  <span className={`text-[10px] font-bold ${macroDeltas.fatDelta < 0 ? 'text-sage' : 'text-clay'}`}>
                    {macroDeltas.fatDelta > 0 ? `+${macroDeltas.fatDelta}g` : `${macroDeltas.fatDelta}g`}
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              *Informational culinary estimates adjusted for active ingredient swaps. Not intended as medical diagnosis.
            </p>
          </div>

          {/* Clinical Health & Metabolic Analysis Panel */}
          <div className="mt-8 p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-sage" />
                <h4 className="font-serif text-lg">Clinical Health & Nutrition Profile</h4>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[11px] text-muted-foreground">Net Carbs:</span>
                <span className="font-bold text-foreground tabular bg-secondary px-2 py-0.5 rounded-full border border-border">
                  {effectiveNetCarbs}g <small className="text-muted-foreground font-normal">({effectiveFiber}g fiber)</small>
                </span>
              </div>
            </div>

            {/* If user has matched health conditions */}
            {userHealthMatches.length > 0 && userHealthMatches[0] ? (
              <div className="bg-sage/10 border border-sage/30 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <HeartPulse size={16} className="text-sage" />
                  <span className="text-xs font-bold text-sage">
                    Direct Alignment with Your Health Profile ({userHealthMatches.map(m => m.badge).join(', ')})
                  </span>
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed">
                  {userHealthMatches[0].clinicalNote}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {userHealthMatches[0].highlights.map((h, idx) => (
                    <span key={idx} className="text-[10px] font-semibold bg-card text-foreground px-2 py-0.5 rounded-md border border-sage/20">
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>
            ) : currentUser.healthConditions?.length > 0 ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200">
                <span className="font-semibold block mb-0.5">Note for your wellness profile:</span>
                This dish provides wholesome nutrients. You can use the ingredient swapper above to tailor it even further for your metabolic needs.
              </div>
            ) : null}

            {/* Condition Suitability Badges */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground block uppercase tracking-wider">
                Condition Suitability Ratings
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {healthEvals.map(evalItem => (
                  <div
                    key={evalItem.conditionId}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      evalItem.isMatch ? 'bg-secondary/40 border-border' : 'bg-muted/30 border-border/50 opacity-70'
                    }`}
                  >
                    <div>
                      <span className="font-semibold block text-[11px] text-foreground">
                        {evalItem.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {evalItem.highlights[0] || (evalItem.isMatch ? 'Suitable' : 'Moderation advised')}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                        evalItem.isMatch
                          ? 'bg-sage/15 text-sage border-sage/30'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {evalItem.isMatch ? `✓ ${evalItem.badge}` : 'Caution'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kitchen Economics & Budget Estimator (Phase 3) */}
          {costData && (
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm mt-6">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2">
                  <Coins size={18} className="text-honey" />
                  <h4 className="font-serif text-lg">Kitchen Economics & Budget</h4>
                </div>
                <span className="text-[11px] font-bold text-sage bg-sage/15 border border-sage/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <PiggyBank size={12} /> Save {costData.savingsPercentage}% vs. Takeout
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3.5 rounded-xl bg-background border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Per Serving
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold font-serif text-foreground tabular">
                      ${costData.costPerServing.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">/ portion</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground block mt-1">
                    vs. ~$16.50 dining out
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-background border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Batch Total ({servings} servings)
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold font-serif text-clay tabular">
                      ${scaledBatchCost.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">total</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground block mt-1">
                    Pantry ingredient pricing
                  </span>
                </div>
              </div>

              {/* Collapsible itemized pricing details */}
              <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Receipt size={13} className="text-muted-foreground" />
                  {costData.ingredientCosts.length} itemized kitchen staples
                </span>
                <span className="font-medium text-foreground">
                  Est. batch saving: ${(costData.restaurantEquivalent - scaledBatchCost).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Step-by-Step Instructions & Reviews */}
        <section>
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE METHOD</span>
              <h2>Step-by-step Guide</h2>
            </div>
            <span className="text-xs font-semibold text-muted-foreground tabular">
              {doneSteps.length} of {recipe.steps.length} completed
            </span>
          </div>

          <div className="space-y-4">
            {recipe.steps.map((step, index) => {
              const isDone = doneSteps.includes(index);
              const stepTimer = timers.find(t => t.stepNumber === step.stepNumber);

              return (
                <div
                  key={step.stepNumber}
                  className={`method-step ${isDone ? 'step-done' : ''}`}
                  onClick={() =>
                    setDoneSteps(prev =>
                      prev.includes(index) ? prev.filter(x => x !== index) : [...prev, index]
                    )
                  }
                >
                  <span className="step-number">
                    {isDone ? <Check size={16} /> : step.stepNumber}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{step.instruction}</p>
                    {step.tip && (
                      <div className="mt-2 text-xs text-primary bg-secondary p-2.5 rounded-xl border border-border flex items-start gap-1.5">
                        <ChefHat size={13} className="shrink-0 mt-0.5" />
                        <span>Chef’s tip: {step.tip}</span>
                      </div>
                    )}
                    {step.durationMinutes && (
                      <div className="mt-2.5 flex items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock size={12} /> Approx {step.durationMinutes} min
                        </span>

                        {stepTimer ? (
                          <div className="flex items-center gap-1.5 bg-card border border-sage/40 px-2.5 py-1 rounded-full text-xs">
                            <Timer size={12} className={stepTimer.isRunning ? 'text-sage animate-spin' : 'text-muted-foreground'} />
                            <strong className="tabular">{formatTimerDisplay(stepTimer.remainingSeconds)}</strong>
                            <button
                              type="button"
                              onClick={() => togglePauseTimer(stepTimer.id)}
                              className="text-[10px] text-primary hover:underline ml-1 font-semibold"
                            >
                              {stepTimer.isRunning ? 'Pause' : 'Resume'}
                            </button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 text-[11px] rounded-full gap-1 px-2.5"
                            onClick={() =>
                              startOrAddTimer(
                                `Step ${step.stepNumber}: ${step.instruction.slice(0, 24)}…`,
                                step.durationMinutes || 5,
                                step.stepNumber
                              )
                            }
                          >
                            <Timer size={11} /> Start {step.durationMinutes}m Timer
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {doneSteps.length === recipe.steps.length && (
            <div className="bg-secondary border border-border p-5 rounded-2xl text-center my-6 animate-in fade-in">
              <CheckCircle2 size={28} className="text-sage mx-auto mb-2" />
              <h4 className="font-serif text-lg">Delicious work!</h4>
              <p className="text-xs text-muted-foreground mt-1">
                You’ve completed all steps for {recipe.title}. Enjoy your handmade creation!
              </p>
            </div>
          )}

          {/* Community Reviews Section */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="eyebrow">COMMUNITY KITCHEN</span>
                <h3 className="font-serif text-xl">Reviews & Feedback ({recipeReviews.length})</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-1.5"
                onClick={() => setReviewOpen(true)}
              >
                <MessageSquare size={14} />
                Leave a Review
              </Button>
            </div>

            <div className="space-y-3">
              {recipeReviews.map(rev => (
                <div key={rev.id} className="bg-card border border-border p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="avatar w-7 h-7 text-xs">{rev.userAvatar}</span>
                      <strong className="text-xs font-semibold">{rev.userName}</strong>
                      {rev.verifiedCook && (
                        <span className="text-[10px] bg-secondary text-primary px-2 py-0.5 rounded-full font-medium">
                          Cooked this
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-honey text-xs">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* FULL-SCREEN COOKING MODE OVERLAY */}
      {cookingMode && (
        <div className="cooking-mode-overlay animate-in fade-in">
          <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <span className="brand-mark">
                <ChefHat size={18} />
              </span>
              <div>
                <h2 className="text-xl font-serif">{recipe.title}</h2>
                <span className="text-xs text-muted-foreground">
                  Step {activeStepIndex + 1} of {recipe.steps.length}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-1"
              onClick={() => setCookingMode(false)}
            >
              <X size={16} /> Exit Cooking Mode
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="max-w-4xl mx-auto w-full">
            <div className="cooking-progress-bar">
              <div
                className="cooking-progress-fill"
                style={{ width: `${((activeStepIndex + 1) / recipe.steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Active Step Presentation */}
          <div className="max-w-3xl mx-auto w-full my-auto py-10 text-center">
            <div className="step-number w-14 h-14 text-2xl mx-auto mb-6 bg-clay text-white">
              {activeStepIndex + 1}
            </div>
            <p className="text-2xl font-serif leading-relaxed mb-6">
              {recipe.steps[activeStepIndex]?.instruction}
            </p>

            {recipe.steps[activeStepIndex]?.tip && (
              <div className="bg-card border border-border p-4 rounded-2xl max-w-xl mx-auto text-sm text-primary flex items-center justify-center gap-2">
                <ChefHat size={16} />
                <span>Chef’s Tip: {recipe.steps[activeStepIndex]?.tip}</span>
              </div>
            )}

            {recipe.steps[activeStepIndex]?.durationMinutes && (
              <div className="mt-6 flex flex-col items-center justify-center gap-3">
                {timers.find(t => t.stepNumber === activeStepIndex + 1) ? (
                  <div className="flex items-center gap-3 bg-card border border-sage/50 px-5 py-2.5 rounded-full shadow-md">
                    <Timer size={20} className="text-sage animate-spin" />
                    <span className="text-xl font-bold font-mono tabular">
                      {formatTimerDisplay(
                        timers.find(t => t.stepNumber === activeStepIndex + 1)?.remainingSeconds ?? 0
                      )}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs h-7 px-3"
                      onClick={() =>
                        togglePauseTimer(
                          timers.find(t => t.stepNumber === activeStepIndex + 1)!.id
                        )
                      }
                    >
                      {timers.find(t => t.stepNumber === activeStepIndex + 1)?.isRunning ? 'Pause' : 'Resume'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs h-7 px-2"
                      onClick={() =>
                        addOneMinute(
                          timers.find(t => t.stepNumber === activeStepIndex + 1)!.id
                        )
                      }
                    >
                      +1m
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="rounded-full bg-clay text-white gap-2 text-xs h-9 px-5 shadow-md hover:bg-clay/90"
                    onClick={() =>
                      startOrAddTimer(
                        `Step ${activeStepIndex + 1}: ${recipe.steps[activeStepIndex]?.instruction.slice(0, 32)}…`,
                        recipe.steps[activeStepIndex]?.durationMinutes || 5,
                        activeStepIndex + 1
                      )
                    }
                  >
                    <Timer size={15} /> Start {recipe.steps[activeStepIndex]?.durationMinutes}m Step Timer
                  </Button>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-4 mt-10">
              <Button
                variant="outline"
                className="rounded-full px-6"
                disabled={activeStepIndex === 0}
                onClick={() => setActiveStepIndex(p => p - 1)}
              >
                Previous Step
              </Button>
              {activeStepIndex < recipe.steps.length - 1 ? (
                <Button
                  className="rounded-full px-8 bg-clay text-white"
                  onClick={() => setActiveStepIndex(p => p + 1)}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  className="rounded-full px-8 bg-sage text-white"
                  onClick={() => {
                    setCookingMode(false);
                    toast.success('Finished cooking! Enjoy your meal.');
                  }}
                >
                  <CheckCircle2 size={16} className="mr-2 inline" /> Complete Recipe
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VERSION HISTORY DIALOG */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-lg">
          <DialogTitle className="flex items-center gap-2">
            <History size={18} className="text-clay" />
            Recipe Version Control
          </DialogTitle>
          <DialogDescription>
            Every edit creates an immutable snapshot. You can inspect changes and roll back anytime.
          </DialogDescription>

          <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto">
            {recipeVersions.map(ver => (
              <div key={ver.versionId} className="version-card">
                <div className="flex items-center justify-between mb-1">
                  <span className="version-pill">Version {ver.versionNumber}.0</span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(ver.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs font-semibold text-foreground mb-1">{ver.changeSummary}</p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
                  <span>Author: {ver.authorName}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs gap-1 hover:text-clay"
                    onClick={() => {
                      restoreRecipeVersion(id, ver.versionId);
                      setHistoryOpen(false);
                    }}
                  >
                    <RotateCcw size={12} /> Restore
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* INGREDIENT GLOSSARY & SUBSTITUTION DIALOG */}
      <Dialog open={Boolean(selectedIngredient)} onOpenChange={() => setSelectedIngredient(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle className="text-2xl font-serif">{selectedIngredient?.name}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {selectedIngredient?.aliases} · {selectedIngredient?.category}
          </DialogDescription>

          <div className="space-y-3 mt-2 text-xs">
            <div>
              <strong className="text-foreground block font-semibold mb-1">Flavor Profile:</strong>
              <p className="text-muted-foreground">{selectedIngredient?.flavor}</p>
            </div>

            <div className="bg-secondary p-3 rounded-xl border border-border">
              <strong className="text-primary block font-semibold mb-1">Tested Culinary Substitute:</strong>
              <p className="text-espresso">{selectedIngredient?.substitute}</p>
            </div>

            <div>
              <strong className="text-foreground block font-semibold mb-1">Freshness & Storage:</strong>
              <p className="text-muted-foreground">{selectedIngredient?.storage}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex justify-end">
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link to="/ingredients" onClick={() => setSelectedIngredient(null)}>
                Browse Master Ingredient Library
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* LEAVE REVIEW DIALOG */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Leave Cooking Feedback</DialogTitle>
          <DialogDescription>
            Share how the recipe turned out or what adjustments you made in your kitchen.
          </DialogDescription>

          <form onSubmit={submitReview} className="space-y-4 mt-3">
            <div>
              <label className="text-xs font-semibold block mb-2">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      size={22}
                      className={star <= newRating ? 'text-honey fill-honey' : 'text-border'}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-foreground ml-2">{newRating} Stars</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5">Your Experience & Tips</label>
              <Textarea
                required
                placeholder="Did you scale the servings? Any ingredient substitutes or cooking temperature tips?"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setReviewOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full bg-clay text-white">
                Submit Review
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ADD TO COLLECTION DIALOG */}
      <Dialog open={collectionOpen} onOpenChange={setCollectionOpen}>
        <DialogContent>
          <DialogTitle>A Place on Your Kitchen Shelf</DialogTitle>
          <DialogDescription>Choose a collection for {recipe.title}.</DialogDescription>
          <div className="space-y-2 mt-3">
            {collections.map(c => {
              const inCollection = c.ids.includes(id);
              return (
                <Button
                  key={c.id}
                  variant="outline"
                  className="w-full justify-between rounded-xl"
                  onClick={() => {
                    addToCollection(c.id, id);
                    setCollectionOpen(false);
                    toast.success(`Added to collection: ${c.name}`);
                  }}
                >
                  <span>{c.name}</span>
                  {inCollection && <Check size={16} className="text-sage" />}
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogTitle>Delete this Recipe?</DialogTitle>
          <DialogDescription>
            This permanently removes "{recipe.title}" from your cookbook, meal planner, and saved lists.
          </DialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Keep Recipe
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteOpen(false);
                deleteRecipe(id);
                navigate({ to: '/' });
              }}
            >
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* INGREDIENT SUBSTITUTION MODAL */}
      <Dialog open={Boolean(substitutionModalIngredient)} onOpenChange={() => setSubstitutionModalIngredient(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle className="text-xl font-serif flex items-center gap-2">
            <ArrowLeftRight size={18} className="text-clay" />
            Healthy Swaps for {substitutionModalIngredient}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Select a verified culinary substitution. Ingredient quantities and nutrition macros will recalculate dynamically.
          </DialogDescription>

          <div className="space-y-3 mt-3">
            {ingredientSubstitutions
              .filter(s => s.originalIngredient.toLowerCase() === substitutionModalIngredient?.toLowerCase())
              .map(sub => {
                const isCurrent = activeSwaps[sub.originalIngredient]?.substituteName === sub.substituteName;
                return (
                  <div
                    key={sub.substituteName}
                    className={`p-3.5 rounded-xl border text-xs transition-all flex flex-col gap-2 ${
                      isCurrent ? 'border-clay bg-peach/40' : 'border-border bg-card hover:border-border/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-sm font-semibold text-foreground">{sub.substituteName}</strong>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-primary">
                        Ratio: {sub.conversionRatio}:1
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {sub.healthBenefit}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px]">
                      <div className="flex items-center gap-2 tabular font-medium">
                        <span className={sub.calorieDelta < 0 ? 'text-sage' : sub.calorieDelta > 0 ? 'text-clay' : 'text-muted-foreground'}>
                          {sub.calorieDelta > 0 ? `+${sub.calorieDelta}` : sub.calorieDelta} kcal
                        </span>
                        <span>·</span>
                        <span className={sub.proteinDelta > 0 ? 'text-sage' : 'text-muted-foreground'}>
                          {sub.proteinDelta > 0 ? `+${sub.proteinDelta}g` : `${sub.proteinDelta}g`} protein
                        </span>
                        <span>·</span>
                        <span className={sub.carbsDelta < 0 ? 'text-sage' : 'text-muted-foreground'}>
                          {sub.carbsDelta > 0 ? `+${sub.carbsDelta}g` : `${sub.carbsDelta}g`} carbs
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className={`rounded-full h-7 text-xs ${isCurrent ? 'bg-secondary text-foreground' : 'bg-clay text-white'}`}
                        onClick={() => {
                          if (isCurrent) {
                            setActiveSwaps(prev => {
                              const next = { ...prev };
                              delete next[sub.originalIngredient];
                              return next;
                            });
                            toast.info(`Restored original ${sub.originalIngredient}`);
                          } else {
                            setActiveSwaps(prev => ({
                              ...prev,
                              [sub.originalIngredient]: sub,
                            }));
                            toast.success(`Swapped ${sub.originalIngredient} with ${sub.substituteName}`);
                          }
                          setSubstitutionModalIngredient(null);
                        }}
                      >
                        {isCurrent ? 'Remove Swap' : 'Apply Swap'}
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>

      {/* FLOATING KITCHEN TIMERS HUD */}
      {timers.length > 0 && (
        <aside
          aria-label="Active Kitchen Timers"
          className="fixed bottom-5 right-5 z-50 bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-3.5 max-w-sm w-full animate-in slide-in-from-bottom-5"
        >
          <div className="flex items-center justify-between border-b border-border/70 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-foreground">
              <Timer size={15} className="text-clay animate-pulse" />
              <span>Kitchen Multi-Timers ({timers.length})</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] text-muted-foreground hover:text-foreground px-2"
              onClick={() => setTimers([])}
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {timers.map(timer => {
              const isDone = timer.remainingSeconds === 0;
              return (
                <div
                  key={timer.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
                    isDone
                      ? 'bg-clay/15 border-clay text-clay animate-bounce'
                      : timer.isRunning
                      ? 'bg-secondary/60 border-sage/40'
                      : 'bg-muted/40 border-border text-muted-foreground'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold block truncate text-[11px] text-foreground">
                      {timer.label}
                    </span>
                    <span className="tabular font-bold text-sm text-foreground">
                      {isDone ? '🎉 Ready!' : formatTimerDisplay(timer.remainingSeconds)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!isDone && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-full"
                        onClick={() => togglePauseTimer(timer.id)}
                        title={timer.isRunning ? 'Pause timer' : 'Resume timer'}
                      >
                        {timer.isRunning ? <Pause size={13} /> : <Play size={13} />}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] px-1.5 rounded-full"
                      onClick={() => addOneMinute(timer.id)}
                      title="Add 1 minute"
                    >
                      +1m
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 rounded-full hover:text-destructive"
                      onClick={() => removeTimer(timer.id)}
                      title="Dismiss timer"
                    >
                      <X size={13} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      )}
    </div>
  );
}