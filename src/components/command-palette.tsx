import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  Compass,
  BookOpen,
  CalendarDays,
  Sprout,
  HeartPulse,
  Plus,
  Settings2,
  Sun,
  Sunset,
  Moon,
  UserCheck,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Flame,
  Clock,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useVault } from "@/components/vault-provider";
import { toast } from "sonner";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const {
    items,
    setTheme,
    switchUser,
    allUsers,
    currentUser,
    resetDatabase,
    addPantryItem,
  } = useVault();

  const [search, setSearch] = useState("");

  // Keyboard shortcut listener: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Type a recipe name, navigation page, or quick action..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-[360px] p-2">
        <CommandEmpty className="py-8 text-center text-xs text-muted-foreground">
          No matching culinary treasures or actions found.
        </CommandEmpty>

        {/* Recipes Group */}
        <CommandGroup heading="Recipes in Vault">
          {items.slice(0, 5).map((recipe) => (
            <CommandItem
              key={recipe.id}
              value={`${recipe.title} ${recipe.cuisine} ${recipe.diet}`}
              onSelect={() => {
                runCommand(() => {
                  navigate({ to: "/recipe/$id", params: { id: recipe.id } });
                });
              }}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-8 h-8 rounded-lg object-cover shrink-0 border border-border"
                />
                <div>
                  <span className="font-medium text-xs text-foreground block">
                    {recipe.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <span>{recipe.cuisine}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Clock size={11} /> {recipe.time}m
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Flame size={11} className="text-clay" /> {recipe.calories} kcal
                    </span>
                  </span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-semibold">
                {recipe.diet}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator className="my-2" />

        {/* Navigation Group */}
        <CommandGroup heading="Kitchen Navigation">
          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/" }))}
            className="flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer"
          >
            <Compass size={15} className="text-primary" />
            <span className="text-xs">Discover Recipes</span>
            <CommandShortcut>G D</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/cookbook" }))}
            className="flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer"
          >
            <BookOpen size={15} className="text-primary" />
            <span className="text-xs">My Cookbook & Collections</span>
            <CommandShortcut>G C</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/planner" }))}
            className="flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer"
          >
            <CalendarDays size={15} className="text-primary" />
            <span className="text-xs">Weekly Meal Planner</span>
            <CommandShortcut>G P</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/ingredients" }))}
            className="flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer"
          >
            <Sprout size={15} className="text-sage" />
            <span className="text-xs">Ingredient Intelligence Library</span>
            <CommandShortcut>G I</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/nutrition" }))}
            className="flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer"
          >
            <HeartPulse size={15} className="text-rose-500" />
            <span className="text-xs">Nutrition & Wellbeing</span>
            <CommandShortcut>G N</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/profile" }))}
            className="flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer"
          >
            <Settings2 size={15} className="text-muted-foreground" />
            <span className="text-xs">Chef Profile & Dietary Filters</span>
            <CommandShortcut>G S</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-2" />

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/create" }))}
            className="flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer"
          >
            <Plus size={15} className="text-clay" />
            <span className="text-xs font-semibold">Add a New Recipe</span>
            <CommandShortcut>N</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              runCommand(() => {
                setTheme("morning");
                toast.success("Atmosphere changed to Morning Sunshine");
              })
            }
            className="flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer"
          >
            <Sun size={15} className="text-amber-500" />
            <span className="text-xs">Theme: Morning Sunshine</span>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              runCommand(() => {
                setTheme("sunset");
                toast.success("Atmosphere changed to Sunset Artisan Pantry");
              })
            }
            className="flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer"
          >
            <Sunset size={15} className="text-clay" />
            <span className="text-xs">Theme: Sunset Artisan Pantry</span>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              runCommand(() => {
                setTheme("night");
                toast.success("Atmosphere changed to Peaceful Night");
              })
            }
            className="flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer"
          >
            <Moon size={15} className="text-indigo-400" />
            <span className="text-xs">Theme: Peaceful Night</span>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              runCommand(() => {
                addPantryItem("Extra Virgin Olive Oil");
                addPantryItem("Garlic");
                addPantryItem("Artisan Pasta");
                toast.success("Stocked pantry with 3 essential staples!");
              })
            }
            className="flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer"
          >
            <ShoppingBag size={15} className="text-sage" />
            <span className="text-xs">Quick-Stock 3 Pantry Essentials</span>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              runCommand(() => {
                resetDatabase();
              })
            }
            className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-destructive cursor-pointer hover:bg-destructive/10"
          >
            <RotateCcw size={15} />
            <span className="text-xs">Reset Demo Database to Initial State</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-2" />

        {/* Switch Persona Group */}
        <CommandGroup heading="Switch Active Cook">
          {allUsers.map((u) => (
            <CommandItem
              key={u.id}
              onSelect={() =>
                runCommand(() => {
                  switchUser(u.id);
                })
              }
              className="flex items-center justify-between py-2 px-3 rounded-xl cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                  {u.avatar}
                </span>
                <span className="text-xs">{u.name}</span>
                <span className="text-[10px] text-muted-foreground">({u.role})</span>
              </div>
              {currentUser.id === u.id && (
                <span className="text-[10px] text-primary font-semibold">Active</span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
