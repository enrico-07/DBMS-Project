import pasta from '@/assets/lemon-pasta.jpg';
import salad from '@/assets/salad.jpg';
import soup from '@/assets/soup.jpg';
import pancakes from '@/assets/pancakes.jpg';
import chicken from '@/assets/chicken.jpg';

// -------------------------------------------------------------
// RELATIONAL DATA TYPES (Normalized 3NF Representation)
// -------------------------------------------------------------

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  location?: string;
  role: string;
  avatar: string;
  bio: string;
  dietaryPreferences: string[];
  dislikedIngredients: string[];
  healthConditions: string[];
  favoriteCuisines: string[];
  cookingSkill: 'Beginner' | 'Home Cook' | 'Seasoned Chef';
  targetCookTime: number; // in minutes
  twoFactorEnabled?: boolean;
  sessionTimeout?: number; // in minutes
  loginMethod?: 'email' | 'google' | 'guest';
  createdAt?: string;
};

export type AllergenType =
  | 'Dairy'
  | 'Gluten'
  | 'Peanuts'
  | 'Tree Nuts'
  | 'Eggs'
  | 'Soy'
  | 'Fish'
  | 'Shellfish'
  | 'Sesame';

export interface IngredientVariety {
  id: string;
  ingredientId: string;
  name: string;
  defaultUnit?: string;
  culinaryRole?: string;
  relativeCaloriesMultiplier?: number;
  isDiabeticFriendly?: boolean;
  isGlutenFree?: boolean;
  isVegan?: boolean;
  isVegetarian?: boolean;
  allergens?: AllergenType[];
}

export type IngredientCategory =
  | 'Produce'
  | 'Dairy & Eggs'
  | 'Grains & Pasta'
  | 'Legumes'
  | 'Pantry & Spices'
  | 'Proteins'
  | 'Baking'
  | 'Condiments'
  | 'Nuts & Seeds';

export type IngredientMaster = {
  id: string;
  name: string;
  aliases: string;
  category: IngredientCategory;
  flavor: string;
  substitute: string;
  storage: string;
  commonUses: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  isUncommon?: boolean;
  glycemicIndex?: 'Low' | 'Medium' | 'High';
  isDiabeticFriendly?: boolean;
  isPcosFriendly?: boolean;
  isGlutenFree?: boolean;
  isVegan?: boolean;
  isVegetarian?: boolean;
  allergens?: AllergenType[];
  varieties?: IngredientVariety[];
};

export type RecipeIngredient = {
  ingredientId?: string;
  varietyId?: string;
  varietyName?: string;
  name: string;
  quantity: number;
  unit: string;
  preparationState?: string; // e.g., 'finely diced', 'room temperature', 'freshly squeezed'
  isOptional?: boolean;
};

export type RecipeStep = {
  stepNumber: number;
  instruction: string;
  durationMinutes?: number; // for cooking mode timer
  tip?: string;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Desserts' | 'Baking' | 'Snacks';
  cuisine: 'Italian' | 'Mediterranean' | 'American' | 'Indian' | 'Japanese' | 'Mexican' | 'Other';
  diet: 'Vegetarian' | 'Vegan' | 'High protein' | 'Gluten-free' | 'Balanced';
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  time: number; // total time in minutes
  servings: number;
  rating: string;
  ratingCount: number;
  calories: number; // per serving
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  source: string;
  sourceUrl?: string;
  visibility: 'Public' | 'Private' | 'Unlisted';
  status: 'Published' | 'Draft';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  tags: string[];
};

export type RecipeVersion = {
  versionId: string;
  recipeId: string;
  versionNumber: number;
  changeSummary: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  snapshot: Partial<Recipe>;
};

export type Collection = {
  id: string;
  name: string;
  description: string;
  ids: string[];
  createdBy: string;
  createdAt: string;
  icon?: string;
};

export type PlanItem = {
  id: string;
  day: number; // 0=Mon, 1=Tue, 2=Wed, etc. + (week * 7)
  meal: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  recipeId: string;
  customServings?: number;
};

export type Review = {
  id: string;
  recipeId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
  verifiedCook: boolean;
};

export type NutritionFAQ = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

// -------------------------------------------------------------
// DEMO PERSONAS & ACCOUNTS
// -------------------------------------------------------------

export const demoUsers: UserProfile[] = [
  {
    id: 'user-eric',
    name: 'Eric Titus',
    email: 'eric@recipevault.internal',
    role: 'Home Cook & Artisan Curator',
    avatar: 'E',
    bio: 'Passionate home cook fond of slow-simmered sauces, roasted herbs, and heritage cookbooks.',
    dietaryPreferences: ['Vegetarian', 'High protein'],
    dislikedIngredients: ['Refined palm oil'],
    healthConditions: ['Heart-Healthy / Balanced'],
    favoriteCuisines: ['Italian', 'Mediterranean'],
    cookingSkill: 'Home Cook',
    targetCookTime: 35,
  },
  {
    id: 'user-neeraj',
    name: 'Neeraj K',
    email: 'neeraj@recipevault.internal',
    role: 'Fitness & High-Protein Meal Prep',
    avatar: 'N',
    bio: 'Macro tracker and weekend meal planner focusing on energizing proteins and clean fuel.',
    dietaryPreferences: ['High protein', 'Balanced'],
    dislikedIngredients: ['Excess sugar'],
    healthConditions: ['Muscle Growth / Fitness'],
    favoriteCuisines: ['Mediterranean', 'American', 'Indian'],
    cookingSkill: 'Seasoned Chef',
    targetCookTime: 45,
  },
  {
    id: 'user-maya',
    name: 'Maya Lin',
    email: 'maya@recipevault.internal',
    role: 'Plant-Based & Quick Meals',
    avatar: 'M',
    bio: 'Busy student experimenting with seasonal veggies, bright lemon dressings, and 20-minute bowls.',
    dietaryPreferences: ['Vegan', 'Gluten-free'],
    dislikedIngredients: ['Dairy', 'Eggs'],
    healthConditions: ['Anti-inflammatory'],
    favoriteCuisines: ['Mediterranean', 'Japanese', 'Italian'],
    cookingSkill: 'Beginner',
    targetCookTime: 25,
  },
];

// -------------------------------------------------------------
// MASTER INGREDIENT REPOSITORY (Semantic Knowledge Layer)
// -------------------------------------------------------------

export const masterIngredients: IngredientMaster[] = [
  // --- BAKING ESSENTIALS & FLOURS ---
  {
    id: 'ing-flour',
    name: 'Wheat Flour',
    aliases: 'Wheat flour · Maida · Atta · Triticum flour',
    category: 'Baking',
    flavor: 'Mild, clean, wheaty starchy base providing gluten structure',
    substitute: 'Almond flour, gluten-free 1-to-1 baking blend, or oat flour',
    storage: 'Cool, dark pantry in airtight container; freeze for long-term storage.',
    commonUses: 'Cakes, pastries, bread doughs, thickening roux, cookies.',
    caloriesPer100g: 364,
    proteinPer100g: 10.3,
    carbsPer100g: 76.3,
    fatPer100g: 1.0,
    fiberPer100g: 2.7,
    glycemicIndex: 'High',
    isDiabeticFriendly: false,
    isPcosFriendly: false,
    isGlutenFree: false,
    isVegan: true,
    isVegetarian: true,
    allergens: ['Gluten'],
    varieties: [
      { id: 'var-flour-ap', ingredientId: 'ing-flour', name: 'All-Purpose Flour', defaultUnit: 'g', culinaryRole: 'Standard versatile baking flour (10-12% protein)' },
      { id: 'var-flour-bread', ingredientId: 'ing-flour', name: 'High-Protein Bread Flour', defaultUnit: 'g', culinaryRole: 'High gluten (12-14%) for chewy artisan breads' },
      { id: 'var-flour-cake', ingredientId: 'ing-flour', name: 'Low-Protein Cake & Pastry Flour', defaultUnit: 'g', culinaryRole: 'Fine bleached starch (7-9%) for tender, delicate crumbs' },
      { id: 'var-flour-wholewheat', ingredientId: 'ing-flour', name: 'Whole Wheat Flour', defaultUnit: 'g', culinaryRole: 'Contains bran and germ with nutty flavor and higher fiber' },
    ],
  },
  {
    id: 'ing-almond-flour',
    name: 'Almond Flour',
    aliases: 'Ground almonds · Almond meal · Badam powder',
    category: 'Baking',
    flavor: 'Sweet, buttery, rich nutty flavor with tender crumb moisture',
    substitute: 'Hazelnut flour, sunflower seed flour, or oat flour',
    storage: 'Refrigerate in sealed mason jar to preserve delicate nut oils.',
    commonUses: 'Macarons, keto cakes, gluten-free crumbles, financiers.',
    caloriesPer100g: 571,
    proteinPer100g: 21.4,
    carbsPer100g: 21.4,
    fatPer100g: 50.0,
    fiberPer100g: 10.7,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: ['Tree Nuts'],
    varieties: [
      { id: 'var-almond-blanched', ingredientId: 'ing-almond-flour', name: 'Super-Fine Blanched Almond Flour', defaultUnit: 'g', culinaryRole: 'Skinless finely milled powder for delicate pastries' },
      { id: 'var-almond-meal', ingredientId: 'ing-almond-flour', name: 'Coarse Natural Almond Meal', defaultUnit: 'g', culinaryRole: 'Unblanched ground almonds for rustic crusts and crumbles' },
    ],
  },

  // --- SUGARS & SWEETENERS ---
  {
    id: 'ing-sugar',
    name: 'Sugar',
    aliases: 'Table sugar · Sucrose · Cane sugar · Beet sugar',
    category: 'Baking',
    flavor: 'Pure, crystalline clean sweetness that aerates fats and retains baked moisture',
    substitute: 'Coconut sugar, pure maple syrup, monkfruit sweetener, or erythritol',
    storage: 'Cool, dry pantry in strictly airtight moisture-proof container.',
    commonUses: 'Caramelization, creaming with butter, macerating fruit, structure in cakes.',
    caloriesPer100g: 387,
    proteinPer100g: 0,
    carbsPer100g: 100,
    fatPer100g: 0,
    fiberPer100g: 0,
    glycemicIndex: 'High',
    isDiabeticFriendly: false,
    isPcosFriendly: false,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
    varieties: [
      { id: 'var-sugar-granulated', ingredientId: 'ing-sugar', name: 'Granulated White Sugar', defaultUnit: 'g', culinaryRole: 'Standard crystalline white sugar for everyday baking' },
      { id: 'var-sugar-powdered', ingredientId: 'ing-sugar', name: 'Powdered / Confectioners Sugar', defaultUnit: 'g', culinaryRole: 'Finely pulverized sugar with cornstarch for frostings and dusting' },
      { id: 'var-sugar-light-brown', ingredientId: 'ing-sugar', name: 'Light Brown Sugar', defaultUnit: 'g', culinaryRole: 'Sugar with 3.5% molasses for subtle caramel notes and chewiness' },
      { id: 'var-sugar-dark-brown', ingredientId: 'ing-sugar', name: 'Dark Brown Sugar', defaultUnit: 'g', culinaryRole: 'Sugar with 6.5% molasses for deep toffee flavor and rich moisture' },
      { id: 'var-sugar-caster', ingredientId: 'ing-sugar', name: 'Superfine Caster Sugar', defaultUnit: 'g', culinaryRole: 'Ultra-fine crystals for meringues, soufflés, and light sponges' },
      { id: 'var-sugar-demerara', ingredientId: 'ing-sugar', name: 'Demerara / Turbinado Raw Sugar', defaultUnit: 'g', culinaryRole: 'Large golden crunchy crystals for muffin tops and pie crusts' },
    ],
  },
  {
    id: 'ing-sweeteners-natural',
    name: 'Natural Syrups & Honey',
    aliases: 'Maple syrup · Honey · Agave nectar · Molasses',
    category: 'Baking',
    flavor: 'Complex floral, woody, mineral sweetness with natural humectant properties',
    substitute: 'Pure date syrup or coconut nectar',
    storage: 'Refrigerate real maple syrup after opening; store honey at room temperature.',
    commonUses: 'Glazes, pancake syrups, granola, marinades, cake hydration.',
    caloriesPer100g: 260,
    proteinPer100g: 0.1,
    carbsPer100g: 67.0,
    fatPer100g: 0.1,
    fiberPer100g: 0,
    glycemicIndex: 'Medium',
    isDiabeticFriendly: false,
    isPcosFriendly: false,
    isGlutenFree: true,
    isVegan: false,
    isVegetarian: true,
    allergens: [],
    varieties: [
      { id: 'var-sweet-maple', ingredientId: 'ing-sweeteners-natural', name: 'Grade A Pure Maple Syrup', defaultUnit: 'ml', culinaryRole: 'Woody, caramel notes tapped from sugar maples (Vegan)' },
      { id: 'var-sweet-honey', ingredientId: 'ing-sweeteners-natural', name: 'Raw Wildflower Honey', defaultUnit: 'tbsp', culinaryRole: 'Floral, antibacterial viscous sweetener' },
      { id: 'var-sweet-agave', ingredientId: 'ing-sweeteners-natural', name: 'Blue Agave Nectar', defaultUnit: 'tbsp', culinaryRole: 'Mild, neutral liquid plant sweetener with lower glycemic spike' },
      { id: 'var-sweet-molasses', ingredientId: 'ing-sweeteners-natural', name: 'Blackstrap Molasses', defaultUnit: 'tbsp', culinaryRole: 'Robust, iron-rich bitter-sweet syrup for gingerbread' },
    ],
  },

  // --- CHOCOLATE & COCOA ---
  {
    id: 'ing-chocolate',
    name: 'Chocolate',
    aliases: 'Baking chocolate · Cocoa liquor · Couverture · Dark chocolate · Milk chocolate',
    category: 'Baking',
    flavor: 'Complex roasted cacao, bitter-sweet, rich cocoa butter velvet melt',
    substitute: 'Cocoa powder whisked with melted coconut oil or butter',
    storage: 'Cool, dark pantry (16-18°C) away from direct sunlight; avoid fridge condensation.',
    commonUses: 'Lava cakes, ganaches, brownies, truffles, chocolate glazes.',
    caloriesPer100g: 546,
    proteinPer100g: 4.9,
    carbsPer100g: 61.0,
    fatPer100g: 31.0,
    fiberPer100g: 7.0,
    glycemicIndex: 'Medium',
    isDiabeticFriendly: false,
    isPcosFriendly: false,
    isGlutenFree: true,
    isVegan: false,
    isVegetarian: true,
    allergens: ['Dairy'],
    varieties: [
      { id: 'var-choc-dark70', ingredientId: 'ing-chocolate', name: '70% Bittersweet Dark Chocolate', defaultUnit: 'g', culinaryRole: 'High cacao content for intense chocolate flavor with minimal sugar' },
      { id: 'var-choc-semisweet', ingredientId: 'ing-chocolate', name: 'Semi-Sweet Chocolate (55-60%)', defaultUnit: 'g', culinaryRole: 'Balanced sweetness ideal for chocolate chip cookies and molten cakes' },
      { id: 'var-choc-milk', ingredientId: 'ing-chocolate', name: 'Creamy Milk Chocolate', defaultUnit: 'g', culinaryRole: 'Sweet, lactic chocolate with milk solids for mild desserts' },
      { id: 'var-choc-white', ingredientId: 'ing-chocolate', name: 'Pure White Chocolate', defaultUnit: 'g', culinaryRole: 'Cocoa butter and vanilla without cocoa solids for mousse and ganache' },
      { id: 'var-choc-chips', ingredientId: 'ing-chocolate', name: 'Baking Chocolate Chips', defaultUnit: 'g', culinaryRole: 'Lower cocoa butter content designed to hold shape during baking' },
    ],
  },
  {
    id: 'ing-cocoa',
    name: 'Cocoa Powder',
    aliases: 'Cacao powder · Dutch cocoa · Baking cocoa',
    category: 'Baking',
    flavor: 'Deep, earthy, concentrated bittersweet chocolate essence without fats',
    substitute: 'Melted unsweetened chocolate (reduce butter/oil proportionally)',
    storage: 'Cool, dry cupboard in an airtight container.',
    commonUses: 'Chocolate dusting, devil’s food cake, chocolate frosting, hot cocoa.',
    caloriesPer100g: 228,
    proteinPer100g: 19.6,
    carbsPer100g: 57.9,
    fatPer100g: 13.7,
    fiberPer100g: 33.2,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
    varieties: [
      { id: 'var-cocoa-dutch', ingredientId: 'ing-cocoa', name: 'Dutch-Processed Alkalized Cocoa Powder', defaultUnit: 'g', culinaryRole: 'Neutralized acid with deep dark hue and mellow, smooth flavor' },
      { id: 'var-cocoa-natural', ingredientId: 'ing-cocoa', name: 'Natural Unsweetened Cocoa Powder', defaultUnit: 'g', culinaryRole: 'Acidic, lighter color; pairs with baking soda for leavening' },
      { id: 'var-cocoa-black', ingredientId: 'ing-cocoa', name: 'Black Cocoa Powder', defaultUnit: 'g', culinaryRole: 'Ultra-dutched jet black powder for Oreo-style cookies and visual punch' },
    ],
  },

  // --- BUTTER & FATS ---
  {
    id: 'ing-butter',
    name: 'Butter',
    aliases: 'Creamery butter · Sweet butter · Ghee · Brown butter',
    category: 'Dairy & Eggs',
    flavor: 'Rich, creamy, luscious dairy fat with delicate nutty sweetness',
    substitute: 'Refined coconut oil, extra virgin olive oil, or vegan cultured butter',
    storage: 'Refrigerate wrapped at 2-4°C; keep a small covered butter dish at room temp for spreading.',
    commonUses: 'Laminated pastry dough, pan sauces, creaming cakes, frying, basting proteins.',
    caloriesPer100g: 717,
    proteinPer100g: 0.9,
    carbsPer100g: 0.1,
    fatPer100g: 81.1,
    fiberPer100g: 0,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: false,
    isVegetarian: true,
    allergens: ['Dairy'],
    varieties: [
      { id: 'var-butter-unsalted', ingredientId: 'ing-butter', name: 'Unsalted European Butter', defaultUnit: 'g', culinaryRole: '82%+ butterfat without sodium for precise baking control' },
      { id: 'var-butter-salted', ingredientId: 'ing-butter', name: 'Salted Sweet Cream Butter', defaultUnit: 'g', culinaryRole: 'Everyday table butter with ~1.5% salt for savory sautéing' },
      { id: 'var-butter-brown', ingredientId: 'ing-butter', name: 'Brown Butter (Beurre Noisette)', defaultUnit: 'g', culinaryRole: 'Toasted milk solids yielding nutty hazelnut aroma for baked goods' },
      { id: 'var-butter-melted', ingredientId: 'ing-butter', name: 'Melted Warm Butter', defaultUnit: 'g', culinaryRole: 'Liquid emulsified fat for chocolate lava cakes, muffins, and quick breads' },
      { id: 'var-butter-clarified', ingredientId: 'ing-butter', name: 'Clarified Butter / Desi Ghee', defaultUnit: 'tbsp', culinaryRole: 'Pure 100% milk fat with solids removed; high 485°F smoke point' },
    ],
  },

  // --- MILKS & CREAMS ---
  {
    id: 'ing-milk',
    name: 'Milk & Dairy Cream',
    aliases: 'Dairy milk · Heavy cream · Buttermilk · Whole milk · Cream',
    category: 'Dairy & Eggs',
    flavor: 'Mildly sweet, creamy, silky emulsion of butterfat and dairy proteins',
    substitute: 'Oat milk, almond milk, or coconut cream',
    storage: 'Keep refrigerated between 1-4°C; seal caps tightly to prevent absorbing aromas.',
    commonUses: 'Custards, cakes, enriching sauces, baking doughs, coffee.',
    caloriesPer100g: 61,
    proteinPer100g: 3.2,
    carbsPer100g: 4.8,
    fatPer100g: 3.3,
    fiberPer100g: 0,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: false,
    isVegetarian: true,
    allergens: ['Dairy'],
    varieties: [
      { id: 'var-milk-whole', ingredientId: 'ing-milk', name: 'Whole Dairy Milk (3.25%)', defaultUnit: 'ml', culinaryRole: 'Full fat dairy milk for balanced moisture and browning' },
      { id: 'var-milk-skim', ingredientId: 'ing-milk', name: 'Skim / Non-Fat Milk', defaultUnit: 'ml', culinaryRole: 'Low fat milk for light nutrition' },
      { id: 'var-milk-heavy-cream', ingredientId: 'ing-milk', name: 'Heavy Whipping Cream (36%)', defaultUnit: 'ml', culinaryRole: 'High fat cream that whips to stiff peaks and enriches ganaches' },
      { id: 'var-milk-buttermilk', ingredientId: 'ing-milk', name: 'Cultured Buttermilk', defaultUnit: 'ml', culinaryRole: 'Lactic acid liquid that tenderizes pancakes and activates baking soda' },
      { id: 'var-milk-evaporated', ingredientId: 'ing-milk', name: 'Evaporated Milk', defaultUnit: 'ml', culinaryRole: '60% water removed for velvety mac and cheese and pie fillings' },
      { id: 'var-milk-condensed', ingredientId: 'ing-milk', name: 'Sweetened Condensed Milk', defaultUnit: 'ml', culinaryRole: 'Thick, caramelized sugary dairy for fudge and banoffee pie' },
    ],
  },
  {
    id: 'ing-plant-milk',
    name: 'Plant-Based Milk',
    aliases: 'Dairy-free milk · Oat milk · Almond milk · Soy milk',
    category: 'Dairy & Eggs',
    flavor: 'Creamy, plant-derived milk alternative with nutty or cereal sweetness',
    substitute: 'Dairy milk or coconut milk',
    storage: 'Shelf stable until opened; refrigerate and consume within 7-10 days.',
    commonUses: 'Vegan baking, smoothies, dairy-free lattes, cereal.',
    caloriesPer100g: 45,
    proteinPer100g: 1.5,
    carbsPer100g: 6.5,
    fatPer100g: 1.5,
    fiberPer100g: 0.8,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: ['Tree Nuts', 'Soy'],
    varieties: [
      { id: 'var-milk-oat', ingredientId: 'ing-plant-milk', name: 'Creamy Barista Oat Milk', defaultUnit: 'ml', culinaryRole: 'Naturally sweet oat beverage with smooth body for baking' },
      { id: 'var-milk-almond', ingredientId: 'ing-plant-milk', name: 'Unsweetened Almond Milk', defaultUnit: 'ml', culinaryRole: 'Low calorie, nutty beverage ideal for keto and light cakes' },
      { id: 'var-milk-soy', ingredientId: 'ing-plant-milk', name: 'Organic Soy Milk', defaultUnit: 'ml', culinaryRole: 'High protein plant milk that curdles like dairy when acid is added' },
    ],
  },

  // --- NUTS, SEEDS & PEANUTS (ALLERGEN CRITICAL) ---
  {
    id: 'ing-peanuts',
    name: 'Peanuts',
    aliases: 'Groundnuts · Goobers · Arachis hypogaea · Peanut butter',
    category: 'Nuts & Seeds',
    flavor: 'Deeply roasted, nutty, savory-sweet legumes with high oil content',
    substitute: 'Sunflower seed butter, toasted almonds, or pumpkin seeds',
    storage: 'Airtight container in cool pantry; refrigerate peanut butter to prevent separation.',
    commonUses: 'Peanut butter cookies, satay sauce, pad thai garnish, crunchy crumbles.',
    caloriesPer100g: 567,
    proteinPer100g: 25.8,
    carbsPer100g: 16.1,
    fatPer100g: 49.2,
    fiberPer100g: 8.5,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: ['Peanuts'],
    varieties: [
      { id: 'var-peanuts-roasted', ingredientId: 'ing-peanuts', name: 'Roasted Salted Peanuts', defaultUnit: 'g', culinaryRole: 'Golden crunchy roasted peanuts for toppings and brittle' },
      { id: 'var-peanuts-raw', ingredientId: 'ing-peanuts', name: 'Raw Shelled Peanuts', defaultUnit: 'g', culinaryRole: 'Unroasted peanuts for boiling, roasting, and stir-fries' },
      { id: 'var-peanut-butter-creamy', ingredientId: 'ing-peanuts', name: 'Creamy Smooth Peanut Butter', defaultUnit: 'tbsp', culinaryRole: 'Emulsified peanut paste for cookies, frostings, and satay' },
      { id: 'var-peanut-butter-crunchy', ingredientId: 'ing-peanuts', name: 'Natural Crunchy Peanut Butter', defaultUnit: 'tbsp', culinaryRole: '100% peanuts with crushed nut chunks and natural oil separation' },
    ],
  },
  {
    id: 'ing-tree-nuts',
    name: 'Tree Nuts',
    aliases: 'Walnuts · Almonds · Pecans · Pistachios · Hazelnuts',
    category: 'Nuts & Seeds',
    flavor: 'Buttery, rich, earthy with varied crunch and high heart-healthy omega-3s',
    substitute: 'Toasted pumpkin seeds or sunflower seeds',
    storage: 'Refrigerate or freeze in airtight glass jars to prevent rancidity.',
    commonUses: 'Banana breads, brownies, pesto alla genovese, pie toppings, granolas.',
    caloriesPer100g: 654,
    proteinPer100g: 15.2,
    carbsPer100g: 13.7,
    fatPer100g: 65.2,
    fiberPer100g: 6.7,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: ['Tree Nuts'],
    varieties: [
      { id: 'var-nuts-walnuts', ingredientId: 'ing-tree-nuts', name: 'Shelled English Walnuts', defaultUnit: 'g', culinaryRole: 'Earthy, tannin-rich nut halves for brownies and breads' },
      { id: 'var-nuts-pecans', ingredientId: 'ing-tree-nuts', name: 'Southern Pecan Halves', defaultUnit: 'g', culinaryRole: 'Sweet buttery nut halves for pecan pies and pralines' },
      { id: 'var-nuts-almonds', ingredientId: 'ing-tree-nuts', name: 'Sliced Toasted Almonds', defaultUnit: 'g', culinaryRole: 'Crisp shaved nuts for garnishing tarts and salads' },
      { id: 'var-nuts-pistachios', ingredientId: 'ing-tree-nuts', name: 'Roasted Shelled Pistachios', defaultUnit: 'g', culinaryRole: 'Vibrant green aromatic nuts for gelato and baklava' },
    ],
  },

  // --- BAKING LEAVENERS & AROMATICS ---
  {
    id: 'ing-vanilla',
    name: 'Vanilla',
    aliases: 'Vanilla extract · Vanilla bean · Vanilla paste',
    category: 'Baking',
    flavor: 'Sweet, floral, aromatic vanillin notes that bridge and elevate dessert profiles',
    substitute: 'Almond extract or ground tonka bean',
    storage: 'Cool, dark cupboard; never refrigerate vanilla beans which can mold.',
    commonUses: 'All baked cakes, custard fillings, ice creams, cookies.',
    caloriesPer100g: 288,
    proteinPer100g: 0.1,
    carbsPer100g: 12.7,
    fatPer100g: 0.1,
    fiberPer100g: 0,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
    varieties: [
      { id: 'var-vanilla-extract', ingredientId: 'ing-vanilla', name: 'Pure Madagascar Bourbon Vanilla Extract', defaultUnit: 'tsp', culinaryRole: 'Standard double-fold alcohol vanilla tincture' },
      { id: 'var-vanilla-bean', ingredientId: 'ing-vanilla', name: 'Whole Tahitian Vanilla Bean Pod', defaultUnit: 'whole', culinaryRole: 'Split pod with millions of aromatic seeds for panna cotta and ice cream' },
      { id: 'var-vanilla-paste', ingredientId: 'ing-vanilla', name: 'Concentrated Vanilla Bean Paste', defaultUnit: 'tsp', culinaryRole: 'Viscous syrup speckled with visible vanilla caviar' },
    ],
  },
  {
    id: 'ing-leaveners',
    name: 'Baking Leaveners',
    aliases: 'Baking powder · Baking soda · Active dry yeast',
    category: 'Baking',
    flavor: 'Neutral to slightly salty; produces carbon dioxide micro-bubbles for rise',
    substitute: 'Whipping egg whites for mechanical rise or lemon juice + baking soda',
    storage: 'Tightly sealed dry pantry; check expiration dates for active fizzing.',
    commonUses: 'Quick breads, cookies, cakes, pizza doughs, fluffy pancakes.',
    caloriesPer100g: 53,
    proteinPer100g: 0,
    carbsPer100g: 28.0,
    fatPer100g: 0,
    fiberPer100g: 0,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
    varieties: [
      { id: 'var-leaven-powder', ingredientId: 'ing-leaveners', name: 'Double-Acting Baking Powder', defaultUnit: 'tsp', culinaryRole: 'Releases gas twice: when moistened and again when heated in oven' },
      { id: 'var-leaven-soda', ingredientId: 'ing-leaveners', name: 'Pure Baking Soda (Sodium Bicarbonate)', defaultUnit: 'tsp', culinaryRole: 'Requires acid (buttermilk, cocoa, brown sugar) to react and leaven' },
      { id: 'var-leaven-yeast', ingredientId: 'ing-leaveners', name: 'Active Dry Baker’s Yeast', defaultUnit: 'tsp', culinaryRole: 'Live fungal culture requiring warm hydration to ferment dough' },
    ],
  },

  // --- HEALTH & DIABETIC HERO PRODUCE ---
  {
    id: 'ing-sweet-potato',
    name: 'Sweet Potato',
    aliases: 'Yams · Ipomoea batatas · Shakarkandi',
    category: 'Produce',
    flavor: 'Sweet, earthy, velvety starch packed with beta-carotene and prebiotic fiber',
    substitute: 'Butternut squash, kabocha pumpkin, or carrots',
    storage: 'Cool, dark, well-ventilated dry pantry (not in refrigerator).',
    commonUses: 'Roasted wedges, silky mash, gnocchi, healthy brownies, soups.',
    caloriesPer100g: 86,
    proteinPer100g: 1.6,
    carbsPer100g: 20.1,
    fatPer100g: 0.1,
    fiberPer100g: 3.0,
    glycemicIndex: 'Medium',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
    varieties: [
      { id: 'var-sweetpot-orange', ingredientId: 'ing-sweet-potato', name: 'Beauregard Orange Sweet Potato', defaultUnit: 'g', culinaryRole: 'Moist, high sugar and carotene flesh for baking and roasting' },
      { id: 'var-sweetpot-purple', ingredientId: 'ing-sweet-potato', name: 'Japanese Murasaki Purple Sweet Potato', defaultUnit: 'g', culinaryRole: 'Nutty, chestnut-like flavor with dense starch and anthocyanins' },
    ],
  },
  {
    id: 'ing-rice',
    name: 'Rice',
    aliases: 'Oryza sativa · Brown rice · Jasmine · Basmati · Arborio',
    category: 'Grains & Pasta',
    flavor: 'Mild, fragrant cereal grain with comforting chew',
    substitute: 'Quinoa, riced cauliflower, or farro',
    storage: 'Airtight container in cool dry pantry.',
    commonUses: 'Grain bowls, risottos, pilafs, sushi, side dishes.',
    caloriesPer100g: 130,
    proteinPer100g: 2.7,
    carbsPer100g: 28.0,
    fatPer100g: 0.3,
    fiberPer100g: 0.4,
    glycemicIndex: 'Medium',
    isDiabeticFriendly: false,
    isPcosFriendly: false,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
    varieties: [
      { id: 'var-rice-brown', ingredientId: 'ing-rice', name: 'Whole Grain Brown Rice', defaultUnit: 'g', culinaryRole: 'High fiber whole grain with low glycemic impact (Diabetic Friendly)', isDiabeticFriendly: true, isGlutenFree: true, isVegan: true, isVegetarian: true },
      { id: 'var-rice-jasmine', ingredientId: 'ing-rice', name: 'Fragrant Jasmine Rice', defaultUnit: 'g', culinaryRole: 'Floral, soft, slightly sticky Thai long-grain rice' },
      { id: 'var-rice-basmati', ingredientId: 'ing-rice', name: 'Aged Himalayan Basmati Rice', defaultUnit: 'g', culinaryRole: 'Slender, non-sticky aromatic grains for curries and pilafs' },
      { id: 'var-rice-arborio', ingredientId: 'ing-rice', name: 'Italian Arborio Risotto Rice', defaultUnit: 'g', culinaryRole: 'High amylopectin short grain releasing creamy starch for risotto' },
    ],
  },

  // --- CORE KITCHEN PANTRY & PRODUCE ---
  {
    id: 'ing-ricotta',
    name: 'Ricotta',
    aliases: 'Italian whey cheese · Ricotta fresca',
    category: 'Dairy & Eggs',
    flavor: 'Mild, silky, subtly sweet and lactic',
    substitute: 'Whipped whole milk cottage cheese or silken tofu with nutritional yeast',
    storage: 'Keep refrigerated at 2-4°C in its whey; consume within 3-5 days of opening.',
    commonUses: 'Filled pastas (ravioli, cannelloni), delicate cheesecakes, fluffy lemon pancakes.',
    caloriesPer100g: 174,
    proteinPer100g: 11.3,
    carbsPer100g: 3.0,
    fatPer100g: 13.0,
    fiberPer100g: 0,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: false,
    isVegetarian: true,
    allergens: ['Dairy'],
  },
  {
    id: 'ing-chickpeas',
    name: 'Chickpeas',
    aliases: 'Garbanzo beans · Kabuli chana · Ceci',
    category: 'Legumes',
    flavor: 'Nutty, buttery, earthy with firm bite',
    substitute: 'Cannellini beans, navy beans, or cooked green lentils',
    storage: 'Store dried chickpeas in airtight jar. Refrigerate cooked beans in cooking liquid for 4 days.',
    commonUses: 'Silky hummus, crisp oven snacks, hearty Mediterranean harvest salads and curries.',
    caloriesPer100g: 164,
    proteinPer100g: 8.9,
    carbsPer100g: 27.4,
    fatPer100g: 2.6,
    fiberPer100g: 7.6,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
  },
  {
    id: 'ing-basil',
    name: 'Fresh Basil',
    aliases: 'Sweet Genovese basil · Ocimum basilicum',
    category: 'Produce',
    flavor: 'Peppery, sweet, with warm notes of clove and anise',
    substitute: 'Fresh Italian flat-leaf parsley blended with fresh mint',
    storage: 'Treat like fresh flowers: trim stems and stand in water glass at room temp.',
    commonUses: 'Pesto alla Genovese, Caprese salads, tomato sauces, finishing herb for pasta.',
    caloriesPer100g: 23,
    proteinPer100g: 3.2,
    carbsPer100g: 2.7,
    fatPer100g: 0.6,
    fiberPer100g: 1.6,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
  },
  {
    id: 'ing-tahini',
    name: 'Tahini',
    aliases: 'Sesame paste · Tahina · Rashi',
    category: 'Condiments',
    flavor: 'Deeply toasted, nutty, rich with a pleasing bitter edge',
    substitute: 'Unsweetened sunflower seed butter or cashew butter',
    storage: 'Store in cool cupboard; once opened, refrigerate and stir oil back in.',
    commonUses: 'Hummus, lemon-garlic salad dressings, halva, roasted vegetable drizzle.',
    caloriesPer100g: 595,
    proteinPer100g: 17.0,
    carbsPer100g: 21.2,
    fatPer100g: 53.8,
    fiberPer100g: 9.3,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: ['Sesame'],
  },
  {
    id: 'ing-pasta',
    name: 'Artisan Pasta',
    aliases: 'Penne · Rigatoni · Spaghetti · Durum wheat semolina',
    category: 'Grains & Pasta',
    flavor: 'Clean, wheaty, comforting starch with al dente bite',
    substitute: 'Gluten-free brown rice pasta, soba noodles, or chickpea pasta',
    storage: 'Cool, dry pantry in sealed airtight container.',
    commonUses: 'Pasta courses, minestrone additions, pasta bakes.',
    caloriesPer100g: 371,
    proteinPer100g: 13.0,
    carbsPer100g: 74.0,
    fatPer100g: 1.5,
    fiberPer100g: 3.2,
    glycemicIndex: 'Medium',
    isDiabeticFriendly: false,
    isPcosFriendly: false,
    isGlutenFree: false,
    isVegan: true,
    isVegetarian: true,
    allergens: ['Gluten'],
  },
  {
    id: 'ing-lemon',
    name: 'Lemon',
    aliases: 'Eureka lemon · Lisbon lemon · Citrus limon',
    category: 'Produce',
    flavor: 'Sharp citric acidity; fragrant aromatic zest oils',
    substitute: 'Lime juice, white wine vinegar, or ground sumac',
    storage: 'Room temp for 1 week; crisper drawer for 3 weeks.',
    commonUses: 'Dressings, marinades, baking balance, deglazing.',
    caloriesPer100g: 29,
    proteinPer100g: 1.1,
    carbsPer100g: 9.3,
    fatPer100g: 0.3,
    fiberPer100g: 2.8,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
  },
  {
    id: 'ing-olive-oil',
    name: 'Extra Virgin Olive Oil',
    aliases: 'EVOO · Cold-pressed olive oil · Aceite de oliva',
    category: 'Pantry & Spices',
    flavor: 'Fruity, peppery, grassy finish with monounsaturated polyphenols',
    substitute: 'Avocado oil for cooking; walnut oil for dressings',
    storage: 'Cool dark cupboard away from oven heat; consume within 60 days of opening.',
    commonUses: 'Finishing pastas, salad emulsifications, gentle sautéing.',
    caloriesPer100g: 884,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatPer100g: 100,
    fiberPer100g: 0,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
  },
  {
    id: 'ing-tomatoes',
    name: 'Tomatoes',
    aliases: 'Roma tomatoes · San Marzano · Plum tomatoes',
    category: 'Produce',
    flavor: 'Sweet, savory umami with bright malic acidity and rich lycopene',
    substitute: 'Canned whole peeled tomatoes or roasted red bell peppers',
    storage: 'Stem-down at room temperature; do not refrigerate whole raw tomatoes.',
    commonUses: 'Slow soups, marinara sauce, fresh salads, roasting.',
    caloriesPer100g: 18,
    proteinPer100g: 0.9,
    carbsPer100g: 3.9,
    fatPer100g: 0.2,
    fiberPer100g: 1.2,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
  },
  {
    id: 'ing-garlic',
    name: 'Garlic',
    aliases: 'Allium sativum · Fresh garlic bulbs · Lahsun',
    category: 'Produce',
    flavor: 'Pungent, sharp allicin bite when raw; sweet, caramelized butteriness when roasted',
    substitute: 'Shallots, garlic scapes, or asafoetida (hing)',
    storage: 'Mesh bag in cool, dark pantry with good airflow. Avoid plastic.',
    commonUses: 'Aromatic base, roasted garlic soups, marinades, aioli.',
    caloriesPer100g: 149,
    proteinPer100g: 6.4,
    carbsPer100g: 33.1,
    fatPer100g: 0.5,
    fiberPer100g: 2.1,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
  },
  {
    id: 'ing-chicken',
    name: 'Chicken Breast',
    aliases: 'Boneless skinless chicken breast · Murgh',
    category: 'Proteins',
    flavor: 'Clean, savory lean poultry protein ready to absorb marinades',
    substitute: 'Extra-firm pressed tofu, turkey cutlets, or seitan',
    storage: 'Refrigerate at 1-2°C for 2 days; freeze airtight for up to 6 months.',
    commonUses: 'Roasts, skillet sears, curries, protein meal-prepping.',
    caloriesPer100g: 165,
    proteinPer100g: 31.0,
    carbsPer100g: 0,
    fatPer100g: 3.6,
    fiberPer100g: 0,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: false,
    isVegetarian: false,
    allergens: [],
  },
  {
    id: 'ing-potatoes',
    name: 'Yukon Gold Potatoes',
    aliases: 'Yellow potatoes · Solanum tuberosum · Aloo',
    category: 'Produce',
    flavor: 'Naturally buttery, creamy, medium-starch golden flesh',
    substitute: 'Russet potatoes, sweet potatoes, or mashed cauliflower',
    storage: 'Cool, dark pantry with ventilation; keep away from onions.',
    commonUses: 'Pan roasting with rosemary, silky mash, comforting stews.',
    caloriesPer100g: 77,
    proteinPer100g: 2.0,
    carbsPer100g: 17.5,
    fatPer100g: 0.1,
    fiberPer100g: 2.2,
    glycemicIndex: 'High',
    isDiabeticFriendly: false,
    isPcosFriendly: false,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
  },
  {
    id: 'ing-chickpea-pasta',
    name: 'Chickpea Pasta',
    aliases: 'Banza pasta · High-protein pulse pasta',
    category: 'Grains & Pasta',
    flavor: 'Earthy, hearty pulse starch with high satiety and double protein',
    substitute: 'Red lentil pasta or whole grain pasta',
    storage: 'Airtight container in dry pantry.',
    commonUses: 'Diabetic-friendly pasta bakes, post-workout dinners.',
    caloriesPer100g: 340,
    proteinPer100g: 23.0,
    carbsPer100g: 58.0,
    fatPer100g: 6.0,
    fiberPer100g: 11.0,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
  },
  {
    id: 'ing-zucchini',
    name: 'Zucchini',
    aliases: 'Courgette · Green summer squash',
    category: 'Produce',
    flavor: 'Delicate, mildly sweet, refreshing tender water-rich vegetable',
    substitute: 'Yellow crookneck squash or thinly sliced eggplant',
    storage: 'Crisper drawer in loose paper bag up to 1 week.',
    commonUses: 'Sautéed skillet sides, grilled planks, vegetable noodles.',
    caloriesPer100g: 17,
    proteinPer100g: 1.2,
    carbsPer100g: 3.1,
    fatPer100g: 0.3,
    fiberPer100g: 1.0,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
  },
  {
    id: 'ing-greek-yogurt',
    name: 'Greek Yogurt (0% or 2%)',
    aliases: 'Strained yogurt · Labneh base',
    category: 'Dairy & Eggs',
    flavor: 'Tangy, thick, velvety protein-packed cultured dairy',
    substitute: 'Whipped silken tofu with lemon or coconut yogurt',
    storage: 'Refrigerate at 2-4°C; consume within 7 days of opening.',
    commonUses: 'Parfaits, protein marinades, tzatziki, healthy dressings.',
    caloriesPer100g: 73,
    proteinPer100g: 10.0,
    carbsPer100g: 3.9,
    fatPer100g: 2.0,
    fiberPer100g: 0,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: false,
    isVegetarian: true,
    allergens: ['Dairy'],
  },
  {
    id: 'ing-salmon',
    name: 'Wild Salmon Fillet',
    aliases: 'Sockeye · Coho · Pacific salmon',
    category: 'Proteins',
    flavor: 'Deeply savory, rich in marine umami and heart-healthy astaxanthin',
    substitute: 'Arctic char, steelhead trout, or marinated tempeh',
    storage: 'Over crushed ice in fridge; prepare within 24-36 hours.',
    commonUses: 'Pan-seared bowls, cedar-plank roasting, grain bowls.',
    caloriesPer100g: 182,
    proteinPer100g: 25.0,
    carbsPer100g: 0,
    fatPer100g: 8.0,
    fiberPer100g: 0,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: false,
    isVegetarian: false,
    allergens: ['Fish'],
  },
  {
    id: 'ing-quinoa',
    name: 'Tri-Color Quinoa',
    aliases: 'Incan golden grain · Chenopodium quinoa',
    category: 'Grains & Pasta',
    flavor: 'Nutty, earthy with playful caviar-like popped texture',
    substitute: 'Millet, brown rice, or farro',
    storage: 'Sealed pantry jar; keep cool.',
    commonUses: 'Warm salad bases, pilafs, high-protein bowl foundations.',
    caloriesPer100g: 120,
    proteinPer100g: 4.4,
    carbsPer100g: 21.3,
    fatPer100g: 1.9,
    fiberPer100g: 2.8,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
  },
  {
    id: 'ing-red-lentils',
    name: 'Split Red Lentils',
    aliases: 'Masoor dal · Petite crimson lentils',
    category: 'Legumes',
    flavor: 'Mild, sweet, earthy; breaks down rapidly into velvety stews',
    substitute: 'Yellow split peas or brown lentils',
    storage: 'Cool dark cupboard in sealed glass container.',
    commonUses: 'Indian dahl, velvety soups, quick protein purées.',
    caloriesPer100g: 116,
    proteinPer100g: 9.0,
    carbsPer100g: 20.0,
    fatPer100g: 0.4,
    fiberPer100g: 3.9,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
  },
  {
    id: 'ing-coconut-milk',
    name: 'Coconut Milk (Full-Fat)',
    aliases: 'Culinary coconut cream · Pure coconut extract',
    category: 'Dairy & Eggs',
    flavor: 'Opulent, silky tropical creaminess packed with medium-chain triglycerides',
    substitute: 'Cashew cream or heavy dairy cream',
    storage: 'Pantry canned; transfer unused portions to glass container in fridge for 4 days.',
    commonUses: 'Dahl, Thai curries, dairy-free puddings, creamy soups.',
    caloriesPer100g: 197,
    proteinPer100g: 2.0,
    carbsPer100g: 2.8,
    fatPer100g: 21.3,
    fiberPer100g: 0,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
  },
  {
    id: 'ing-ginger',
    name: 'Fresh Ginger Root',
    aliases: 'Zingiber officinale · Adrak',
    category: 'Produce',
    flavor: 'Spicy, zesty, clean, warming medicinal aroma',
    substitute: 'Ground dried ginger (1/4 ratio) or galangal',
    storage: 'Refrigerate wrapped unpeeled in paper towel; freeze indefinitely and grate frozen.',
    commonUses: 'Curry pastes, herbal broths, dressings, tea infusions.',
    caloriesPer100g: 80,
    proteinPer100g: 1.8,
    carbsPer100g: 17.8,
    fatPer100g: 0.7,
    fiberPer100g: 2.0,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
  },
  {
    id: 'ing-sourdough',
    name: 'Artisan Sourdough Bread',
    aliases: 'Naturally leavened wild yeast bread',
    category: 'Grains & Pasta',
    flavor: 'Tangy, complex wild fermentation with blistered crunchy crust and open crumb',
    substitute: 'Gluten-free seeded artisan bread',
    storage: 'Cut-side down on wooden board for 2 days; slice and freeze airtight.',
    commonUses: 'Avocado toasts, croutons, bruschetta, panzanella.',
    caloriesPer100g: 247,
    proteinPer100g: 9.0,
    carbsPer100g: 49.0,
    fatPer100g: 1.2,
    fiberPer100g: 2.5,
    glycemicIndex: 'Medium',
    isDiabeticFriendly: true,
    isPcosFriendly: false,
    isGlutenFree: false,
    isVegan: true,
    isVegetarian: true,
    allergens: ['Gluten'],
  },
  {
    id: 'ing-avocado',
    name: 'Ripe Hass Avocado',
    aliases: 'Alligator pear · Persea americana',
    category: 'Produce',
    flavor: 'Silky, buttery, clean grassy richness packed with oleic monounsaturated fatty acids',
    substitute: 'Edamame dip or whipped ricotta',
    storage: 'Room temp until soft to touch; refrigerate ripe fruit up to 4 days.',
    commonUses: 'Toasts, salads, grain bowls, dairy-free smoothies.',
    caloriesPer100g: 160,
    proteinPer100g: 2.0,
    carbsPer100g: 8.5,
    fatPer100g: 14.7,
    fiberPer100g: 6.7,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
  },
  {
    id: 'ing-eggs',
    name: 'Pasture-Raised Eggs',
    aliases: 'Fresh chicken eggs · Whole eggs',
    category: 'Dairy & Eggs',
    flavor: 'Rich, custard-like yolk with clean albumen structure',
    substitute: 'Flax eggs, aquafaba, or silken tofu in baking',
    storage: 'Refrigerate carton at 2-4°C.',
    commonUses: 'Poaching, custards, cake structure, emulsifying hollandaise.',
    caloriesPer100g: 143,
    proteinPer100g: 12.6,
    carbsPer100g: 0.7,
    fatPer100g: 9.5,
    fiberPer100g: 0,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: false,
    isVegetarian: true,
    allergens: ['Eggs'],
    varieties: [
      { id: 'var-eggs-whole', ingredientId: 'ing-eggs', name: 'Whole Fresh Eggs', defaultUnit: 'whole', culinaryRole: 'Standard whole egg combining yolk fats with albumen proteins' },
      { id: 'var-eggs-whites', ingredientId: 'ing-eggs', name: 'Egg Whites (Albumen)', defaultUnit: 'whole', culinaryRole: 'Pure protein for meringues, macarons, and fat-free structure' },
      { id: 'var-eggs-yolks', ingredientId: 'ing-eggs', name: 'Rich Egg Yolks', defaultUnit: 'whole', culinaryRole: 'Lecithin-rich emulsifier for custards, crème brûlée, and mayonnaise' },
    ],
  },
  {
    id: 'ing-shiitake',
    name: 'Fresh Shiitake Mushrooms',
    aliases: 'Lentinula edodes · Black forest mushroom',
    category: 'Produce',
    flavor: 'Deeply smoky, earthy, concentrated fungal guanylate umami',
    substitute: 'Cremini mushrooms, porcini, or portobello caps',
    storage: 'Refrigerate in breathable paper bag; avoid airtight plastic.',
    commonUses: 'Ramen broths, stir fries, mushroom ragu, braises.',
    caloriesPer100g: 34,
    proteinPer100g: 2.2,
    carbsPer100g: 6.8,
    fatPer100g: 0.5,
    fiberPer100g: 2.5,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
  },
  {
    id: 'ing-miso',
    name: 'White Miso Paste',
    aliases: 'Shiro miso · Sweet fermented soybean paste',
    category: 'Condiments',
    flavor: 'Sweet, savory, mild saltiness with rich fermented depth',
    substitute: 'Yellow miso or nutritional yeast with coconut aminos',
    storage: 'Refrigerate tightly sealed; keeps up to 1 year.',
    commonUses: 'Ramen broth, salad dressings, glazes for roasted eggplant.',
    caloriesPer100g: 198,
    proteinPer100g: 12.0,
    carbsPer100g: 26.0,
    fatPer100g: 6.0,
    fiberPer100g: 5.0,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: ['Soy'],
  },
  {
    id: 'ing-soba',
    name: 'Buckwheat Soba Noodles',
    aliases: 'Japanese buckwheat noodles · Juwari soba',
    category: 'Grains & Pasta',
    flavor: 'Nutty, hearty, smooth texture with clean mineral grain finish',
    substitute: 'Udon noodles, brown rice noodles, or zucchini noodles',
    storage: 'Cool dry pantry in sealed airtight box.',
    commonUses: 'Hot broth ramen bowls, chilled dipping noodles (zaru soba).',
    caloriesPer100g: 99,
    proteinPer100g: 5.1,
    carbsPer100g: 21.4,
    fatPer100g: 0.1,
    fiberPer100g: 1.4,
    glycemicIndex: 'Medium',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: false,
    isVegan: true,
    isVegetarian: true,
    allergens: ['Gluten'],
  },
  {
    id: 'ing-berries',
    name: 'Mixed Wild Berries',
    aliases: 'Fresh blueberries, raspberries & blackberries',
    category: 'Produce',
    flavor: 'Vibrant sweet-tart juiciness loaded with anthocyanin polyphenols',
    substitute: 'Frozen wild blueberries or sliced ripe strawberries',
    storage: 'Refrigerate unwashed with paper towel lining; wash immediately prior to serving.',
    commonUses: 'Breakfast parfaits, baked crisps, chia compote toppings.',
    caloriesPer100g: 57,
    proteinPer100g: 0.7,
    carbsPer100g: 14.5,
    fatPer100g: 0.3,
    fiberPer100g: 2.4,
    glycemicIndex: 'Low',
    isDiabeticFriendly: true,
    isPcosFriendly: true,
    isGlutenFree: true,
    isVegan: true,
    isVegetarian: true,
    allergens: [],
  },
];

// -------------------------------------------------------------
// RELATIONAL INFERENCE & SEMANTIC INTELLIGENCE HELPERS
// -------------------------------------------------------------

export function findMasterIngredient(
  item: { ingredientId?: string; name: string; varietyId?: string },
  masterList: IngredientMaster[] = masterIngredients
): IngredientMaster | undefined {
  if (item.ingredientId) {
    const byId = masterList.find(m => m.id === item.ingredientId);
    if (byId) return byId;
  }
  if (item.varietyId) {
    const byVar = masterList.find(m => m.varieties?.some(v => v.id === item.varietyId));
    if (byVar) return byVar;
  }
  const cleanName = (item.name || '').toLowerCase().trim();
  if (!cleanName) return undefined;

  // 1. Exact canonical name
  const byName = masterList.find(m => m.name.toLowerCase() === cleanName);
  if (byName) return byName;

  // 2. Exact variety match
  const byVarName = masterList.find(m =>
    m.varieties?.some(v => v.name.toLowerCase() === cleanName)
  );
  if (byVarName) return byVarName;

  // 3. Substring in variety name
  const byVarSub = masterList.find(m =>
    m.varieties?.some(v => v.name.toLowerCase().includes(cleanName) || cleanName.includes(v.name.toLowerCase()))
  );
  if (byVarSub) return byVarSub;

  // 4. Substring in canonical name or aliases
  return masterList.find(m =>
    cleanName.includes(m.name.toLowerCase()) ||
    m.name.toLowerCase().includes(cleanName) ||
    m.aliases.toLowerCase().includes(cleanName)
  );
}

export function findMasterIngredientAndVariety(
  item: { ingredientId?: string; name: string; varietyId?: string },
  masterList: IngredientMaster[] = masterIngredients
): { master?: IngredientMaster; variety?: IngredientVariety } {
  const master = findMasterIngredient(item, masterList);
  if (!master) return {};

  const cleanName = (item.name || '').toLowerCase().trim();
  let variety: IngredientVariety | undefined;
  if (item.varietyId && master.varieties) {
    variety = master.varieties.find((v) => v.id === item.varietyId);
  }
  if (!variety && master.varieties) {
    variety = master.varieties.find(
      (v) =>
        v.name.toLowerCase() === cleanName ||
        cleanName.includes(v.name.toLowerCase()) ||
        v.name.toLowerCase().includes(cleanName)
    );
  }
  return { master, variety };
}

export function inferRecipeAllergens(
  ingredients: RecipeIngredient[],
  masterList: IngredientMaster[] = masterIngredients
): AllergenType[] {
  const allergenSet = new Set<AllergenType>();
  for (const ing of ingredients) {
    const { master, variety } = findMasterIngredientAndVariety(ing, masterList);
    const allergens = variety?.allergens !== undefined ? variety.allergens : master?.allergens;
    if (allergens) {
      allergens.forEach((a) => allergenSet.add(a));
    }
  }
  return Array.from(allergenSet);
}

export function inferRecipeDietaryTags(
  ingredients: RecipeIngredient[],
  masterList: IngredientMaster[] = masterIngredients
): {
  isDiabeticFriendly: boolean;
  isGlutenFree: boolean;
  isVegan: boolean;
  isVegetarian: boolean;
  detectedAllergens: AllergenType[];
  inferredTags: string[];
} {
  const allergens = inferRecipeAllergens(ingredients, masterList);
  if (!ingredients || ingredients.length === 0) {
    return {
      isDiabeticFriendly: true,
      isGlutenFree: true,
      isVegan: true,
      isVegetarian: true,
      detectedAllergens: [],
      inferredTags: [],
    };
  }

  let allVegan = true;
  let allVegetarian = true;
  let allGlutenFree = !allergens.includes('Gluten');
  let diabeticFriendly = true;

  for (const ing of ingredients) {
    const { master, variety } = findMasterIngredientAndVariety(ing, masterList);
    if (master) {
      const isVegan = variety?.isVegan !== undefined ? variety.isVegan : master.isVegan;
      const isVegetarian =
        variety?.isVegetarian !== undefined ? variety.isVegetarian : master.isVegetarian;
      const isGlutenFree =
        variety?.isGlutenFree !== undefined ? variety.isGlutenFree : master.isGlutenFree;
      const isDiabetic =
        variety?.isDiabeticFriendly !== undefined
          ? variety.isDiabeticFriendly
          : master.isDiabeticFriendly;

      if (isVegan === false) allVegan = false;
      if (isVegetarian === false) allVegetarian = false;
      if (isGlutenFree === false) allGlutenFree = false;
      if (isDiabetic === false || (variety?.isDiabeticFriendly !== true && master.glycemicIndex === 'High')) {
        diabeticFriendly = false;
      }
    } else {
      const lower = ing.name.toLowerCase();
      if (
        lower.includes('chicken') ||
        lower.includes('meat') ||
        lower.includes('beef') ||
        lower.includes('fish') ||
        lower.includes('salmon')
      ) {
        allVegan = false;
        allVegetarian = false;
      }
      if (
        lower.includes('cheese') ||
        lower.includes('milk') ||
        lower.includes('butter') ||
        lower.includes('egg') ||
        lower.includes('honey')
      ) {
        allVegan = false;
      }
      if (
        lower.includes('flour') ||
        lower.includes('wheat') ||
        lower.includes('bread') ||
        lower.includes('pasta')
      ) {
        allGlutenFree = false;
      }
      if (lower.includes('sugar') || lower.includes('syrup') || lower.includes('caramel')) {
        diabeticFriendly = false;
      }
    }
  }

  const tags: string[] = [];
  if (allVegan) tags.push('Vegan');
  else if (allVegetarian) tags.push('Vegetarian');
  if (allGlutenFree) tags.push('Gluten-free');
  if (diabeticFriendly) tags.push('Diabetic-friendly');

  return {
    isDiabeticFriendly: diabeticFriendly,
    isGlutenFree: allGlutenFree,
    isVegan: allVegan,
    isVegetarian: allVegetarian,
    detectedAllergens: allergens,
    inferredTags: tags,
  };
}

export function estimateRecipeNutrition(
  ingredients: RecipeIngredient[],
  servings: number = 2,
  masterList: IngredientMaster[] = masterIngredients
): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
} {
  let totalCal = 0;
  let totalProt = 0;
  let totalCarb = 0;
  let totalFat = 0;
  let totalFib = 0;

  for (const ing of ingredients) {
    const master = findMasterIngredient(ing, masterList);
    let factorInGrams = 1;
    const u = (ing.unit || '').toLowerCase().trim();
    if (u === 'g' || u === 'ml') factorInGrams = 1;
    else if (u === 'kg' || u === 'l') factorInGrams = 1000;
    else if (u === 'tbsp') factorInGrams = 15;
    else if (u === 'tsp') factorInGrams = 5;
    else if (u === 'cup') factorInGrams = 200;
    else if (u === 'whole') factorInGrams = 60;
    else if (u === 'clove') factorInGrams = 3;
    else if (u === 'pinch') factorInGrams = 1;
    else if (u === 'slice') factorInGrams = 35;
    else if (u === 'oz') factorInGrams = 28.35;
    else if (u === 'lb') factorInGrams = 453.6;

    const grams = (Number(ing.quantity) || 0) * factorInGrams;
    const multiplier = grams / 100;

    if (master) {
      totalCal += master.caloriesPer100g * multiplier;
      totalProt += master.proteinPer100g * multiplier;
      totalCarb += master.carbsPer100g * multiplier;
      totalFat += master.fatPer100g * multiplier;
      totalFib += master.fiberPer100g * multiplier;
    } else {
      totalCal += 120 * multiplier;
      totalProt += 4 * multiplier;
      totalCarb += 15 * multiplier;
      totalFat += 3 * multiplier;
      totalFib += 2 * multiplier;
    }
  }

  const s = Math.max(1, servings);
  return {
    calories: Math.round(totalCal / s),
    protein: Math.round((totalProt / s) * 10) / 10,
    carbs: Math.round((totalCarb / s) * 10) / 10,
    fat: Math.round((totalFat / s) * 10) / 10,
    fiber: Math.round((totalFib / s) * 10) / 10,
  };
}

// CORE RECIPE REPOSITORY (Structured Relational Entries)
// -------------------------------------------------------------

export const recipes: Recipe[] = [
  {
    id: 'lemon-ricotta-pasta',
    title: 'Lemon & Ricotta Pasta',
    description: 'A little sunshine in a bowl. Creamy fresh ricotta, bright lemon zest, and fragrant hand-torn basil.',
    image: pasta,
    category: 'Dinner',
    cuisine: 'Italian',
    diet: 'Vegetarian',
    difficulty: 'Easy',
    prepTime: 10,
    cookTime: 15,
    time: 25,
    servings: 2,
    rating: '4.9',
    ratingCount: 28,
    calories: 485,
    protein: 21,
    carbs: 62,
    fat: 17,
    fiber: 4,
    source: 'The RecipeVault Kitchen',
    sourceUrl: 'https://recipevault.internal/recipes/lemon-ricotta-pasta',
    visibility: 'Public',
    status: 'Published',
    createdBy: 'user-eric',
    createdAt: '2026-08-14T10:30:00Z',
    updatedAt: '2026-09-02T14:15:00Z',
    tags: ['Quick & Easy', 'Weeknight', 'Comfort Food', 'Summer'],
    ingredients: [
      { ingredientId: 'ing-pasta', name: 'Artisan Pasta', quantity: 200, unit: 'g', preparationState: 'penne or rigatoni' },
      { ingredientId: 'ing-ricotta', name: 'Ricotta', quantity: 150, unit: 'g', preparationState: 'fresh whole milk' },
      { ingredientId: 'ing-lemon', name: 'Lemon', quantity: 1, unit: 'whole', preparationState: 'zested and juiced' },
      { ingredientId: 'ing-olive-oil', name: 'Extra Virgin Olive Oil', quantity: 1.5, unit: 'tbsp', preparationState: 'cold-pressed' },
      { ingredientId: 'ing-basil', name: 'Fresh Basil', quantity: 0.25, unit: 'cup', preparationState: 'hand-torn' },
      { ingredientId: 'ing-garlic', name: 'Garlic', quantity: 1, unit: 'clove', preparationState: 'finely grated', isOptional: true },
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'Bring a large pot of salted water to a rolling boil. Cook pasta until 1 minute shy of al dente. Vital: ladle out 1 cup of starchy pasta water before draining.',
        durationMinutes: 10,
        tip: 'Salting the water like the sea ensures the pasta itself has real flavor.',
      },
      {
        stepNumber: 2,
        instruction: 'In a warm shallow serving bowl, whisk together ricotta, lemon zest, 2 tbsp fresh lemon juice, grated garlic, olive oil, and a generous crack of black pepper.',
        durationMinutes: 3,
        tip: 'The residual heat of the bowl softens the ricotta into a velvety sheen.',
      },
      {
        stepNumber: 3,
        instruction: 'Toss hot drained pasta straight into the ricotta bowl. Splash in 3–4 tbsp of reserved pasta water and toss vigorously until a glossy emulsion forms.',
        durationMinutes: 2,
        tip: 'Starch in the water binds the dairy fat and lemon juice into a restaurant-grade sauce.',
      },
      {
        stepNumber: 4,
        instruction: 'Scatter with fresh torn basil, a final grating of lemon zest, flaky sea salt, and a drizzle of peppery olive oil. Serve immediately.',
        durationMinutes: 1,
      },
    ],
  },
  {
    id: 'chickpea-harvest-bowl',
    title: 'Roasted Chickpea Harvest Bowl',
    description: 'Crispy cumin-roasted chickpeas, buttery ripe avocado, sweet tomatoes, and crisp greens finished with a creamy lemon-tahini drizzle.',
    image: salad,
    category: 'Lunch',
    cuisine: 'Mediterranean',
    diet: 'Vegan',
    difficulty: 'Easy',
    prepTime: 10,
    cookTime: 20,
    time: 30,
    servings: 2,
    rating: '4.8',
    ratingCount: 19,
    calories: 390,
    protein: 16,
    carbs: 45,
    fat: 18,
    fiber: 11,
    source: 'The RecipeVault Kitchen',
    visibility: 'Public',
    status: 'Published',
    createdBy: 'user-maya',
    createdAt: '2026-08-19T11:00:00Z',
    updatedAt: '2026-08-25T16:20:00Z',
    tags: ['Plant-Powered', 'High Fiber', 'Meal Prep', 'Gluten-Free'],
    ingredients: [
      { ingredientId: 'ing-chickpeas', name: 'Chickpeas', quantity: 400, unit: 'g', preparationState: 'rinsed and thoroughly dried' },
      { ingredientId: 'ing-tomatoes', name: 'Tomatoes', quantity: 150, unit: 'g', preparationState: 'quartered ripe cherry' },
      { ingredientId: 'ing-olive-oil', name: 'Extra Virgin Olive Oil', quantity: 2, unit: 'tbsp' },
      { ingredientId: 'ing-lemon', name: 'Lemon', quantity: 1, unit: 'whole', preparationState: 'freshly squeezed' },
      { ingredientId: 'ing-tahini', name: 'Tahini', quantity: 2, unit: 'tbsp', preparationState: 'stirred smooth' },
      { ingredientId: 'ing-garlic', name: 'Garlic', quantity: 1, unit: 'clove', preparationState: 'crushed' },
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'Preheat oven to 200°C (400°F). Pat chickpeas thoroughly dry with a kitchen towel. Toss with 1 tbsp olive oil, sea salt, and ground cumin.',
        durationMinutes: 5,
        tip: 'Removing all moisture is the secret to blistered, genuinely crunchy chickpeas.',
      },
      {
        stepNumber: 2,
        instruction: 'Spread chickpeas on a baking sheet in a single layer and roast for 20 minutes until golden and crisp, shaking the tray halfway.',
        durationMinutes: 20,
      },
      {
        stepNumber: 3,
        instruction: 'Whisk tahini, lemon juice, crushed garlic, and 2 tablespoons of warm water until a creamy dressing forms.',
        durationMinutes: 3,
        tip: 'Tahini will seize up initially when lemon is added; keep stirring and adding warm water until silky.',
      },
      {
        stepNumber: 4,
        instruction: 'Divide fresh greens and tomatoes between two wide bowls, top with hot crunchy chickpeas, and generously drizzle tahini dressing over top.',
        durationMinutes: 2,
      },
    ],
  },
  {
    id: 'rosemary-roast-chicken',
    title: 'Lemon & Rosemary Roast Chicken',
    description: 'Crispy skin, tender juicy chicken, and Yukon gold potatoes roasted in lemon juices and fragrant fresh rosemary.',
    image: chicken,
    category: 'Dinner',
    cuisine: 'Mediterranean',
    diet: 'High protein',
    difficulty: 'Medium',
    prepTime: 15,
    cookTime: 50,
    time: 65,
    servings: 4,
    rating: '4.8',
    ratingCount: 22,
    calories: 520,
    protein: 42,
    carbs: 31,
    fat: 25,
    fiber: 4,
    source: 'The RecipeVault Kitchen',
    visibility: 'Public',
    status: 'Published',
    createdBy: 'user-neeraj',
    createdAt: '2026-07-28T17:00:00Z',
    updatedAt: '2026-08-30T19:00:00Z',
    tags: ['High Protein', 'Family Dinner', 'One Pan', 'Rustic'],
    ingredients: [
      { ingredientId: 'ing-chicken', name: 'Chicken Breast', quantity: 700, unit: 'g', preparationState: 'skin-on or bone-in cuts' },
      { ingredientId: 'ing-potatoes', name: 'Yukon Gold Potatoes', quantity: 500, unit: 'g', preparationState: 'cut into 1-inch wedges' },
      { ingredientId: 'ing-lemon', name: 'Lemon', quantity: 2, unit: 'whole', preparationState: 'sliced into rounds' },
      { ingredientId: 'ing-garlic', name: 'Garlic', quantity: 6, unit: 'clove', preparationState: 'smashed whole' },
      { ingredientId: 'ing-olive-oil', name: 'Extra Virgin Olive Oil', quantity: 2.5, unit: 'tbsp' },
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'Heat oven to 200°C (400°F). Toss potato wedges and smashed garlic with 1.5 tbsp olive oil, salt, and freshly chopped rosemary on a heavy roasting pan.',
        durationMinutes: 8,
      },
      {
        stepNumber: 2,
        instruction: 'Nestle chicken pieces among the potatoes. Rub chicken skin with remaining olive oil, salt, and pepper. Tuck lemon rounds between pieces.',
        durationMinutes: 7,
      },
      {
        stepNumber: 3,
        instruction: 'Roast for 45–50 minutes, basting once halfway through with pan juices, until chicken skin is crisp and deep golden (internal temp 74°C / 165°F).',
        durationMinutes: 50,
        tip: 'Basting with the lemon-infused chicken drippings glazes the potatoes to crispy perfection.',
      },
      {
        stepNumber: 4,
        instruction: 'Let rest for 5 minutes before carving. Spoon luscious pan juices and roasted garlic over the plates.',
        durationMinutes: 5,
      },
    ],
  },
];

// -------------------------------------------------------------
// RECIPE VERSION HISTORY (Relational Version Snapshots)
// -------------------------------------------------------------

export const initialRecipeVersions: RecipeVersion[] = [
  {
    versionId: 'ver-lemon-pasta-1',
    recipeId: 'lemon-ricotta-pasta',
    versionNumber: 1,
    changeSummary: 'Initial recipe creation with standard ricotta and cream sauce.',
    authorId: 'user-eric',
    authorName: 'Eric Titus',
    createdAt: '2026-08-14T10:30:00Z',
    snapshot: {
      servings: 2,
      time: 30,
      description: 'Simple lemon ricotta pasta with parmesan and heavy cream.',
    },
  },
  {
    versionId: 'ver-lemon-pasta-2',
    recipeId: 'lemon-ricotta-pasta',
    versionNumber: 2,
    changeSummary: 'Eliminated heavy cream, increased starchy pasta water emulsification and added fresh lemon zest finishing note.',
    authorId: 'user-eric',
    authorName: 'Eric Titus',
    createdAt: '2026-09-02T14:15:00Z',
    snapshot: {
      servings: 2,
      time: 25,
      description: 'A little sunshine in a bowl. Creamy fresh ricotta, bright lemon zest, and fragrant hand-torn basil.',
    },
  },
  {
    versionId: 'ver-chickpea-bowl-1',
    recipeId: 'chickpea-harvest-bowl',
    versionNumber: 1,
    changeSummary: 'Initial harvest bowl formulation with balsamic glaze dressing.',
    authorId: 'user-maya',
    authorName: 'Maya Lin',
    createdAt: '2026-08-19T11:00:00Z',
    snapshot: {
      servings: 2,
      time: 35,
    },
  },
  {
    versionId: 'ver-chickpea-bowl-2',
    recipeId: 'chickpea-harvest-bowl',
    versionNumber: 2,
    changeSummary: 'Upgraded to Mediterranean lemon-tahini dressing for superior creaminess and healthy fats.',
    authorId: 'user-maya',
    authorName: 'Maya Lin',
    createdAt: '2026-08-25T16:20:00Z',
    snapshot: {
      servings: 2,
      time: 30,
    },
  },
];

// -------------------------------------------------------------
// REVIEWS & RATINGS REPOSITORY
// -------------------------------------------------------------

export const initialReviews: Review[] = [
  {
    id: 'rev-1',
    recipeId: 'lemon-ricotta-pasta',
    userId: 'user-neeraj',
    userName: 'Neeraj K',
    userAvatar: 'N',
    rating: 5,
    comment: 'The pasta water trick completely transformed this! Silky smooth without needing heavy cream. Made this after a long gym workout.',
    createdAt: '2026-09-12T19:30:00Z',
    verifiedCook: true,
  },
  {
    id: 'rev-2',
    recipeId: 'lemon-ricotta-pasta',
    userId: 'user-maya',
    userName: 'Maya Lin',
    userAvatar: 'M',
    rating: 5,
    comment: 'Substituted almond milk ricotta and it was divine. The lemon zest brings so much lively freshness!',
    createdAt: '2026-09-20T13:45:00Z',
    verifiedCook: true,
  },
  {
    id: 'rev-3',
    recipeId: 'chickpea-harvest-bowl',
    userId: 'user-eric',
    userName: 'Eric Titus',
    userAvatar: 'E',
    rating: 5,
    comment: 'The tahini dressing is absolute gold. Roasting the chickpeas thoroughly makes all the difference in crunch.',
    createdAt: '2026-08-28T12:10:00Z',
    verifiedCook: true,
  },
  {
    id: 'rev-roast-chicken-1',
    recipeId: 'rosemary-roast-chicken',
    userId: 'user-neeraj',
    userName: 'Neeraj K',
    userAvatar: 'N',
    rating: 5,
    comment: 'The herb butter under the skin made the chicken so juicy, and the potatoes absorbed all the pan drippings!',
    createdAt: '2026-09-22T19:00:00Z',
    verifiedCook: true,
  },
];

// -------------------------------------------------------------
// NUTRITION & CULINARY SCIENTIFIC FAQS
// -------------------------------------------------------------

export const nutritionFAQs: NutritionFAQ[] = [
  {
    id: 'faq-1',
    category: 'Serving Scaling & Portions',
    question: 'How does serving scaling affect nutritional values?',
    answer: 'The macro numbers displayed on each recipe card (Calories, Protein, Carbs, Fat) represent the nutritional breakdown for ONE standard portion. When you adjust the serving stepper (e.g. from 2 to 6 servings), ingredient quantities automatically scale up for preparation, but the per-serving nutrient density remains constant.',
  },
  {
    id: 'faq-2',
    category: 'Macronutrient Balance',
    question: 'Why prioritize protein and dietary fiber in everyday cooking?',
    answer: 'Protein provides the amino acids required for cellular repair, immune health, and muscle synthesis. Combining lean proteins with unrefined fiber (like legumes, vegetables, and whole grains) slows glucose absorption, preventing energy crashes and supporting gut microbiome diversity.',
  },
  {
    id: 'faq-3',
    category: 'Culinary Chemistry',
    question: 'What is the culinary secret behind pasta cooking water?',
    answer: 'When dried pasta boils, starches leach into the cooking water. Ladling out this warm, starchy liquid and tossing it vigorously with fat (such as olive oil or ricotta) forms a physical emulsion. The starch acts as a natural culinary stabilizer, clinging the sauce tightly to the pasta noodles.',
  },
  {
    id: 'faq-4',
    category: 'Healthy Fats',
    question: 'Are the fats in extra virgin olive oil and tahini heart-healthy?',
    answer: 'Yes! Extra virgin olive oil is abundant in oleic acid (a monounsaturated omega-9 fat) and polyphenol antioxidants. Tahini provides rich polyunsaturated and monounsaturated lipids along with sesamin. Both promote cardiovascular health when replacing saturated animal fats.',
  },
  {
    id: 'faq-5',
    category: 'Disclaimer & Medical Boundaries',
    question: 'Are RecipeVault recommendations clinical medical advice?',
    answer: 'No. RecipeVault provides educational culinary information, nutritional estimates, and user-guided dietary filters for home cooking discovery. Nutritional metrics are approximations calculated from standard baseline datasets. They should never substitute for personalized clinical guidance from a registered dietitian or physician.',
  },
];

// -------------------------------------------------------------
// REUSABLE CALCULATION SERVICES (Fraction Scaler & Smart Shopping)
// -------------------------------------------------------------

/**
 * Converts decimal numbers to neat culinary fractions (e.g., 0.5 -> "1/2", 1.25 -> "1 1/4")
 */
export function formatCulinaryQuantity(val: number): string {
  if (val <= 0) return '0';
  const whole = Math.floor(val);
  const remainder = Number((val - whole).toFixed(2));

  let fraction = '';
  if (Math.abs(remainder - 0.25) < 0.05) fraction = '1/4';
  else if (Math.abs(remainder - 0.33) < 0.05) fraction = '1/3';
  else if (Math.abs(remainder - 0.5) < 0.05) fraction = '1/2';
  else if (Math.abs(remainder - 0.67) < 0.05) fraction = '2/3';
  else if (Math.abs(remainder - 0.75) < 0.05) fraction = '3/4';

  if (fraction) {
    return whole > 0 ? `${whole} ${fraction}` : fraction;
  }

  // Otherwise clean decimal format
  return Number(val.toFixed(val >= 10 ? 1 : 2)).toLocaleString('en-US');
}

/**
 * Calculates scaled quantity for target servings without mutating canonical database record
 */
export function scaledQuantity(quantity: number, originalServings: number, targetServings: number): string {
  if (!originalServings || originalServings <= 0) return String(quantity);
  const scaled = (quantity * targetServings) / originalServings;
  return formatCulinaryQuantity(scaled);
}

/**
 * Computes pantry overlap score (0 to 100%) for a given recipe
 */
export function calculatePantryMatch(recipe: Recipe, userPantryIngredientNames: string[]): {
  matchPercentage: number;
  matchingCount: number;
  totalRequired: number;
  missingIngredients: string[];
} {
  const pantrySet = new Set(userPantryIngredientNames.map(s => s.toLowerCase().trim()));
  const required = recipe.ingredients.filter(i => !i.isOptional);
  const totalRequired = required.length;

  if (totalRequired === 0) {
    return { matchPercentage: 100, matchingCount: 0, totalRequired: 0, missingIngredients: [] };
  }

  const missing: string[] = [];
  let matchingCount = 0;

  for (const ing of required) {
    const isPresent = pantrySet.has(ing.name.toLowerCase().trim()) ||
      Array.from(pantrySet).some(p => ing.name.toLowerCase().includes(p) || p.includes(ing.name.toLowerCase()));
    if (isPresent) {
      matchingCount++;
    } else {
      missing.push(ing.name);
    }
  }

  const matchPercentage = Math.round((matchingCount / totalRequired) * 100);
  return { matchPercentage, matchingCount, totalRequired, missingIngredients: missing };
}

/**
 * -------------------------------------------------------------
 * CLINICAL HEALTH & METABOLIC INTELLIGENCE ENGINE
 * Supports: Type 2 Diabetes, PCOS, Hypertension (DASH), GERD, Celiac
 * -------------------------------------------------------------
 */

export type HealthConditionId = 'diabetes' | 'pcos' | 'hypertension' | 'gerd' | 'celiac';

export type HealthConditionRule = {
  id: HealthConditionId;
  label: string;
  badge: string;
  color: string;
  description: string;
  clinicalRationale: string;
  idealMaxNetCarbs?: number;
  idealMinFiber?: number;
  idealMinProtein?: number;
  idealMaxFat?: number;
  beneficialIngredients: string[];
  triggerIngredients: string[];
};

export const HEALTH_CONDITIONS: Record<HealthConditionId, HealthConditionRule> = {
  diabetes: {
    id: 'diabetes',
    label: 'Type 2 Diabetes & Prediabetes',
    badge: 'Diabetic-Friendly',
    color: 'emerald',
    description: 'Stabilizes blood glucose via high soluble fiber, low net carbs, and slow digestive glycemic release.',
    clinicalRationale: 'Focuses on complex carbohydrates with high dietary fiber (≥ 4g) and moderate net carbs (≤ 45g per serving). Blunts postprandial glucose excursions and guards pancreatic beta cells against insulin surges.',
    idealMaxNetCarbs: 45,
    idealMinFiber: 4,
    beneficialIngredients: ['chickpeas', 'white beans', 'garlic', 'olive oil', 'lemon', 'basil', 'greens', 'spinach', 'avocado'],
    triggerIngredients: ['refined sugar', 'corn syrup', 'maple syrup', 'white bread', 'sweetened glaze', 'candy'],
  },
  pcos: {
    id: 'pcos',
    label: 'PCOS (Polycystic Ovary Syndrome)',
    badge: 'PCOS-Balanced',
    color: 'purple',
    description: 'Anti-inflammatory, hormone-supportive meals designed to reduce hyperinsulinemia and ovarian stress.',
    clinicalRationale: 'Combines anti-inflammatory monounsaturated fats (EVOO, avocado) with lean proteins (≥ 14g) and low glycemic load starches to minimize insulin spikes that trigger androgen overproduction.',
    idealMinProtein: 14,
    idealMinFiber: 3,
    beneficialIngredients: ['extra virgin olive oil', 'lemon', 'garlic', 'chicken', 'tahini', 'avocado', 'chickpeas', 'basil'],
    triggerIngredients: ['refined sugar', 'trans fats', 'high fructose'],
  },
  hypertension: {
    id: 'hypertension',
    label: 'Hypertension & Heart-Healthy (DASH)',
    badge: 'Heart-Healthy',
    color: 'rose',
    description: 'Vascular-protective meals rich in potassium, magnesium, and healthy polyphenols following DASH principles.',
    clinicalRationale: 'Abundant in potassium-rich legumes and allium aromatics (garlic, onion) while keeping saturated fats low (≤ 18g). Supports nitric oxide bioavailability and arterial endothelial relaxation.',
    idealMaxFat: 20,
    beneficialIngredients: ['garlic', 'olive oil', 'tomatoes', 'basil', 'white beans', 'lemon', 'spinach'],
    triggerIngredients: ['cured bacon', 'salted pork', 'high sodium brines'],
  },
  gerd: {
    id: 'gerd',
    label: 'GERD & Acid Reflux Relief',
    badge: 'Reflux-Safe',
    color: 'amber',
    description: 'Gentle, low-acidity meals crafted to avoid relaxation of the lower esophageal sphincter (LES).',
    clinicalRationale: 'Eliminates aggressive chili capsaicin, deep-fried coatings, and high-concentration citrus acids to protect the esophageal mucosa and prevent bile/acid regurgitation.',
    beneficialIngredients: ['white beans', 'chickpeas', 'pasta', 'chicken breast', 'basil', 'olive oil', 'oats'],
    triggerIngredients: ['cayenne', 'chili pepper', 'jalapeno', 'deep fried', 'raw onion in excess'],
  },
  celiac: {
    id: 'celiac',
    label: 'Celiac & Gluten-Free',
    badge: 'Gluten-Safe',
    color: 'sky',
    description: '100% wheat- and gluten-free wholesome dishes safe for celiac sprue and severe gluten sensitivity.',
    clinicalRationale: 'Zero gliadin and glutenin prolamins ensures mucosal immune protection, preventing intestinal villous blunting and systemic inflammation in celiac individuals.',
    beneficialIngredients: ['chickpeas', 'white beans', 'chicken', 'olive oil', 'lemon', 'avocado', 'rice', 'quinoa'],
    triggerIngredients: ['semolina', 'wheat flour', 'barley', 'rye', 'durum'],
  },
};

export type HealthEvaluation = {
  conditionId: HealthConditionId;
  label: string;
  badge: string;
  color: string;
  isMatch: boolean;
  score: number; // 0 to 100 suitability score
  clinicalNote: string;
  highlights: string[];
};

/**
 * Clinically evaluates a recipe across chronic health profiles
 */
export function evaluateRecipeHealthConditions(recipe: Recipe): HealthEvaluation[] {
  const fiber = recipe.fiber ?? (recipe.ingredients.some(i => i.name.toLowerCase().includes('bean') || i.name.toLowerCase().includes('chickpea')) ? 8 : 3);
  const netCarbs = Math.max(0, recipe.carbs - fiber);
  const ingNames = recipe.ingredients.map(i => i.name.toLowerCase());
  const titleLower = recipe.title.toLowerCase();

  return (Object.keys(HEALTH_CONDITIONS) as HealthConditionId[]).map(condId => {
    const rule = HEALTH_CONDITIONS[condId];
    let isMatch = true;
    let score = 70;
    const highlights: string[] = [];

    // Check triggers
    const hasTrigger = rule.triggerIngredients.some(t =>
      ingNames.some(ing => ing.includes(t)) || titleLower.includes(t)
    );

    if (hasTrigger) {
      isMatch = false;
      score = Math.max(20, score - 50);
    }

    // Condition-specific clinical algorithms
    if (condId === 'diabetes') {
      if (netCarbs <= (rule.idealMaxNetCarbs || 45)) {
        score += 15;
        highlights.push(`Low Net Carbs (${netCarbs}g)`);
      } else {
        score -= 20;
      }
      if (fiber >= (rule.idealMinFiber || 4)) {
        score += 15;
        highlights.push(`High Soluble Fiber (${fiber}g)`);
      }
      if (hasTrigger) isMatch = false;
      else if (score >= 65) isMatch = true;
    } else if (condId === 'pcos') {
      if (recipe.protein >= (rule.idealMinProtein || 14)) {
        score += 15;
        highlights.push(`Satisfying Protein (${recipe.protein}g)`);
      }
      if (ingNames.some(i => i.includes('olive oil') || i.includes('avocado') || i.includes('tahini'))) {
        score += 15;
        highlights.push('Anti-inflammatory healthy lipids');
      }
      if (hasTrigger) isMatch = false;
      else if (score >= 70) isMatch = true;
    } else if (condId === 'hypertension') {
      if (recipe.fat <= (rule.idealMaxFat || 20)) {
        score += 15;
        highlights.push(`Controlled Total Fat (${recipe.fat}g)`);
      }
      if (ingNames.some(i => i.includes('garlic') || i.includes('tomato') || i.includes('basil'))) {
        score += 15;
        highlights.push('Rich in allium and herbal potassium');
      }
      if (hasTrigger) isMatch = false;
      else if (score >= 70) isMatch = true;
    } else if (condId === 'gerd') {
      // Check spicy/heavy citrus
      const hasCitrus = ingNames.some(i => i.includes('lemon') && recipe.ingredients.find(ing => ing.name.toLowerCase().includes('lemon'))?.quantity! > 1);
      const isSpicy = ingNames.some(i => i.includes('chili') || i.includes('pepper') || i.includes('cayenne'));
      if (isSpicy || hasCitrus) {
        score -= 30;
        isMatch = false;
      } else {
        score += 20;
        highlights.push('Non-acidic & digestive soothing');
        isMatch = true;
      }
    } else if (condId === 'celiac') {
      const isGlutenDiet = recipe.diet === 'Gluten-free';
      const hasWheat = ingNames.some(i => i.includes('artisan pasta') || i.includes('wheat') || i.includes('flour') || i.includes('semolina'));
      if (isGlutenDiet || !hasWheat) {
        score = 95;
        highlights.push('Naturally 100% Gluten-Free');
        isMatch = true;
      } else {
        score = 15;
        isMatch = false;
      }
    }

    return {
      conditionId: condId,
      label: rule.label,
      badge: rule.badge,
      color: rule.color,
      isMatch,
      score: Math.min(100, Math.max(0, score)),
      clinicalNote: rule.clinicalRationale,
      highlights,
    };
  });
}

/**
 * -------------------------------------------------------------
 * INGREDIENT SUBSTITUTION SWAPPER CATALOG
 * Provides real-time macro delta calculations
 * -------------------------------------------------------------
 */

export type IngredientSubstitution = {
  originalIngredient: string;
  substituteName: string;
  conversionRatio: number; // e.g. 1.0 means 1:1 replacement
  targetUnit: string;
  calorieDelta: number; // per serving estimate
  proteinDelta: number;
  carbsDelta: number;
  fatDelta: number;
  fiberDelta: number;
  healthBenefit: string;
  suitableForConditions: HealthConditionId[];
};

export const ingredientSubstitutions: IngredientSubstitution[] = [
  {
    originalIngredient: 'Artisan Pasta',
    substituteName: 'Chickpea & Lentil Rotini',
    conversionRatio: 1.0,
    targetUnit: 'g',
    calorieDelta: -25,
    proteinDelta: +7,
    carbsDelta: -14,
    fatDelta: +0.5,
    fiberDelta: +6,
    healthBenefit: 'Boosts plant protein and lowers glycemic impact for blood sugar stability',
    suitableForConditions: ['diabetes', 'celiac', 'pcos'],
  },
  {
    originalIngredient: 'Artisan Pasta',
    substituteName: 'Spiralized Zucchini Ribbons',
    conversionRatio: 1.5,
    targetUnit: 'g',
    calorieDelta: -120,
    proteinDelta: -6,
    carbsDelta: -32,
    fatDelta: -0.5,
    fiberDelta: +1,
    healthBenefit: 'Cuts 80% of starches and carbs; ideal for ultra-low GI meals',
    suitableForConditions: ['diabetes', 'celiac', 'pcos'],
  },
  {
    originalIngredient: 'Ricotta',
    substituteName: 'Whipped Cottage Cheese',
    conversionRatio: 1.0,
    targetUnit: 'g',
    calorieDelta: -45,
    proteinDelta: +6,
    carbsDelta: +0.5,
    fatDelta: -7,
    fiberDelta: 0,
    healthBenefit: 'Reduces saturated fat by 50% while doubling lean casein protein',
    suitableForConditions: ['diabetes', 'pcos', 'hypertension'],
  },
  {
    originalIngredient: 'Ricotta',
    substituteName: 'Silken Tofu & Nutritional Yeast',
    conversionRatio: 1.0,
    targetUnit: 'g',
    calorieDelta: -55,
    proteinDelta: +3,
    carbsDelta: -1,
    fatDelta: -8,
    fiberDelta: +1.5,
    healthBenefit: 'Zero cholesterol plant-based alternative rich in isoflavones',
    suitableForConditions: ['hypertension', 'pcos', 'gerd'],
  },
  {
    originalIngredient: 'Extra Virgin Olive Oil',
    substituteName: 'Cold-Pressed Avocado Oil',
    conversionRatio: 1.0,
    targetUnit: 'tbsp',
    calorieDelta: 0,
    proteinDelta: 0,
    carbsDelta: 0,
    fatDelta: 0,
    fiberDelta: 0,
    healthBenefit: 'Higher smoke point (270°C) with identical heart-healthy oleic acid content',
    suitableForConditions: ['hypertension', 'pcos', 'gerd'],
  },
  {
    originalIngredient: 'Lemon',
    substituteName: 'Mild Golden Apple Cider & Sumac',
    conversionRatio: 0.5,
    targetUnit: 'tbsp',
    calorieDelta: -5,
    proteinDelta: 0,
    carbsDelta: -1,
    fatDelta: 0,
    fiberDelta: 0,
    healthBenefit: 'Mild enzymatic tang without harsh citric burn for sensitive stomachs',
    suitableForConditions: ['gerd'],
  },
  {
    originalIngredient: 'Chicken Breast',
    substituteName: 'Firm Organic Tempeh Cutlets',
    conversionRatio: 1.0,
    targetUnit: 'g',
    calorieDelta: +20,
    proteinDelta: -2,
    carbsDelta: +4,
    fatDelta: +4,
    fiberDelta: +5,
    healthBenefit: 'Fermented whole soy supporting gut microbiome diversity and vascular health',
    suitableForConditions: ['hypertension', 'pcos', 'diabetes'],
  },
];

/**
 * -------------------------------------------------------------
 * PANTRY SHELF-LIFE & FRESHNESS RADAR
 * -------------------------------------------------------------
 */

export function getIngredientShelfLifeDays(ingredientName: string): number {
  const lower = ingredientName.toLowerCase();
  if (lower.includes('basil') || lower.includes('herb') || lower.includes('cilantro') || lower.includes('mint')) return 4;
  if (lower.includes('chicken') || lower.includes('poultry') || lower.includes('fish') || lower.includes('meat')) return 3;
  if (lower.includes('ricotta') || lower.includes('cottage') || lower.includes('dairy') || lower.includes('milk') || lower.includes('cheese')) return 5;
  if (lower.includes('avocado')) return 4;
  if (lower.includes('tomato')) return 7;
  if (lower.includes('lemon') || lower.includes('lime') || lower.includes('citrus')) return 14;
  if (lower.includes('garlic') || lower.includes('onion') || lower.includes('shallot')) return 30;
  if (lower.includes('greens') || lower.includes('salad') || lower.includes('kale') || lower.includes('spinach')) return 5;
  if (lower.includes('pasta') || lower.includes('rice') || lower.includes('grain')) return 365;
  if (lower.includes('oil') || lower.includes('vinegar')) return 180;
  if (lower.includes('chickpea') || lower.includes('bean') || lower.includes('lentil')) return 365;
  return 30;
}

export type PantryFreshnessItem = {
  name: string;
  dateAdded: string;
  shelfLifeDays: number;
  daysRemaining: number;
  status: 'fresh' | 'use-soon' | 'expiring';
  storageTip: string;
};

export function evaluatePantryFreshness(
  pantryItems: string[],
  stockDates?: Record<string, string>
): PantryFreshnessItem[] {
  const now = new Date().getTime();
  const dates = stockDates || {};

  return pantryItems.map(name => {
    // If not recorded, assign a deterministic synthetic date within its valid window
    let dateAddedStr = dates[name];
    if (!dateAddedStr) {
      // Default: added 1.5 days ago for realistic demo freshness tracking
      const simulatedTime = now - (1.5 * 24 * 60 * 60 * 1000);
      dateAddedStr = new Date(simulatedTime).toISOString();
    }

    const dateAdded = new Date(dateAddedStr).getTime();
    const shelfLife = getIngredientShelfLifeDays(name);
    const elapsedDays = Math.max(0, Math.floor((now - dateAdded) / (1000 * 60 * 60 * 24)));
    const daysRemaining = shelfLife - elapsedDays;

    let status: 'fresh' | 'use-soon' | 'expiring' = 'fresh';
    if (daysRemaining <= 1) {
      status = 'expiring';
    } else if (daysRemaining <= 3) {
      status = 'use-soon';
    }

    const master = masterIngredients.find(m => m.name.toLowerCase() === name.toLowerCase());
    const storageTip = master?.storage || 'Keep in a cool dry pantry or refrigerate after opening.';

    return {
      name,
      dateAdded: dateAddedStr,
      shelfLifeDays: shelfLife,
      daysRemaining: Math.max(0, daysRemaining),
      status,
      storageTip,
    };
  });
}

/**
 * Transparent Relational Recommendation Scorer with Health Intelligence
 * Combines:
 * - Cuisine Affinity (25%)
 * - Dietary Match (25%)
 * - Clinical Health Condition Alignment (25%)
 * - Cooking Time Compatibility (10%)
 * - Rating Weight (15%)
 */
export function calculateRecommendationScore(recipe: Recipe, user: UserProfile): {
  score: number;
  reasons: string[];
  healthEvaluations?: HealthEvaluation[];
} {
  let score = 0;
  const reasons: string[] = [];

  // 1. Dietary restrictions: MUST NOT conflict with dislikes
  const containsDisliked = user.dislikedIngredients.some(d =>
    recipe.ingredients.some(i => i.name.toLowerCase().includes(d.toLowerCase()))
  );
  if (containsDisliked) {
    return { score: 10, reasons: ['Contains an ingredient you prefer to avoid'] };
  }

  // Dietary preference match
  if (user.dietaryPreferences.includes(recipe.diet)) {
    score += 25;
    reasons.push(`Matches your ${recipe.diet} preference`);
  }

  // 2. Cuisine preference
  if (user.favoriteCuisines.includes(recipe.cuisine)) {
    score += 25;
    reasons.push(`Favorite ${recipe.cuisine} cuisine`);
  }

  // 3. Time affinity
  if (recipe.time <= user.targetCookTime) {
    score += 10;
    reasons.push(`Ready in under ${user.targetCookTime} mins`);
  }

  // 4. Rating contribution
  const numRating = parseFloat(recipe.rating) || 4.5;
  score += Math.round((numRating / 5) * 15);

  // 5. Clinical Health & Metabolic Condition Scoring
  const healthEvals = evaluateRecipeHealthConditions(recipe);
  const userConditions = user.healthConditions || [];

  if (userConditions.length > 0) {
    let healthBonus = 0;
    userConditions.forEach(cond => {
      const match = healthEvals.find(h =>
        h.conditionId.toLowerCase().includes(cond.toLowerCase()) ||
        cond.toLowerCase().includes(h.conditionId.toLowerCase()) ||
        h.label.toLowerCase().includes(cond.toLowerCase()) ||
        cond.toLowerCase().includes(h.label.toLowerCase())
      );
      if (match && match.isMatch) {
        healthBonus += 20;
        reasons.push(`${match.badge}: ${match.highlights[0] || match.label}`);
      }
    });
    score += Math.min(25, healthBonus);
  } else {
    // If user has no specific conditions, default general health score
    score += 15;
  }

  return { score: Math.min(score, 100), reasons, healthEvaluations: healthEvals };
}

// Backward compatibility alias for glossary
export const glossary = masterIngredients;

/**
 * -------------------------------------------------------------
 * CULINARY COST & BUDGET ESTIMATOR ENGINE
 * Standard market ingredient pricing for domestic kitchen economics
 * -------------------------------------------------------------
 */

export interface IngredientCostRule {
  namePattern: string;
  costPerUnit: number; // in USD
  unit: string;
}

export const INGREDIENT_COST_DATABASE: IngredientCostRule[] = [
  { namePattern: 'pasta', costPerUnit: 0.005, unit: 'g' }, // $1.00 per 200g
  { namePattern: 'ricotta', costPerUnit: 0.015, unit: 'g' }, // $2.25 per 150g
  { namePattern: 'olive oil', costPerUnit: 0.20, unit: 'tbsp' },
  { namePattern: 'lemon', costPerUnit: 0.75, unit: 'whole' },
  { namePattern: 'basil', costPerUnit: 1.50, unit: 'cup' },
  { namePattern: 'chickpea', costPerUnit: 0.0035, unit: 'g' }, // $1.40 can
  { namePattern: 'tomato', costPerUnit: 0.004, unit: 'g' },
  { namePattern: 'garlic', costPerUnit: 0.15, unit: 'clove' },
  { namePattern: 'chicken', costPerUnit: 0.012, unit: 'g' }, // $8.40 per 700g
  { namePattern: 'potato', costPerUnit: 0.003, unit: 'g' },
  { namePattern: 'egg', costPerUnit: 0.30, unit: 'whole' },
  { namePattern: 'milk', costPerUnit: 0.002, unit: 'ml' },
  { namePattern: 'flour', costPerUnit: 0.002, unit: 'g' },
  { namePattern: 'butter', costPerUnit: 0.012, unit: 'g' },
  { namePattern: 'blueberry', costPerUnit: 0.018, unit: 'g' },
  { namePattern: 'yogurt', costPerUnit: 0.008, unit: 'g' },
  { namePattern: 'avocado', costPerUnit: 1.25, unit: 'whole' },
  { namePattern: 'tahini', costPerUnit: 0.35, unit: 'tbsp' },
  { namePattern: 'rosemary', costPerUnit: 0.50, unit: 'sprig' },
];

export interface RecipeCostBreakdown {
  totalCost: number;
  costPerServing: number;
  restaurantEquivalent: number;
  savingsPercentage: number;
  ingredientCosts: { name: string; estimatedCost: number }[];
}

export function calculateRecipeCost(recipe: Recipe): RecipeCostBreakdown {
  let total = 0;
  const ingredientCosts: { name: string; estimatedCost: number }[] = [];

  for (const ing of recipe.ingredients) {
    const lowerName = ing.name.toLowerCase();
    const rule = INGREDIENT_COST_DATABASE.find(r => lowerName.includes(r.namePattern));
    let cost = 0.50; // default baseline per ingredient

    if (rule) {
      if (ing.unit.toLowerCase() === rule.unit.toLowerCase()) {
        cost = rule.costPerUnit * ing.quantity;
      } else if (rule.unit === 'g' && ing.unit.toLowerCase() === 'kg') {
        cost = rule.costPerUnit * (ing.quantity * 1000);
      } else if (rule.unit === 'tbsp' && ing.unit.toLowerCase() === 'tsp') {
        cost = rule.costPerUnit * (ing.quantity / 3);
      } else if (rule.unit === 'cup' && ing.unit.toLowerCase() === 'tbsp') {
        cost = rule.costPerUnit * (ing.quantity / 16);
      } else {
        cost = rule.costPerUnit * ing.quantity;
      }
    }

    cost = Math.max(0.10, Math.round(cost * 100) / 100);
    total += cost;
    ingredientCosts.push({ name: ing.name, estimatedCost: cost });
  }

  const servings = Math.max(1, recipe.servings);
  const costPerServing = Math.round((total / servings) * 100) / 100;
  // Average restaurant takeout for similar meal is roughly $14 - $18 per serving
  const restaurantEquivalent = Math.round(servings * 16.50 * 100) / 100;
  const savingsPercentage = Math.round(((restaurantEquivalent - total) / restaurantEquivalent) * 100);

  return {
    totalCost: Math.round(total * 100) / 100,
    costPerServing,
    restaurantEquivalent,
    savingsPercentage: Math.max(0, savingsPercentage),
    ingredientCosts,
  };
}

/**
 * -------------------------------------------------------------
 * SMART RECIPE TEXT PARSER & UNSTRUCTURED EXTRACTOR
 * Normalizes handwritten cards, messy web pastes, and raw notes
 * -------------------------------------------------------------
 */

export interface ParsedRecipeDraft {
  title: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  category: Recipe['category'];
  cuisine: Recipe['cuisine'];
  diet: Recipe['diet'];
  ingredients: { name: string; quantity: number; unit: string; preparationState?: string }[];
  steps: { stepNumber: number; instruction: string; durationMinutes?: number }[];
}

export function parseRawRecipeText(raw: string): ParsedRecipeDraft {
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let title = "Handwritten Kitchen Recipe";
  let description = "Saved recipe transcribed and structured into RecipeVault.";
  let servings = 4;
  let prepTime = 15;
  let cookTime = 25;
  let category: Recipe['category'] = "Dinner";
  let cuisine: Recipe['cuisine'] = "Italian";
  let diet: Recipe['diet'] = "Balanced";

  const ingredients: { name: string; quantity: number; unit: string; preparationState?: string }[] = [];
  const steps: { stepNumber: number; instruction: string; durationMinutes?: number }[] = [];

  let mode: 'meta' | 'ingredients' | 'steps' = 'meta';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    // Section transitions
    if (/^(ingredients?|what you need|shopping list):?$/i.test(line)) {
      mode = 'ingredients';
      continue;
    }
    if (/^(instructions?|directions?|method|steps?|preparation):?$/i.test(line)) {
      mode = 'steps';
      continue;
    }

    if (mode === 'meta') {
      if (i === 0 && !line.includes(':')) {
        title = line.replace(/^[#\s*]+/, '').trim();
      } else if (lower.includes('serving')) {
        const m = line.match(/\d+/);
        if (m) servings = parseInt(m[0], 10);
      } else if (lower.includes('prep')) {
        const m = line.match(/\d+/);
        if (m) prepTime = parseInt(m[0], 10);
      } else if (lower.includes('cook')) {
        const m = line.match(/\d+/);
        if (m) cookTime = parseInt(m[0], 10);
      } else if (lower.includes('italian')) {
        cuisine = "Italian";
      } else if (lower.includes('mediterranean')) {
        cuisine = "Mediterranean";
      } else if (lower.includes('breakfast')) {
        category = "Breakfast";
      } else if (lower.includes('lunch')) {
        category = "Lunch";
      } else if (lower.includes('dessert')) {
        category = "Desserts";
      } else if (lower.includes('vegan')) {
        diet = "Vegan";
      } else if (lower.includes('vegetarian')) {
        diet = "Vegetarian";
      } else if (i === 1 && !line.includes(':')) {
        description = line;
      }
    } else if (mode === 'ingredients') {
      // Clean bullet points or list markers (e.g. "* ", "- ", "1. ")
      const clean = line.replace(/^(\d+[.)\-:]\s*|[-*•]\s*)/, '').trim();
      if (!clean) continue;

      // Extract quantity, unit, name
      const match = clean.match(/^([\d/.\s]+)?\s*(tbsp|tsp|tablespoons?|teaspoons?|g|kg|ml|l|cups?|oz|pounds?|lbs?|cloves?|slices?|cans?|pinches?|pinch|heads?|stalks?|bunch|whole)?\s+(.+)$/i);

      if (match) {
        const rawQty = match[1]?.trim() || "1";
        let quantity = 1;
        if (rawQty.includes('/')) {
          const [num, den] = rawQty.split('/');
          quantity = (parseFloat(num) || 1) / (parseFloat(den) || 1);
        } else {
          quantity = parseFloat(rawQty) || 1;
        }

        const unit = match[2]?.trim() || "unit";
        let nameAndPrep = match[3]?.trim() || clean;
        let prepState = "";

        if (nameAndPrep.includes(',')) {
          const parts = nameAndPrep.split(',');
          nameAndPrep = parts[0].trim();
          prepState = parts.slice(1).join(',').trim();
        }

        ingredients.push({
          name: nameAndPrep,
          quantity: Math.round(quantity * 100) / 100,
          unit,
          preparationState: prepState || undefined,
        });
      } else {
        ingredients.push({
          name: clean,
          quantity: 1,
          unit: "unit",
        });
      }
    } else if (mode === 'steps') {
      const clean = line.replace(/^(\d+[.)\-:]\s*|[-*•]\s*)/, '').trim();
      if (!clean) continue;

      const timeMatch = clean.match(/(\d+)\s*(?:minutes?|mins?)/i);
      const durationMinutes = timeMatch ? parseInt(timeMatch[1], 10) : undefined;

      steps.push({
        stepNumber: steps.length + 1,
        instruction: clean,
        durationMinutes,
      });
    }
  }

  // Fallbacks if user didn't write explicit headings
  if (ingredients.length === 0 && steps.length === 0) {
    ingredients.push({ name: "Handpicked Seasonal Ingredient", quantity: 1, unit: "unit" });
    steps.push({ stepNumber: 1, instruction: raw.trim() });
  }

  return {
    title,
    description,
    servings,
    prepTime,
    cookTime,
    category,
    cuisine,
    diet,
    ingredients,
    steps: steps.length > 0 ? steps : [{ stepNumber: 1, instruction: "Prepare ingredients and cook according to method." }],
  };
}