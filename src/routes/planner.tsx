import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ShoppingBasket,
  Trash2,
  Calendar,
  Check,
  Copy,
  RotateCcw,
  Printer,
  Share2,
  Receipt,
  ListFilter,
  Coins,
  Utensils,
  Clock,
} from "lucide-react";
import { useVault } from "@/components/vault-provider";
import { PageHeading } from "@/components/recipe-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { pageMeta } from "@/lib/metadata";
import { masterIngredients, formatCulinaryQuantity } from "@/lib/recipes";
import { toast } from "sonner";
import pasta from "@/assets/lemon-pasta.jpg";

export const Route = createFileRoute("/planner")({
  component: Planner,
  head: () =>
    pageMeta(
      "Weekly Meal Planner & Consolidated Shopping List",
      "Plan your culinary week, assign meals, and automatically generate an aisle-categorized shopping list.",
    ),
});

function Planner() {
  const { items, plan, setMeal, clearMealPlan, pantry, currentUser } = useVault();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [activeSlot, setActiveSlot] = useState<{
    day: number;
    meal: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  } | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [shoppingModalOpen, setShoppingModalOpen] = useState(false);
  const [checkedShoppingItems, setCheckedShoppingItems] = useState<string[]>([]);
  const [receiptView, setReceiptView] = useState(false);

  const days = [
    { name: "Monday", subtitle: "A fresh start" },
    { name: "Tuesday", subtitle: "Simple flavors" },
    { name: "Wednesday", subtitle: "Midweek comfort" },
    { name: "Thursday", subtitle: "Quick & nourishing" },
    { name: "Friday", subtitle: "Celebration dinner" },
    { name: "Saturday", subtitle: "Slow cooking" },
    { name: "Sunday", subtitle: "Family favorites" },
  ];

  const mealSlots: ("Breakfast" | "Lunch" | "Dinner")[] = ["Breakfast", "Lunch", "Dinner"];

  // Current week's plan items
  const currentWeekPlan = useMemo(() => {
    const start = weekOffset * 7;
    const end = start + 7;
    return plan.filter((p) => p.day >= start && p.day < end);
  }, [plan, weekOffset]);

  // Aggregate shopping list grouped by aisle
  const shoppingListByAisle = useMemo(() => {
    type AggItem = {
      name: string;
      quantity: number;
      unit: string;
      category: string;
      inPantry: boolean;
    };

    const map = new Map<string, AggItem>();

    currentWeekPlan.forEach((p) => {
      const recipe = items.find((r) => r.id === p.recipeId);
      if (!recipe) return;

      const servingMultiplier = (p.customServings || recipe.servings) / recipe.servings;

      recipe.ingredients.forEach((ing) => {
        const key = `${ing.name.toLowerCase()}|${ing.unit.toLowerCase()}`;
        const master = masterIngredients.find(
          (m) =>
            m.name.toLowerCase() === ing.name.toLowerCase() ||
            ing.name.toLowerCase().includes(m.name.toLowerCase()),
        );
        const category = master?.category || "Pantry Essentials";
        const inPantry = pantry.some(
          (item) =>
            item.toLowerCase() === ing.name.toLowerCase() ||
            ing.name.toLowerCase().includes(item.toLowerCase()),
        );

        const currentQty = (ing.quantity || 1) * servingMultiplier;

        if (map.has(key)) {
          const existing = map.get(key)!;
          existing.quantity += currentQty;
        } else {
          map.set(key, {
            name: ing.name,
            quantity: currentQty,
            unit: ing.unit,
            category,
            inPantry,
          });
        }
      });
    });

    // Group items by category
    const grouped: Record<string, AggItem[]> = {};
    Array.from(map.values()).forEach((item) => {
      const aisleItems = grouped[item.category] ?? (grouped[item.category] = []);
      aisleItems.push(item);
    });

    return grouped;
  }, [currentWeekPlan, items, pantry]);

  const totalIngredientsCount = Object.values(shoppingListByAisle).reduce(
    (acc, list) => acc + list.length,
    0,
  );

  const copyShoppingList = async () => {
    let text = `🛒 RecipeVault Market Basket (${weekOffset === 0 ? "This Week" : `Week +${weekOffset}`})\n\n`;
    Object.entries(shoppingListByAisle).forEach(([cat, list]) => {
      text += `--- ${cat.toUpperCase()} ---\n`;
      list.forEach((item) => {
        const isChecked = checkedShoppingItems.includes(`${item.name}|${item.unit}`);
        const pantryTag = item.inPantry ? " (Already in Pantry)" : "";
        text += `${isChecked ? "[x]" : "[ ]"} ${formatCulinaryQuantity(item.quantity)} ${item.unit} ${item.name}${pantryTag}\n`;
      });
      text += "\n";
    });

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Market shopping list copied to clipboard!");
    } catch {
      toast.error("Unable to copy list automatically.");
    }
  };

  const shareWhatsApp = () => {
    let msg = `🛒 *RecipeVault Grocery List* (${weekOffset === 0 ? "This Week" : `Week +${weekOffset}`})\nChef: ${currentUser.name}\n\n`;
    Object.entries(shoppingListByAisle).forEach(([cat, list]) => {
      msg += `*${cat.toUpperCase()}*\n`;
      list.forEach((item) => {
        const itemKey = `${item.name}|${item.unit}`;
        const isChecked = checkedShoppingItems.includes(itemKey);
        const inPantryText = item.inPantry ? " (Pantry ✓)" : "";
        msg += `${isChecked ? "✅" : "▫️"} ${formatCulinaryQuantity(item.quantity)} ${item.unit} ${item.name}${inPantryText}\n`;
      });
      msg += "\n";
    });
    msg += `Total items: ${totalIngredientsCount} · Generated by RecipeVault`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
    toast.success("Opened WhatsApp with formatted grocery list");
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="standard-page">
      <PageHeading
        eyebrow="RELATIONAL MEAL PLANNING & AUTOMATION"
        title="A delicious week ahead."
        description="Schedule comforting lunches, effortless weeknight dinners, and consolidate your ingredients into an automated shopping list."
        action={
          <Button
            variant="outline"
            className="rounded-full sm:rounded-2xl gap-2 h-10 sm:h-11 px-5 sm:px-6 text-sm font-semibold border-primary/25 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground shadow-xs active:scale-[0.99] transition-all shrink-0 w-full sm:w-auto justify-center"
            onClick={() => setShoppingModalOpen(true)}
          >
            <ShoppingBasket size={18} className="shrink-0" />
            <span>View Market Basket</span>
            <span
              className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary tabular-nums"
              suppressHydrationWarning
            >
              {totalIngredientsCount} {totalIngredientsCount === 1 ? "item" : "items"}
            </span>
          </Button>
        }
      />

      {/* Week Navigator & Controls */}
      <div className="planner-nav-bar mt-6 mb-5">
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <Calendar size={20} className="text-primary shrink-0" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground truncate">
              {weekOffset === 0
                ? "This Week’s Menu"
                : weekOffset === 1
                  ? "Next Week’s Menu"
                  : `Week +${weekOffset}`}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop Clear Week: Positioned to the LEFT of toggle arrows so arrows stay anchored */}
            {currentWeekPlan.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex text-xs text-muted-foreground hover:text-destructive gap-1.5 h-9 px-3 rounded-full hover:bg-destructive/10 transition-colors"
                onClick={clearMealPlan}
              >
                <RotateCcw size={13} /> Clear Week
              </Button>
            )}

            <div className="flex items-center gap-1.5">
              <Button
                size="icon"
                variant="outline"
                className="rounded-full w-9 h-9 border-border/80 shadow-2xs hover:bg-muted active:scale-95 transition-all"
                disabled={weekOffset === 0}
                onClick={() => setWeekOffset((w) => w - 1)}
                aria-label="Previous week"
              >
                <ChevronLeft size={16} />
              </Button>

              <Button
                size="icon"
                variant="outline"
                className="rounded-full w-9 h-9 border-border/80 shadow-2xs hover:bg-muted active:scale-95 transition-all"
                onClick={() => setWeekOffset((w) => w + 1)}
                aria-label="Next week"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Clear Week: Cleanly left-aligned under header row so arrows never shift */}
        {currentWeekPlan.length > 0 && (
          <div className="sm:hidden flex items-center justify-between pt-2.5 pb-0.5 border-t border-border/50 mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1.5 px-2 -ml-2 rounded-lg"
              onClick={clearMealPlan}
            >
              <RotateCcw size={12} /> Clear all meals
            </Button>
            <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
              {currentWeekPlan.length} {currentWeekPlan.length === 1 ? "meal" : "meals"} planned
            </span>
          </div>
        )}
      </div>

      {/* Mobile Day Selector Strip (< 768px) */}
      <div className="md:hidden mb-5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5 scroll-smooth snap-x snap-mandatory">
          {days.map((day, idx) => {
            const dayIndex = weekOffset * 7 + idx;
            const isSelected = selectedDayIdx === idx;
            const dayMealsCount = currentWeekPlan.filter(
              (p) => p.day === dayIndex && p.recipeId,
            ).length;
            return (
              <button
                key={day.name}
                type="button"
                onClick={() => setSelectedDayIdx(idx)}
                className={`flex flex-col items-center justify-center py-2 px-2.5 rounded-xl border transition-all text-center shrink-0 min-w-[50px] snap-start ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs ring-2 ring-primary/20 scale-[1.02]"
                    : "bg-card text-foreground border-border/80 hover:bg-muted/60 active:scale-95"
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-85">
                  {day.name.slice(0, 3)}
                </span>
                <span className="text-sm font-extrabold my-0.5 leading-none">
                  {idx + 1}
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-1 transition-all ${
                    dayMealsCount > 0
                      ? isSelected
                        ? "bg-primary-foreground"
                        : "bg-clay"
                      : "opacity-0"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Selected Day View Card */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 mt-3 shadow-xs">
          <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-border/60">
            <div>
              <h3 className="font-serif font-bold text-lg text-foreground tracking-tight">
                {days[selectedDayIdx]?.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {days[selectedDayIdx]?.subtitle}
              </p>
            </div>
            <span className="text-xs font-semibold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20 tabular-nums">
              {
                currentWeekPlan.filter(
                  (p) => p.day === weekOffset * 7 + selectedDayIdx && p.recipeId,
                ).length
              }{" "}
              / 3 planned
            </span>
          </div>

          <div className="space-y-3">
            {mealSlots.map((meal) => {
              const dayIndex = weekOffset * 7 + selectedDayIdx;
              const planned = currentWeekPlan.find(
                (p) => p.day === dayIndex && p.meal === meal,
              );
              const recipe = items.find((r) => r.id === planned?.recipeId);

              return (
                <div
                  key={meal}
                  className="p-3 sm:p-3.5 rounded-xl border border-border/70 bg-background/60 hover:bg-background/90 transition-all flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {recipe ? (
                      <Link
                        to="/recipe/$id"
                        params={{ id: recipe.id }}
                        className="shrink-0 group"
                      >
                        <img
                          src={recipe.image || pasta}
                          alt={recipe.title}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-border/40 shadow-2xs group-hover:opacity-90 transition-opacity"
                        />
                      </Link>
                    ) : (
                      <div className="w-12 h-12 rounded-xl border border-border/60 flex items-center justify-center text-muted-foreground/70 shrink-0 bg-muted/40">
                        <Utensils size={16} />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase text-primary tracking-wider block mb-0.5">
                        {meal}
                      </span>
                      {recipe ? (
                        <>
                          <Link
                            to="/recipe/$id"
                            params={{ id: recipe.id }}
                            className="font-serif font-bold text-sm text-foreground hover:text-primary transition-colors truncate block"
                          >
                            {recipe.title}
                          </Link>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Clock size={11} className="shrink-0" />
                            <span>{recipe.time} min</span>
                            <span>·</span>
                            <span>{recipe.category}</span>
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground block">
                          Nothing planned yet
                        </span>
                      )}
                    </div>
                  </div>

                  {recipe ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                      onClick={() => {
                        const oldRecipeId = recipe.id;
                        setMeal(dayIndex, meal, "");
                        toast.info(`Removed "${recipe.title}" from ${meal}`, {
                          action: {
                            label: "Undo",
                            onClick: () => setMeal(dayIndex, meal, oldRecipeId),
                          },
                        });
                      }}
                      title="Remove meal"
                      aria-label={`Remove ${recipe.title} from ${meal}`}
                    >
                      <Trash2 size={15} />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full h-8 text-xs font-semibold px-3.5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground shrink-0 gap-1.5 shadow-2xs active:scale-95 transition-all"
                      onClick={() => {
                        setActiveSlot({ day: dayIndex, meal });
                        setSelectedRecipeId(items[0]?.id || "");
                      }}
                    >
                      <Plus size={13} /> Plan
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7-Day Calendar Planner Matrix (Desktop md:grid) */}
      <div className="hidden md:grid planner-grid">
        {days.map((day, idx) => {
          const dayIndex = weekOffset * 7 + idx;
          return (
            <section className="planner-day" key={day.name}>
              <h3>
                {day.name.slice(0, 3)}
                <small>{day.subtitle}</small>
              </h3>

              <div className="space-y-2 mt-4">
                {mealSlots.map((meal) => {
                  const planned = currentWeekPlan.find(
                    (p) => p.day === dayIndex && p.meal === meal,
                  );
                  const recipe = items.find((r) => r.id === planned?.recipeId);

                  return (
                    <div className="meal-slot" key={meal}>
                      <span className="tiny-label font-bold text-muted-foreground uppercase text-[9px]">
                        {meal}
                      </span>

                      {recipe ? (
                        <div className="relative group">
                          <Link to="/recipe/$id" params={{ id: recipe.id }}>
                            <img
                              src={recipe.image || pasta}
                              alt={recipe.title}
                              loading="lazy"
                              decoding="async"
                              width={384}
                              height={256}
                              suppressHydrationWarning
                              onError={e => {
                                (e.currentTarget as HTMLImageElement).src = pasta;
                              }}
                            />
                            <strong>{recipe.title}</strong>
                          </Link>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                            <span>{recipe.time} min</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                const oldRecipeId = recipe.id;
                                setMeal(dayIndex, meal, "");
                                toast.info(`Removed "${recipe.title}" from plan`, {
                                  action: {
                                    label: "Undo",
                                    onClick: () => setMeal(dayIndex, meal, oldRecipeId),
                                  },
                                });
                              }}
                              title="Remove from meal plan"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="w-full py-4 border border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-all mt-2"
                          onClick={() => {
                            setActiveSlot({ day: dayIndex, meal });
                            setSelectedRecipeId(items[0]?.id || "");
                          }}
                        >
                          <Plus size={14} />
                          <span className="text-[10px] font-semibold">Plan {meal}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* ASSIGN RECIPE MODAL */}
      <Dialog open={Boolean(activeSlot)} onOpenChange={() => setActiveSlot(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle>
            Plan {activeSlot?.meal} for {days[(activeSlot?.day ?? 0) % 7]?.name}
          </DialogTitle>
          <DialogDescription>
            Choose a dish from your recipe catalog to assign to this slot.
          </DialogDescription>

          <div className="mt-4 space-y-3">
            <label className="text-xs font-semibold block mb-1">Select Recipe</label>
            <select
              aria-label="Select recipe"
              className="w-full text-xs p-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={selectedRecipeId}
              onChange={(e) => setSelectedRecipeId(e.target.value)}
            >
              {items
                .filter((r) => r.status !== "Draft")
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.category} · {r.time} min · {r.diet})
                  </option>
                ))}
            </select>

            {/* Quick preview of chosen recipe */}
            {(() => {
              const previewItem = items.find((r) => r.id === selectedRecipeId);
              if (!previewItem) return null;
              return (
                <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border/70 bg-muted/30">
                  <img
                    src={previewItem.image || pasta}
                    alt={previewItem.title}
                    className="w-12 h-12 rounded-lg object-cover border border-border/40 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-serif font-bold text-xs truncate text-foreground">
                      {previewItem.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      ⏱ {previewItem.time} min · {previewItem.category} · {previewItem.diet}
                    </p>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end gap-2 pt-3">
              <Button
                variant="ghost"
                className="rounded-full text-xs h-9 px-4"
                onClick={() => setActiveSlot(null)}
              >
                Cancel
              </Button>
              <Button
                className="rounded-full bg-primary text-primary-foreground text-xs font-semibold h-9 px-5 shadow-xs"
                onClick={() => {
                  if (activeSlot && selectedRecipeId) {
                    setMeal(activeSlot.day, activeSlot.meal, selectedRecipeId);
                    setActiveSlot(null);
                    toast.success("Added to weekly schedule");
                  }
                }}
              >
                Assign Meal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AGGREGATED MARKET BASKET / SHOPPING LIST MODAL */}
      <Dialog open={shoppingModalOpen} onOpenChange={setShoppingModalOpen}>
        <DialogContent className="max-w-xl max-h-[88vh] p-0 sm:p-0 flex flex-col gap-0 sm:gap-0 overflow-hidden">
          <div className="overflow-y-auto max-h-[88vh] no-scrollbar">
            <div className="px-5 py-5 sm:px-7 sm:py-6 space-y-3">
              {/* Header & Controls Area */}
          <div className="border-b border-border/70 pb-2.5 space-y-2">
            {/* Row 1: Title & Description on Left, Aisle/Slip Toggle on Right (Desktop) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 pr-10 sm:pr-8">
              <div className="min-w-0">
                <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-serif font-bold text-foreground">
                  <ShoppingBasket size={20} className="text-primary shrink-0" />
                  <span className="truncate">Your Market Basket</span>
                </DialogTitle>
                <DialogDescription className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  Consolidated across all planned recipes for {weekOffset === 0 ? "this week" : `week +${weekOffset}`}.
                </DialogDescription>
              </div>

              {/* Laptop only: Aisle/Slip toggle placed on the right edge */}
              <div className="hidden sm:flex items-center shrink-0">
                <div className="bg-muted/80 p-0.5 rounded-full flex items-center border border-border shadow-2xs">
                  <Button
                    type="button"
                    variant={!receiptView ? "default" : "ghost"}
                    size="sm"
                    className={`h-7 text-xs font-semibold rounded-full px-3 transition-all ${
                      !receiptView
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    }`}
                    onClick={() => setReceiptView(false)}
                  >
                    <ListFilter size={13} className="mr-1.5" /> Aisles
                  </Button>
                  <Button
                    type="button"
                    variant={receiptView ? "default" : "ghost"}
                    size="sm"
                    className={`h-7 text-xs font-semibold rounded-full px-3 transition-all ${
                      receiptView
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    }`}
                    onClick={() => setReceiptView(true)}
                  >
                    <Receipt size={13} className="mr-1.5" /> Slip
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile only: Aisle/Slip toggle - LEFT ALIGNED */}
            <div className="sm:hidden flex items-center justify-start pt-1">
              <div className="bg-muted/80 p-0.5 rounded-full flex items-center border border-border shadow-2xs">
                <Button
                  type="button"
                  variant={!receiptView ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 text-xs font-semibold rounded-full px-3 transition-all ${
                    !receiptView
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                  onClick={() => setReceiptView(false)}
                >
                  <ListFilter size={12} className="mr-1.5" /> Aisles
                </Button>
                <Button
                  type="button"
                  variant={receiptView ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 text-xs font-semibold rounded-full px-3 transition-all ${
                    receiptView
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                  onClick={() => setReceiptView(true)}
                >
                  <Receipt size={12} className="mr-1.5" /> Slip
                </Button>
              </div>
            </div>

            {/* Mobile Action Buttons: Copy & Print side-by-side, WhatsApp full-width on next line */}
            <div className="sm:hidden flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1.5 text-xs h-8 px-3 border-border/80 hover:bg-muted active:scale-95 transition-all flex-1 justify-center"
                  onClick={copyShoppingList}
                  title="Copy formatted list to clipboard"
                >
                  <Copy size={13} className="text-muted-foreground shrink-0" />
                  <span>Copy list</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1.5 text-xs h-8 px-3 border-border/80 hover:bg-muted active:scale-95 transition-all flex-1 justify-center"
                  onClick={printReceipt}
                  title="Print grocery list"
                >
                  <Printer size={13} className="text-muted-foreground shrink-0" />
                  <span>Print slip</span>
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-2 text-xs h-8.5 px-4 border-border/80 hover:text-emerald-600 hover:border-emerald-600/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 active:scale-95 transition-all w-full justify-center"
                onClick={shareWhatsApp}
                title="Send checkable grocery list to WhatsApp"
              >
                <Share2 size={13} className="text-emerald-600 shrink-0" />
                <span>Share via WhatsApp</span>
              </Button>
            </div>

            {/* Desktop Action Buttons: Single row aligned to the right */}
            <div className="hidden sm:flex items-center justify-between gap-2 pt-0.5 w-full">
              <div className="text-[11px] text-muted-foreground mr-auto tabular-nums">
                {checkedShoppingItems.length > 0
                  ? `${checkedShoppingItems.length} of ${totalIngredientsCount} items checked`
                  : `${totalIngredientsCount} total ingredients`}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1.5 text-xs h-8 px-3.5 border-border/80 hover:bg-muted active:scale-95 transition-all"
                  onClick={copyShoppingList}
                  title="Copy formatted list to clipboard"
                >
                  <Copy size={13} className="text-muted-foreground shrink-0" />
                  <span>Copy</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1.5 text-xs h-8 px-3.5 border-border/80 hover:text-emerald-600 hover:border-emerald-600/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 active:scale-95 transition-all"
                  onClick={shareWhatsApp}
                  title="Send checkable grocery list to WhatsApp"
                >
                  <Share2 size={13} className="text-emerald-600 shrink-0" />
                  <span>WhatsApp</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1.5 text-xs h-8 px-3.5 border-border/80 hover:bg-muted active:scale-95 transition-all"
                  onClick={printReceipt}
                  title="Print grocery list"
                >
                  <Printer size={13} className="text-muted-foreground shrink-0" />
                  <span>Print</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Estimated Weekly Grocery Budget Pill - Compact & Zero Bloat */}
          {totalIngredientsCount > 0 && (
            <div className="bg-primary/5 border border-primary/20 py-1.5 px-3 rounded-lg flex items-center justify-between gap-2 mt-2 mb-1.5 text-xs shadow-2xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <Coins size={13} className="text-honey shrink-0" />
                <span className="font-semibold text-foreground text-[11px] sm:text-xs truncate">
                  Estimated Grocery Budget:
                </span>
              </div>
              <div className="flex items-baseline gap-1 shrink-0 text-right">
                <span className="font-serif font-bold text-primary text-xs sm:text-sm tabular-nums">
                  ~${(
                    Object.values(shoppingListByAisle)
                      .flat()
                      .filter((i) => !i.inPantry).length * 2.25
                  ).toFixed(2)}
                </span>
                <span className="font-normal text-[10px] text-muted-foreground whitespace-nowrap">
                  ({Object.values(shoppingListByAisle).flat().filter((i) => !i.inPantry).length} to buy)
                </span>
              </div>
            </div>
          )}

          {totalIngredientsCount === 0 ? (
            <div className="text-center py-10">
              <ShoppingBasket size={28} className="text-primary mx-auto mb-2" />
              <p className="text-sm font-semibold">No meals planned yet for this week.</p>
              <small className="text-muted-foreground text-xs">
                Add recipes to the calendar above to generate an aisle-by-aisle shopping list.
              </small>
            </div>
          ) : receiptView ? (
            /* VINTAGE THERMAL GROCERY SLIP VIEW */
            <div className="my-3 p-4 sm:p-6 bg-[#FCFAF7] dark:bg-[#1E1B18] border-2 border-dashed border-[#D5C7B6] dark:border-[#423932] rounded-xl font-mono text-xs shadow-inner printable-receipt">
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-[#D5C7B6] dark:border-[#423932]">
                <p className="tracking-widest font-bold text-sm text-[#2C231B] dark:text-[#E8DFD5]">
                  *** RECIPEVAULT PANTRY DISPATCH ***
                </p>
                <p className="text-[10px] text-muted-foreground">
                  WEEKLY GROCERY CONSOLIDATION SLIP
                </p>
                <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                  <span>DATE: {new Date().toLocaleDateString()}</span>
                  <span>CHEF: {currentUser.name.toUpperCase()}</span>
                </div>
              </div>

              <div className="py-4 space-y-4">
                {Object.entries(shoppingListByAisle).map(([category, itemsList]) => (
                  <div key={category} className="space-y-1">
                    <p className="font-bold text-[11px] text-primary tracking-wider">
                      [ {category.toUpperCase()} ]
                    </p>
                    {itemsList.map((item) => {
                      const itemKey = `${item.name}|${item.unit}`;
                      const isChecked = checkedShoppingItems.includes(itemKey);

                      return (
                        <div
                          key={itemKey}
                          className="flex items-center justify-between text-xs py-0.5 border-b border-dotted border-border/40"
                        >
                          <span className={isChecked ? "line-through opacity-50" : ""}>
                            {isChecked ? "[✓]" : "[ ]"} {formatCulinaryQuantity(item.quantity)}{" "}
                            {item.unit} {item.name}
                          </span>
                          {item.inPantry && (
                            <span className="text-[10px] text-sage font-bold shrink-0">
                              *IN PANTRY
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t-2 border-dashed border-[#D5C7B6] dark:border-[#423932] space-y-1.5 text-[11px]">
                <div className="flex justify-between font-bold">
                  <span>TOTAL ITEMS COMPILED:</span>
                  <span>{totalIngredientsCount}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-[10px]">
                  <span>PANTRY MATCH ITEMS:</span>
                  <span>
                    {
                      Object.values(shoppingListByAisle)
                        .flat()
                        .filter((i) => i.inPantry).length
                    }{" "}
                    already in stock
                  </span>
                </div>
              </div>

              <div className="text-center pt-4 space-y-1">
                <p className="text-[9px] tracking-[0.25em] text-muted-foreground font-bold">
                  ||| | |||| | || | ||| |||| | ||| || | ||
                </p>
                <p className="text-[10px] text-muted-foreground italic">
                  Cook with intention · Eat with joy
                </p>
              </div>
            </div>
          ) : (
            /* STANDARD CATEGORIZED AISLE LIST */
            <div className="space-y-3.5 mt-1.5">
              {Object.entries(shoppingListByAisle).map(([category, itemsList]) => (
                <div key={category}>
                  <h4 className="aisle-header">{category}</h4>
                  <div className="space-y-1.5">
                    {itemsList.map((item) => {
                      const itemKey = `${item.name}|${item.unit}`;
                      const isChecked = checkedShoppingItems.includes(itemKey);

                      return (
                        <div
                          key={itemKey}
                          className={`shopping-item cursor-pointer transition-colors ${
                            isChecked ? "opacity-60 bg-muted/40" : "hover:bg-muted/30"
                          }`}
                          onClick={() =>
                            setCheckedShoppingItems((prev) =>
                              prev.includes(itemKey)
                                ? prev.filter((x) => x !== itemKey)
                                : [...prev, itemKey],
                            )
                          }
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded accent-clay w-4 h-4 cursor-pointer shrink-0"
                          />
                          <div className="flex-1 text-xs select-none pr-1.5 min-w-0">
                            <span
                              className={`block leading-snug ${
                                isChecked ? "line-through text-muted-foreground" : "font-medium text-foreground"
                              }`}
                            >
                              <strong className="tabular mr-1 text-foreground">
                                {formatCulinaryQuantity(item.quantity)} {item.unit}
                              </strong>
                              <span>{item.name}</span>
                            </span>
                          </div>

                          {item.inPantry && (
                            <span className="text-[10px] bg-secondary text-primary px-2 py-0.5 rounded-full font-semibold shrink-0 border border-primary/20">
                              In Pantry ✓
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
