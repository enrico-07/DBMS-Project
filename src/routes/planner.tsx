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
            className="rounded-full gap-2 text-xs h-9 px-4 shadow-sm hover:border-clay/50 shrink-0"
            onClick={() => setShoppingModalOpen(true)}
          >
            <ShoppingBasket size={15} className="text-clay" />
            Market Basket (<span suppressHydrationWarning>{totalIngredientsCount}</span>)
          </Button>
        }
      />

      {/* Week Navigator & Clear */}
      <div className="section-heading mt-6 mb-6">
        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-clay" />
          <h2 className="text-2xl font-serif">
            {weekOffset === 0
              ? "This Week’s Menu"
              : weekOffset === 1
                ? "Next Week’s Menu"
                : `Week +${weekOffset}`}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            className="rounded-full w-9 h-9"
            disabled={weekOffset === 0}
            onClick={() => setWeekOffset((w) => w - 1)}
            aria-label="Previous week"
          >
            <ChevronLeft size={16} />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="rounded-full w-9 h-9"
            onClick={() => setWeekOffset((w) => w + 1)}
            aria-label="Next week"
          >
            <ChevronRight size={16} />
          </Button>

          {currentWeekPlan.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-destructive gap-1 ml-2"
              onClick={clearMealPlan}
            >
              <RotateCcw size={13} /> Clear Week
            </Button>
          )}
        </div>
      </div>

      {/* 7-Day Calendar Planner Matrix */}
      <div className="planner-grid">
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
                          className="w-full py-4 border border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-clay hover:text-clay transition-all mt-2"
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
              className="w-full text-xs p-3 rounded-xl border border-border bg-card"
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

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="ghost" onClick={() => setActiveSlot(null)}>
                Cancel
              </Button>
              <Button
                className="rounded-full bg-clay text-white"
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
        <DialogContent className="max-w-xl max-h-[88vh] overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl font-serif">
                <ShoppingBasket size={20} className="text-clay" />
                Your Market Basket
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Consolidated across all planned recipes for {weekOffset === 0 ? "this week" : `week +${weekOffset}`}.
              </DialogDescription>
            </div>

            {/* View Switcher & Action Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
              <div className="bg-secondary p-0.5 rounded-full flex items-center border border-border mr-1">
                <Button
                  type="button"
                  variant={!receiptView ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 text-[11px] rounded-full px-2.5 ${!receiptView ? "bg-clay text-white shadow-none" : "hover:bg-background/50"}`}
                  onClick={() => setReceiptView(false)}
                >
                  <ListFilter size={12} className="mr-1" /> Aisles
                </Button>
                <Button
                  type="button"
                  variant={receiptView ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 text-[11px] rounded-full px-2.5 ${receiptView ? "bg-clay text-white shadow-none" : "hover:bg-background/50"}`}
                  onClick={() => setReceiptView(true)}
                >
                  <Receipt size={12} className="mr-1" /> Slip
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-1 text-[11px] h-7 px-2.5"
                onClick={printReceipt}
                title="Print thermal grocery slip"
              >
                <Printer size={12} /> Print
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-1 text-[11px] h-7 px-2.5 hover:text-emerald-600 hover:border-emerald-600/40"
                onClick={shareWhatsApp}
                title="Send checkable grocery list to WhatsApp"
              >
                <Share2 size={12} /> WhatsApp
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-1 text-[11px] h-7 px-2.5"
                onClick={copyShoppingList}
                title="Copy formatted list to clipboard"
              >
                <Copy size={12} /> Copy
              </Button>
            </div>
          </div>

          {/* Estimated Weekly Grocery Budget Pill (Phase 3) */}
          {totalIngredientsCount > 0 && (
            <div className="bg-peach/60 border border-clay/20 p-3 rounded-2xl flex items-center justify-between my-3 text-xs">
              <div className="flex items-center gap-2">
                <Coins size={15} className="text-honey" />
                <span className="font-semibold text-foreground">Estimated Grocery Budget:</span>
              </div>
              <span className="font-serif font-bold text-clay text-sm tabular">
                ~${(
                  Object.values(shoppingListByAisle)
                    .flat()
                    .filter((i) => !i.inPantry).length * 2.25
                ).toFixed(2)}{' '}
                <small className="font-normal text-[10px] text-muted-foreground ml-1">
                  ({Object.values(shoppingListByAisle).flat().filter((i) => !i.inPantry).length} items to buy)
                </small>
              </span>
            </div>
          )}

          {totalIngredientsCount === 0 ? (
            <div className="text-center py-10">
              <ShoppingBasket size={28} className="text-clay mx-auto mb-2" />
              <p className="text-sm font-semibold">No meals planned yet for this week.</p>
              <small className="text-muted-foreground text-xs">
                Add recipes to the calendar above to generate an aisle-by-aisle shopping list.
              </small>
            </div>
          ) : receiptView ? (
            /* VINTAGE THERMAL GROCERY SLIP VIEW */
            <div className="my-4 p-6 bg-[#FCFAF7] dark:bg-[#1E1B18] border-2 border-dashed border-[#D5C7B6] dark:border-[#423932] rounded-xl font-mono text-xs shadow-inner printable-receipt">
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
                    <p className="font-bold text-[11px] text-clay dark:text-clay/90 tracking-wider">
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
            <div className="space-y-6 mt-4">
              {Object.entries(shoppingListByAisle).map(([category, itemsList]) => (
                <div key={category}>
                  <h4 className="aisle-header">{category}</h4>
                  <div className="space-y-1.5">
                    {itemsList.map((item) => {
                      const itemKey = `${item.name}|${item.unit}`;
                      const isChecked = checkedShoppingItems.includes(itemKey);

                      return (
                        <div key={itemKey} className="shopping-item">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              setCheckedShoppingItems((prev) =>
                                prev.includes(itemKey)
                                  ? prev.filter((x) => x !== itemKey)
                                  : [...prev, itemKey],
                              )
                            }
                            className="rounded accent-clay"
                          />
                          <div className="flex-1 text-xs">
                            <span
                              className={
                                isChecked ? "line-through text-muted-foreground" : "font-medium"
                              }
                            >
                              <strong className="tabular mr-1">
                                {formatCulinaryQuantity(item.quantity)} {item.unit}
                              </strong>
                              {item.name}
                            </span>
                          </div>

                          {item.inPantry && (
                            <span className="text-[10px] bg-secondary text-primary px-2 py-0.5 rounded-full font-semibold shrink-0">
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
