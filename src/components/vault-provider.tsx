import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  recipes as initialRecipes,
  masterIngredients,
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
} from '@/lib/recipes';
import { toast } from 'sonner';

export type ThemeMode = 'morning' | 'sunset' | 'night';

type VaultContextType = {
  // Theme Mode
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  // Authentication & Current User
  currentUser: UserProfile;
  allUsers: UserProfile[];
  isAuthenticated: boolean;
  switchUser: (userId: string) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  registerUser: (name: string, email: string, password?: string, extra?: Partial<UserProfile>) => UserProfile;
  loginUser: (email: string, password?: string) => boolean;
  loginWithGoogle: (mockGoogleProfile?: { name: string; email: string; avatar?: string }) => UserProfile;
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
  setMeal: (day: number, meal: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack', recipeId: string, customServings?: number) => void;
  clearMealPlan: () => void;

  // Reviews & Community
  reviews: Review[];
  addReview: (recipeId: string, rating: number, comment: string) => void;

  // Preferences (Direct toggle for active user)
  preferences: string[];
  togglePreference: (name: string) => void;

  // Demo Database Controls
  resetDatabase: () => void;
};

const VaultContext = createContext<VaultContextType | null>(null);

const STORAGE_KEYS = {
  THEME: 'rv_theme_mode',
  RECIPES: 'rv_recipes_v3',
  SAVED: 'rv_saved_v3',
  COLLECTIONS: 'rv_collections_v3',
  PLAN: 'rv_plan_v3',
  VERSIONS: 'rv_versions_v3',
  REVIEWS: 'rv_reviews_v3',
  PANTRY: 'rv_pantry_v3',
  CURRENT_USER_ID: 'rv_current_user_v3',
  ALL_USERS: 'rv_all_users_v3',
  IS_AUTHENTICATED: 'rv_is_authenticated_v3',
};

export function VaultProvider({ children }: { children: ReactNode }) {
  // Helper to determine atmosphere based on local device clock:
  // morning: 6 AM to 12 NOON (6 <= hour < 12)
  // afternoon/sunset: 12 NOON to 7 PM (12 <= hour < 19)
  // night: 7 PM to 6 AM (hour >= 19 || hour < 6)
  const getTimeBasedTheme = (): ThemeMode => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 19) return 'sunset';
    return 'night';
  };

  // Theme state ('morning' | 'sunset' | 'night')
  // If user has explicitly selected a theme preference, use it; otherwise auto-detect from local clock
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'sunset';
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode;
      if (stored === 'morning' || stored === 'sunset' || stored === 'night') {
        return stored;
      }
    } catch {
      // fallback
    }
    return getTimeBasedTheme();
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      if (newTheme === 'night') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // ignore
    }
  };

  // Listen to live system clock (e.g. check every minute if no manual override is stored)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Apply current theme
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'night') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Interval to check time-based transition if user has not set a custom override
    const timer = setInterval(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.THEME);
        if (!stored) {
          const autoTheme = getTimeBasedTheme();
          if (autoTheme !== theme) {
            setThemeState(autoTheme);
          }
        }
      } catch {}
    }, 60000);

    return () => clearInterval(timer);
  }, [theme]);

  // Users state (Persisting all user profiles so customizations are never lost)
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return demoUsers;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      if (stored && allUsers.some(u => u.id === stored)) return stored;
    } catch {
      // fallback
    }
    return demoUsers[0].id; // Eric by default
  });

  const currentUser = allUsers.find(u => u.id === currentUserId) || allUsers[0];

  // Authentication session state (First-time visitors must sign in/sign up)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  // Recipes state
  const [items, setItems] = useState<Recipe[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECIPES);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return initialRecipes;
  });

  // Saved recipes
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return ['lemon-ricotta-pasta', 'roasted-tomato-soup'];
  });

  // Collections
  const [collections, setCollections] = useState<Collection[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      {
        id: 'weeknight',
        name: 'Weeknight favorites',
        description: 'Quick, comforting meals ready in under 35 minutes.',
        ids: ['lemon-ricotta-pasta', 'roasted-tomato-soup', 'chickpea-harvest-bowl'],
        createdBy: 'user-eric',
        createdAt: '2026-08-15T12:00:00Z',
      },
      {
        id: 'slow-mornings',
        name: 'Slow mornings & brunch',
        description: 'Pancake stacks and comforting breakfasts for relaxed Sundays.',
        ids: ['blueberry-pancakes'],
        createdBy: 'user-eric',
        createdAt: '2026-08-20T10:00:00Z',
      },
      {
        id: 'high-protein-prep',
        name: 'High-protein nourishment',
        description: 'Energizing dinners loaded with clean proteins and balanced macros.',
        ids: ['rosemary-roast-chicken', 'chickpea-harvest-bowl'],
        createdBy: 'user-neeraj',
        createdAt: '2026-08-25T14:00:00Z',
      },
    ];
  });

  // Meal Plan
  const [plan, setPlan] = useState<PlanItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PLAN);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      { id: 'p1', day: 0, meal: 'Dinner', recipeId: 'lemon-ricotta-pasta' },
      { id: 'p2', day: 2, meal: 'Lunch', recipeId: 'chickpea-harvest-bowl' },
      { id: 'p3', day: 4, meal: 'Dinner', recipeId: 'rosemary-roast-chicken' },
      { id: 'p4', day: 6, meal: 'Breakfast', recipeId: 'blueberry-pancakes' },
    ];
  });

  // Recipe Versions
  const [versions, setVersions] = useState<RecipeVersion[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VERSIONS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return initialRecipeVersions;
  });

  // Reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return initialReviews;
  });

  // Pantry items
  const [pantry, setPantry] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PANTRY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return ['Artisan Pasta', 'Extra Virgin Olive Oil', 'Garlic', 'Tomatoes', 'Lemon', 'Ricotta'];
  });

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(items));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(saved));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [saved]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [collections]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(plan));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [plan]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VERSIONS, JSON.stringify(versions));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [versions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PANTRY, JSON.stringify(pantry));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [pantry]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [currentUserId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(allUsers));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [allUsers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, isAuthenticated ? 'true' : 'false');
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [isAuthenticated]);

  // Auth Functions
  const switchUser = (userId: string) => {
    if (allUsers.some(u => u.id === userId)) {
      setCurrentUserId(userId);
      setIsAuthenticated(true);
      const targetUser = allUsers.find(u => u.id === userId);
      toast.success(`Switched active cook to ${targetUser?.name}`);
    }
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setAllUsers(prev =>
      prev.map(u => (u.id === currentUserId ? { ...u, ...profile } : u))
    );
    toast.success('Kitchen preferences updated');
  };

  const registerUser = (
    name: string,
    email: string,
    password?: string,
    extra?: Partial<UserProfile>
  ): UserProfile => {
    const newUser: UserProfile = {
      id: `user-${crypto.randomUUID().slice(0, 8)}`,
      name,
      email,
      password: password || 'demo1234',
      role: extra?.role || 'Curious Home Cook',
      avatar: extra?.avatar || name.charAt(0).toUpperCase() || 'U',
      bio: extra?.bio || 'New home cook curating favorite family recipes and exploring culinary flavors.',
      phone: extra?.phone || '',
      location: extra?.location || 'Kitchen Pantry, Home',
      dietaryPreferences: extra?.dietaryPreferences || ['Vegetarian'],
      dislikedIngredients: extra?.dislikedIngredients || [],
      healthConditions: extra?.healthConditions || [],
      favoriteCuisines: extra?.favoriteCuisines || ['Italian', 'Mediterranean'],
      cookingSkill: extra?.cookingSkill || 'Beginner',
      targetCookTime: extra?.targetCookTime || 30,
      twoFactorEnabled: extra?.twoFactorEnabled ?? false,
      sessionTimeout: extra?.sessionTimeout ?? 60,
      loginMethod: extra?.loginMethod || 'email',
      createdAt: new Date().toISOString(),
    };
    setAllUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    setIsAuthenticated(true);
    return newUser;
  };

  const loginUser = (email: string, password?: string): boolean => {
    const existing = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      // If user has a password set and password was provided, verify it (demo allows match or bypass if empty)
      if (existing.password && password && existing.password !== password) {
        toast.error('Incorrect password. Please verify your credentials or click "Forgot password".');
        return false;
      }
      setCurrentUserId(existing.id);
      setIsAuthenticated(true);
      return true;
    }
    // Also allow seamless demo access for any entered username/email as placeholder
    const auto = registerUser(email.includes('@') ? email.split('@')[0] : email, email, password);
    setIsAuthenticated(true);
    return true;
  };

  const loginWithGoogle = (mockGoogleProfile?: { name: string; email: string; avatar?: string }): UserProfile => {
    const profile = mockGoogleProfile || {
      name: 'Google Culinary Cook',
      email: 'culinary.cook@gmail.com',
      avatar: 'G',
    };

    const existing = allUsers.find(u => u.email.toLowerCase() === profile.email.toLowerCase());
    if (existing) {
      setCurrentUserId(existing.id);
      setIsAuthenticated(true);
      toast.success(`Signed in via Google as ${existing.name}`);
      return existing;
    }

    const newUser: UserProfile = {
      id: `user-google-${crypto.randomUUID().slice(0, 6)}`,
      name: profile.name,
      email: profile.email,
      role: 'Google Verified Cook',
      avatar: profile.avatar || 'G',
      bio: 'Verified kitchen chef connected via Google Account with synced preferences.',
      phone: '',
      location: 'San Francisco, CA',
      dietaryPreferences: ['Balanced'],
      dislikedIngredients: [],
      healthConditions: [],
      favoriteCuisines: ['Mediterranean', 'Japanese'],
      cookingSkill: 'Home Cook',
      targetCookTime: 30,
      twoFactorEnabled: true,
      sessionTimeout: 120,
      loginMethod: 'google',
      createdAt: new Date().toISOString(),
    };

    setAllUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    setIsAuthenticated(true);
    toast.success(`Google Account connected! Welcome, ${newUser.name}.`);
    return newUser;
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    toast.info('You have signed out of your kitchen vault.');
  };

  const resetPassword = (email: string): boolean => {
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      toast.success(`Reset link and recovery code sent to ${email}`);
      return true;
    } else {
      toast.error('No registered cook found with this email address.');
      return false;
    }
  };

  // Recipe Operations with Version Snapshotting
  const toggleSave = (id: string) => {
    setSaved(prev => {
      const isAlreadySaved = prev.includes(id);
      return isAlreadySaved ? prev.filter(x => x !== id) : [...prev, id];
    });
  };

  const addRecipe = (recipe: Recipe, changeSummary?: string) => {
    setItems(prev => {
      const exists = prev.some(x => x.id === recipe.id);
      if (exists) {
        // Record version snapshot before updating
        const existingRecipe = prev.find(x => x.id === recipe.id)!;
        const currentVersionCount = versions.filter(v => v.recipeId === recipe.id).length;
        const newVersion: RecipeVersion = {
          versionId: `ver-${recipe.id}-${currentVersionCount + 1}`,
          recipeId: recipe.id,
          versionNumber: currentVersionCount + 1,
          changeSummary: changeSummary || `Revision ${currentVersionCount + 1}: Refined ingredients and cooking directions.`,
          authorId: currentUser.id,
          authorName: currentUser.name,
          createdAt: new Date().toISOString(),
          snapshot: { ...existingRecipe },
        };
        setVersions(vPrev => [newVersion, ...vPrev]);

        return prev.map(x => (x.id === recipe.id ? { ...recipe, updatedAt: new Date().toISOString() } : x));
      } else {
        // New recipe initial version
        const initialVersion: RecipeVersion = {
          versionId: `ver-${recipe.id}-1`,
          recipeId: recipe.id,
          versionNumber: 1,
          changeSummary: 'Initial recipe creation and publication into RecipeVault.',
          authorId: currentUser.id,
          authorName: currentUser.name,
          createdAt: new Date().toISOString(),
          snapshot: { ...recipe },
        };
        setVersions(vPrev => [initialVersion, ...vPrev]);
        return [recipe, ...prev];
      }
    });
  };

  const deleteRecipe = (id: string) => {
    setItems(prev => prev.filter(x => x.id !== id));
    setSaved(prev => prev.filter(x => x !== id));
    setPlan(prev => prev.filter(x => x.recipeId !== id));
    setCollections(prev => prev.map(c => ({ ...c, ids: c.ids.filter(x => x !== id) })));
  };

  const restoreRecipeVersion = (recipeId: string, versionId: string) => {
    const versionRecord = versions.find(v => v.versionId === versionId);
    if (!versionRecord || !versionRecord.snapshot) {
      toast.error('Version snapshot could not be found.');
      return;
    }

    setItems(prev =>
      prev.map(r => {
        if (r.id === recipeId) {
          return {
            ...r,
            ...versionRecord.snapshot,
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      })
    );
    toast.success(`Restored to Version ${versionRecord.versionNumber}: ${versionRecord.changeSummary}`);
  };

  // Pantry Management
  const togglePantryItem = (name: string) => {
    setPantry(prev => (prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]));
  };

  const addPantryItem = (name: string) => {
    if (!pantry.includes(name)) {
      setPantry(prev => [...prev, name]);
      toast.success(`Added ${name} to your home pantry`);
    }
  };

  const removePantryItem = (name: string) => {
    setPantry(prev => prev.filter(x => x !== name));
  };

  // Collection Operations
  const createCollection = (name: string, description?: string) => {
    const newCollection: Collection = {
      id: crypto.randomUUID(),
      name,
      description: description || 'A curated grouping of recipes.',
      ids: [],
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
    };
    setCollections(prev => [...prev, newCollection]);
  };

  const addToCollection = (collectionId: string, recipeId: string) => {
    setCollections(prev =>
      prev.map(c =>
        c.id === collectionId
          ? { ...c, ids: c.ids.includes(recipeId) ? c.ids : [...c.ids, recipeId] }
          : c
      )
    );
  };

  const removeFromCollection = (collectionId: string, recipeId: string) => {
    setCollections(prev =>
      prev.map(c =>
        c.id === collectionId
          ? { ...c, ids: c.ids.filter(x => x !== recipeId) }
          : c
      )
    );
  };

  const deleteCollection = (collectionId: string) => {
    setCollections(prev => prev.filter(c => c.id !== collectionId));
  };

  // Meal Planner Operations
  const setMeal = (day: number, meal: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack', recipeId: string, customServings?: number) => {
    setPlan(prev => {
      const filtered = prev.filter(x => x.day !== day || x.meal !== meal);
      if (!recipeId) return filtered;
      return [...filtered, { id: crypto.randomUUID(), day, meal, recipeId, customServings }];
    });
  };

  const clearMealPlan = () => {
    setPlan([]);
    toast.success('Cleared weekly meal plan');
  };

  // Reviews & Rating Aggregation
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

    setReviews(prev => [newRev, ...prev]);

    // Recalculate average rating for recipe
    setItems(prev =>
      prev.map(r => {
        if (r.id === recipeId) {
          const matchingReviews = [newRev, ...reviews.filter(rv => rv.recipeId === recipeId)];
          const avg = (matchingReviews.reduce((sum, rev) => sum + rev.rating, 0) / matchingReviews.length).toFixed(1);
          return {
            ...r,
            rating: avg,
            ratingCount: matchingReviews.length,
          };
        }
        return r;
      })
    );

    toast.success('Your cooking review has been published!');
  };

  // Preferences shortcut (operates on current user)
  const preferences = [
    ...currentUser.favoriteCuisines,
    ...currentUser.dietaryPreferences,
  ];

  const togglePreference = (name: string) => {
    const isCuisine = ['Italian', 'Mediterranean', 'American', 'Indian', 'Japanese', 'Mexican'].includes(name);
    if (isCuisine) {
      const favs = currentUser.favoriteCuisines.includes(name)
        ? currentUser.favoriteCuisines.filter(x => x !== name)
        : [...currentUser.favoriteCuisines, name];
      updateUserProfile({ favoriteCuisines: favs });
    } else {
      const diets = currentUser.dietaryPreferences.includes(name)
        ? currentUser.dietaryPreferences.filter(x => x !== name)
        : [...currentUser.dietaryPreferences, name];
      updateUserProfile({ dietaryPreferences: diets });
    }
  };

  // Reset to Demo Database
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
    setSaved(['lemon-ricotta-pasta', 'roasted-tomato-soup']);
    setCollections([
      {
        id: 'weeknight',
        name: 'Weeknight favorites',
        description: 'Quick, comforting meals ready in under 35 minutes.',
        ids: ['lemon-ricotta-pasta', 'roasted-tomato-soup', 'chickpea-harvest-bowl'],
        createdBy: 'user-eric',
        createdAt: '2026-08-15T12:00:00Z',
      },
      {
        id: 'slow-mornings',
        name: 'Slow mornings & brunch',
        description: 'Pancake stacks and comforting breakfasts for relaxed Sundays.',
        ids: ['blueberry-pancakes'],
        createdBy: 'user-eric',
        createdAt: '2026-08-20T10:00:00Z',
      },
      {
        id: 'high-protein-prep',
        name: 'High-protein nourishment',
        description: 'Energizing dinners loaded with clean proteins and balanced macros.',
        ids: ['rosemary-roast-chicken', 'chickpea-harvest-bowl'],
        createdBy: 'user-neeraj',
        createdAt: '2026-08-25T14:00:00Z',
      },
    ]);
    setPlan([
      { id: 'p1', day: 0, meal: 'Dinner', recipeId: 'lemon-ricotta-pasta' },
      { id: 'p2', day: 2, meal: 'Lunch', recipeId: 'chickpea-harvest-bowl' },
      { id: 'p3', day: 4, meal: 'Dinner', recipeId: 'rosemary-roast-chicken' },
      { id: 'p4', day: 6, meal: 'Breakfast', recipeId: 'blueberry-pancakes' },
    ]);
    setVersions(initialRecipeVersions);
    setReviews(initialReviews);
    setPantry(['Artisan Pasta', 'Extra Virgin Olive Oil', 'Garlic', 'Tomatoes', 'Lemon', 'Ricotta']);
    setAllUsers(demoUsers);
    setCurrentUserId(demoUsers[0].id);

    toast.success('Relational database reset to canonical demo state');
  };

  return (
    <VaultContext.Provider
      value={{
        theme,
        setTheme,
        currentUser,
        allUsers,
        isAuthenticated,
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
        restoreRecipeVersion,
        ingredients: masterIngredients,
        pantry,
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
        reviews,
        addReview,
        preferences,
        togglePreference,
        resetDatabase,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const value = useContext(VaultContext);
  if (!value) throw new Error('useVault must be used within a VaultProvider');
  return value;
}