import { useState, useMemo } from 'react';
import {
  Check,
  ChevronsUpDown,
  Search,
  Plus,
  AlertTriangle,
  HeartPulse,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  masterIngredients,
  type IngredientMaster,
  type IngredientVariety,
  type RecipeIngredient,
  type IngredientCategory,
  type AllergenType,
  findMasterIngredient,
} from '@/lib/recipes';

interface SemanticIngredientPickerProps {
  value: RecipeIngredient;
  onChange: (updated: RecipeIngredient) => void;
  availableIngredients?: IngredientMaster[];
  onAddNewCustomIngredient?: (newMaster: IngredientMaster) => void;
}

const CATEGORIES: ('All' | IngredientCategory)[] = [
  'All',
  'Baking',
  'Dairy & Eggs',
  'Pantry & Spices',
  'Produce',
  'Nuts & Seeds',
  'Grains & Pasta',
  'Legumes',
  'Proteins',
  'Condiments',
];

const PREPARATION_PRESETS: Record<string, string[]> = {
  'ing-butter': ['melted', 'softened to room temp', 'cold and cubed', 'browned', 'clarified'],
  'ing-chocolate': ['finely chopped', 'melted and cooled', 'rough chunks', 'grated'],
  'ing-flour': ['sifted', 'spooned and leveled', 'toasted'],
  'ing-sugar': ['sifted', 'packed', 'creamed with butter'],
  'ing-eggs': ['room temperature', 'beaten', 'separated into whites & yolks'],
  'ing-milk': ['warm (110°F)', 'scalded', 'room temperature', 'ice-cold'],
  'ing-peanuts': ['finely ground', 'coarsely crushed', 'toasted'],
  'ing-garlic': ['minced', 'thinly shaved', 'smashed', 'roasted whole'],
  'ing-lemon': ['finely zested', 'freshly squeezed juice', 'wedges'],
  'ing-tomatoes': ['crushed by hand', 'seeded & diced', 'roasted with skins on'],
};

export function SemanticIngredientPicker({
  value,
  onChange,
  availableIngredients = masterIngredients,
  onAddNewCustomIngredient,
}: SemanticIngredientPickerProps) {
  const [open, setOpen] = useState(false);
  const [varietyModalOpen, setVarietyModalOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | IngredientCategory>('All');

  // Custom Ingredient Form state
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<IngredientCategory>('Baking');
  const [customAllergens, setCustomAllergens] = useState<AllergenType[]>([]);
  const [customDiabetic, setCustomDiabetic] = useState(true);

  // Identify currently matched master & variety
  const currentMaster = useMemo(
    () => findMasterIngredient(value, availableIngredients),
    [value, availableIngredients]
  );

  const currentVariety = useMemo(() => {
    if (!currentMaster || !currentMaster.varieties) return undefined;
    if (value.varietyId) {
      return currentMaster.varieties.find((v) => v.id === value.varietyId);
    }
    return currentMaster.varieties.find(
      (v) => v.name.toLowerCase() === (value.name || '').toLowerCase()
    );
  }, [currentMaster, value.varietyId, value.name]);

  // Filtered ingredients
  const filteredList = useMemo(() => {
    const q = search.toLowerCase().trim();
    return availableIngredients.filter((ing) => {
      if (selectedCategory !== 'All' && ing.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;

      // Match canonical name, aliases, category
      if (
        ing.name.toLowerCase().includes(q) ||
        ing.aliases.toLowerCase().includes(q) ||
        ing.category.toLowerCase().includes(q)
      ) {
        return true;
      }

      // Match any subdivision variety name
      if (ing.varieties?.some((v) => v.name.toLowerCase().includes(q))) {
        return true;
      }

      return false;
    });
  }, [availableIngredients, search, selectedCategory]);

  const handleSelectMaster = (master: IngredientMaster, variety?: IngredientVariety) => {
    const chosenVariety = variety || (master.varieties && master.varieties.length > 0 ? master.varieties[0] : undefined);
    const chosenName = chosenVariety ? chosenVariety.name : master.name;
    const defaultUnit = chosenVariety?.defaultUnit || 'g';

    onChange({
      ...value,
      name: chosenName,
      ingredientId: master.id,
      varietyId: chosenVariety?.id,
      varietyName: chosenVariety?.name,
      unit: defaultUnit,
      // Default prep note if relevant
      preparationState:
        value.preparationState ||
        (PREPARATION_PRESETS[master.id] ? PREPARATION_PRESETS[master.id][0] : ''),
    });
    setOpen(false);
  };

  const handleSelectVariety = (variety: IngredientVariety) => {
    if (!currentMaster) return;
    onChange({
      ...value,
      name: variety.name,
      varietyId: variety.id,
      varietyName: variety.name,
      unit: variety.defaultUnit || value.unit || 'g',
    });
    setVarietyModalOpen(false);
  };

  const handleCreateCustom = () => {
    if (!customName.trim()) return;
    const newId = `ing-${customName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const newMaster: IngredientMaster = {
      id: newId,
      name: customName.trim(),
      aliases: customName.trim(),
      category: customCategory,
      flavor: 'Custom culinary ingredient created for recipe formulation',
      substitute: 'Culinary equivalent',
      storage: 'Airtight container in cool dry pantry',
      commonUses: 'Recipe vault preparations',
      caloriesPer100g: 150,
      proteinPer100g: 4,
      carbsPer100g: 20,
      fatPer100g: 3,
      fiberPer100g: 2,
      glycemicIndex: customDiabetic ? 'Low' : 'High',
      isDiabeticFriendly: customDiabetic,
      allergens: customAllergens,
      isGlutenFree: !customAllergens.includes('Gluten'),
      isVegan: !customAllergens.includes('Dairy') && !customAllergens.includes('Eggs'),
      isVegetarian: true,
    };

    if (onAddNewCustomIngredient) {
      onAddNewCustomIngredient(newMaster);
    }

    handleSelectMaster(newMaster);
    setCustomModalOpen(false);
    setCustomName('');
    setCustomAllergens([]);
  };

  return (
    <div className="flex-1 flex flex-col gap-1.5 w-full min-w-0 md:min-w-[260px]">
      <div className="flex items-center gap-2 w-full">
        {/* Main Search Popover Button */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full flex-1 justify-between text-left font-normal text-xs h-9 px-3.5 bg-background hover:bg-accent/40 border-border rounded-xl shadow-2xs min-w-0"
            >
              <div className="flex items-center gap-2 truncate min-w-0">
                <span className="font-medium text-foreground truncate">
                  {value.name ? value.name : 'Select or search ingredient...'}
                </span>
                {currentVariety && (
                  <Badge variant="outline" className="text-[10px] px-2 py-0 font-medium bg-primary/10 text-primary border-primary/30 shrink-0">
                    {currentVariety.name}
                  </Badge>
                )}
                {currentMaster?.category && !currentVariety && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal shrink-0 hidden sm:inline-flex">
                    {currentMaster.category}
                  </Badge>
                )}
              </div>
              <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            collisionPadding={12}
            className="w-[min(380px,calc(100vw-28px))] p-0 bg-popover border border-border shadow-xl rounded-2xl z-50 overflow-hidden"
            align="start"
          >
            {/* Search Input Box */}
            <div className="flex items-center border-b border-border px-3.5 py-2.5 bg-muted/20">
              <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                className="flex h-8 w-full rounded-md bg-transparent text-xs outline-none placeholder:text-muted-foreground text-foreground"
                placeholder="Type e.g. butter, flour, sugar, chocolate..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 p-2.5 overflow-x-auto border-b border-border bg-card text-[11px] no-scrollbar scroll-smooth">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground font-medium shadow-xs'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="max-h-[280px] overflow-y-auto p-1 divide-y divide-border/40">
              {filteredList.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-3">
                    No ingredient matches "{search}".
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5 rounded-full"
                    onClick={() => {
                      setCustomName(search);
                      setCustomModalOpen(true);
                      setOpen(false);
                    }}
                  >
                    <Plus size={13} /> Add as custom ingredient entity
                  </Button>
                </div>
              ) : (
                filteredList.map((master) => {
                  const isParentSelected = currentMaster?.id === master.id;
                  const hasVarieties = master.varieties && master.varieties.length > 0;

                  return (
                    <div key={master.id} className="p-1 space-y-1">
                      {/* Master Item Header */}
                      <button
                        type="button"
                        onClick={() => handleSelectMaster(master)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors hover:bg-accent/60 ${
                          isParentSelected ? 'bg-primary/10 font-semibold text-primary' : 'text-foreground'
                        }`}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span>{master.name}</span>
                            <span className="text-[10px] text-muted-foreground font-normal">
                              ({master.category})
                            </span>
                          </div>
                          {master.flavor && (
                            <span className="text-[10px] text-muted-foreground truncate max-w-[220px] font-normal hidden sm:inline">
                              {master.flavor}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {master.allergens && master.allergens.length > 0 && (
                            <span
                              className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1 py-0.5 rounded"
                              title={`Contains ${master.allergens.join(', ')}`}
                            >
                              ⚠️ {master.allergens[0]}
                            </span>
                          )}
                          {isParentSelected && <Check size={14} className="text-primary" />}
                        </div>
                      </button>

                      {/* Subdivisions / Varieties under this ingredient */}
                      {hasVarieties && (
                        <div className="pl-4 pr-1 space-y-0.5 border-l-2 border-primary/20 ml-2 py-0.5">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                            Varieties & Subdivisions:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {master.varieties!.map((variety) => {
                              const isVarietyActive = value.varietyId === variety.id;
                              return (
                                <button
                                  key={variety.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectMaster(master, variety);
                                  }}
                                  className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors flex items-center gap-1 ${
                                    isVarietyActive
                                      ? 'bg-primary text-primary-foreground border-primary font-medium'
                                      : 'bg-background hover:bg-accent border-border text-foreground'
                                  }`}
                                  title={variety.culinaryRole}
                                >
                                  {variety.name}
                                  {isVarietyActive && <Check size={10} />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick footer to define custom entity */}
            <div className="border-t border-border p-2 sm:p-2.5 bg-muted/30 flex justify-between items-center text-[11px]">
              <span className="text-muted-foreground">Can’t find your ingredient?</span>
              <button
                type="button"
                onClick={() => {
                  setCustomName(search);
                  setCustomModalOpen(true);
                  setOpen(false);
                }}
                className="text-primary hover:underline text-xs flex items-center gap-1 font-medium cursor-pointer"
              >
                <Plus size={12} /> Add Custom
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Semantic Metadata Pill Row */}
      {currentMaster && (
        <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1">
          {/* Allergens warning */}
          {currentMaster.allergens && currentMaster.allergens.length > 0 && (
            <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full font-medium">
              <AlertTriangle size={10} />
              Contains: {currentMaster.allergens.join(', ')}
            </span>
          )}

          {/* Diabetic check */}
          {currentMaster.isDiabeticFriendly && (
            <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-medium">
              <HeartPulse size={10} />
              Diabetic-Friendly
            </span>
          )}

          {/* Calorie density hint */}
          <span className="text-muted-foreground">
            ~{currentMaster.caloriesPer100g} kcal / 100g
          </span>

          {/* Prep State Suggestion Quick Chips */}
          {PREPARATION_PRESETS[currentMaster.id] && (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <span className="text-muted-foreground/70">Prep:</span>
              {PREPARATION_PRESETS[currentMaster.id].slice(0, 3).map((prep) => (
                <button
                  key={prep}
                  type="button"
                  onClick={() => onChange({ ...value, preparationState: prep })}
                  className={`text-[9px] px-1.5 py-0.2 rounded transition-colors ${
                    value.preparationState === prep
                      ? 'bg-secondary text-secondary-foreground font-semibold'
                      : 'hover:bg-muted text-muted-foreground underline underline-offset-2'
                  }`}
                >
                  {prep}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Variety Picker Modal */}
      <Dialog open={varietyModalOpen} onOpenChange={setVarietyModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">
              Subdivisions & Varieties for {currentMaster?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select the exact culinary variant to refine chemistry, texture, and recipe attributes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            {currentMaster?.varieties?.map((variety) => {
              const isActive = value.varietyId === variety.id;
              return (
                <div
                  key={variety.id}
                  onClick={() => handleSelectVariety(variety)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                    isActive
                      ? 'border-primary bg-primary/5 text-primary shadow-sm'
                      : 'border-border bg-card hover:bg-accent/50 text-foreground'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs">{variety.name}</span>
                      {isActive && <Check size={14} className="text-primary" />}
                    </div>
                    {variety.culinaryRole && (
                      <p className="text-[11px] text-muted-foreground">{variety.culinaryRole}</p>
                    )}
                  </div>
                  {variety.defaultUnit && (
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
                      unit: {variety.defaultUnit}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* New Semantic Ingredient Entity Creation Modal */}
      <Dialog open={customModalOpen} onOpenChange={setCustomModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Define New Semantic Ingredient</DialogTitle>
            <DialogDescription className="text-xs">
              Every ingredient in RecipeVault is a first-class semantic entity with health tags,
              allergens, and relational attributes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-medium text-foreground block mb-1">Ingredient Canonical Name</label>
              <Input
                placeholder="e.g. All-Purpose Flour, Dark Brown Sugar, Clarified Ghee..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">Category</label>
              <select
                className="w-full text-xs p-2 rounded-lg border border-border bg-background"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as IngredientCategory)}
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">Allergens Present</label>
              <div className="flex flex-wrap gap-1.5">
                {(
                  ['Dairy', 'Gluten', 'Peanuts', 'Tree Nuts', 'Eggs', 'Soy', 'Fish', 'Sesame'] as AllergenType[]
                ).map((alg) => {
                  const has = customAllergens.includes(alg);
                  return (
                    <button
                      key={alg}
                      type="button"
                      onClick={() =>
                        setCustomAllergens((prev) =>
                          has ? prev.filter((a) => a !== alg) : [...prev, alg]
                        )
                      }
                      className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                        has
                          ? 'bg-amber-500 text-white border-amber-600 font-medium'
                          : 'bg-muted text-muted-foreground border-transparent hover:bg-accent'
                      }`}
                    >
                      {alg}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="diabeticFriendlyCheck"
                checked={customDiabetic}
                onChange={(e) => setCustomDiabetic(e.target.checked)}
                className="rounded border-border text-primary"
              />
              <label htmlFor="diabeticFriendlyCheck" className="text-xs text-foreground cursor-pointer">
                Diabetic-Friendly (Low glycemic index / high fiber)
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCustomModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateCustom} disabled={!customName.trim()}>
              Save Semantic Entity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
