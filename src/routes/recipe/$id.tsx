import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
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
  Sparkles,
  Flame,
  MessageSquare,
  X,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useVault } from '@/components/vault-provider';
import { scaledQuantity, masterIngredients, type IngredientMaster } from '@/lib/recipes';
import { pageMeta } from '@/lib/metadata';
import { toast } from 'sonner';

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
    <div className="standard-page detail-page">
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
        <p>{recipe.description}</p>

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

          <span className="photo-badge static">{recipe.diet}</span>
          <span className="text-xs px-2.5 py-1 rounded-full border border-border bg-card">
            {recipe.difficulty}
          </span>
        </div>
      </div>

      {/* Hero Cover Image */}
      <img
        className="detail-cover"
        src={recipe.image}
        alt={recipe.title}
        width={1536}
        height={1024}
        loading="eager"
        decoding="async"
        fetchPriority="high"
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

          {/* Ingredient Checkoff List */}
          <ul className="ingredient-list">
            {recipe.ingredients.map(i => {
              const isChecked = checkedIngredients.includes(i.name);
              return (
                <li key={i.name}>
                  <label>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        setCheckedIngredients(prev =>
                          prev.includes(i.name) ? prev.filter(x => x !== i.name) : [...prev, i.name]
                        )
                      }
                    />
                    <span className={isChecked ? 'line-through text-muted-foreground' : ''}>
                      <strong data-testid={`quantity-${i.name}`} className="tabular mr-1.5 font-semibold">
                        {scaledQuantity(i.quantity, recipe.servings, servings)} {i.unit}
                      </strong>
                      <span>{i.name}</span>
                      {i.preparationState && (
                        <span className="text-xs text-muted-foreground ml-1.5 font-normal italic">
                          ({i.preparationState})
                        </span>
                      )}
                    </span>
                  </label>

                  <button
                    type="button"
                    className="ingredient-chip-trigger"
                    onClick={() => handleIngredientClick(i.name)}
                    title={`View culinary info and substitutes for ${i.name}`}
                  >
                    Glossary ⓘ
                  </button>
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
                <strong className="tabular">{recipe.calories}<small>kcal</small></strong>
                <span>Energy</span>
              </div>
              <div>
                <strong className="tabular">{recipe.protein}<small>g</small></strong>
                <span>Protein</span>
              </div>
              <div>
                <strong className="tabular">{recipe.carbs}<small>g</small></strong>
                <span>Carbs</span>
              </div>
              <div>
                <strong className="tabular">{recipe.fat}<small>g</small></strong>
                <span>Fat</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              *Informational culinary estimates based on standard recipe ingredients. Not intended as medical diagnosis or clinical diet planning.
            </p>
          </div>
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
                        <Sparkles size={13} className="shrink-0 mt-0.5" />
                        <span>Chef’s tip: {step.tip}</span>
                      </div>
                    )}
                    {step.durationMinutes && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground mt-2">
                        <Clock size={12} /> Approx {step.durationMinutes} min
                      </span>
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
                <Sparkles size={16} />
                <span>Chef’s Tip: {recipe.steps[activeStepIndex]?.tip}</span>
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
                  Complete Recipe ♡
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
                deleteRecipe(id);
                navigate({ to: '/' });
                toast.success('Recipe removed from your kitchen.');
              }}
            >
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}