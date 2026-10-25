import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  ImagePlus,
  Check,
  Save,
  Clock,
  ArrowLeft,
  GitCommit,
  Wand2,
  AlertTriangle,
  HeartPulse,
  Flame,
  Wheat,
  ShieldCheck,
  Activity,
  Globe,
  Lock,
  Link as LinkIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PageHeading } from '@/components/recipe-card';
import { useVault } from '@/components/vault-provider';
import { pageMeta } from '@/lib/metadata';
import {
  type RecipeIngredient,
  type RecipeStep,
  type IngredientMaster,
  parseRawRecipeText,
  inferRecipeDietaryTags,
  estimateRecipeNutrition,
  masterIngredients,
} from '@/lib/recipes';
import { SemanticIngredientPicker } from '@/components/semantic-ingredient-picker';
import { toast } from 'sonner';

export const Route = createFileRoute('/create')({
  validateSearch: (search: Record<string, unknown>): { edit?: string } =>
    typeof search['edit'] === 'string' ? { edit: search['edit'] } : {},
  component: CreateRecipe,
  head: () =>
    pageMeta(
      'Recipe Builder & Version Control',
      'Create or refine recipes with structured ingredients, timed instructions, and immutable version history.'
    ),
});

function CreateRecipe() {
  const { edit } = Route.useSearch();
  const { items, addRecipe, currentUser } = useVault();
  const original = items.find(r => r.id === edit);
  const navigate = useNavigate();

  // Recipe Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState(2);
  const [prepTime, setPrepTime] = useState(10);
  const [cookTime, setCookTime] = useState(20);
  const [category, setCategory] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Desserts' | 'Baking' | 'Snacks'>('Dinner');
  const [cuisine, setCuisine] = useState<'Italian' | 'Mediterranean' | 'American' | 'Indian' | 'Japanese' | 'Mexican' | 'Other'>('Italian');
  const [diet, setDiet] = useState<'Vegetarian' | 'Vegan' | 'High protein' | 'Gluten-free' | 'Balanced'>('Vegetarian');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Advanced'>('Easy');
  const [visibility, setVisibility] = useState<'Public' | 'Private' | 'Unlisted'>('Public');
  const [source, setSource] = useState('My Kitchen');
  const [image, setImage] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Structured Ingredients & Steps
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { name: '', quantity: 100, unit: 'g', preparationState: '' },
    { name: '', quantity: 1, unit: 'tbsp', preparationState: '' },
  ]);
  const [steps, setSteps] = useState<RecipeStep[]>([
    { stepNumber: 1, instruction: '', durationMinutes: 5, tip: '' },
  ]);

  // Master ingredients state (with dynamic runtime additions)
  const [availableMasterList, setAvailableMasterList] = useState<IngredientMaster[]>(masterIngredients);

  const handleAddNewCustomIngredient = (newMaster: IngredientMaster) => {
    setAvailableMasterList((prev) => [newMaster, ...prev]);
    toast.success(`Registered "${newMaster.name}" into master semantic ingredient ontology!`);
  };

  // Real-time Relational & Nutritional Intelligence Engine
  const intelligence = useMemo(() => {
    const valid = ingredients.filter(
      (i) => (i.name || '').trim().length > 0 && Number(i.quantity) > 0
    );
    const tagsAndAllergens = inferRecipeDietaryTags(valid, availableMasterList);
    const nutrition = estimateRecipeNutrition(
      valid,
      Number(servings) || 2,
      availableMasterList
    );
    return {
      ...tagsAndAllergens,
      nutrition,
      validCount: valid.length,
    };
  }, [ingredients, servings, availableMasterList]);

  // Version Control Commit Message (for edits)
  const [changeSummary, setChangeSummary] = useState('');

  // Smart Recipe Importer Modal State
  const [smartImportOpen, setSmartImportOpen] = useState(false);
  const [rawImportText, setRawImportText] = useState('');

  const handleSmartExtract = () => {
    if (!rawImportText.trim()) {
      toast.error('Please paste recipe text first.');
      return;
    }
    const draft = parseRawRecipeText(rawImportText);
    setTitle(draft.title);
    setDescription(draft.description);
    setServings(draft.servings);
    setPrepTime(draft.prepTime);
    setCookTime(draft.cookTime);
    setCategory(draft.category);
    setCuisine(draft.cuisine);
    setDiet(draft.diet);
    setIngredients(draft.ingredients);
    setSteps(draft.steps);
    setSmartImportOpen(false);
    setRawImportText('');
    toast.success(
      `Extracted "${draft.title}" with ${draft.ingredients.length} ingredients and ${draft.steps.length} timed steps!`,
    );
  };

  // Prepopulate if editing
  useEffect(() => {
    if (original) {
      setTitle(original.title);
      setDescription(original.description);
      setServings(original.servings);
      setPrepTime(original.prepTime || 10);
      setCookTime(original.cookTime || original.time - 10);
      setCategory(original.category);
      setCuisine(original.cuisine);
      setDiet(original.diet);
      setDifficulty(original.difficulty || 'Easy');
      setVisibility(original.visibility);
      setSource(original.source);
      setImage(original.image);
      setIngredients(original.ingredients);
      setSteps(original.steps);
      setChangeSummary('');
    }
  }, [original]);

  const handleSubmit = async (status: 'Published' | 'Draft') => {
    if (isSubmitting) return;
    if (!title.trim()) {
      toast.error('Please enter a recipe title.');
      return;
    }
    const validIngredients = ingredients.filter(i => (i.name || '').trim().length > 0 && i.quantity > 0);
    if (validIngredients.length === 0) {
      toast.error('Add at least one valid ingredient with quantity.');
      return;
    }
    const validSteps = steps.filter(s => s.instruction.trim().length > 0);
    if (validSteps.length === 0) {
      toast.error('Add at least one cooking instruction step.');
      return;
    }

    setIsSubmitting(true);
    try {
      const id = edit ?? `rec-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || crypto.randomUUID().slice(0, 8)}`;
      const totalTime = Number(prepTime) + Number(cookTime);

      // Precise nutritional calculation from semantic ontology
      const calculatedNutrition = intelligence.nutrition;
      const calories = original?.calories && edit ? original.calories : calculatedNutrition.calories;
      const protein = original?.protein && edit ? original.protein : calculatedNutrition.protein;
      const carbs = original?.carbs && edit ? original.carbs : calculatedNutrition.carbs;
      const fat = original?.fat && edit ? original.fat : calculatedNutrition.fat;
      const fiber = calculatedNutrition.fiber || original?.fiber || 4;

      const harmonizedTags = Array.from(new Set([
        cuisine,
        category,
        diet,
        ...intelligence.inferredTags,
      ])).filter(Boolean);

      const syncResult = await addRecipe(
        {
          id,
          title: title.trim(),
          description: description.trim() || 'A delightful homemade recipe worth savoring.',
          image: image || original?.image || items[0]?.image || '',
          category,
          cuisine,
          diet,
          difficulty,
          prepTime: Number(prepTime),
          cookTime: Number(cookTime),
          time: totalTime,
          servings: Number(servings),
          rating: original?.rating || '5.0',
          ratingCount: original?.ratingCount || 1,
          calories,
          protein,
          carbs,
          fat,
          fiber,
          source: source.trim() || `${currentUser.name}’s Kitchen`,
          visibility,
          status,
          createdBy: original?.createdBy || currentUser.id,
          createdAt: original?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ingredients: validIngredients,
          steps: validSteps.map((s, idx) => ({ ...s, stepNumber: idx + 1 })),
          tags: harmonizedTags,
        },
        edit ? changeSummary.trim() || undefined : undefined
      );

      if (syncResult && syncResult.success === false) {
        toast.error(`Database save note: ${syncResult.error || 'Check connectivity'}`);
        return;
      }

      toast.success(
        status === 'Draft'
          ? 'Draft saved to your cookbook.'
          : edit
          ? 'Recipe revisions committed to version history!'
          : 'Recipe published to RecipeVault!'
      );

      navigate({ to: '/recipe/$id', params: { id } });
    } catch (e: any) {
      toast.error(`Save error: ${e.message || String(e)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="standard-page editor-page max-w-5xl mx-auto">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
        <button
          type="button"
          onClick={() => navigate({ to: '/' })}
          className="hover:text-primary transition-colors font-medium cursor-pointer"
        >
          Discover
        </button>
        <span>/</span>
        <span className="text-foreground font-semibold">{edit ? 'Edit Recipe' : 'Add New Recipe'}</span>
      </nav>

      <PageHeading
        eyebrow="STRUCTURED RECIPE BUILDER & DBMS ENGINE"
        title={edit ? `Refining "${original?.title || 'Recipe'}"` : 'Every great recipe has a story.'}
        description="Capture precise ingredient quantities, cooking durations, and version revisions for your digital shelf."
        action={
          <div className="flex items-center gap-2.5 justify-end">
            {!edit && (
              <Button
                type="button"
                variant="outline"
                className="rounded-full gap-1.5 text-xs text-primary border-primary/40 hover:bg-primary/10 shrink-0 shadow-2xs"
                onClick={() => setSmartImportOpen(true)}
              >
                <Wand2 size={14} /> Smart Paste / Import
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              className="rounded-full text-xs"
              onClick={() => navigate({ to: edit ? `/recipe/${edit}` : '/' })}
            >
              <ArrowLeft size={16} className="mr-1" /> Cancel
            </Button>
          </div>
        }
      />

      <form
        onSubmit={e => {
          e.preventDefault();
          handleSubmit('Published');
        }}
      >
        <div className="editor-layout flex flex-col gap-8 w-full">
          {/* Version Commit Note (Only on edit) */}
            {edit && (
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl">
                <label className="text-xs font-bold text-primary uppercase flex items-center gap-1.5 mb-2">
                  <GitCommit size={15} /> Version Control Commit Note
                </label>
                <Input
                  placeholder="e.g. Adjusted lemon juice ratio and reduced cooking time by 5 minutes"
                  value={changeSummary}
                  onChange={e => setChangeSummary(e.target.value)}
                  className="bg-card text-xs"
                />
                <span className="text-[10px] text-muted-foreground mt-1.5 block">
                  This note will be permanently logged in the recipe’s revision timeline.
                </span>
              </div>
            )}

            {/* General Metadata */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <h2 className="text-xl font-serif">Recipe Essentials</h2>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Recipe Title *
                </label>
                <Input
                  required
                  placeholder="e.g. Classic Bucatini all’Amatriciana"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Description & Context
                </label>
                <Textarea
                  placeholder="What makes this dish memorable? Origins, textures, aromas…"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Servings</label>
                  <Input
                    type="number"
                    min={1}
                    max={24}
                    value={servings}
                    onChange={e => setServings(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Prep Time (min)</label>
                  <Input
                    type="number"
                    min={1}
                    value={prepTime}
                    onChange={e => setPrepTime(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Cook Time (min)</label>
                  <Input
                    type="number"
                    min={0}
                    value={cookTime}
                    onChange={e => setCookTime(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Difficulty</label>
                  <Select value={difficulty} onValueChange={(val: any) => setDifficulty(val)}>
                    <SelectTrigger className="w-full text-xs h-9 rounded-xl border-border bg-background">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground shadow-xl p-1">
                      <SelectItem value="Easy" className="rounded-lg text-xs py-2 px-2.5 cursor-pointer">Easy</SelectItem>
                      <SelectItem value="Medium" className="rounded-lg text-xs py-2 px-2.5 cursor-pointer">Medium</SelectItem>
                      <SelectItem value="Advanced" className="rounded-lg text-xs py-2 px-2.5 cursor-pointer">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Category</label>
                  <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                    <SelectTrigger className="w-full text-xs h-9 rounded-xl border-border bg-background">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground shadow-xl p-1">
                      {['Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Baking', 'Snacks'].map(x => (
                        <SelectItem key={x} value={x} className="rounded-lg text-xs py-2 px-2.5 cursor-pointer">
                          {x}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Cuisine</label>
                  <Select value={cuisine} onValueChange={(val: any) => setCuisine(val)}>
                    <SelectTrigger className="w-full text-xs h-9 rounded-xl border-border bg-background">
                      <SelectValue placeholder="Cuisine" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground shadow-xl p-1">
                      {['Italian', 'Mediterranean', 'American', 'Indian', 'Japanese', 'Mexican', 'Other'].map(x => (
                        <SelectItem key={x} value={x} className="rounded-lg text-xs py-2 px-2.5 cursor-pointer">
                          {x}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Dietary Tag</label>
                  <Select value={diet} onValueChange={(val: any) => setDiet(val)}>
                    <SelectTrigger className="w-full text-xs h-9 rounded-xl border-border bg-background">
                      <SelectValue placeholder="Dietary Tag" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground shadow-xl p-1">
                      {['Vegetarian', 'Vegan', 'High protein', 'Gluten-free', 'Balanced'].map(x => (
                        <SelectItem key={x} value={x} className="rounded-lg text-xs py-2 px-2.5 cursor-pointer">
                          {x}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Live Recipe Formulation & Intelligence Card */}
            <div className="bg-card border border-primary/20 p-6 rounded-2xl shadow-sm space-y-4 bg-gradient-to-br from-card via-card to-primary/5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight">Live Culinary Intelligence</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Real-time relational analysis from semantic ingredient entities
                    </p>
                  </div>
                </div>

                {/* Live Macro Snapshot */}
                <div className="flex items-center gap-2.5 text-xs bg-background/80 border border-border px-3.5 py-1.5 rounded-full font-mono shadow-2xs">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <Flame size={13} className="text-amber-500" />
                    {intelligence.nutrition.calories} kcal
                  </span>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="text-muted-foreground">P: <strong className="text-foreground">{intelligence.nutrition.protein}g</strong></span>
                  <span className="text-muted-foreground">C: <strong className="text-foreground">{intelligence.nutrition.carbs}g</strong></span>
                  <span className="text-muted-foreground">F: <strong className="text-foreground">{intelligence.nutrition.fat}g</strong></span>
                  <span className="text-[10px] text-muted-foreground">/ serving</span>
                </div>
              </div>

              {/* Detected Allergens & Health Badges */}
              <div className="flex flex-wrap items-center gap-2.5 pt-4 mt-3 border-t border-border/60">
                {/* Allergens */}
                {intelligence.detectedAllergens.length > 0 ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertTriangle size={13} /> Allergens:
                    </span>
                    {intelligence.detectedAllergens.map(alg => (
                      <Badge key={alg} variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs px-3 py-1 rounded-full font-medium shadow-2xs">
                        {alg === 'Dairy' ? '🥛 Dairy' : alg === 'Gluten' ? '🌾 Gluten' : alg === 'Peanuts' ? '🥜 Peanuts' : alg === 'Tree Nuts' ? '🌰 Tree Nuts' : alg === 'Eggs' ? '🥚 Eggs' : alg === 'Soy' ? '🌱 Soy' : alg === 'Fish' ? '🐟 Fish' : alg}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs px-3 py-1 rounded-full font-medium shadow-2xs">
                    <ShieldCheck size={13} className="mr-1 inline" /> Common Allergen-Free
                  </Badge>
                )}

                {/* Health Traits */}
                {intelligence.isDiabeticFriendly && (
                  <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs px-3 py-1 rounded-full font-medium shadow-2xs">
                    <HeartPulse size={13} className="mr-1 inline" /> Diabetic-Friendly
                  </Badge>
                )}

                {intelligence.isGlutenFree && (
                  <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs px-3 py-1 rounded-full font-medium shadow-2xs">
                    <Wheat size={13} className="mr-1 inline" /> 100% Gluten-Free
                  </Badge>
                )}

                {intelligence.isVegan && (
                  <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300 text-xs px-3 py-1 rounded-full font-medium shadow-2xs">
                    🌿 100% Vegan
                  </Badge>
                )}

                {/* One-click apply suggestion */}
                {intelligence.inferredTags.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (intelligence.isVegan && diet !== 'Vegan') setDiet('Vegan');
                      else if (intelligence.isVegetarian && diet !== 'Vegetarian' && diet !== 'Vegan') setDiet('Vegetarian');
                      else if (intelligence.isGlutenFree && diet !== 'Gluten-free') setDiet('Gluten-free');
                      toast.success('Aligned dietary tag with ingredient formulation!');
                    }}
                    className="ml-auto text-xs text-primary hover:underline font-medium cursor-pointer"
                  >
                    Auto-align diet tag
                  </button>
                )}
              </div>
            </div>

            {/* Ingredients Table */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif">Ingredients</h2>
                  <p className="text-xs text-muted-foreground">
                    Select semantic entities with varieties, exact weights, and preparation notes.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1"
                  onClick={() =>
                    setIngredients(prev => [
                      ...prev,
                      { name: '', quantity: 100, unit: 'g', preparationState: '' },
                    ])
                  }
                >
                  <Plus size={14} /> Add Ingredient
                </Button>
              </div>

              <div className="space-y-3">
                {ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-border bg-card/60 flex flex-col md:flex-row md:items-start gap-3 hover:border-primary/30 transition-all shadow-sm"
                  >
                    {/* Semantic Combobox & Variety Selector */}
                    <SemanticIngredientPicker
                      value={ing}
                      availableIngredients={availableMasterList}
                      onAddNewCustomIngredient={handleAddNewCustomIngredient}
                      onChange={(updated) =>
                        setIngredients((p) => p.map((item, n) => (n === idx ? updated : item)))
                      }
                    />

                    {/* Numeric Quantity */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground md:hidden mb-0.5">Quantity</span>
                        <Input
                          type="number"
                          step="any"
                          min={0.01}
                          placeholder="Qty"
                          value={ing.quantity}
                          onChange={(e) =>
                            setIngredients((p) =>
                              p.map((item, n) =>
                                n === idx ? { ...item, quantity: Number(e.target.value) } : item
                              )
                            )
                          }
                          className="w-20 text-xs h-9"
                          required
                        />
                      </div>

                      {/* Standard Unit */}
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground md:hidden mb-0.5">Unit</span>
                        <Select
                          value={ing.unit}
                          onValueChange={(val) =>
                            setIngredients((p) =>
                              p.map((item, n) => (n === idx ? { ...item, unit: val } : item))
                            )
                          }
                        >
                          <SelectTrigger className="w-24 text-xs h-9 rounded-xl border-border bg-background font-mono">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground shadow-xl p-1 max-h-52">
                            {['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'whole', 'clove', 'pinch', 'slice', 'oz', 'lb'].map(
                              (u) => (
                                <SelectItem key={u} value={u} className="rounded-lg text-xs py-1.5 px-2 cursor-pointer font-mono">
                                  {u}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Preparation Notes */}
                      <div className="flex-1 flex flex-col min-w-[120px]">
                        <span className="text-[10px] text-muted-foreground md:hidden mb-0.5">Prep Notes</span>
                        <Input
                          placeholder="Prep (e.g. melted, sifted)"
                          value={ing.preparationState || ''}
                          onChange={(e) =>
                            setIngredients((p) =>
                              p.map((item, n) =>
                                n === idx ? { ...item, preparationState: e.target.value } : item
                              )
                            )
                          }
                          className="text-xs h-9"
                        />
                      </div>

                      {/* Remove Button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={ingredients.length <= 1}
                        onClick={() => setIngredients((p) => p.filter((_, n) => n !== idx))}
                        className="text-muted-foreground hover:text-destructive h-9 w-9 shrink-0 mt-auto md:mt-0"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instruction Steps */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif">Method Steps</h2>
                  <p className="text-xs text-muted-foreground">
                    Numbered instructions used in active cooking mode.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1"
                  onClick={() =>
                    setSteps(prev => [...prev, { stepNumber: prev.length + 1, instruction: '', durationMinutes: 5, tip: '' }])
                  }
                >
                  <Plus size={14} /> Add Step
                </Button>
              </div>

              <div className="space-y-4">
                {steps.map((st, idx) => (
                  <div key={idx} className="bg-background border border-border p-4 sm:p-5 rounded-2xl flex gap-3 sm:gap-4 shadow-2xs hover:border-primary/30 transition-all">
                    <span className="step-number w-8 h-8 text-xs shrink-0 font-semibold">{idx + 1}</span>
                    <div className="flex-1 space-y-2.5">
                      <Textarea
                        placeholder={`Describe step ${idx + 1} in clear cooking instructions…`}
                        value={st.instruction}
                        onChange={e =>
                          setSteps(p => p.map((item, n) => (n === idx ? { ...item, instruction: e.target.value } : item)))
                        }
                        rows={2}
                        className="text-xs rounded-xl min-h-[68px] leading-relaxed"
                        required
                      />
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          placeholder="Optional chef’s tip (e.g. keep heat on medium-low)…"
                          value={st.tip || ''}
                          onChange={e =>
                            setSteps(p => p.map((item, n) => (n === idx ? { ...item, tip: e.target.value } : item)))
                          }
                          className="text-xs h-9 rounded-xl flex-1 bg-card"
                        />
                        <div className="flex items-center gap-1.5 self-start sm:self-auto">
                          <Select
                            value={String(st.durationMinutes ?? 5)}
                            onValueChange={(val) =>
                              setSteps(p =>
                                p.map((item, n) => (n === idx ? { ...item, durationMinutes: Number(val) } : item))
                              )
                            }
                          >
                            <SelectTrigger className="w-28 text-xs h-9 rounded-xl border-border bg-card gap-1.5 shadow-2xs shrink-0 font-medium cursor-pointer">
                              <Clock size={13} className="text-muted-foreground shrink-0" />
                              <SelectValue placeholder="5 min" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground shadow-xl p-1 max-h-56">
                              {[1, 2, 3, 4, 5, 7, 8, 10, 12, 15, 20, 25, 30, 40, 45, 60, 90, 120].map(mins => (
                                <SelectItem key={mins} value={String(mins)} className="rounded-lg text-xs py-1.5 px-2.5 cursor-pointer font-medium">
                                  {mins} min
                                </SelectItem>
                              ))}
                              {st.durationMinutes && ![1, 2, 3, 4, 5, 7, 8, 10, 12, 15, 20, 25, 30, 40, 45, 60, 90, 120].includes(st.durationMinutes) && (
                                <SelectItem value={String(st.durationMinutes)} className="rounded-lg text-xs py-1.5 px-2.5 cursor-pointer font-medium">
                                  {st.durationMinutes} min
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={steps.length <= 1}
                      onClick={() => setSteps(p => p.filter((_, n) => n !== idx))}
                      className="text-muted-foreground hover:text-destructive h-9 w-9 rounded-xl shrink-0"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recipe Imagery & Publishing Settings */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6 w-full">
              <div>
                <h2 className="text-xl font-serif">Recipe Imagery</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  High-resolution photo for the dish card and cookbook shelf.
                </p>
              </div>

              {image ? (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-border aspect-[16/10] bg-muted/30 shadow-xs group">
                    <img src={image} alt="Recipe Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 p-4">
                      <label className="cursor-pointer">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white text-zinc-900 shadow-md hover:bg-white/90 transition-all cursor-pointer">
                          <ImagePlus size={14} /> Change Photo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') setImage(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="rounded-full gap-1.5 text-xs shadow-md h-9 px-3.5"
                        onClick={() => setImage('')}
                      >
                        <Trash2 size={14} /> Remove
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                      <Check size={14} className="text-emerald-500" /> Photo attached
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1">
                        <ImagePlus size={13} />
                        <span>Change</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') setImage(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      <span className="text-muted-foreground/30">•</span>
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="text-xs text-destructive hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="upload-zone p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/60 transition-all group border-2 border-dashed rounded-2xl bg-muted/10">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-2xs">
                      <ImagePlus size={22} />
                    </div>
                    <span className="text-sm font-semibold text-foreground mb-1">
                      Upload Recipe Photo
                    </span>
                    <p className="text-xs text-muted-foreground max-w-xs mb-3.5">
                      JPG, PNG, or WebP up to 10MB
                    </p>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-sm group-hover:bg-primary/90 transition-all">
                      <ImagePlus size={14} /> Browse Image File
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') setImage(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>

                  {/* Or Image Link paste input */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="relative flex-1">
                      <LinkIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Or paste image URL (https://...)"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        className="text-xs h-9 pl-8 rounded-xl bg-background"
                      />
                    </div>
                    {imageUrlInput && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (imageUrlInput.trim()) {
                            setImage(imageUrlInput.trim());
                            setImageUrlInput('');
                            toast.success('Image link attached!');
                          }
                        }}
                        className="rounded-full text-xs h-9 px-4 shrink-0 shadow-2xs"
                      >
                        Attach
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Metadata with generous breathing room (fixes Image 4 cramped spacing) */}
              <div className="pt-6 border-t border-border/60 space-y-5">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                    Source Attribution
                  </label>
                  <Input
                    placeholder="e.g. Nonna’s handwritten notes, 1984"
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    className="text-xs h-9 rounded-xl bg-background"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Credit original author, family heirloom, or cookbook origin.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                    Privacy & Visibility
                  </label>
                  <Select value={visibility} onValueChange={(val: any) => setVisibility(val)}>
                    <SelectTrigger className="w-full text-xs h-9 rounded-xl border-border bg-background">
                      <SelectValue placeholder="Privacy & Visibility" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground shadow-xl p-1">
                      <SelectItem value="Public" className="rounded-lg text-xs py-2 px-2.5 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Globe size={13} className="text-primary" />
                          <span>Public (Discoverable by everyone)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Private" className="rounded-lg text-xs py-2 px-2.5 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Lock size={13} className="text-muted-foreground" />
                          <span>Private (Only you in your cookbook)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Unlisted" className="rounded-lg text-xs py-2 px-2.5 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <LinkIcon size={13} className="text-muted-foreground" />
                          <span>Unlisted (Direct link only)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Publishing Footer Actions */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-3 w-full">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-primary text-primary-foreground gap-2 shadow-md hover:bg-primary/90 disabled:opacity-50 h-11 text-sm font-semibold"
              >
                <Check size={16} />
                {isSubmitting ? 'Saving to Vault...' : edit ? 'Commit Revisions' : 'Publish to Vault'}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                className="w-full rounded-full gap-2 disabled:opacity-50 h-10 text-xs"
                onClick={() => handleSubmit('Draft')}
              >
                <Save size={15} /> Save as Draft
              </Button>
            </div>
          </div>
        </form>

      {/* Smart Unstructured Text Recipe Importer Modal */}
      <Dialog open={smartImportOpen} onOpenChange={setSmartImportOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <Wand2 size={18} className="text-primary" /> Fast Recipe Text Importer
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Paste unformatted recipe notes, a family recipe card, or an online snippet. Our relational parser extracts ingredients, quantities, units, and numbered steps instantly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <Textarea
              rows={9}
              placeholder={`Example:\nGrandma's Garlic Roasted Potatoes\nA crispy family staple for holidays.\nServings: 4\nPrep time: 10 mins\nCook time: 35 mins\n\nIngredients:\n* 800 g potatoes, cubed\n* 3 tbsp olive oil\n* 4 cloves garlic, minced\n\nInstructions:\n1. Preheat oven to 400°F (200°C).\n2. Toss potatoes with olive oil and garlic for 5 minutes.\n3. Roast for 30 minutes until crisp.`}
              value={rawImportText}
              onChange={(e) => setRawImportText(e.target.value)}
              className="text-xs font-mono leading-relaxed bg-background"
            />

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setRawImportText(`Sunday Skillet Shakshuka
Eggs poached in spiced tomato & bell pepper sauce.
Servings: 3
Prep time: 10 mins
Cook time: 20 mins

Ingredients:
* 1 tbsp olive oil
* 1 whole onion, diced
* 1 whole bell pepper, sliced
* 400 g tomatoes, crushed
* 4 whole eggs
* 0.25 cup fresh cilantro

Instructions:
1. Heat olive oil in a skillet and sauté onion and bell pepper for 8 minutes.
2. Add crushed tomatoes, cumin, and simmer for 10 minutes until thickened.
3. Make small wells in the sauce and crack eggs directly in; cover and cook for 6 minutes.`);
                }}
              >
                Use sample recipe
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSmartImportOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
                  onClick={handleSmartExtract}
                >
                  Parse & Populate
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}