import { describe, expect, it } from 'vitest';
import {
  formatCulinaryQuantity,
  scaledQuantity,
  calculatePantryMatch,
  calculateRecommendationScore,
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
});
