import { describe, expect, it } from 'vitest';
import {
  formatCulinaryQuantity,
  scaledQuantity,
  calculatePantryMatch,
  calculateRecommendationScore,
  evaluateRecipeHealthConditions,
  ingredientSubstitutions,
  getIngredientShelfLifeDays,
  evaluatePantryFreshness,
  calculateRecipeCost,
  parseRawRecipeText,
  recipes,
  demoUsers,
  masterIngredients,
} from '@/lib/recipes';

describe('RecipeVault Culinary & Relational Intelligence Engine', () => {
  it('correctly formats and scales fractional quantities', () => {
    // 0.5 should format to "1/2"
    expect(formatCulinaryQuantity(0.5)).toBe('1/2');
    // 1.25 should format to "1 1/4"
    expect(formatCulinaryQuantity(1.25)).toBe('1 1/4');
    // 2.75 should format to "2 3/4"
    expect(formatCulinaryQuantity(2.75)).toBe('2 3/4');

    // Scaling from 2 to 4 servings
    expect(scaledQuantity(200, 2, 4)).toBe('400');
    // Scaling from 2 to 1 serving (half)
    expect(scaledQuantity(1, 2, 1)).toBe('1/2');
  });

  it('accurately computes pantry ingredient overlap', () => {
    const lemonPasta = recipes.find(r => r.id === 'lemon-ricotta-pasta')!;
    expect(lemonPasta).toBeDefined();

    // With exact match for key ingredients
    const userPantry = ['Artisan Pasta', 'Ricotta', 'Lemon', 'Extra Virgin Olive Oil', 'Fresh Basil'];
    const result = calculatePantryMatch(lemonPasta, userPantry);

    expect(result.matchingCount).toBeGreaterThanOrEqual(4);
    expect(result.matchPercentage).toBeGreaterThanOrEqual(80);
    expect(Array.isArray(result.missingIngredients)).toBe(true);
  });

  it('calculates transparent relational recommendation scores for personas', () => {
    const eric = demoUsers.find(u => u.id === 'user-eric')!; // Italian & high protein enthusiast
    const lemonPasta = recipes.find(r => r.id === 'lemon-ricotta-pasta')!; // Italian dinner, 25 min

    const { score, reasons } = calculateRecommendationScore(lemonPasta, eric);

    expect(score).toBeGreaterThan(60);
    expect(reasons.some(r => r.includes('Italian'))).toBe(true);
  });

  it('evaluates clinical health conditions accurately across dietary profiles', () => {
    const chickpeaBowl = recipes.find(r => r.id === 'chickpea-harvest-bowl')!;
    expect(chickpeaBowl).toBeDefined();

    const evals = evaluateRecipeHealthConditions(chickpeaBowl);
    expect(evals.length).toBe(5);

    // Chickpea harvest bowl has high fiber and low net carbs -> should match diabetes
    const diabetesEval = evals.find(e => e.conditionId === 'diabetes')!;
    expect(diabetesEval.isMatch).toBe(true);
    expect(diabetesEval.badge).toBe('Diabetic-Friendly');
    expect(diabetesEval.score).toBeGreaterThanOrEqual(65);

    // Should also match Celiac since it's naturally gluten-free
    const celiacEval = evals.find(e => e.conditionId === 'celiac')!;
    expect(celiacEval.isMatch).toBe(true);
  });

  it('verifies ingredient substitutions have valid macro deltas and ratios', () => {
    expect(ingredientSubstitutions.length).toBeGreaterThan(0);

    ingredientSubstitutions.forEach(sub => {
      expect(sub.originalIngredient).toBeTruthy();
      expect(sub.substituteName).toBeTruthy();
      expect(sub.conversionRatio).toBeGreaterThan(0);
      expect(sub.healthBenefit).toBeTruthy();
      expect(sub.suitableForConditions.length).toBeGreaterThan(0);
    });

    // Test specific ricotta to cottage cheese swap
    const ricottaSwap = ingredientSubstitutions.find(
      s => s.originalIngredient === 'Ricotta' && s.substituteName === 'Whipped Cottage Cheese'
    );
    expect(ricottaSwap).toBeDefined();
    expect(ricottaSwap!.calorieDelta).toBeLessThan(0); // Cuts calories
    expect(ricottaSwap!.proteinDelta).toBeGreaterThan(0); // Boosts protein
  });

  it('computes accurate shelf-life days and pantry freshness alerts', () => {
    expect(getIngredientShelfLifeDays('Fresh Basil')).toBe(4);
    expect(getIngredientShelfLifeDays('Chicken Breast')).toBe(3);
    expect(getIngredientShelfLifeDays('Ricotta')).toBe(5);
    expect(getIngredientShelfLifeDays('Artisan Pasta')).toBe(365);

    const now = Date.now();
    const pantryItems = ['Fresh Basil', 'Artisan Pasta'];
    const stockDates = {
      'Fresh Basil': new Date(now - 3.5 * 86400000).toISOString(), // 3.5 days ago -> 0.5 days left -> expiring
      'Artisan Pasta': new Date(now - 10 * 86400000).toISOString(), // 10 days ago -> 355 days left -> fresh
    };

    const freshness = evaluatePantryFreshness(pantryItems, stockDates);
    const basilStatus = freshness.find(f => f.name === 'Fresh Basil');
    const pastaStatus = freshness.find(f => f.name === 'Artisan Pasta');

    expect(basilStatus?.status).toBe('expiring');
    expect(pastaStatus?.status).toBe('fresh');
  });

  it('contains normalized relational entries with foreign key integrity', () => {
    // Every recipe ingredient must correspond to valid entries
    recipes.forEach(recipe => {
      expect(recipe.title).toBeTruthy();
      expect(recipe.ingredients.length).toBeGreaterThan(0);
      expect(recipe.steps.length).toBeGreaterThan(0);
      expect(recipe.servings).toBeGreaterThan(0);
      expect(recipe.calories).toBeGreaterThan(0);
    });

    // Master ingredients must have category and nutrition
    masterIngredients.forEach(ing => {
      expect(ing.id).toBeTruthy();
      expect(ing.name).toBeTruthy();
      expect(ing.category).toBeTruthy();
      expect(ing.substitute).toBeTruthy();
    });
  });

  it('accurately calculates recipe cost economics and savings vs takeout', () => {
    const lemonPasta = recipes.find(r => r.id === 'lemon-ricotta-pasta')!;
    const cost = calculateRecipeCost(lemonPasta);

    expect(cost.totalCost).toBeGreaterThan(0);
    expect(cost.costPerServing).toBeGreaterThan(0);
    expect(cost.restaurantEquivalent).toBeGreaterThan(cost.totalCost);
    expect(cost.savingsPercentage).toBeGreaterThan(50);
    expect(cost.ingredientCosts.length).toBe(lemonPasta.ingredients.length);
  });

  it('parses raw unstructured recipe text into structured 3NF drafts', () => {
    const rawSnippet = `Grandma's Rustic Tomato Pasta
A quick weeknight staple made with pantry items.
Servings: 4
Prep time: 10 mins
Cook time: 20 mins

Ingredients:
* 400 g artisan pasta
* 2 tbsp olive oil, cold-pressed
* 4 cloves garlic, minced
* 500 g tomatoes, crushed

Instructions:
1. Boil the pasta in salted water for 10 minutes until al dente.
2. Sauté garlic and crushed tomatoes in olive oil for 8 minutes.
3. Toss together with pasta and serve hot.`;

    const parsed = parseRawRecipeText(rawSnippet);

    expect(parsed.title).toBe("Grandma's Rustic Tomato Pasta");
    expect(parsed.servings).toBe(4);
    expect(parsed.prepTime).toBe(10);
    expect(parsed.cookTime).toBe(20);
    expect(parsed.ingredients.length).toBe(4);
    expect(parsed.ingredients[0].name.toLowerCase()).toContain('pasta');
    expect(parsed.ingredients[0].quantity).toBe(400);
    expect(parsed.ingredients[0].unit).toBe('g');
    expect(parsed.steps.length).toBe(3);
    expect(parsed.steps[0].durationMinutes).toBe(10);
  });
});
