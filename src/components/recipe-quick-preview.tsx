import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Clock,
  Flame,
  Star,
  Users,
  Bookmark,
  Calendar,
  Check,
  ExternalLink,
  ChefHat,
  Plus,
  Minus,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useVault } from "@/components/vault-provider";
import { scaledQuantity, type Recipe } from "@/lib/recipes";
import { toast } from "sonner";
import pasta from "@/assets/lemon-pasta.jpg";

export function RecipeQuickPreview({
  recipe,
  open,
  onOpenChange,
}: {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const { saved, toggleSave, pantry, setMeal } = useVault();

  const [servings, setServings] = useState<number>(recipe?.servings ?? 2);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedMeal, setSelectedMeal] = useState<"Breakfast" | "Lunch" | "Dinner">("Dinner");
  const [showPlanMenu, setShowPlanMenu] = useState(false);

  if (!recipe) return null;

  const isSaved = saved.includes(recipe.id);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleSaveToggle = () => {
    toggleSave(recipe.id);
    if (!isSaved) {
      toast.success(`Tucked "${recipe.title}" into your cookbook!`, {
        action: {
          label: "Undo",
          onClick: () => toggleSave(recipe.id),
        },
      });
    } else {
      toast.info(`Removed "${recipe.title}" from saved recipes`, {
        action: {
          label: "Undo",
          onClick: () => toggleSave(recipe.id),
        },
      });
    }
  };

  const handleAddToPlan = () => {
    setMeal(selectedDay, selectedMeal, recipe.id, servings);
    setShowPlanMenu(false);
    toast.success(`Added "${recipe.title}" to ${days[selectedDay]} ${selectedMeal}!`, {
      action: {
        label: "View Planner",
        onClick: () => {
          onOpenChange(false);
          navigate({ to: "/planner" });
        },
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border border-border bg-card">
        {/* Hero Photo Banner */}
        <div className="relative aspect-[21/9] sm:aspect-[16/7] w-full overflow-hidden bg-muted">
          <img
            src={recipe.image || pasta}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={e => {
              (e.currentTarget as HTMLImageElement).src = pasta;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badges on image */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-foreground backdrop-blur-sm shadow-xs">
              {recipe.diet}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/40 text-white backdrop-blur-sm">
              {recipe.cuisine} · {recipe.category}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <DialogTitle className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
              {recipe.title}
            </DialogTitle>
            <DialogDescription className="text-white/80 text-xs line-clamp-1 mt-1">
              {recipe.description}
            </DialogDescription>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-4 gap-2 py-3 px-4 rounded-2xl bg-muted/40 border border-border/60 text-center">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Total Time</span>
              <span className="text-xs sm:text-sm font-bold text-foreground tabular flex items-center justify-center gap-1 mt-0.5">
                <Clock size={12} className="text-clay" /> {recipe.time} min
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Calories</span>
              <span className="text-xs sm:text-sm font-bold text-foreground tabular flex items-center justify-center gap-1 mt-0.5">
                <Flame size={12} className="text-amber-500" /> {recipe.calories} kcal
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Difficulty</span>
              <span className="text-xs sm:text-sm font-bold text-foreground mt-0.5 block">
                {recipe.difficulty}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Rating</span>
              <span className="text-xs sm:text-sm font-bold text-foreground tabular flex items-center justify-center gap-1 mt-0.5">
                <Star size={12} className="text-honey fill-honey" /> {recipe.rating}
              </span>
            </div>
          </div>

          {/* Servings Stepper & Ingredients Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Ingredients Preview
              </h4>
              <div className="flex items-center gap-2 bg-muted/60 px-2.5 py-1 rounded-full border border-border">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users size={12} /> Servings:
                </span>
                <button
                  type="button"
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="w-5 h-5 rounded-full hover:bg-background flex items-center justify-center text-xs transition-colors"
                >
                  <Minus size={11} />
                </button>
                <strong className="text-xs tabular w-4 text-center">{servings}</strong>
                <button
                  type="button"
                  onClick={() => setServings(servings + 1)}
                  className="w-5 h-5 rounded-full hover:bg-background flex items-center justify-center text-xs transition-colors"
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {recipe.ingredients.slice(0, 8).map((ing, idx) => {
                const inPantry = pantry.some(
                  (p) =>
                    p.toLowerCase() === ing.name.toLowerCase() ||
                    ing.name.toLowerCase().includes(p.toLowerCase()),
                );
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-card border border-border/70"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span
                        className={`w-2 h-2 rounded-full ${inPantry ? "bg-sage" : "bg-muted-foreground/30"}`}
                        title={inPantry ? "In your pantry" : "Need to buy"}
                      />
                      <span className="truncate">{ing.name}</span>
                    </span>
                    <span className="text-muted-foreground tabular shrink-0 font-medium">
                      {scaledQuantity(ing.quantity, recipe.servings, servings)} {ing.unit}
                    </span>
                  </div>
                );
              })}
            </div>
            {recipe.ingredients.length > 8 && (
              <span className="text-[11px] text-muted-foreground mt-1.5 block">
                + {recipe.ingredients.length - 8} more ingredients in full recipe
              </span>
            )}
          </div>

          {/* Quick Plan Drawer/Popover if active */}
          {showPlanMenu && (
            <div className="p-3.5 rounded-2xl bg-secondary/70 border border-border space-y-3 animate-in fade-in slide-in-from-top-2">
              <span className="text-xs font-semibold block text-foreground">
                Assign to Weekly Meal Plan:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                    Day of Week
                  </label>
                  <select
                    className="w-full text-xs p-2 rounded-lg border border-border bg-background"
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(Number(e.target.value))}
                  >
                    {days.map((d, i) => (
                      <option key={d} value={i}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                    Meal Time
                  </label>
                  <select
                    className="w-full text-xs p-2 rounded-lg border border-border bg-background"
                    value={selectedMeal}
                    onChange={(e) => setSelectedMeal(e.target.value as any)}
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={() => setShowPlanMenu(false)}>
                  Cancel
                </Button>
                <Button size="sm" className="bg-clay text-white hover:bg-clay/90" onClick={handleAddToPlan}>
                  Confirm Schedule
                </Button>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Button
                variant={isSaved ? "default" : "outline"}
                size="sm"
                className={`rounded-full gap-1.5 text-xs font-semibold ${
                  isSaved ? "bg-honey text-white hover:bg-honey/90" : ""
                }`}
                onClick={handleSaveToggle}
              >
                <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
                {isSaved ? "Saved" : "Save Recipe"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-1.5 text-xs"
                onClick={() => setShowPlanMenu(!showPlanMenu)}
              >
                <Calendar size={14} className="text-clay" />
                Plan Meal
              </Button>
            </div>

            <Button
              asChild
              size="sm"
              className="rounded-full bg-clay text-white gap-1.5 text-xs font-semibold hover:bg-clay/90 shadow-sm"
              onClick={() => onOpenChange(false)}
            >
              <Link to="/recipe/$id" params={{ id: recipe.id }}>
                View Full Recipe <ExternalLink size={13} />
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
