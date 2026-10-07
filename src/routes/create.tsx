import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  ImagePlus,
  Check,
  Save,
  Clock,
  Sparkles,
  ArrowLeft,
  GitCommit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeading } from '@/components/recipe-card';
import { useVault } from '@/components/vault-provider';
import { pageMeta } from '@/lib/metadata';
import type { RecipeIngredient, RecipeStep } from '@/lib/recipes';
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

  // Structured Ingredients & Steps
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { name: '', quantity: 100, unit: 'g', preparationState: '' },
    { name: '', quantity: 1, unit: 'tbsp', preparationState: '' },
  ]);
  const [steps, setSteps] = useState<RecipeStep[]>([
    { stepNumber: 1, instruction: '', durationMinutes: 5, tip: '' },
  ]);

  // Version Control Commit Message (for edits)
  const [changeSummary, setChangeSummary] = useState('');

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

  const handleSubmit = (status: 'Published' | 'Draft') => {
    if (!title.trim()) {
      toast.error('Please enter a recipe title.');
      return;
    }
    const validIngredients = ingredients.filter(i => i.name.trim().length > 0 && i.quantity > 0);
    if (validIngredients.length === 0) {
      toast.error('Add at least one valid ingredient with quantity.');
      return;
    }
    const validSteps = steps.filter(s => s.instruction.trim().length > 0);
    if (validSteps.length === 0) {
      toast.error('Add at least one cooking instruction step.');
      return;
    }

    const id = edit ?? `rec-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || crypto.randomUUID().slice(0, 8)}`;
    const totalTime = Number(prepTime) + Number(cookTime);

    // Approximate baseline calories/macros if new
    const calories = original?.calories || Math.round(validIngredients.length * 95);
    const protein = original?.protein || Math.round(validIngredients.length * 4.5);
    const carbs = original?.carbs || Math.round(validIngredients.length * 11);
    const fat = original?.fat || Math.round(validIngredients.length * 3.2);

    addRecipe(
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
        fiber: original?.fiber || 4,
        source: source.trim() || `${currentUser.name}’s Kitchen`,
        visibility,
        status,
        createdBy: original?.createdBy || currentUser.id,
        createdAt: original?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ingredients: validIngredients,
        steps: validSteps.map((s, idx) => ({ ...s, stepNumber: idx + 1 })),
        tags: [cuisine, category, diet],
      },
      edit ? changeSummary.trim() || undefined : undefined
    );

    toast.success(
      status === 'Draft'
        ? 'Draft saved to your cookbook.'
        : edit
        ? 'Recipe revisions committed to version history!'
        : 'Recipe published to RecipeVault!'
    );

    navigate({ to: '/recipe/$id', params: { id } });
  };

  return (
    <div className="standard-page editor-page max-w-5xl mx-auto">
      <PageHeading
        eyebrow="STRUCTURED RECIPE BUILDER & DBMS ENGINE"
        title={edit ? `Refining "${original?.title || 'Recipe'}"` : 'Every great recipe has a story.'}
        description="Capture precise ingredient quantities, cooking durations, and version revisions for your digital shelf."
        action={
          <Button variant="ghost" onClick={() => navigate({ to: edit ? `/recipe/${edit}` : '/' })}>
            <ArrowLeft size={16} className="mr-1" /> Cancel
          </Button>
        }
      />

      <form
        onSubmit={e => {
          e.preventDefault();
          handleSubmit('Published');
        }}
      >
        <div className="editor-layout">
          {/* Main Left: Basics, Ingredients & Steps */}
          <section className="space-y-8">
            {/* Version Commit Note (Only on edit) */}
            {edit && (
              <div className="bg-peach border border-clay/30 p-4 rounded-2xl">
                <label className="text-xs font-bold text-clay uppercase flex items-center gap-1.5 mb-2">
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
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Difficulty</label>
                  <select
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value as any)}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Category</label>
                  <select
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                  >
                    {['Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Baking', 'Snacks'].map(x => (
                      <option key={x} value={x}>{x}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Cuisine</label>
                  <select
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
                    value={cuisine}
                    onChange={e => setCuisine(e.target.value as any)}
                  >
                    {['Italian', 'Mediterranean', 'American', 'Indian', 'Japanese', 'Mexican', 'Other'].map(x => (
                      <option key={x} value={x}>{x}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Dietary Tag</label>
                  <select
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
                    value={diet}
                    onChange={e => setDiet(e.target.value as any)}
                  >
                    {['Vegetarian', 'Vegan', 'High protein', 'Gluten-free', 'Balanced'].map(x => (
                      <option key={x} value={x}>{x}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Ingredients Table */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif">Ingredients</h2>
                  <p className="text-xs text-muted-foreground">
                    Scaled automatically according to serving multiplier.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1"
                  onClick={() =>
                    setIngredients(prev => [...prev, { name: '', quantity: 1, unit: 'g', preparationState: '' }])
                  }
                >
                  <Plus size={14} /> Add Ingredient
                </Button>
              </div>

              <div className="space-y-2">
                {ingredients.map((ing, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="Ingredient name (e.g. Rigatoni)"
                      value={ing.name}
                      onChange={e =>
                        setIngredients(p => p.map((item, n) => (n === idx ? { ...item, name: e.target.value } : item)))
                      }
                      className="flex-[2] text-xs"
                      required
                    />
                    <Input
                      type="number"
                      step="any"
                      min={0.01}
                      placeholder="Qty"
                      value={ing.quantity}
                      onChange={e =>
                        setIngredients(p =>
                          p.map((item, n) => (n === idx ? { ...item, quantity: Number(e.target.value) } : item))
                        )
                      }
                      className="w-20 text-xs"
                      required
                    />
                    <select
                      className="w-24 text-xs p-2.5 rounded-lg border border-border bg-background"
                      value={ing.unit}
                      onChange={e =>
                        setIngredients(p => p.map((item, n) => (n === idx ? { ...item, unit: e.target.value } : item)))
                      }
                    >
                      {['g', 'kg', 'ml', 'cup', 'tbsp', 'tsp', 'whole', 'clove', 'pinch'].map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    <Input
                      placeholder="Prep notes (e.g. toasted)"
                      value={ing.preparationState || ''}
                      onChange={e =>
                        setIngredients(p =>
                          p.map((item, n) => (n === idx ? { ...item, preparationState: e.target.value } : item))
                        )
                      }
                      className="flex-1 text-xs hidden md:block"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={ingredients.length <= 1}
                      onClick={() => setIngredients(p => p.filter((_, n) => n !== idx))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
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
                  <div key={idx} className="bg-background border border-border p-4 rounded-xl flex gap-3">
                    <span className="step-number w-8 h-8 text-xs">{idx + 1}</span>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder={`Describe step ${idx + 1}…`}
                        value={st.instruction}
                        onChange={e =>
                          setSteps(p => p.map((item, n) => (n === idx ? { ...item, instruction: e.target.value } : item)))
                        }
                        rows={2}
                        className="text-xs"
                        required
                      />
                      <div className="flex gap-2">
                        <Input
                          placeholder="Optional chef’s tip…"
                          value={st.tip || ''}
                          onChange={e =>
                            setSteps(p => p.map((item, n) => (n === idx ? { ...item, tip: e.target.value } : item)))
                          }
                          className="text-xs flex-1"
                        />
                        <div className="flex items-center gap-1">
                          <Clock size={13} className="text-muted-foreground" />
                          <Input
                            type="number"
                            min={0}
                            placeholder="Mins"
                            value={st.durationMinutes || ''}
                            onChange={e =>
                              setSteps(p =>
                                p.map((item, n) => (n === idx ? { ...item, durationMinutes: Number(e.target.value) } : item))
                              )
                            }
                            className="w-16 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={steps.length <= 1}
                      onClick={() => setSteps(p => p.filter((_, n) => n !== idx))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right Sidebar: Imagery & Publishing Settings */}
          <section className="space-y-6">
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <h2 className="text-xl font-serif">Recipe Imagery</h2>
              <label className="upload-zone">
                {image ? (
                  <img src={image} alt="Preview" className="rounded-xl w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-6">
                    <ImagePlus size={36} className="text-muted-foreground mx-auto mb-2" />
                    <span className="text-xs font-semibold block">Select a Photo</span>
                    <small className="text-[10px] text-muted-foreground">JPG, PNG, or WebP</small>
                  </div>
                )}
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

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Source Attribution
                </label>
                <Input
                  placeholder="e.g. Nonna’s handwritten notes, 1984"
                  value={source}
                  onChange={e => setSource(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Privacy & Visibility
                </label>
                <select
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
                  value={visibility}
                  onChange={e => setVisibility(e.target.value as any)}
                >
                  <option value="Public">Public (Discoverable by everyone)</option>
                  <option value="Private">Private (Only you)</option>
                  <option value="Unlisted">Unlisted (Direct link only)</option>
                </select>
              </div>
            </div>

            {/* Publishing Footer Actions */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-3">
              <Button
                type="submit"
                className="w-full rounded-full bg-clay text-white gap-2 shadow-md hover:bg-clay/90"
              >
                <Check size={16} />
                {edit ? 'Commit Revisions' : 'Publish to Vault'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full gap-2"
                onClick={() => handleSubmit('Draft')}
              >
                <Save size={15} /> Save as Draft
              </Button>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}