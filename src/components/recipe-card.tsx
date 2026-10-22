import { Link } from '@tanstack/react-router';
import { Bookmark, Clock, Star, ArrowUpRight, Flame, Eye } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useVault } from './vault-provider';
import { type Recipe, evaluateRecipeHealthConditions } from '@/lib/recipes';
import { RecipeQuickPreview } from './recipe-quick-preview';
import { toast } from 'sonner';
import pasta from '@/assets/lemon-pasta.jpg';

export function RecipeCard({
  recipe,
  pantryMatchPercentage,
}: {
  recipe: Recipe;
  pantryMatchPercentage?: number;
}) {
  const { saved, toggleSave, currentUser } = useVault();
  const isSaved = saved.includes(recipe.id);
  const [isAnimating, setIsAnimating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const healthEvals = evaluateRecipeHealthConditions(recipe);
  const userMatches = healthEvals.filter(h =>
    h.isMatch &&
    currentUser.healthConditions?.some(
      c => c.toLowerCase() === h.conditionId.toLowerCase() || c.toLowerCase() === h.label.toLowerCase()
    )
  );
  const primaryHealthBadge = userMatches[0] || healthEvals.find(h => h.isMatch);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAnimating(true);
    toggleSave(recipe.id);
    if (!isSaved) {
      toast.success(`Tucked "${recipe.title}" into your cookbook!`, {
        action: {
          label: 'Undo',
          onClick: () => toggleSave(recipe.id),
        },
      });
    } else {
      toast.info(`Removed "${recipe.title}" from saved recipes`, {
        action: {
          label: 'Undo',
          onClick: () => toggleSave(recipe.id),
        },
      });
    }
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <>
      <article className="recipe-card group">
        <div className="recipe-photo relative">
          <Link to="/recipe/$id" params={{ id: recipe.id }} aria-label={`View ${recipe.title}`}>
            <img
              src={recipe.image || pasta}
              alt={recipe.title}
              loading="lazy"
              decoding="async"
              width={768}
              height={512}
              onError={e => {
                (e.currentTarget as HTMLImageElement).src = pasta;
              }}
            />
          </Link>

          {/* Dietary Badge */}
          <span className="photo-badge">{recipe.diet}</span>

          {/* Pantry Match Indicator if applicable */}
          {typeof pantryMatchPercentage === 'number' && pantryMatchPercentage > 0 && (
            <span className="pantry-match-badge">
              {pantryMatchPercentage}% in pantry
            </span>
          )}

          {/* Quick Preview Hover Trigger */}
          <button
            type="button"
            className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 rounded-full bg-card/90 text-foreground backdrop-blur-md text-[11px] font-semibold h-7 px-3 flex items-center gap-1 shadow-md hover:scale-105"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPreviewOpen(true);
            }}
            title="Quick preview recipe details"
          >
            <Eye size={12} className="text-primary" />
            <span>Quick view</span>
          </button>

          {/* Tactile Bookmark Save Button with Tuck Animation */}
          <Button
            variant="secondary"
            size="icon"
            className={`save-button ${isSaved ? 'is-saved' : ''} ${isAnimating ? 'tuck-animation' : ''}`}
            aria-label={`${isSaved ? 'Unsave' : 'Save'} ${recipe.title}`}
            title={isSaved ? 'Remove from saved recipes' : 'Save to cookbook'}
            onClick={handleSave}
          >
            <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
          </Button>
        </div>

      <div className="recipe-card-body">
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="recipe-category">
            {recipe.cuisine} <span>·</span> {recipe.category}
          </div>
          {primaryHealthBadge && (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                userMatches.length > 0
                  ? 'bg-sage/15 text-sage border-sage/30'
                  : 'bg-secondary text-muted-foreground border-border'
              }`}
              title={primaryHealthBadge.clinicalNote}
            >
              {userMatches.length > 0 ? `🩺 ${primaryHealthBadge.badge}` : primaryHealthBadge.badge}
            </span>
          )}
        </div>

        <Link to="/recipe/$id" params={{ id: recipe.id }} className="recipe-title">
          {recipe.title}
        </Link>

        <p className="text-xs text-muted-foreground line-clamp-2 my-2 leading-relaxed">
          {recipe.description}
        </p>

        <div className="recipe-meta">
          <span className="flex items-center gap-1">
            <Clock size={13} className="text-muted-foreground" />
            <span className="tabular">{recipe.time} min</span>
            <span className="meta-dot">·</span>
            <span>{recipe.difficulty}</span>
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular flex items-center gap-0.5">
              <Flame size={12} className="text-clay" />
              {recipe.calories} kcal
            </span>
            <span className="rating tabular">
              <Star size={13} fill="currentColor" />
              {recipe.rating}
            </span>
          </div>
        </div>
      </div>
    </article>

    <RecipeQuickPreview
      recipe={recipe}
      open={previewOpen}
      onOpenChange={setPreviewOpen}
    />
  </>
);
}

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon = Bookmark,
  actionLabel = 'Explore recipes',
  actionTo = '/',
  customAction,
}: {
  title: string;
  description: string;
  icon?: React.ElementType;
  actionLabel?: string;
  actionTo?: string;
  customAction?: React.ReactNode;
}) {
  return (
    <div className="empty-state text-center p-8 sm:p-12 border border-dashed border-border rounded-3xl bg-card/60 backdrop-blur-sm max-w-xl mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-secondary/80 border border-border flex items-center justify-center mx-auto mb-4 text-primary shadow-sm">
        <Icon size={30} className="stroke-[1.75]" />
      </div>
      <h3 className="font-serif text-2xl text-foreground mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      {customAction ? (
        customAction
      ) : (
        <Button asChild className="rounded-full bg-clay text-white px-6 shadow-sm hover:bg-clay/90 gap-1.5 text-xs font-semibold">
          <Link to={actionTo}>
            {actionLabel} <ArrowUpRight size={14} />
          </Link>
        </Button>
      )}
    </div>
  );
}

export function RecipeCardSkeleton() {
  return (
    <div className="border border-border rounded-[20px] overflow-hidden bg-card animate-pulse shadow-sm flex flex-col">
      <div className="aspect-[1.45] bg-secondary/60 relative">
        <div className="absolute top-3.5 left-3.5 w-20 h-5 bg-card/70 rounded-full" />
      </div>
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="w-24 h-3 bg-muted rounded-full" />
        <div className="w-4/5 h-5 bg-muted rounded-md" />
        <div className="w-3/5 h-4 bg-muted rounded-md" />
        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
          <div className="w-16 h-3 bg-muted rounded-full" />
          <div className="w-12 h-3 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  );
}