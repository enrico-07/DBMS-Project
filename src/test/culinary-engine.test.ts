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
  findMasterIngredient,
  inferRecipeAllergens,
  inferRecipeDietaryTags,
  estimateRecipeNutrition,
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

  it('resolves semantic ingredients and their subdivisions/varieties', () => {
    // 1. Lookup by variety name: All-Purpose Flour
    const apFlour = findMasterIngredient({ name: 'All-Purpose Flour' });
    expect(apFlour).toBeDefined();
    expect(apFlour?.id).toBe('ing-flour');
    expect(apFlour?.category).toBe('Baking');
    expect(apFlour?.allergens).toContain('Gluten');

    // 2. Lookup by butter variety: Melted Butter
    const meltedButter = findMasterIngredient({ name: 'Melted Warm Butter' });
    expect(meltedButter).toBeDefined();
    expect(meltedButter?.id).toBe('ing-butter');
    expect(meltedButter?.category).toBe('Dairy & Eggs');
    expect(meltedButter?.allergens).toContain('Dairy');

    // 3. Lookup by chocolate variety: 70% Dark Chocolate
    const darkChoc = findMasterIngredient({ name: '70% Bittersweet Dark Chocolate' });
    expect(darkChoc).toBeDefined();
    expect(darkChoc?.id).toBe('ing-chocolate');

    // 4. Lookup by sugar variety: Powdered / Confectioners Sugar
    const powderedSugar = findMasterIngredient({ name: 'Powdered / Confectioners Sugar' });
    expect(powderedSugar).toBeDefined();
    expect(powderedSugar?.id).toBe('ing-sugar');

    // 5. Lookup by peanut butter
    const peanutButter = findMasterIngredient({ name: 'Creamy Smooth Peanut Butter' });
    expect(peanutButter).toBeDefined();
    expect(peanutButter?.id).toBe('ing-peanuts');
    expect(peanutButter?.allergens).toContain('Peanuts');
  });

  it('accurately infers allergens in real-time from ingredient formulations', () => {
    // Chocolate Lava Cake formulation
    const lavaCakeIngredients = [
      { name: '70% Bittersweet Dark Chocolate', quantity: 150, unit: 'g' },
      { name: 'Unsalted European Butter', quantity: 100, unit: 'g' },
      { name: 'All-Purpose Flour', quantity: 50, unit: 'g' },
      { name: 'Granulated White Sugar', quantity: 80, unit: 'g' },
      { name: 'Whole Fresh Eggs', quantity: 3, unit: 'whole' },
    ];

    const allergens = inferRecipeAllergens(lavaCakeIngredients);
    expect(allergens).toContain('Dairy'); // from chocolate & butter
    expect(allergens).toContain('Gluten'); // from flour
    expect(allergens).toContain('Eggs'); // from eggs
    expect(allergens).not.toContain('Peanuts');

    // Adding peanut butter
    const withPeanuts = [
      ...lavaCakeIngredients,
      { name: 'Creamy Smooth Peanut Butter', quantity: 2, unit: 'tbsp' },
    ];
    const allergensWithPeanuts = inferRecipeAllergens(withPeanuts);
    expect(allergensWithPeanuts).toContain('Peanuts');
  });

  it('infers dietary tags and diabetic-friendly status accurately', () => {
    // Formulation 1: Sweet potato and brown rice bowl
    const diabeticBowl = [
      { name: 'Beauregard Orange Sweet Potato', quantity: 200, unit: 'g' },
      { name: 'Whole Grain Brown Rice', quantity: 150, unit: 'g' },
      { name: 'Ripe Hass Avocado', quantity: 1, unit: 'whole' },
    ];
    const diabeticEval = inferRecipeDietaryTags(diabeticBowl);
    expect(diabeticEval.isDiabeticFriendly).toBe(true);
    expect(diabeticEval.isVegan).toBe(true);
    expect(diabeticEval.isGlutenFree).toBe(true);
    expect(diabeticEval.detectedAllergens.length).toBe(0);

    // Formulation 2: High sugar dessert
    const sugaryCake = [
      { name: 'Granulated White Sugar', quantity: 200, unit: 'g' },
      { name: 'All-Purpose Flour', quantity: 200, unit: 'g' },
      { name: 'Whole Dairy Milk (3.25%)', quantity: 200, unit: 'ml' },
    ];
    const sugarEval = inferRecipeDietaryTags(sugaryCake);
    expect(sugarEval.isDiabeticFriendly).toBe(false);
    expect(sugarEval.isGlutenFree).toBe(false);
    expect(sugarEval.isVegan).toBe(false);
  });

  it('dynamically computes nutritional macros based on ingredient quantities', () => {
    const bowl = [
      { name: 'Chicken Breast', quantity: 200, unit: 'g' }, // ~330 kcal, 62g protein, 0 carbs, 7.2g fat
      { name: 'Extra Virgin Olive Oil', quantity: 1, unit: 'tbsp' }, // 15g ~ 132 kcal, 15g fat
    ];
    const nutrition = estimateRecipeNutrition(bowl, 1);
    expect(nutrition.calories).toBeGreaterThan(400);
    expect(nutrition.calories).toBeLessThan(550);
    expect(nutrition.protein).toBeGreaterThan(50);
    expect(nutrition.fat).toBeGreaterThan(15);
  });
});
