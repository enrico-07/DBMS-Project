import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
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
  Pencil,
  X,
} from "lucide-react";
import { useVault } from "@/components/vault-provider";
import { PageHeading } from "@/components/recipe-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export type BasketItem = {
  id: string;
  key: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  inPantry: boolean;
  isCustom?: boolean;
  isEdited?: boolean;
};

export type BasketWeekCustomization = {
  customItems: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    category: string;
    inPantry: boolean;
  }>;
  deletedKeys: string[];
  overrides: Record<
    string,
    {
      name: string;
      quantity: number;
      unit: string;
      category: string;
      inPantry?: boolean;
    }
  >;
};

const DEFAULT_AISLE_CATEGORIES = [
  "Produce",
  "Dairy & Eggs",
  "Grains & Pasta",
  "Proteins",
  "Legumes",
  "Pantry & Spices",
  "Baking",
  "Condiments",
  "Nuts & Seeds",
  "Pantry Essentials",
  "Other",
];

const COMMON_UNITS = [
  "whole",
  "g",
  "kg",
  "ml",
  "L",
  "tbsp",
  "tsp",
  "cup",
  "cups",
  "oz",
  "lb",
  "cloves",
  "bunch",
  "slices",
  "can",
  "pinch",
  "pkg",
];

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

  // Basket Customizations (Add / Edit / Remove) persisted per week
  const [basketCustomizations, setBasketCustomizations] = useState<
    Record<number, BasketWeekCustomization>
  >(() => {
    try {
      const raw = localStorage.getItem("rv_market_basket_customizations_v1");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "rv_market_basket_customizations_v1",
        JSON.stringify(basketCustomizations),
      );
    } catch {
      // Storage quota or private browsing fallback
    }
  }, [basketCustomizations]);

  // Form states for adding a custom item
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemUnit, setNewItemUnit] = useState("whole");
  const [newItemCategory, setNewItemCategory] = useState("Produce");
  const [newItemInPantry, setNewItemInPantry] = useState(false);

  // Form states for inline editing an item
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    quantity: number;
    unit: string;
    category: string;
    inPantry: boolean;
  }>({
    name: "",
    quantity: 1,
    unit: "whole",
    category: "Produce",
    inPantry: false,
  });

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

  const currentWeekCustomizations = useMemo<BasketWeekCustomization>(() => {
    return (
      basketCustomizations[weekOffset] || {
        customItems: [],
        deletedKeys: [],
        overrides: {},
      }
    );
  }, [basketCustomizations, weekOffset]);

  const hasModifications = useMemo(() => {
    const data = currentWeekCustomizations;
    return (
      (data.customItems && data.customItems.length > 0) ||
      (data.deletedKeys && data.deletedKeys.length > 0) ||
      (data.overrides && Object.keys(data.overrides).length > 0)
    );
  }, [currentWeekCustomizations]);

  // Aggregate shopping list grouped by aisle with customizations applied
  const shoppingListByAisle = useMemo(() => {
    const map = new Map<string, BasketItem>();
    const deletedSet = new Set(currentWeekCustomizations.deletedKeys || []);
    const overrides = currentWeekCustomizations.overrides || {};

    // 1. Process base recipe plan items
    currentWeekPlan.forEach((p) => {
      const recipe = items.find((r) => r.id === p.recipeId);
      if (!recipe) return;

      const servingMultiplier = (p.customServings || recipe.servings) / recipe.servings;

      recipe.ingredients.forEach((ing) => {
        const baseKey = `${ing.name.toLowerCase().trim()}|${ing.unit.toLowerCase().trim()}`;

        // If this base recipe item was explicitly removed by the user, omit it
        if (deletedSet.has(baseKey)) {
          return;
        }

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

        if (map.has(baseKey)) {
          const existing = map.get(baseKey)!;
          existing.quantity += currentQty;
        } else {
          map.set(baseKey, {
            id: `plan_${baseKey}`,
            key: baseKey,
            name: ing.name,
            quantity: currentQty,
            unit: ing.unit,
            category,
            inPantry,
          });
        }
      });
    });

    // 2. Apply user overrides (name, quantity, unit, category, inPantry)
    Object.entries(overrides).forEach(([key, override]) => {
      if (map.has(key)) {
        const item = map.get(key)!;
        map.set(key, {
          ...item,
          name: override.name ?? item.name,
          quantity: override.quantity ?? item.quantity,
          unit: override.unit ?? item.unit,
          category: override.category ?? item.category,
          inPantry: override.inPantry !== undefined ? override.inPantry : item.inPantry,
          isEdited: true,
        });
      }
    });

    // 3. Add custom user items
    (currentWeekCustomizations.customItems || []).forEach((cItem) => {
      if (deletedSet.has(cItem.id)) return;
      map.set(cItem.id, {
        id: cItem.id,
        key: cItem.id,
        name: cItem.name,
        quantity: cItem.quantity,
        unit: cItem.unit,
        category: cItem.category,
        inPantry: cItem.inPantry,
        isCustom: true,
      });
    });

    // 4. Group items by category in preferred aisle order
    const grouped: Record<string, BasketItem[]> = {};
    Array.from(map.values()).forEach((item) => {
      const aisle = item.category || "Pantry Essentials";
      const aisleItems = grouped[aisle] ?? (grouped[aisle] = []);
      aisleItems.push(item);
    });

    return grouped;
  }, [currentWeekPlan, items, pantry, currentWeekCustomizations]);

  const totalIngredientsCount = Object.values(shoppingListByAisle).reduce(
    (acc, list) => acc + list.length,
    0,
  );

  // CRUD actions for Market Basket items
  const handleAddCustomItem = () => {
    if (!newItemName.trim()) {
      toast.error("Please enter an item name");
      return;
    }
    const qtyNum = parseFloat(newItemQty) || 1;
    const newCustomItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newItemName.trim(),
      quantity: qtyNum,
      unit: newItemUnit.trim() || "whole",
      category: newItemCategory || "Produce",
      inPantry: newItemInPantry,
    };

    setBasketCustomizations((prev) => {
      const weekData = prev[weekOffset] || {
        customItems: [],
        deletedKeys: [],
        overrides: {},
      };
      return {
        ...prev,
        [weekOffset]: {
          ...weekData,
          customItems: [...(weekData.customItems || []), newCustomItem],
        },
      };
    });

    toast.success(`Added "${newItemName.trim()}" to market basket`);
    setNewItemName("");
    setNewItemQty("1");
    setNewItemUnit("whole");
    setNewItemInPantry(false);
    setShowAddForm(false);
  };

  const startEditing = (item: BasketItem) => {
    setEditingItemId(item.id);
    setEditForm({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      inPantry: item.inPantry,
    });
  };

  const handleSaveEdit = (item: BasketItem) => {
    if (!editForm.name.trim()) {
      toast.error("Item name cannot be empty");
      return;
    }
    if (editForm.quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    setBasketCustomizations((prev) => {
      const weekData = prev[weekOffset] || {
        customItems: [],
        deletedKeys: [],
        overrides: {},
      };

      if (item.isCustom) {
        const updatedCustom = (weekData.customItems || []).map((ci) =>
          ci.id === item.id
            ? {
                ...ci,
                name: editForm.name.trim(),
                quantity: editForm.quantity,
                unit: editForm.unit.trim() || "whole",
                category: editForm.category,
                inPantry: editForm.inPantry,
              }
            : ci,
        );
        return {
          ...prev,
          [weekOffset]: {
            ...weekData,
            customItems: updatedCustom,
          },
        };
      } else {
        return {
          ...prev,
          [weekOffset]: {
            ...weekData,
            overrides: {
              ...(weekData.overrides || {}),
              [item.key]: {
                name: editForm.name.trim(),
                quantity: editForm.quantity,
                unit: editForm.unit.trim() || "whole",
                category: editForm.category,
                inPantry: editForm.inPantry,
              },
            },
          },
        };
      }
    });

    toast.success(`Updated "${editForm.name.trim()}"`);
    setEditingItemId(null);
  };

  const handleDeleteItem = (item: BasketItem) => {
    setBasketCustomizations((prev) => {
      const weekData = prev[weekOffset] || {
        customItems: [],
        deletedKeys: [],
        overrides: {},
      };

      if (item.isCustom) {
        return {
          ...prev,
          [weekOffset]: {
            ...weekData,
            customItems: (weekData.customItems || []).filter((ci) => ci.id !== item.id),
          },
        };
      } else {
        return {
          ...prev,
          [weekOffset]: {
            ...weekData,
            deletedKeys: [...(weekData.deletedKeys || []).filter((k) => k !== item.key), item.key],
          },
        };
      }
    });

    // Remove from checked items
    setCheckedShoppingItems((prev) =>
      prev.filter((id) => id !== item.id && id !== item.key && id !== `${item.name}|${item.unit}`),
    );

    toast.success(`Removed "${item.name}" from basket`, {
      action: {
        label: "Undo",
        onClick: () => {
          handleUndoDelete(item);
        },
      },
    });
  };

  const handleUndoDelete = (item: BasketItem) => {
    setBasketCustomizations((prev) => {
      const weekData = prev[weekOffset] || {
        customItems: [],
        deletedKeys: [],
        overrides: {},
      };

      if (item.isCustom) {
        return {
          ...prev,
          [weekOffset]: {
            ...weekData,
            customItems: [
              ...(weekData.customItems || []),
              {
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                category: item.category,
                inPantry: item.inPantry,
              },
            ],
          },
        };
      } else {
        return {
          ...prev,
          [weekOffset]: {
            ...weekData,
            deletedKeys: (weekData.deletedKeys || []).filter((k) => k !== item.key),
          },
        };
      }
    });
    toast.info(`Restored "${item.name}" to basket`);
  };

  const handleResetPlan = () => {
    setBasketCustomizations((prev) => {
      const copy = { ...prev };
      delete copy[weekOffset];
      return copy;
    });
    setEditingItemId(null);
    setShowAddForm(false);
    toast.info("Reset market basket to planned recipe ingredients");
  };

  const copyShoppingList = async () => {
    let text = `🛒 RecipeVault Market Basket (${weekOffset === 0 ? "This Week" : `Week +${weekOffset}`})\n\n`;
    Object.entries(shoppingListByAisle).forEach(([cat, list]) => {
      text += `--- ${cat.toUpperCase()} ---\n`;
      list.forEach((item) => {
        const isChecked =
          checkedShoppingItems.includes(item.id) ||
          checkedShoppingItems.includes(item.key) ||
          checkedShoppingItems.includes(`${item.name}|${item.unit}`);
        const pantryTag = item.inPantry ? " (In Pantry ✓)" : "";
        const customTag = item.isCustom ? " (Extra)" : "";
        text += `${isChecked ? "[x]" : "[ ]"} ${formatCulinaryQuantity(item.quantity)} ${item.unit} ${item.name}${customTag}${pantryTag}\n`;
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
        const isChecked =
          checkedShoppingItems.includes(item.id) ||
          checkedShoppingItems.includes(item.key) ||
          checkedShoppingItems.includes(`${item.name}|${item.unit}`);
        const inPantryText = item.inPantry ? " (Pantry ✓)" : "";
        const customText = item.isCustom ? " [Extra]" : "";
        msg += `${isChecked ? "✅" : "▫️"} ${formatCulinaryQuantity(item.quantity)} ${item.unit} ${item.name}${customText}${inPantryText}\n`;
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
            <div className="px-4 py-4 sm:px-7 sm:py-6 space-y-3">
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

              {/* Laptop only: Aisle/Slip toggle & Add Item placed on the right edge */}
              <div className="hidden sm:flex items-center gap-2 shrink-0">
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

                <Button
                  type="button"
                  size="sm"
                  className="h-7 text-xs font-semibold rounded-full px-3 bg-primary text-primary-foreground shadow-xs gap-1.5"
                  onClick={() => setShowAddForm((v) => !v)}
                  title="Add custom item to basket"
                >
                  <Plus size={13} />
                  <span>Add</span>
                </Button>
              </div>
            </div>

            {/* Mobile only: Aisle/Slip toggle on left, compact Add button on right */}
            <div className="sm:hidden flex items-center justify-between gap-2 pt-1">
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

              <Button
                type="button"
                size="sm"
                className="h-7 text-xs font-semibold rounded-full px-3 bg-primary text-primary-foreground shadow-xs gap-1 shrink-0"
                onClick={() => setShowAddForm((v) => !v)}
                title="Add custom item to basket"
              >
                <Plus size={13} />
                <span>Add</span>
              </Button>
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

              {hasModifications && (
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5 px-0.5">
                  <span className="tabular-nums">
                    {checkedShoppingItems.length > 0
                      ? `${checkedShoppingItems.length} of ${totalIngredientsCount} checked`
                      : `${totalIngredientsCount} items`}
                  </span>
                  <button
                    type="button"
                    onClick={handleResetPlan}
                    className="text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <RotateCcw size={11} /> Reset to recipe plan
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Action Buttons: Single row aligned to the right */}
            <div className="hidden sm:flex items-center justify-between gap-2 pt-0.5 w-full">
              <div className="flex items-center gap-2 mr-auto">
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {checkedShoppingItems.length > 0
                    ? `${checkedShoppingItems.length} of ${totalIngredientsCount} items checked`
                    : `${totalIngredientsCount} total ingredients`}
                </span>
                {hasModifications && (
                  <button
                    type="button"
                    onClick={handleResetPlan}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer ml-1"
                    title="Revert custom additions, edits, and deletions back to planned recipe ingredients"
                  >
                    <RotateCcw size={11} /> Revert to recipe plan
                  </button>
                )}
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

          {/* Add Custom Item Inline Form (Smooth Expand) */}
          {showAddForm && (
            <div className="p-3.5 sm:p-4 bg-primary/[0.04] border border-primary/30 rounded-xl space-y-3 mt-2 mb-2 shadow-xs animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between pb-1 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Plus size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-serif font-bold text-foreground">
                      Add Item to Market Basket
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      Add extra groceries, pantry staples, or household items for this week.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => setShowAddForm(false)}
                  title="Cancel"
                >
                  <X size={14} />
                </Button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddCustomItem();
                }}
                className="space-y-2.5 pt-1"
              >
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Item Name *
                  </label>
                  <Input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. Sourdough loaf, Avocados, Olive oil"
                    className="h-8.5 text-xs"
                    autoFocus
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Quantity *
                    </label>
                    <Input
                      type="number"
                      step="any"
                      min="0.01"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(e.target.value)}
                      placeholder="1"
                      className="h-8.5 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Unit
                    </label>
                    <Input
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value)}
                      placeholder="e.g. whole, g, bunch"
                      className="h-8.5 text-xs"
                      list="common-units-list"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Aisle / Category
                    </label>
                    <select
                      value={newItemCategory}
                      onChange={(e) => setNewItemCategory(e.target.value)}
                      className="flex h-8.5 w-full rounded-xl border border-input bg-background/80 px-2.5 py-1 text-xs shadow-xs focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                    >
                      {DEFAULT_AISLE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center pt-2 sm:pt-5">
                    <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newItemInPantry}
                        onChange={(e) => setNewItemInPantry(e.target.checked)}
                        className="rounded accent-clay w-4 h-4 cursor-pointer"
                      />
                      <span>Already in Pantry (Stocked)</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7.5 text-xs px-3"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-7.5 text-xs px-3.5 bg-primary text-primary-foreground gap-1.5 shadow-xs"
                  >
                    <Plus size={13} />
                    <span>Add to Basket</span>
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Estimated Weekly Grocery Budget Pill */}
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
            <div className="text-center py-10 space-y-2">
              <ShoppingBasket size={28} className="text-primary mx-auto mb-1" />
              <p className="text-sm font-semibold">No items in your market basket.</p>
              <p className="text-muted-foreground text-xs max-w-xs mx-auto">
                Add recipes to the weekly calendar above or add custom items to your basket.
              </p>
              <div className="pt-2">
                <Button
                  size="sm"
                  className="rounded-full bg-primary text-primary-foreground gap-1.5 text-xs px-4"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus size={13} /> Add an item
                </Button>
              </div>
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
                      const isChecked =
                        checkedShoppingItems.includes(item.id) ||
                        checkedShoppingItems.includes(item.key) ||
                        checkedShoppingItems.includes(`${item.name}|${item.unit}`);

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs py-0.5 border-b border-dotted border-border/40"
                        >
                          <span className={isChecked ? "line-through opacity-50" : ""}>
                            {isChecked ? "[✓]" : "[ ]"} {formatCulinaryQuantity(item.quantity)}{" "}
                            {item.unit} {item.name}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.isCustom && (
                              <span className="text-[9px] text-honey font-bold">
                                *EXTRA
                              </span>
                            )}
                            {item.isEdited && (
                              <span className="text-[9px] text-primary font-bold">
                                *EDITED
                              </span>
                            )}
                            {item.inPantry && (
                              <span className="text-[10px] text-sage font-bold">
                                *IN PANTRY
                              </span>
                            )}
                          </div>
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
            /* STANDARD CATEGORIZED AISLE LIST WITH ADD/EDIT/DELETE */
            <div className="space-y-3.5 mt-1.5">
              {Object.entries(shoppingListByAisle).map(([category, itemsList]) => (
                <div key={category}>
                  <h4 className="aisle-header">{category}</h4>
                  <div className="space-y-1.5">
                    {itemsList.map((item) => {
                      const isChecked =
                        checkedShoppingItems.includes(item.id) ||
                        checkedShoppingItems.includes(item.key) ||
                        checkedShoppingItems.includes(`${item.name}|${item.unit}`);

                      if (editingItemId === item.id) {
                        return (
                          <div
                            key={item.id}
                            className="p-3 sm:p-3.5 bg-card border-2 border-primary/40 rounded-xl space-y-3 my-2 shadow-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between pb-1 border-b border-border/50">
                              <div className="flex items-center gap-1.5">
                                <Pencil size={13} className="text-primary shrink-0" />
                                <span className="text-xs font-semibold text-foreground">
                                  Edit {item.isCustom ? "Custom Item" : "Recipe Item"}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => setEditingItemId(null)}
                                title="Cancel edit"
                              >
                                <X size={13} />
                              </Button>
                            </div>

                            <div className="space-y-2">
                              <div>
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                  Item Name *
                                </label>
                                <Input
                                  value={editForm.name}
                                  onChange={(e) =>
                                    setEditForm((f) => ({ ...f, name: e.target.value }))
                                  }
                                  placeholder="e.g. Cherry tomatoes"
                                  className="h-8.5 text-xs"
                                  autoFocus
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                    Quantity *
                                  </label>
                                  <Input
                                    type="number"
                                    step="any"
                                    min="0.01"
                                    value={editForm.quantity}
                                    onChange={(e) =>
                                      setEditForm((f) => ({
                                        ...f,
                                        quantity: parseFloat(e.target.value) || 0,
                                      }))
                                    }
                                    className="h-8.5 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                    Unit
                                  </label>
                                  <Input
                                    value={editForm.unit}
                                    onChange={(e) =>
                                      setEditForm((f) => ({ ...f, unit: e.target.value }))
                                    }
                                    placeholder="e.g. g, whole, bunch"
                                    className="h-8.5 text-xs"
                                    list="common-units-list"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                    Aisle / Category
                                  </label>
                                  <select
                                    value={editForm.category}
                                    onChange={(e) =>
                                      setEditForm((f) => ({ ...f, category: e.target.value }))
                                    }
                                    className="flex h-8.5 w-full rounded-xl border border-input bg-background/80 px-2.5 py-1 text-xs shadow-xs focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                                  >
                                    {DEFAULT_AISLE_CATEGORIES.map((cat) => (
                                      <option key={cat} value={cat}>
                                        {cat}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="flex items-center pt-2 sm:pt-5">
                                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={editForm.inPantry}
                                      onChange={(e) =>
                                        setEditForm((f) => ({ ...f, inPantry: e.target.checked }))
                                      }
                                      className="rounded accent-clay w-4 h-4 cursor-pointer"
                                    />
                                    <span>Already in Pantry</span>
                                  </label>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-destructive hover:bg-destructive/10 px-2 gap-1"
                                onClick={() => {
                                  handleDeleteItem(item);
                                  setEditingItemId(null);
                                }}
                              >
                                <Trash2 size={12} />
                                <span>Delete</span>
                              </Button>

                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs px-3"
                                  onClick={() => setEditingItemId(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-7 text-xs px-3 bg-primary text-primary-foreground gap-1"
                                  onClick={() => handleSaveEdit(item)}
                                >
                                  <Check size={12} />
                                  <span>Save</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={item.id}
                          className={`shopping-item cursor-pointer group transition-colors ${
                            isChecked ? "opacity-60 bg-muted/40" : "hover:bg-muted/30"
                          }`}
                          onClick={() =>
                            setCheckedShoppingItems((prev) =>
                              isChecked
                                ? prev.filter(
                                    (x) =>
                                      x !== item.id &&
                                      x !== item.key &&
                                      x !== `${item.name}|${item.unit}`,
                                  )
                                : [...prev, item.id],
                            )
                          }
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded accent-clay w-4 h-4 cursor-pointer shrink-0"
                          />
                          <div className="flex-1 text-xs select-none pr-2 min-w-0">
                            <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0.5">
                              <span className="font-bold tabular-nums text-foreground whitespace-nowrap shrink-0">
                                {formatCulinaryQuantity(item.quantity)} {item.unit}
                              </span>
                              <span
                                className={`leading-snug ${
                                  isChecked
                                    ? "line-through text-muted-foreground"
                                    : "font-medium text-foreground"
                                }`}
                              >
                                {item.name}
                              </span>
                              {item.isCustom && (
                                <span className="text-[9px] bg-amber-500/10 text-amber-800 dark:text-amber-200 px-1.5 py-0.2 rounded font-semibold border border-amber-500/30 whitespace-nowrap shrink-0">
                                  Extra
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0 ml-auto">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(item);
                              }}
                              title={`Edit ${item.name}`}
                            >
                              <Pencil size={13} />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem(item);
                              }}
                              title={`Remove ${item.name}`}
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Autocomplete datalist for standard culinary units */}
          <datalist id="common-units-list">
            {COMMON_UNITS.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
