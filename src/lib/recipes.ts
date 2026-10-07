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

export type IngredientMaster = {
  id: string;
  name: string;
  aliases: string;
  category: 'Produce' | 'Dairy & Eggs' | 'Grains & Pasta' | 'Legumes' | 'Pantry & Spices' | 'Proteins' | 'Baking' | 'Condiments';
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
};

export type RecipeIngredient = {
  ingredientId?: string;
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
  {
    id: 'ing-ricotta',
    name: 'Ricotta',
    aliases: 'Italian whey cheese · Ricotta fresca',
    category: 'Dairy & Eggs',
    flavor: 'Mild, silky, subtly sweet and lactic',
    substitute: 'Whipped whole milk cottage cheese or silken tofu with a pinch of nutritional yeast',
    storage: 'Keep refrigerated at 2-4°C in its whey; consume within 3-5 days of opening.',
    commonUses: 'Filled pastas (ravioli, cannelloni), delicate cheesecakes, fluffy lemon pancakes.',
    caloriesPer100g: 174,
    proteinPer100g: 11.3,
    carbsPer100g: 3.0,
    fatPer100g: 13.0,
    fiberPer100g: 0,
    isUncommon: false,
  },
  {
    id: 'ing-chickpeas',
    name: 'Chickpeas',
    aliases: 'Garbanzo beans · Kabuli chana · Ceci',
    category: 'Legumes',
    flavor: 'Nutty, buttery, earthy with firm bite',
    substitute: 'Cannellini beans, navy beans, or cooked green lentils',
    storage: 'Store dried chickpeas indefinitely in an airtight jar. Refrigerate cooked beans in cooking liquid for 4 days.',
    commonUses: 'Silky hummus, crisp oven snacks, hearty Mediterranean harvest salads and curries.',
    caloriesPer100g: 164,
    proteinPer100g: 8.9,
    carbsPer100g: 27.4,
    fatPer100g: 2.6,
    fiberPer100g: 7.6,
  },
  {
    id: 'ing-basil',
    name: 'Fresh Basil',
    aliases: 'Sweet Genovese basil · Ocimum basilicum',
    category: 'Produce',
    flavor: 'Peppery, sweet, with warm notes of clove and anise',
    substitute: 'Fresh Italian flat-leaf parsley blended with a hint of fresh mint',
    storage: 'Treat like fresh flowers: trim stems and stand in a glass of water on the counter at room temp. Avoid refrigerating which turns leaves black.',
    commonUses: 'Pesto alla Genovese, Caprese salads, tomato sauces, finishing herb for pasta.',
    caloriesPer100g: 23,
    proteinPer100g: 3.2,
    carbsPer100g: 2.7,
    fatPer100g: 0.6,
    fiberPer100g: 1.6,
  },
  {
    id: 'ing-tahini',
    name: 'Tahini',
    aliases: 'Sesame paste · Tahina · Rashi',
    category: 'Condiments',
    flavor: 'Deeply toasted, nutty, rich with a pleasing bitter edge',
    substitute: 'Unsweetened sunflower seed butter, cashew butter, or Chinese sesame paste',
    storage: 'Store unopened at room temp in a cool cupboard; once opened, refrigerate and stir oil back in.',
    commonUses: 'Hummus, lemon-garlic salad dressings, halva, drizzled over roasted cauliflower.',
    caloriesPer100g: 595,
    proteinPer100g: 17.0,
    carbsPer100g: 21.2,
    fatPer100g: 53.8,
    fiberPer100g: 9.3,
    isUncommon: true,
  },
  {
    id: 'ing-tomatoes',
    name: 'Tomatoes',
    aliases: 'Roma plum tomatoes · San Marzano · Heirloom',
    category: 'Produce',
    flavor: 'Juicy, bright acidity balanced by natural umami and sweetness',
    substitute: 'Whole canned San Marzano tomatoes or roasted red bell peppers for sweetness',
    storage: 'Always store at room temperature stem-down to preserve aromatics. Refrigeration dulls flavor enzymes.',
    commonUses: 'Slow-roasted soups, marinara sauce, gazpacho, raw salads.',
    caloriesPer100g: 18,
    proteinPer100g: 0.9,
    carbsPer100g: 3.9,
    fatPer100g: 0.2,
    fiberPer100g: 1.2,
  },
  {
    id: 'ing-garlic',
    name: 'Garlic',
    aliases: 'Allium sativum · Purple stripe garlic',
    category: 'Produce',
    flavor: 'Pungent and spicy when raw; mellow, sweet and nutty when roasted',
    substitute: 'Shallots, garlic scapes, or a pinch of asafoetida (hing) in hot oil',
    storage: 'Keep in an open basket in a cool, dry, dark pantry with good airflow. Never in plastic.',
    commonUses: 'Foundational aromatic for sautéing, dressings, roasting whole in foil with thyme.',
    caloriesPer100g: 149,
    proteinPer100g: 6.4,
    carbsPer100g: 33.1,
    fatPer100g: 0.5,
    fiberPer100g: 2.1,
  },
  {
    id: 'ing-olive-oil',
    name: 'Extra Virgin Olive Oil',
    aliases: 'EVOO · Cold-pressed olive oil',
    category: 'Pantry & Spices',
    flavor: 'Fruity, grassy, peppery finish from polyphenol antioxidants',
    substitute: 'Cold-pressed avocado oil or mild unrefined walnut oil',
    storage: 'Keep in dark glass or tin away from stove heat, daylight and oxygen.',
    commonUses: 'Finishing warm pastas, salad vinaigrettes, confit garlic, dipping rustic bread.',
    caloriesPer100g: 884,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatPer100g: 100,
    fiberPer100g: 0,
  },
  {
    id: 'ing-lemon',
    name: 'Lemon',
    aliases: 'Citrus limon · Eureka · Meyer lemon',
    category: 'Produce',
    flavor: 'Sharp citric acidity; fragrant aromatic essential oils in the zest',
    substitute: 'Lime juice for acidity, or white wine vinegar; sumac for dry tang',
    storage: 'Keep at room temp for up to 1 week, or in crisper drawer for up to 3 weeks.',
    commonUses: 'Salad dressings, balancing creamy sauces, brightening roasted poultry, baking.',
    caloriesPer100g: 29,
    proteinPer100g: 1.1,
    carbsPer100g: 9.3,
    fatPer100g: 0.3,
    fiberPer100g: 2.8,
  },
  {
    id: 'ing-pasta',
    name: 'Artisan Pasta',
    aliases: 'Bronze-cut semolina pasta · Penne / Rigatoni',
    category: 'Grains & Pasta',
    flavor: 'Clean, wheaty, comforting starch with pleasant toothsome chew',
    substitute: 'Gluten-free brown rice pasta, soba noodles, or zucchini ribbons',
    storage: 'Cool, dry pantry in sealed airtight container.',
    commonUses: 'Pasta dishes, cold pasta salads, minestrone soup additions.',
    caloriesPer100g: 371,
    proteinPer100g: 13.0,
    carbsPer100g: 74.0,
    fatPer100g: 1.5,
    fiberPer100g: 3.2,
  },
  {
    id: 'ing-chicken',
    name: 'Chicken Breast',
    aliases: 'Free-range poultry breast · Pollo',
    category: 'Proteins',
    flavor: 'Mild, lean, receptive to herb marinades and roasting caramelization',
    substitute: 'Firm tofu steaks, tempeh, or turkey tenderloin',
    storage: 'Keep in the coldest back shelf of the fridge (0-2°C) for up to 2 days or freeze.',
    commonUses: 'Roasts, skillet sautés, grain bowls, nourishing chicken broths.',
    caloriesPer100g: 165,
    proteinPer100g: 31.0,
    carbsPer100g: 0,
    fatPer100g: 3.6,
    fiberPer100g: 0,
  },
  {
    id: 'ing-blueberries',
    name: 'Fresh Blueberries',
    aliases: 'Wild berries · Vaccinium corymbosum',
    category: 'Produce',
    flavor: 'Sweet-tart, floral, bursting juice with rich anthocyanins',
    substitute: 'Blackberries, raspberries, or sliced strawberries',
    storage: 'Keep dry in breathable container in fridge; wash only immediately before eating.',
    commonUses: 'Pancake folding, breakfast parfaits, fruit compotes, rustic galettes.',
    caloriesPer100g: 57,
    proteinPer100g: 0.7,
    carbsPer100g: 14.5,
    fatPer100g: 0.3,
    fiberPer100g: 2.4,
  },
  {
    id: 'ing-potatoes',
    name: 'Yukon Gold Potatoes',
    aliases: 'Yellow butter potatoes · Solanum tuberosum',
    category: 'Produce',
    flavor: 'Naturally buttery, creamy interior that crisps golden upon roasting',
    substitute: 'Red creamer potatoes, fingerlings, or sweet potatoes',
    storage: 'Cool, well-ventilated dark pantry (7-10°C). Keep away from onions to prevent sprouting.',
    commonUses: 'Crispy roasted wedges, silky mash, potato leek soup.',
    caloriesPer100g: 77,
    proteinPer100g: 2.0,
    carbsPer100g: 17.5,
    fatPer100g: 0.1,
    fiberPer100g: 2.2,
  },
];

// -------------------------------------------------------------
// CORE RECIPE REPOSITORY (Structured Relational Entries)
// -------------------------------------------------------------

export const recipes: Recipe[] = [
  {
    id: 'lemon-ricotta-pasta',
    title: 'Lemon & Ricotta Pasta',
    description: 'A little sunshine in a bowl. Creamy fresh ricotta, bright lemon zest, and fragrant hand-torn basil come together in this effortless weeknight favorite.',
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
    id: 'roasted-tomato-soup',
    title: 'Slow-Roasted Tomato & Garlic Soup',
    description: 'A comforting, velvety bowl made from plum tomatoes roasted with whole garlic bulbs and simmered with garden basil and a swirl of cream.',
    image: soup,
    category: 'Dinner',
    cuisine: 'Italian',
    diet: 'Vegetarian',
    difficulty: 'Easy',
    prepTime: 15,
    cookTime: 30,
    time: 45,
    servings: 4,
    rating: '4.9',
    ratingCount: 34,
    calories: 245,
    protein: 6,
    carbs: 28,
    fat: 12,
    fiber: 5,
    source: 'The RecipeVault Kitchen',
    visibility: 'Public',
    status: 'Published',
    createdBy: 'user-eric',
    createdAt: '2026-08-01T09:15:00Z',
    updatedAt: '2026-09-01T12:00:00Z',
    tags: ['Cozy', 'Autumn', 'Slow Cooked', 'Comfort Food'],
    ingredients: [
      { ingredientId: 'ing-tomatoes', name: 'Tomatoes', quantity: 800, unit: 'g', preparationState: 'halved ripe plum tomatoes' },
      { ingredientId: 'ing-garlic', name: 'Garlic', quantity: 5, unit: 'clove', preparationState: 'unpeeled in skins' },
      { ingredientId: 'ing-olive-oil', name: 'Extra Virgin Olive Oil', quantity: 2, unit: 'tbsp' },
      { ingredientId: 'ing-basil', name: 'Fresh Basil', quantity: 0.5, unit: 'cup', preparationState: 'packed leaves' },
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'Preheat oven to 200°C (400°F). Arrange halved tomatoes cut-side up on a baking tray with garlic cloves. Drizzle generously with olive oil, salt, and black pepper.',
        durationMinutes: 5,
      },
      {
        stepNumber: 2,
        instruction: 'Roast for 30 minutes until tomatoes are slightly charred at the edges and garlic is caramelized and soft.',
        durationMinutes: 30,
        tip: 'Caramelizing the skins concentrates natural glutamates for profound savoriness without canned paste.',
      },
      {
        stepNumber: 3,
        instruction: 'Squeeze roasted garlic out of their skins into a pot with the roasted tomatoes and any accumulated pan juices. Simmer gently for 5 minutes with 400ml vegetable stock.',
        durationMinutes: 5,
      },
      {
        stepNumber: 4,
        instruction: 'Add fresh basil and blend until silky smooth using an immersion blender. Season to taste and ladle into bowls with a splash of cream and rustic toast.',
        durationMinutes: 5,
      },
    ],
  },
  {
    id: 'blueberry-pancakes',
    title: 'Sunday Blueberry Ricotta Pancakes',
    description: 'Fluffy golden stacks folded with fresh blueberries, a touch of creamy ricotta for tenderness, and warm maple syrup. Perfect for slow mornings.',
    image: pancakes,
    category: 'Breakfast',
    cuisine: 'American',
    diet: 'Vegetarian',
    difficulty: 'Easy',
    prepTime: 10,
    cookTime: 12,
    time: 22,
    servings: 4,
    rating: '4.7',
    ratingCount: 16,
    calories: 320,
    protein: 9,
    carbs: 51,
    fat: 10,
    fiber: 3,
    source: 'Sunday Family Recipe Book',
    visibility: 'Public',
    status: 'Published',
    createdBy: 'user-eric',
    createdAt: '2026-08-10T08:00:00Z',
    updatedAt: '2026-08-10T08:00:00Z',
    tags: ['Brunch', 'Family Favorite', 'Weekend', 'Sweet'],
    ingredients: [
      { ingredientId: 'ing-blueberries', name: 'Fresh Blueberries', quantity: 150, unit: 'g', preparationState: 'plump and fresh' },
      { ingredientId: 'ing-ricotta', name: 'Ricotta', quantity: 100, unit: 'g', preparationState: 'lightly drained' },
      { ingredientId: 'ing-lemon', name: 'Lemon', quantity: 1, unit: 'whole', preparationState: 'zest only' },
      { ingredientId: 'ing-olive-oil', name: 'Extra Virgin Olive Oil', quantity: 1, unit: 'tbsp', preparationState: 'for griddling' },
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'In a bowl, whisk dry ingredients: 200g flour, 2 tsp baking powder, 2 tbsp sugar, and a pinch of salt.',
        durationMinutes: 3,
      },
      {
        stepNumber: 2,
        instruction: 'In another bowl, whisk together 200ml milk, 2 eggs, ricotta cheese, and grated lemon zest until just combined.',
        durationMinutes: 3,
      },
      {
        stepNumber: 3,
        instruction: 'Gently fold wet into dry ingredients with a spatula until just incorporated. Do not overmix — small lumps create airy pancakes. Fold in blueberries.',
        durationMinutes: 2,
        tip: 'Overmixing develops gluten and turns pancakes tough; gentle folding keeps them cloud-like.',
      },
      {
        stepNumber: 4,
        instruction: 'Heat a lightly oiled skillet over medium-low heat. Ladle 1/4 cup batter per pancake. Cook for 2–3 minutes until bubbles appear on the surface, flip, and cook 1–2 minutes more until golden.',
        durationMinutes: 10,
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
    id: 'rev-4',
    recipeId: 'roasted-tomato-soup',
    userId: 'user-neeraj',
    userName: 'Neeraj K',
    userAvatar: 'N',
    rating: 5,
    comment: 'Roasted the garlic in whole cloves as instructed — unbelievably deep, rich flavor. Paired with grilled sourdough.',
    createdAt: '2026-09-05T20:00:00Z',
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
 * Transparent Relational Recommendation Scorer
 * Combines:
 * - Cuisine Affinity (35%)
 * - Dietary Match (30%)
 * - Cooking Time Compatibility (15%)
 * - Rating Weight (20%)
 */
export function calculateRecommendationScore(recipe: Recipe, user: UserProfile): {
  score: number;
  reasons: string[];
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
    score += 30;
    reasons.push(`Matches your ${recipe.diet} preference`);
  }

  // 2. Cuisine preference
  if (user.favoriteCuisines.includes(recipe.cuisine)) {
    score += 35;
    reasons.push(`Favorite ${recipe.cuisine} cuisine`);
  }

  // 3. Time affinity
  if (recipe.time <= user.targetCookTime) {
    score += 15;
    reasons.push(`Ready in under ${user.targetCookTime} mins`);
  }

  // 4. Rating contribution
  const numRating = parseFloat(recipe.rating) || 4.5;
  score += Math.round((numRating / 5) * 20);

  return { score: Math.min(score, 100), reasons };
}

// Backward compatibility alias for glossary
export const glossary = masterIngredients;