import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ShoppingBasket,
  Trash2,
  Calendar,
  Sparkles,
  Check,
  Copy,
  RotateCcw,
} from 'lucide-react';
import { useVault } from '@/components/vault-provider';
import { PageHeading } from '@/components/recipe-card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { pageMeta } from '@/lib/metadata';
import { masterIngredients, formatCulinaryQuantity } from '@/lib/recipes';
import { toast } from 'sonner';

export const Route = createFileRoute('/planner')({
  component: Planner,
  head: () =>
    pageMeta(
      'Weekly Meal Planner & Consolidated Shopping List',
      'Plan your culinary week, assign meals, and automatically generate an aisle-categorized shopping list.'
    ),
});

function Planner() {
  const { items, plan, setMeal, clearMealPlan, pantry } = useVault();
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeSlot, setActiveSlot] = useState<{ day: number; meal: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' } | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [shoppingModalOpen, setShoppingModalOpen] = useState(false);
  const [checkedShoppingItems, setCheckedShoppingItems] = useState<string[]>([]);

  const days = [
    { name: 'Monday', subtitle: 'A fresh start' },
    { name: 'Tuesday', subtitle: 'Simple flavors' },
    { name: 'Wednesday', subtitle: 'Midweek comfort' },
    { name: 'Thursday', subtitle: 'Quick & nourishing' },
    { name: 'Friday', subtitle: 'Celebration dinner' },
    { name: 'Saturday', subtitle: 'Slow cooking' },
    { name: 'Sunday', subtitle: 'Family favorites' },
  ];

  const mealSlots: ('Breakfast' | 'Lunch' | 'Dinner')[] = ['Breakfast', 'Lunch', 'Dinner'];

  // Current week's plan items
  const currentWeekPlan = useMemo(() => {
    const start = weekOffset * 7;
    const end = start + 7;
    return plan.filter(p => p.day >= start && p.day < end);
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

    currentWeekPlan.forEach(p => {
      const recipe = items.find(r => r.id === p.recipeId);
      if (!recipe) return;

      const servingMultiplier = (p.customServings || recipe.servings) / recipe.servings;

      recipe.ingredients.forEach(ing => {
        const key = `${ing.name.toLowerCase()}|${ing.unit.toLowerCase()}`;
        const master = masterIngredients.find(
          m => m.name.toLowerCase() === ing.name.toLowerCase() || ing.name.toLowerCase().includes(m.name.toLowerCase())
        );
        const category = master?.category || 'Pantry Essentials';
        const inPantry = pantry.some(
          item => item.toLowerCase() === ing.name.toLowerCase() || ing.name.toLowerCase().includes(item.toLowerCase())
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
    Array.from(map.values()).forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });

    return grouped;
  }, [currentWeekPlan, items, pantry]);

  const totalIngredientsCount = Object.values(shoppingListByAisle).reduce(
    (acc, list) => acc + list.length,
    0
  );

  const copyShoppingList = async () => {
    let text = `🛒 RecipeVault Market Basket (${weekOffset === 0 ? 'This Week' : `Week +${weekOffset}`})\n\n`;
    Object.entries(shoppingListByAisle).forEach(([cat, list]) => {
      text += `--- ${cat.toUpperCase()} ---\n`;
      list.forEach(item => {
        const isChecked = checkedShoppingItems.includes(`${item.name}|${item.unit}`);
        const pantryTag = item.inPantry ? ' (Already in Pantry)' : '';
        text += `${isChecked ? '[x]' : '[ ]'} ${formatCulinaryQuantity(item.quantity)} ${item.unit} ${item.name}${pantryTag}\n`;
      });
      text += '\n';
    });

    try {
      await navigator.clipboard.writeText(text);
      toast.success('Market shopping list copied to clipboard!');
    } catch {
      toast.error('Unable to copy list automatically.');
    }
  };

  return (
    <div className="standard-page">
      <PageHeading
        eyebrow="RELATIONAL MEAL PLANNING & AUTOMATION"
        title="A delicious week ahead."
        description="Schedule comforting lunches, effortless weeknight dinners, and consolidate your ingredients into an automated shopping list."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-full gap-2"
              onClick={() => setShoppingModalOpen(true)}
            >
              <ShoppingBasket size={16} className="text-clay" />
              Market Basket ({totalIngredientsCount})
            </Button>
          </div>
        }
      />

      {/* Week Navigator & Clear */}
      <div className="section-heading">
        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-clay" />
          <h2>
            {weekOffset === 0
              ? 'This Week’s Menu'
              : weekOffset === 1
              ? 'Next Week’s Menu'
              : `Week +${weekOffset}`}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            className="rounded-full w-9 h-9"
            disabled={weekOffset === 0}
            onClick={() => setWeekOffset(w => w - 1)}
            aria-label="Previous week"
          >
            <ChevronLeft size={16} />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="rounded-full w-9 h-9"
            onClick={() => setWeekOffset(w => w + 1)}
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
                {mealSlots.map(meal => {
                  const planned = currentWeekPlan.find(p => p.day === dayIndex && p.meal === meal);
                  const recipe = items.find(r => r.id === planned?.recipeId);

                  return (
                    <div className="meal-slot" key={meal}>
                      <span className="tiny-label font-bold text-muted-foreground uppercase text-[9px]">
                        {meal}
                      </span>

                      {recipe ? (
                        <div className="relative group">
                          <Link to="/recipe/$id" params={{ id: recipe.id }}>
                            <img src={recipe.image} alt={recipe.title} loading="lazy" decoding="async" width={384} height={256} />
                            <strong>{recipe.title}</strong>
                          </Link>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                            <span>{recipe.time} min</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6 text-muted-foreground hover:text-destructive"
                              onClick={() => setMeal(dayIndex, meal, '')}
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
                            setSelectedRecipeId(items[0]?.id || '');
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
              onChange={e => setSelectedRecipeId(e.target.value)}
            >
              {items
                .filter(r => r.status !== 'Draft')
                .map(r => (
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
                    toast.success('Added to weekly schedule');
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
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBasket size={20} className="text-clay" />
              Your Market Basket
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-1.5 text-xs h-8"
              onClick={copyShoppingList}
            >
              <Copy size={13} /> Copy List
            </Button>
          </div>

          <DialogDescription>
            Quantities are automatically compiled and consolidated across all planned meals for this week.
          </DialogDescription>

          {totalIngredientsCount === 0 ? (
            <div className="text-center py-10">
              <Sparkles size={28} className="text-clay mx-auto mb-2" />
              <p className="text-sm font-semibold">No meals planned yet for this week.</p>
              <small className="text-muted-foreground text-xs">
                Add recipes to the calendar above to generate an aisle-by-aisle shopping list.
              </small>
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              {Object.entries(shoppingListByAisle).map(([category, itemsList]) => (
                <div key={category}>
                  <h4 className="aisle-header">{category}</h4>
                  <div className="space-y-1.5">
                    {itemsList.map(item => {
                      const itemKey = `${item.name}|${item.unit}`;
                      const isChecked = checkedShoppingItems.includes(itemKey);

                      return (
                        <div key={itemKey} className="shopping-item">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              setCheckedShoppingItems(prev =>
                                prev.includes(itemKey)
                                  ? prev.filter(x => x !== itemKey)
                                  : [...prev, itemKey]
                              )
                            }
                            className="rounded accent-clay"
                          />
                          <div className="flex-1 text-xs">
                            <span className={isChecked ? 'line-through text-muted-foreground' : 'font-medium'}>
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