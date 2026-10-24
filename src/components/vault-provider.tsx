import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import pasta from "@/assets/lemon-pasta.jpg";
import {
  recipes as initialRecipes,
  masterIngredients,
  findMasterIngredient,
  initialRecipeVersions,
  initialReviews,
  demoUsers,
  type Recipe,
  type IngredientMaster,
  type RecipeVersion,
  type Collection,
  type PlanItem,
  type Review,
  type UserProfile,
} from "@/lib/recipes";
import { toast } from "sonner";

export type ThemeMode = "morning" | "sunset" | "night";

export type VaultNotification = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: "save" | "plan" | "pantry" | "recipe" | "system";
  link?: string;
};

function getDefaultUser(): UserProfile {
  const user = demoUsers[0];
  if (!user) {
    throw new Error("RecipeVault requires at least one demo user.");
  }
  return user;
}

const defaultUser = getDefaultUser();

function reportStorageError(error: unknown): void {
  if (typeof window !== "undefined") {
    console.warn("RecipeVault browser storage operation failed.", error);
  }
}

type VaultContextType = {
  // Theme Mode
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  // Authentication & Current User
  currentUser: UserProfile;
  allUsers: UserProfile[];
  isAuthenticated: boolean;
  lastVisitedRoute: string | null;
  setLastVisitedRoute: (route: string) => void;
  switchUser: (userId: string) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  registerUser: (
    name: string,
    email: string,
    password?: string,
    extra?: Partial<UserProfile>,
  ) => UserProfile;
  loginUser: (email: string, password?: string) => boolean;
  loginWithGoogle: (mockGoogleProfile?: {
    name: string;
    email: string;
    avatar?: string;
  }) => UserProfile;
  logoutUser: () => void;
  resetPassword: (email: string) => boolean;

  // Recipes & Version Control
  items: Recipe[];
  saved: string[];
  versions: RecipeVersion[];
  toggleSave: (id: string) => void;
  addRecipe: (recipe: Recipe, changeSummary?: string) => void;
  deleteRecipe: (id: string) => void;
  restoreRecipeVersion: (recipeId: string, versionId: string) => void;

  // Master Ingredients & Pantry
  ingredients: IngredientMaster[];
  pantry: string[];
  pantryStockDates: Record<string, string>;
  togglePantryItem: (ingredientName: string) => void;
  addPantryItem: (ingredientName: string) => void;
  removePantryItem: (ingredientName: string) => void;

  // Collections
  collections: Collection[];
  createCollection: (name: string, description?: string) => void;
  addToCollection: (collectionId: string, recipeId: string) => void;
  removeFromCollection: (collectionId: string, recipeId: string) => void;
  deleteCollection: (collectionId: string) => void;

  // Meal Planner
  plan: PlanItem[];
  setMeal: (
    day: number,
    meal: "Breakfast" | "Lunch" | "Dinner" | "Snack",
    recipeId: string,
    customServings?: number,
  ) => void;
  clearMealPlan: () => void;

  // Reviews & Community
  reviews: Review[];
  addReview: (recipeId: string, rating: number, comment: string) => void;

  // Preferences
  preferences: string[];
  togglePreference: (name: string) => void;

  // Notifications & Activity
  notifications: VaultNotification[];
  unreadNotificationsCount: number;
  addNotification: (notification: Omit<VaultNotification, "id" | "timestamp" | "read">) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Undo & Restoration Helpers
  restoreRecipe: (recipe: Recipe) => void;
  restoreMealPlan: (plan: PlanItem[]) => void;

  // Onboarding Journey
  onboardingDismissed: boolean;
  setOnboardingDismissed: (dismissed: boolean) => void;

  // Demo Database Controls
  resetDatabase: () => void;
};

const VaultContext = createContext<VaultContextType | null>(null);

const STORAGE_KEYS = {
  THEME: "rv_theme_mode",
  RECIPES: "rv_recipes_v3",
  SAVED: "rv_saved_v3",
  COLLECTIONS: "rv_collections_v3",
  PLAN: "rv_plan_v3",
  VERSIONS: "rv_versions_v3",
  REVIEWS: "rv_reviews_v3",
  PANTRY: "rv_pantry_v3",
  PANTRY_DATES: "rv_pantry_dates_v3",
  CURRENT_USER_ID: "rv_current_user_v3",
  ALL_USERS: "rv_all_users_v3",
  IS_AUTHENTICATED: "rv_is_authenticated_v3",
  LAST_VISITED_ROUTE: "rv_last_visited_route_v3",
  NOTIFICATIONS: "rv_notifications_v3",
  ONBOARDING_DISMISSED: "rv_onboarding_dismissed_v3",
};

// --- TYPE-SAFE MAPPING HELPERS FOR SUPABASE ---

interface DbRecipeIngredient {
  ingredient_id?: string;
  quantity?: number | string;
  unit?: string;
  preparation_state?: string;
  is_optional?: boolean;
  ingredients?: {
    canonical_name?: string;
  };
}

interface DbRecipeStep {
  step_number: number;
  instruction: string;
  duration_minutes?: number;
  culinary_tip?: string;
}

interface DbRecipeTag {
  tag_name: string;
}

interface DbRecipeRow {
  recipe_id: string;
  title: string;
  description?: string;
  image_url?: string;
  category_id?: string;
  cuisine_id?: string;
  diet_tag?: string;
  difficulty?: string;
  prep_time?: number;
  cook_time?: number;
  total_time?: number;
  servings?: number;
  rating?: number | string;
  ratingCount?: number;
  rating_count?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  source_attribution?: string;
  visibility?: string;
  status?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  recipe_ingredients?: DbRecipeIngredient[];
  recipe_steps?: DbRecipeStep[];
  recipe_tags?: DbRecipeTag[];
  snapshot_data?: {
    steps?: { stepNumber: number; instruction: string }[];
  };
}

const recipeCategories: readonly Recipe["category"][] = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Desserts",
  "Baking",
  "Snacks",
];
const recipeCuisines: readonly Recipe["cuisine"][] = [
  "Italian",
  "Mediterranean",
  "American",
  "Indian",
  "Japanese",
  "Mexican",
  "Other",
];
const recipeDiets: readonly Recipe["diet"][] = [
  "Vegetarian",
  "Vegan",
  "High protein",
  "Gluten-free",
  "Balanced",
];
const recipeDifficulties: readonly Recipe["difficulty"][] = ["Easy", "Medium", "Advanced"];
const recipeVisibilities: readonly Recipe["visibility"][] = ["Public", "Private", "Unlisted"];
const recipeStatuses: readonly Recipe["status"][] = ["Published", "Draft"];

function selectRecipeValue<T extends string>(
  value: string | undefined,
  allowedValues: readonly T[],
  fallback: T,
): T {
  return allowedValues.find((allowedValue) => allowedValue === value) ?? fallback;
}

function mapDbRecipeToAppRecipe(dbRecipe: DbRecipeRow): Recipe {
  const canonical = initialRecipes.find(r => r.id === dbRecipe.recipe_id);
  const resolvedImage =
    dbRecipe.image_url && dbRecipe.image_url.trim().length > 0
      ? dbRecipe.image_url
      : canonical?.image || pasta;

  return {
    id: dbRecipe.recipe_id,
    title: dbRecipe.title,
    description: dbRecipe.description || "",
    image: resolvedImage,
    category: selectRecipeValue(dbRecipe.category_id, recipeCategories, "Dinner"),
    cuisine: selectRecipeValue(dbRecipe.cuisine_id, recipeCuisines, "Italian"),
    diet: selectRecipeValue(dbRecipe.diet_tag, recipeDiets, "Balanced"),
    difficulty: selectRecipeValue(dbRecipe.difficulty, recipeDifficulties, "Easy"),
    prepTime: dbRecipe.prep_time || 10,
    cookTime: dbRecipe.cook_time || 15,
    time: dbRecipe.total_time || (dbRecipe.prep_time || 10) + (dbRecipe.cook_time || 15),
    servings: dbRecipe.servings || 2,
    rating: String(dbRecipe.rating || "5.0"),
    ratingCount: dbRecipe.rating_count || dbRecipe.ratingCount || 0,
    calories: dbRecipe.calories || 0,
    protein: dbRecipe.protein || 0,
    carbs: dbRecipe.carbs || 0,
    fat: dbRecipe.fat || 0,
    fiber: dbRecipe.fiber || 0,
    source: dbRecipe.source_attribution || "RecipeVault Kitchen",
    visibility: selectRecipeValue(dbRecipe.visibility, recipeVisibilities, "Public"),
    status: selectRecipeValue(dbRecipe.status, recipeStatuses, "Published"),
    createdBy: dbRecipe.user_id || "user-eric",
    createdAt: dbRecipe.created_at || new Date().toISOString(),
    updatedAt: dbRecipe.updated_at || new Date().toISOString(),
    tags: [
      dbRecipe.cuisine_id,
      dbRecipe.category_id,
      dbRecipe.diet_tag,
      ...(dbRecipe.recipe_tags || []).map((t) => t.tag_name),
    ].filter((t): t is string => Boolean(t)),
    ingredients:
      dbRecipe.recipe_ingredients && dbRecipe.recipe_ingredients.length > 0
        ? dbRecipe.recipe_ingredients.map((ri) => ({
            ingredientId: ri.ingredient_id || "",
            name: ri.ingredients?.canonical_name || ri.ingredient_id || "Ingredient",
            quantity: Number(ri.quantity || 1),
            unit: ri.unit || "unit",
            preparationState: ri.preparation_state || "",
            isOptional: Boolean(ri.is_optional),
          }))
        : canonical?.ingredients || [],
    steps:
      dbRecipe.recipe_steps && dbRecipe.recipe_steps.length > 0
        ? [...dbRecipe.recipe_steps]
            .sort((a, b) => a.step_number - b.step_number)
            .map((s) => ({
              stepNumber: s.step_number,
              instruction: s.instruction,
              durationMinutes: s.duration_minutes || undefined,
              tip: s.culinary_tip || undefined,
            }))
        : canonical?.steps || dbRecipe.snapshot_data?.steps || [
            { stepNumber: 1, instruction: "Refer to recipe details for directions." },
          ],
  };
}

function mapAppRecipeToDbRow(recipe: Recipe) {
  return {
    recipe_id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    image_url: recipe.image,
    servings: recipe.servings,
    prep_time: recipe.prepTime,
    cook_time: recipe.cookTime,
    difficulty: recipe.difficulty,
    diet_tag: recipe.diet,
    calories: recipe.calories,
    protein: recipe.protein,
    carbs: recipe.carbs,
    fat: recipe.fat,
    fiber: recipe.fiber,
    source_attribution: recipe.source,
    visibility: recipe.visibility,
    status: recipe.status,
    user_id: recipe.createdBy,
    cuisine_id: recipe.cuisine,
    category_id: recipe.category,
    updated_at: new Date().toISOString(),
  };
}

export function VaultProvider({ children }: { children: ReactNode }) {
  const getTimeBasedTheme = (): ThemeMode => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 19) return "sunset";
    return "night";
  };

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "sunset";
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode;
      if (stored === "morning" || stored === "sunset" || stored === "night") {
        return stored;
      }
    } catch (error) {
      reportStorageError(error);
    }
    return getTimeBasedTheme();
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
      if (newTheme === "night") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (error) {
      reportStorageError(error);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "night") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const timer = setInterval(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.THEME);
        if (!stored) {
          const autoTheme = getTimeBasedTheme();
          if (autoTheme !== theme) {
            setThemeState(autoTheme);
          }
        }
      } catch (error) {
        reportStorageError(error);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [theme]);

  // Users state
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (error) {
      reportStorageError(error);
    }
    return demoUsers;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      if (stored && allUsers.some((u) => u.id === stored)) return stored;
    } catch (error) {
      reportStorageError(error);
    }
    return defaultUser.id;
  });

  const currentUser = allUsers.find((user) => user.id === currentUserId) ?? defaultUser;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
      return stored === "true";
    } catch {
      return false;
    }
  });

  const [lastVisitedRoute, setLastVisitedRouteState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_VISITED_ROUTE);
    } catch {
      return null;
    }
  });

  const setLastVisitedRoute = (route: string) => {
    if (!route || route === "/login") return;
    setLastVisitedRouteState(route);
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_VISITED_ROUTE, route);
    } catch (e) {
      console.warn("Storage save error", e);
    }
  };

  // Recipes state
  const [items, setItems] = useState<Recipe[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECIPES);
      if (stored) {
        const parsed: Recipe[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(recipe => {
            const canonical = initialRecipes.find(r => r.id === recipe.id);
            const validImage =
              canonical?.image ||
              (recipe.image && recipe.image.trim().length > 0 ? recipe.image : pasta);
            return {
              ...recipe,
              image: validImage,
            };
          });
        }
      }
    } catch (error) {
      reportStorageError(error);
    }
    return initialRecipes;
  });

  // Saved recipes
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED);
      if (stored) return JSON.parse(stored);
    } catch (error) {
      reportStorageError(error);
    }
    return ["lemon-ricotta-pasta", "roasted-tomato-soup"];
  });

  // Collections
  const [collections, setCollections] = useState<Collection[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
      if (stored) return JSON.parse(stored);
    } catch (error) {
      reportStorageError(error);
    }
    return [
      {
        id: "weeknight",
        name: "Weeknight favorites",
        description: "Quick, comforting meals ready in under 35 minutes.",
        ids: ["lemon-ricotta-pasta", "roasted-tomato-soup", "chickpea-harvest-bowl"],
        createdBy: "user-eric",
        createdAt: "2026-08-15T12:00:00Z",
      },
      {
        id: "slow-mornings",
        name: "Slow mornings & brunch",
        description: "Pancake stacks and comforting breakfasts for relaxed Sundays.",
        ids: ["blueberry-pancakes"],
        createdBy: "user-eric",
        createdAt: "2026-08-20T10:00:00Z",
      },
      {
        id: "high-protein-prep",
        name: "High-protein nourishment",
        description: "Energizing dinners loaded with clean proteins and balanced macros.",
        ids: ["rosemary-roast-chicken", "chickpea-harvest-bowl"],
        createdBy: "user-neeraj",
        createdAt: "2026-08-25T14:00:00Z",
      },
    ];
  });

  // Meal Plan
  const [plan, setPlan] = useState<PlanItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PLAN);
      if (stored) return JSON.parse(stored);
    } catch (error) {
      reportStorageError(error);
    }
    return [
      { id: "p1", day: 0, meal: "Dinner", recipeId: "lemon-ricotta-pasta" },
      { id: "p2", day: 2, meal: "Lunch", recipeId: "chickpea-harvest-bowl" },
      { id: "p3", day: 4, meal: "Dinner", recipeId: "rosemary-roast-chicken" },
      { id: "p4", day: 6, meal: "Breakfast", recipeId: "blueberry-pancakes" },
    ];
  });

  // Recipe Versions
  const [versions, setVersions] = useState<RecipeVersion[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VERSIONS);
      if (stored) return JSON.parse(stored);
    } catch (error) {
      reportStorageError(error);
    }
    return initialRecipeVersions;
  });

  // Reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (stored) return JSON.parse(stored);
    } catch (error) {
      reportStorageError(error);
    }
    return initialReviews;
  });

  // Pantry items
  const [pantry, setPantry] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PANTRY);
      if (stored) return JSON.parse(stored);
    } catch (error) {
      reportStorageError(error);
    }
    return ["Artisan Pasta", "Extra Virgin Olive Oil", "Garlic", "Tomatoes", "Lemon", "Ricotta"];
  });

  const [pantryStockDates, setPantryStockDates] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PANTRY_DATES);
      if (stored) return JSON.parse(stored);
    } catch (error) {
      reportStorageError(error);
    }
    const now = Date.now();
    return {
      "Fresh Basil": new Date(now - 2.5 * 86400000).toISOString(),
      "Ricotta": new Date(now - 3.5 * 86400000).toISOString(),
      "Tomatoes": new Date(now - 2 * 86400000).toISOString(),
      "Artisan Pasta": new Date(now - 14 * 86400000).toISOString(),
      "Extra Virgin Olive Oil": new Date(now - 30 * 86400000).toISOString(),
      "Garlic": new Date(now - 5 * 86400000).toISOString(),
      "Lemon": new Date(now - 4 * 86400000).toISOString(),
    };
  });

  const defaultNotifications: VaultNotification[] = [
    {
      id: "notif-welcome",
      title: "Welcome to RecipeVault!",
      description: "Your digital kitchen shelf is ready. Press Ctrl+K anywhere for quick actions.",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      read: false,
      type: "system",
      link: "/",
    },
    {
      id: "notif-pantry",
      title: "Pantry Staples Stocked",
      description: "Artisan Pasta, Olive Oil, Garlic, and 3 more essentials are stocked.",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      read: false,
      type: "pantry",
      link: "/ingredients",
    },
    {
      id: "notif-plan",
      title: "Dinner Planned for Wednesday",
      description: "Lemon Ricotta Pasta is queued up for your mid-week dinner.",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      read: true,
      type: "plan",
      link: "/planner",
    },
  ];

  const [notifications, setNotifications] = useState<VaultNotification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      reportStorageError(e);
    }
    return defaultNotifications;
  });

  const [onboardingDismissed, setOnboardingDismissed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ONBOARDING_DISMISSED);
      return stored === "true";
    } catch {
      return false;
    }
  });

  // --- SUPABASE HYDRATION ---
  useEffect(() => {
    async function loadCloudData() {
      try {
        const { data: dbRecipes, error: recipeErr } = await supabase.from("recipes").select(`
            *,
            recipe_ingredients (
              ingredient_id,
              quantity,
              unit,
              preparation_state,
              is_optional,
              ingredients ( canonical_name )
            ),
            recipe_steps (
              step_number,
              instruction,
              duration_minutes,
              culinary_tip
            ),
            recipe_tags (
              tag_name
            )
          `);

        if (!recipeErr && dbRecipes && dbRecipes.length > 0) {
          const mapped = (dbRecipes as DbRecipeRow[]).map(mapDbRecipeToAppRecipe);
          setItems(prev => {
            const customLocalRecipes = prev.filter(r => !mapped.some(m => m.id === r.id));
            return [...mapped, ...customLocalRecipes];
          });
        }

        if (currentUser?.id) {
          const hasLocalPantry = Boolean(localStorage.getItem(STORAGE_KEYS.PANTRY));
          if (!hasLocalPantry) {
            const { data: dbPantry, error: pantryErr } = await supabase
              .from("user_pantry_items")
              .select("ingredient_name")
              .eq("user_id", currentUser.id);

            if (!pantryErr && dbPantry && dbPantry.length > 0) {
              setPantry(dbPantry.map((p: { ingredient_name: string }) => p.ingredient_name));
            }
          }
        }

        const { data: dbReviews, error: reviewErr } = await supabase
          .from("ratings_and_reviews")
          .select("*");

        if (!reviewErr && dbReviews && dbReviews.length > 0) {
          interface DbReviewRow {
            review_id: string;
            recipe_id: string;
            user_id: string;
            rating: number;
            review_text: string;
            created_at: string;
            verified_cook: boolean;
          }
          const mappedReviews: Review[] = (dbReviews as DbReviewRow[]).map((r) => ({
            id: r.review_id,
            recipeId: r.recipe_id,
            userId: r.user_id,
            userName: r.user_id === "user-eric" ? "Eric Titus" : "Home Cook",
            userAvatar: "U",
            rating: r.rating,
            comment: r.review_text,
            createdAt: r.created_at,
            verifiedCook: r.verified_cook,
          }));
          setReviews(mappedReviews);
        }

        const { data: dbCollections, error: colErr } = await supabase
          .from("collections")
          .select(`
            collection_id,
            collection_name,
            description,
            user_id,
            created_at,
            collection_recipes (
              recipe_id
            )
          `);

        if (!colErr && dbCollections && dbCollections.length > 0) {
          interface DbColRow {
            collection_id: string;
            collection_name: string;
            description?: string;
            user_id: string;
            created_at: string;
            collection_recipes?: { recipe_id: string }[];
          }
          const mappedCollections: Collection[] = (dbCollections as DbColRow[]).map((c) => ({
            id: c.collection_id,
            name: c.collection_name,
            description: c.description || "",
            ids: (c.collection_recipes || []).map((cr) => cr.recipe_id),
            createdBy: c.user_id,
            createdAt: c.created_at,
          }));
          setCollections((prev) => {
            const customLocal = prev.filter((p) => !mappedCollections.some((m) => m.id === p.id));
            return [...mappedCollections, ...customLocal];
          });
        }
      } catch (err) {
        console.warn("Supabase offline or unreachable, using local storage cache.", err);
      }
    }

    loadCloudData();
  }, [currentUser.id]);

  // Sync state changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(items));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(saved));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }, [saved]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }, [collections]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(plan));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }, [plan]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VERSIONS, JSON.stringify(versions));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }, [versions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PANTRY, JSON.stringify(pantry));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }, [pantry]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PANTRY_DATES, JSON.stringify(pantryStockDates));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }, [pantryStockDates]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }, [currentUserId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(allUsers));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }, [allUsers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, isAuthenticated ? "true" : "false");
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.ONBOARDING_DISMISSED,
        onboardingDismissed ? "true" : "false",
      );
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }, [onboardingDismissed]);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const addNotification = (notif: Omit<VaultNotification, "id" | "timestamp" | "read">) => {
    const newNotif: VaultNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 24)]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const clearNotifications = () => {
    setNotifications([]);
    toast.info("Notification center cleared");
  };

  const restoreRecipe = (recipe: Recipe) => {
    setItems((prev) => {
      if (prev.some((r) => r.id === recipe.id)) return prev;
      return [recipe, ...prev];
    });
    addNotification({
      title: "Recipe Restored",
      description: `"${recipe.title}" was restored back to your vault.`,
      type: "recipe",
      link: `/recipe/${recipe.id}`,
    });
    toast.success(`Restored "${recipe.title}"`);
  };

  const restoreMealPlan = (oldPlan: PlanItem[]) => {
    setPlan(oldPlan);
    addNotification({
      title: "Meal Plan Restored",
      description: `Restored ${oldPlan.length} scheduled meals.`,
      type: "plan",
      link: "/planner",
    });
    toast.success("Meal plan restored");
  };

  // Auth Functions
  const switchUser = (userId: string) => {
    if (allUsers.some((u) => u.id === userId)) {
      setCurrentUserId(userId);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, "true");
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
      } catch (e) {
        console.warn("Storage save error", e);
      }
      const targetUser = allUsers.find((u) => u.id === userId);
      toast.success(`Switched active cook to ${targetUser?.name}`);
    }
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setAllUsers((prev) => prev.map((u) => (u.id === currentUserId ? { ...u, ...profile } : u)));
    toast.success("Kitchen preferences updated");
  };

  const registerUser = (
    name: string,
    email: string,
    password?: string,
    extra?: Partial<UserProfile>,
  ): UserProfile => {
    const newUser: UserProfile = {
      id: `user-${crypto.randomUUID().slice(0, 8)}`,
      name,
      email,
      password: password || "demo1234",
      role: extra?.role || "Curious Home Cook",
      avatar: extra?.avatar || name.charAt(0).toUpperCase() || "U",
      bio: extra?.bio || "New home cook curating favorite family recipes.",
      phone: extra?.phone || "",
      location: extra?.location || "Kitchen Pantry, Home",
      dietaryPreferences: extra?.dietaryPreferences || ["Vegetarian"],
      dislikedIngredients: extra?.dislikedIngredients || [],
      healthConditions: extra?.healthConditions || [],
      favoriteCuisines: extra?.favoriteCuisines || ["Italian", "Mediterranean"],
      cookingSkill: extra?.cookingSkill || "Beginner",
      targetCookTime: extra?.targetCookTime || 30,
      twoFactorEnabled: extra?.twoFactorEnabled ?? false,
      sessionTimeout: extra?.sessionTimeout ?? 60,
      loginMethod: extra?.loginMethod || "email",
      createdAt: new Date().toISOString(),
    };

    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, "true");
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);
    } catch (e) {
      console.warn("Storage save error", e);
    }

    (async () => {
      await supabase.from("users").insert({
        user_id: newUser.id,
        username: newUser.email.split("@")[0],
        email: newUser.email,
        password_hash: "$2a$12$demo_hash",
        full_name: newUser.name,
        avatar: newUser.avatar,
        role: newUser.role,
        bio: newUser.bio,
        cooking_skill: newUser.cookingSkill,
        target_cook_time: newUser.targetCookTime,
      });
    })();

    return newUser;
  };

  const loginUser = (email: string, password?: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setCurrentUserId(existing.id);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, "true");
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, existing.id);
      } catch (e) {
        console.warn("Storage save error", e);
      }
      return true;
    }
    const autoName = email.includes("@") ? (email.split("@")[0] ?? email) : email;
    registerUser(autoName, email, password);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, "true");
    } catch (e) {
      console.warn("Storage save error", e);
    }
    return true;
  };

  const loginWithGoogle = (mockGoogleProfile?: {
    name: string;
    email: string;
    avatar?: string;
  }): UserProfile => {
    const profile = mockGoogleProfile || {
      name: "Google Culinary Cook",
      email: "culinary.cook@gmail.com",
      avatar: "G",
    };

    const existing = allUsers.find((u) => u.email.toLowerCase() === profile.email.toLowerCase());
    if (existing) {
      setCurrentUserId(existing.id);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, "true");
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, existing.id);
      } catch (e) {
        console.warn("Storage save error", e);
      }
      toast.success(`Signed in via Google as ${existing.name}`);
      return existing;
    }

    const newUser: UserProfile = {
      id: `user-google-${crypto.randomUUID().slice(0, 6)}`,
      name: profile.name,
      email: profile.email,
      role: "Google Verified Cook",
      avatar: profile.avatar || "G",
      bio: "Verified kitchen chef connected via Google Account.",
      phone: "",
      location: "San Francisco, CA",
      dietaryPreferences: ["Balanced"],
      dislikedIngredients: [],
      healthConditions: [],
      favoriteCuisines: ["Mediterranean", "Japanese"],
      cookingSkill: "Home Cook",
      targetCookTime: 30,
      twoFactorEnabled: true,
      sessionTimeout: 120,
      loginMethod: "google",
      createdAt: new Date().toISOString(),
    };

    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, "true");
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);
    } catch (e) {
      console.warn("Storage save error", e);
    }
    toast.success(`Google Account connected! Welcome, ${newUser.name}.`);
    return newUser;
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    setLastVisitedRouteState(null);
    try {
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, "false");
      localStorage.removeItem(STORAGE_KEYS.LAST_VISITED_ROUTE);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("rv_initial_session_restored");
      }
    } catch (e) {
      console.warn("Storage save error", e);
    }
    toast.info("You have signed out of your kitchen vault.");
  };

  const resetPassword = (email: string): boolean => {
    const user = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      toast.success(`Reset link and recovery code sent to ${email}`);
      return true;
    } else {
      toast.error("No registered cook found with this email address.");
      return false;
    }
  };

  // Recipe Operations
  const toggleSave = (id: string) => {
    const recipe = items.find((r) => r.id === id);
    setSaved((prev) => {
      const isAlreadySaved = prev.includes(id);
      if (!isAlreadySaved && recipe) {
        addNotification({
          title: "Recipe Saved",
          description: `Tucked "${recipe.title}" into your cookbook.`,
          type: "save",
          link: `/recipe/${recipe.id}`,
        });
      }
      return isAlreadySaved ? prev.filter((x) => x !== id) : [...prev, id];
    });
  };

  const addRecipe = (recipe: Recipe, changeSummary?: string) => {
    setItems((prev) => {
      const exists = prev.some((x) => x.id === recipe.id);
      if (exists) {
        const existingRecipe = prev.find((x) => x.id === recipe.id)!;
        const currentVersionCount = versions.filter((v) => v.recipeId === recipe.id).length;
        const newVersion: RecipeVersion = {
          versionId: `ver-${recipe.id}-${currentVersionCount + 1}`,
          recipeId: recipe.id,
          versionNumber: currentVersionCount + 1,
          changeSummary: changeSummary || `Revision ${currentVersionCount + 1}`,
          authorId: currentUser.id,
          authorName: currentUser.name,
          createdAt: new Date().toISOString(),
          snapshot: { ...existingRecipe },
        };
        setVersions((vPrev) => [newVersion, ...vPrev]);

        return prev.map((x) =>
          x.id === recipe.id ? { ...recipe, updatedAt: new Date().toISOString() } : x,
        );
      } else {
        const initialVersion: RecipeVersion = {
          versionId: `ver-${recipe.id}-1`,
          recipeId: recipe.id,
          versionNumber: 1,
          changeSummary: "Initial recipe creation and publication into RecipeVault.",
          authorId: currentUser.id,
          authorName: currentUser.name,
          createdAt: new Date().toISOString(),
          snapshot: { ...recipe },
        };
        setVersions((vPrev) => [initialVersion, ...vPrev]);
        return [recipe, ...prev];
      }
    });

    (async () => {
      const dbRow = mapAppRecipeToDbRow(recipe);
      const { error } = await supabase.from("recipes").upsert(dbRow);

      if (error) {
        console.error("Supabase Recipe Upsert Error:", error);
        toast.error("Could not sync recipe changes to cloud database.");
      } else {
        if (recipe.steps && recipe.steps.length > 0) {
          await supabase.from("recipe_steps").delete().eq("recipe_id", recipe.id);
          await supabase.from("recipe_steps").insert(
            recipe.steps.map((s) => ({
              recipe_id: recipe.id,
              step_number: s.stepNumber,
              instruction: s.instruction,
              duration_minutes: s.durationMinutes || 0,
              culinary_tip: s.tip || null,
            })),
          );
        }

        if (recipe.ingredients && recipe.ingredients.length > 0) {
          await supabase.from("recipe_ingredients").delete().eq("recipe_id", recipe.id);
          const ingredientRows = recipe.ingredients
            .filter((i) => (i.name || "").trim().length > 0)
            .map((i) => {
              const matchedMaster = findMasterIngredient(i);
              const resolvedId =
                i.ingredientId ||
                matchedMaster?.id ||
                `ing-${i.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
              return {
                recipe_id: recipe.id,
                ingredient_id: resolvedId,
                quantity: i.quantity || 1,
                unit: i.unit || "g",
                preparation_state: i.preparationState || null,
                is_optional: Boolean(i.isOptional),
              };
            });

          if (ingredientRows.length > 0) {
            const { error: ingSyncErr } = await supabase
              .from("recipe_ingredients")
              .insert(ingredientRows);
            if (ingSyncErr) {
              console.warn("Recipe ingredients cloud sync note:", ingSyncErr.message);
            }
          }
        }

        if (changeSummary) {
          await supabase.from("recipe_versions").insert({
            version_id: `ver-${recipe.id}-${Date.now()}`,
            recipe_id: recipe.id,
            version_number: Date.now(),
            change_summary: changeSummary,
            author_id: currentUser.id,
            author_name: currentUser.name,
            snapshot_data: recipe,
          });
        }
      }
    })();
  };

  const deleteRecipe = (id: string) => {
    const targetRecipe = items.find((recipe) => recipe.id === id);
    setItems((prev) => prev.filter((recipe) => recipe.id !== id));
    setSaved((prev) => prev.filter((x) => x !== id));
    setPlan((prev) => prev.filter((x) => x.recipeId !== id));
    setCollections((prev) => prev.map((c) => ({ ...c, ids: c.ids.filter((x) => x !== id) })));

    if (targetRecipe) {
      addNotification({
        title: "Recipe Moved to Trash",
        description: `"${targetRecipe.title}" was removed from your vault.`,
        type: "recipe",
      });

      toast.success(`Recipe "${targetRecipe.title}" deleted`, {
        action: {
          label: "Undo",
          onClick: () => {
            restoreRecipe(targetRecipe);
          },
        },
      });
    }

    (async () => {
      const { error } = await supabase.from("recipes").delete().eq("recipe_id", id);
      if (error) {
        console.error("Supabase Recipe Delete Error:", error);
      }
    })();
  };

  const restoreRecipeVersion = (recipeId: string, versionId: string) => {
    const versionRecord = versions.find((v) => v.versionId === versionId);
    if (!versionRecord || !versionRecord.snapshot) {
      toast.error("Version snapshot could not be found.");
      return;
    }

    setItems((prev) =>
      prev.map((r) => {
        if (r.id === recipeId) {
          return {
            ...r,
            ...versionRecord.snapshot,
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      }),
    );
    toast.success(
      `Restored to Version ${versionRecord.versionNumber}: ${versionRecord.changeSummary}`,
    );
  };

  // Pantry Management
  const togglePantryItem = (name: string) => {
    const isPresent = pantry.includes(name);
    if (isPresent) {
      setPantry((prev) => prev.filter((x) => x !== name));
      setPantryStockDates((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    } else {
      setPantry((prev) => [...prev, name]);
      setPantryStockDates((prev) => ({ ...prev, [name]: new Date().toISOString() }));
    }

    (async () => {
      if (isPresent) {
        await supabase
          .from("user_pantry_items")
          .delete()
          .eq("user_id", currentUser.id)
          .eq("ingredient_name", name);
      } else {
        await supabase.from("user_pantry_items").insert({
          user_id: currentUser.id,
          ingredient_name: name,
        });
      }
    })();
  };

  const addPantryItem = (name: string) => {
    if (!pantry.includes(name)) {
      setPantry((prev) => [...prev, name]);
      setPantryStockDates((prev) => ({ ...prev, [name]: new Date().toISOString() }));
      addNotification({
        title: "Pantry Item Stocked",
        description: `Added "${name}" to your kitchen pantry.`,
        type: "pantry",
        link: "/ingredients",
      });
      toast.success(`Added ${name} to your home pantry`);

      (async () => {
        await supabase.from("user_pantry_items").insert({
          user_id: currentUser.id,
          ingredient_name: name,
        });
      })();
    }
  };

  const removePantryItem = (name: string) => {
    setPantry((prev) => prev.filter((x) => x !== name));
    setPantryStockDates((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });

    addNotification({
      title: "Pantry Item Removed",
      description: `Removed "${name}" from stock.`,
      type: "pantry",
      link: "/ingredients",
    });

    toast.info(`Removed "${name}" from pantry`, {
      action: {
        label: "Undo",
        onClick: () => addPantryItem(name),
      },
    });

    (async () => {
      await supabase
        .from("user_pantry_items")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("ingredient_name", name);
    })();
  };

  // Collection Operations
  const createCollection = (name: string, description?: string) => {
    const newCollection: Collection = {
      id: crypto.randomUUID(),
      name,
      description: description || "A curated grouping of recipes.",
      ids: [],
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
    };
    setCollections((prev) => [...prev, newCollection]);

    (async () => {
      await supabase.from("collections").insert({
        collection_id: newCollection.id,
        collection_name: name,
        description: newCollection.description,
        user_id: currentUser.id,
      });
    })();
  };

  const addToCollection = (collectionId: string, recipeId: string) => {
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId
          ? { ...c, ids: c.ids.includes(recipeId) ? c.ids : [...c.ids, recipeId] }
          : c,
      ),
    );

    (async () => {
      await supabase.from("collection_recipes").insert({
        collection_id: collectionId,
        recipe_id: recipeId,
      });
    })();
  };

  const removeFromCollection = (collectionId: string, recipeId: string) => {
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId ? { ...c, ids: c.ids.filter((x) => x !== recipeId) } : c,
      ),
    );

    (async () => {
      await supabase
        .from("collection_recipes")
        .delete()
        .eq("collection_id", collectionId)
        .eq("recipe_id", recipeId);
    })();
  };

  const deleteCollection = (collectionId: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== collectionId));

    (async () => {
      await supabase.from("collections").delete().eq("collection_id", collectionId);
    })();
  };

  // Meal Planner Operations
  const setMeal = (
    day: number,
    meal: "Breakfast" | "Lunch" | "Dinner" | "Snack",
    recipeId: string,
    customServings?: number,
  ) => {
    setPlan((prev) => {
      const filtered = prev.filter((x) => x.day !== day || x.meal !== meal);
      if (!recipeId) return filtered;
      return [
        ...filtered,
        {
          id: crypto.randomUUID(),
          day,
          meal,
          recipeId,
          ...(customServings !== undefined ? { customServings } : {}),
        },
      ];
    });

    if (recipeId) {
      const recipe = items.find((r) => r.id === recipeId);
      if (recipe) {
        addNotification({
          title: "Meal Scheduled",
          description: `Added "${recipe.title}" to day ${day + 1} ${meal}.`,
          type: "plan",
          link: "/planner",
        });
      }
    }
  };

  const clearMealPlan = () => {
    const oldPlan = [...plan];
    setPlan([]);
    addNotification({
      title: "Meal Plan Cleared",
      description: `Cleared ${oldPlan.length} scheduled meals.`,
      type: "plan",
    });
    toast.success("Cleared weekly meal plan", {
      action: {
        label: "Undo",
        onClick: () => {
          restoreMealPlan(oldPlan);
        },
      },
    });
  };

  // Reviews
  const addReview = (recipeId: string, rating: number, comment: string) => {
    const newRev: Review = {
      id: `rev-${crypto.randomUUID().slice(0, 8)}`,
      recipeId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      rating,
      comment,
      createdAt: new Date().toISOString(),
      verifiedCook: true,
    };

    setReviews((prev) => [newRev, ...prev]);

    setItems((prev) =>
      prev.map((r) => {
        if (r.id === recipeId) {
          const matchingReviews = [newRev, ...reviews.filter((rv) => rv.recipeId === recipeId)];
          const avg = (
            matchingReviews.reduce((sum, rev) => sum + rev.rating, 0) / matchingReviews.length
          ).toFixed(1);
          return {
            ...r,
            rating: avg,
            ratingCount: matchingReviews.length,
          };
        }
        return r;
      }),
    );

    (async () => {
      const { error } = await supabase.from("ratings_and_reviews").insert({
        review_id: newRev.id,
        recipe_id: recipeId,
        user_id: currentUser.id,
        rating,
        review_text: comment,
        verified_cook: true,
      });

      if (error) {
        console.error("Supabase Review Insert Error:", error);
        toast.error("Failed to sync review to Supabase.");
      } else {
        toast.success("Your cooking review has been published!");
      }
    })();
  };

  const preferences = [...currentUser.favoriteCuisines, ...currentUser.dietaryPreferences];

  const togglePreference = (name: string) => {
    const isCuisine = [
      "Italian",
      "Mediterranean",
      "American",
      "Indian",
      "Japanese",
      "Mexican",
    ].includes(name);
    if (isCuisine) {
      const favs = currentUser.favoriteCuisines.includes(name)
        ? currentUser.favoriteCuisines.filter((x) => x !== name)
        : [...currentUser.favoriteCuisines, name];
      updateUserProfile({ favoriteCuisines: favs });
    } else {
      const diets = currentUser.dietaryPreferences.includes(name)
        ? currentUser.dietaryPreferences.filter((x) => x !== name)
        : [...currentUser.dietaryPreferences, name];
      updateUserProfile({ dietaryPreferences: diets });
    }
  };

  const resetDatabase = () => {
    localStorage.removeItem(STORAGE_KEYS.RECIPES);
    localStorage.removeItem(STORAGE_KEYS.SAVED);
    localStorage.removeItem(STORAGE_KEYS.COLLECTIONS);
    localStorage.removeItem(STORAGE_KEYS.PLAN);
    localStorage.removeItem(STORAGE_KEYS.VERSIONS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.PANTRY);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.ALL_USERS);

    setItems(initialRecipes);
    setSaved(["lemon-ricotta-pasta", "roasted-tomato-soup"]);
    setCollections([
      {
        id: "weeknight",
        name: "Weeknight favorites",
        description: "Quick, comforting meals ready in under 35 minutes.",
        ids: ["lemon-ricotta-pasta", "roasted-tomato-soup", "chickpea-harvest-bowl"],
        createdBy: "user-eric",
        createdAt: "2026-08-15T12:00:00Z",
      },
      {
        id: "slow-mornings",
        name: "Slow mornings & brunch",
        description: "Pancake stacks and comforting breakfasts for relaxed Sundays.",
        ids: ["blueberry-pancakes"],
        createdBy: "user-eric",
        createdAt: "2026-08-20T10:00:00Z",
      },
      {
        id: "high-protein-prep",
        name: "High-protein nourishment",
        description: "Energizing dinners loaded with clean proteins and balanced macros.",
        ids: ["rosemary-roast-chicken", "chickpea-harvest-bowl"],
        createdBy: "user-neeraj",
        createdAt: "2026-08-25T14:00:00Z",
      },
    ]);
    setPlan([
      { id: "p1", day: 0, meal: "Dinner", recipeId: "lemon-ricotta-pasta" },
      { id: "p2", day: 2, meal: "Lunch", recipeId: "chickpea-harvest-bowl" },
      { id: "p3", day: 4, meal: "Dinner", recipeId: "rosemary-roast-chicken" },
      { id: "p4", day: 6, meal: "Breakfast", recipeId: "blueberry-pancakes" },
    ]);
    setVersions(initialRecipeVersions);
    setReviews(initialReviews);
    setPantry([
      "Artisan Pasta",
      "Extra Virgin Olive Oil",
      "Garlic",
      "Tomatoes",
      "Lemon",
      "Ricotta",
    ]);
    setAllUsers(demoUsers);
    setCurrentUserId(defaultUser.id);
    setNotifications(defaultNotifications);
    setOnboardingDismissed(false);

    toast.success("Relational database reset to canonical state");
  };

  return (
    <VaultContext.Provider
      value={{
        theme,
        setTheme,
        currentUser,
        allUsers,
        isAuthenticated,
        lastVisitedRoute,
        setLastVisitedRoute,
        switchUser,
        updateUserProfile,
        registerUser,
        loginUser,
        loginWithGoogle,
        logoutUser,
        resetPassword,
        items,
        saved,
        versions,
        toggleSave,
        addRecipe,
        deleteRecipe,
        restoreRecipe,
        restoreRecipeVersion,
        ingredients: masterIngredients,
        pantry,
        pantryStockDates,
        togglePantryItem,
        addPantryItem,
        removePantryItem,
        collections,
        createCollection,
        addToCollection,
        removeFromCollection,
        deleteCollection,
        plan,
        setMeal,
        clearMealPlan,
        restoreMealPlan,
        reviews,
        addReview,
        preferences,
        togglePreference,
        notifications,
        unreadNotificationsCount,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        onboardingDismissed,
        setOnboardingDismissed,
        resetDatabase,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

// The context hook intentionally lives beside its provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useVault() {
  const value = useContext(VaultContext);
  if (!value) throw new Error("useVault must be used within a VaultProvider");
  return value;
}
