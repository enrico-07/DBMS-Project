import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Circle,
  Sparkles,
  ShoppingBag,
  Heart,
  Calendar,
  ChefHat,
  X,
  ChevronRight,
  ArrowRight,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVault } from "@/components/vault-provider";
import { toast } from "sonner";

export function OnboardingGuide() {
  const {
    currentUser,
    pantry,
    addPantryItem,
    saved,
    plan,
    onboardingDismissed,
    setOnboardingDismissed,
  } = useVault();

  const [minimized, setMinimized] = useState(false);

  if (onboardingDismissed) {
    return (
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => setOnboardingDismissed(false)}
          className="text-xs text-muted-foreground hover:text-clay transition-colors flex items-center gap-1.5 py-1 px-3 rounded-full bg-card border border-border shadow-2xs"
        >
          <Sparkles size={12} className="text-amber-500" />
          <span>Show Getting Started Guide</span>
        </button>
      </div>
    );
  }

  // Calculate milestone steps
  const step1 = currentUser.dietaryPreferences.length > 0 || currentUser.favoriteCuisines.length > 0;
  const step2 = pantry.length >= 3;
  const step3 = saved.length > 0;
  const step4 = plan.length > 0;

  const completedCount = [step1, step2, step3, step4].filter(Boolean).length;
  const percentage = Math.round((completedCount / 4) * 100);
  const isAllComplete = completedCount === 4;

  const quickStaples = ["Extra Virgin Olive Oil", "Garlic", "Artisan Pasta"];

  return (
    <div className="relative overflow-hidden bg-card border border-border/80 rounded-3xl p-5 sm:p-6 mb-8 shadow-sm transition-all duration-300">
      {/* Decorative Warm Kitchen Background Shimmer Accent */}
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-honey/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/70 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {isAllComplete ? <PartyPopper size={20} className="text-honey" /> : <Sparkles size={20} />}
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-foreground">
              {isAllComplete
                ? "You’re all set for culinary greatness!"
                : `Welcome to RecipeVault, ${currentUser.name.split(" ")[0]}!`}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAllComplete
                ? "Your kitchen shelf, stocked pantry, and meal planner are firing on all cylinders."
                : "Follow these 4 simple steps to set up your dream digital kitchen."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMinimized(!minimized)}
            className="text-xs text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg hover:bg-muted transition-colors"
          >
            {minimized ? "Expand" : "Collapse"}
          </button>
          <button
            type="button"
            onClick={() => {
              setOnboardingDismissed(true);
              toast.info("Getting started guide hidden. You can reopen it anytime.");
            }}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
            title="Dismiss guide"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 mb-5 relative z-10">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
            {completedCount} of 4 tasks completed
          </span>
          <span className="text-muted-foreground tabular font-bold text-xs">{percentage}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-clay via-honey to-sage transition-all duration-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Steps Grid */}
      {!minimized && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
          {/* Step 1: Profile & Dietary Taste */}
          <div
            className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
              step1
                ? "bg-muted/30 border-border/60"
                : "bg-card border-border hover:border-primary/40 shadow-2xs"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {step1 ? (
                <CheckCircle2 size={16} className="text-sage shrink-0 mt-0.5" />
              ) : (
                <Circle size={16} className="text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-xs font-semibold text-foreground">1. Chef Preferences</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  Diet: {currentUser.dietaryPreferences[0] || "Balanced"}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-border/40 flex justify-end">
              <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1">
                <Link to="/profile">
                  Edit Taste <ChevronRight size={12} />
                </Link>
              </Button>
            </div>
          </div>

          {/* Step 2: Stock Pantry */}
          <div
            className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
              step2
                ? "bg-muted/30 border-border/60"
                : "bg-card border-border hover:border-primary/40 shadow-2xs"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {step2 ? (
                <CheckCircle2 size={16} className="text-sage shrink-0 mt-0.5" />
              ) : (
                <Circle size={16} className="text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-xs font-semibold text-foreground">2. Stock Staples</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {pantry.length} items currently stocked
                </p>
              </div>
            </div>

            {/* Quick 1-click pantry additions if < 3 */}
            {!step2 ? (
              <div className="mt-2.5 flex flex-wrap gap-1">
                {quickStaples.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addPantryItem(s)}
                    className="text-[10px] bg-secondary/80 hover:bg-secondary px-2 py-0.5 rounded-md text-foreground transition-colors"
                  >
                    + {s.split(" ")[0]}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-3 pt-2 border-t border-border/40 flex justify-end">
                <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1">
                  <Link to="/ingredients">
                    Pantry <ChevronRight size={12} />
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Step 3: Bookmark / Save Recipe */}
          <div
            className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
              step3
                ? "bg-muted/30 border-border/60"
                : "bg-card border-border hover:border-primary/40 shadow-2xs"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {step3 ? (
                <CheckCircle2 size={16} className="text-sage shrink-0 mt-0.5" />
              ) : (
                <Circle size={16} className="text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-xs font-semibold text-foreground">3. Save a Recipe</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {saved.length > 0 ? `${saved.length} recipes tucked away` : "Click bookmark on any card"}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-border/40 flex justify-end">
              <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1">
                <Link to="/cookbook">
                  Cookbook <ChevronRight size={12} />
                </Link>
              </Button>
            </div>
          </div>

          {/* Step 4: Plan a Meal */}
          <div
            className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
              step4
                ? "bg-muted/30 border-border/60"
                : "bg-card border-border hover:border-primary/40 shadow-2xs"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {step4 ? (
                <CheckCircle2 size={16} className="text-sage shrink-0 mt-0.5" />
              ) : (
                <Circle size={16} className="text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-xs font-semibold text-foreground">4. Plan a Meal</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {plan.length > 0 ? `${plan.length} meals on calendar` : "Assign a recipe to a day"}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-border/40 flex justify-end">
              <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1">
                <Link to="/planner">
                  Planner <ChevronRight size={12} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
