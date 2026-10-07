import { Link, useRouterState } from '@tanstack/react-router';
import { useState, type ReactNode } from 'react';
import {
  BookOpen,
  Compass,
  CalendarDays,
  Sprout,
  HeartPulse,
  Settings2,
  Plus,
  Menu,
  X,
  ChefHat,
  ArrowUpRight,
  RotateCcw,
  UserCheck,
  LogIn,
  LogOut,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  ShoppingBag,
  ShoppingBasket,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVault } from '@/components/vault-provider';
import { ThemeSlider } from '@/components/theme-slider';

const navigation = [
  { to: '/' as const, label: 'Discover', icon: Compass },
  { to: '/cookbook' as const, label: 'My cookbook', icon: BookOpen },
  { to: '/planner' as const, label: 'Meal planner', icon: CalendarDays },
  { to: '/ingredients' as const, label: 'Ingredient library', icon: Sprout },
  { to: '/nutrition' as const, label: 'Nutrition & wellbeing', icon: HeartPulse },
];

export function VaultShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: s => s.location.pathname });
  const { currentUser, allUsers, switchUser, resetDatabase, pantry, plan, saved, theme, logoutUser, isAuthenticated } = useVault();

  // If not authenticated or on /login route, present fullscreen auth experience without sidebar/topbar
  if (!isAuthenticated || path === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="app-layout">
      {/* Mobile Sticky Header */}
      <header className="mobile-header">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <ChefHat size={20} />
          </span>
          RecipeVault<span className="text-clay">.</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeSlider compact />
          <Button
            variant="ghost"
            size="icon"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </header>

      {/* Main Persistent Shelf Sidebar */}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">
            <ChefHat size={19} />
          </span>
          RecipeVault<span className="text-clay">.</span>
        </Link>
        <p className="sidebar-caption">A LITTLE SPACE FOR GOOD FOOD</p>

        {/* Navigation Items */}
        <div className="nav-group">
          <span className="nav-label">YOUR KITCHEN</span>
          {navigation.map(({ to, label, icon: Icon }) => (
            <Button
              key={to}
              variant="ghost"
              asChild
              className={`nav-item ${path === to ? 'nav-active' : ''}`}
            >
              <Link to={to} onClick={() => setOpen(false)}>
                <Icon size={17} />
                {label}
                {path === to && <span className="active-dot" />}
              </Link>
            </Button>
          ))}
        </div>

        {/* Add Recipe Action */}
        <Button asChild className="sidebar-add">
          <Link to="/create" onClick={() => setOpen(false)}>
            <Plus size={16} />
            Add a recipe
          </Link>
        </Button>

        {/* Quick Switch Persona Card */}
        <div className="persona-switch-card">
          <div className="persona-label">
            <span>ACTIVE COOK</span>
            <UserCheck size={11} className="text-clay" />
          </div>
          <div className="persona-pills">
            {allUsers.slice(0, 3).map(u => (
              <button
                key={u.id}
                type="button"
                className={`persona-pill ${currentUser.id === u.id ? 'active' : ''}`}
                onClick={() => switchUser(u.id)}
                title={`Switch to ${u.name} (${u.role})`}
              >
                {u.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Bottom Profile & Controls */}
        <div className="sidebar-bottom">
          <Button asChild variant="ghost" className="nav-item">
            <Link to="/profile" onClick={() => setOpen(false)}>
              <Settings2 size={16} />
              Kitchen preferences
            </Link>
          </Button>

          <Button asChild variant="ghost" className="nav-item">
            <Link to="/login" onClick={() => setOpen(false)}>
              <LogIn size={16} />
              Account & switch
            </Link>
          </Button>

          <Button
            variant="ghost"
            className="nav-item text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              setOpen(false);
              logoutUser();
            }}
          >
            <LogOut size={16} />
            Lock & sign out
          </Button>

          <Link to="/profile" className="profile-link" onClick={() => setOpen(false)}>
            <span className="avatar">{currentUser.avatar}</span>
            <div className="overflow-hidden">
              <strong className="truncate">{currentUser.name}</strong>
              <small className="truncate">{currentUser.role}</small>
            </div>
            <ArrowUpRight size={14} className="text-muted-foreground ml-auto shrink-0" />
          </Link>

          <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border text-[9.5px] text-muted-foreground">
            <span>Relational Store · Active</span>
            <button
              type="button"
              onClick={resetDatabase}
              className="flex items-center gap-1 hover:text-clay transition-colors"
              title="Reset database to initial demo state"
            >
              <RotateCcw size={10} /> Reset
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile scrim overlay */}
      {open && <div className="mobile-scrim" onClick={() => setOpen(false)} />}

      {/* Main Content Area */}
      <main className="main-content">
        {/* Sleek Interactive Top Navigation Bar (Replaces empty top gap!) */}
        <header className="vault-topbar">
          <div className="topbar-welcome flex-nowrap whitespace-nowrap">
            {theme === 'morning' ? (
              <Sun size={15} className="text-primary shrink-0 animate-in fade-in zoom-in-75 duration-300" />
            ) : theme === 'night' ? (
              <Moon size={15} className="text-primary shrink-0 animate-in fade-in zoom-in-75 duration-300" />
            ) : (
              <Sunset size={15} className="text-primary shrink-0 animate-in fade-in zoom-in-75 duration-300" />
            )}
            <span className="whitespace-nowrap">
              {theme === 'morning' ? 'Good morning' : theme === 'sunset' ? 'Good evening' : 'Have a peaceful night'},{' '}
              <strong className="text-foreground ml-1">{currentUser.name.split(' ')[0]}</strong>
            </span>
          </div>

          <div className="topbar-actions">
            {/* Color Scheme Slider Toggle */}
            <ThemeSlider />

            {/* Quick Pantry Indicator */}
            <Link to="/" className="topbar-chip" title="View or manage stocked pantry ingredients">
              <ShoppingBag size={13} className="text-sage" />
              <span>
                Pantry: <strong className="tabular">{pantry.length}</strong>
              </span>
            </Link>

            {/* Shopping List Counter */}
            <Link to="/planner" className="topbar-chip" title="Open meal planner & market basket">
              <ShoppingBasket size={13} className="text-clay" />
              <span>
                Planned: <strong className="tabular">{plan.length}</strong>
              </span>
            </Link>

            {/* Saved Recipes Counter */}
            <Link to="/cookbook" className="topbar-chip" title="View saved cookbook recipes">
              <Bookmark size={13} className="text-honey fill-honey" />
              <span>
                Saved: <strong className="tabular">{saved.length}</strong>
              </span>
            </Link>

            {/* Quick Persona Switcher in Header */}
            <div className="topbar-persona-switcher hidden md:flex">
              {allUsers.slice(0, 3).map(u => (
                <button
                  key={u.id}
                  type="button"
                  className={`topbar-persona-btn ${currentUser.id === u.id ? 'active' : ''}`}
                  onClick={() => switchUser(u.id)}
                  title={`Switch to ${u.name}`}
                >
                  {u.name.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Add Recipe Action */}
            <Button asChild size="sm" className="rounded-full bg-clay text-white h-9 px-4 text-xs font-semibold gap-1.5 shadow-sm hover:bg-clay/90">
              <Link to="/create">
                <Plus size={14} /> Add Recipe
              </Link>
            </Button>

            {/* Quick Sign Out Action */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Lock vault & sign out"
              onClick={logoutUser}
            >
              <LogOut size={14} />
            </Button>
          </div>
        </header>

        {children}

        <footer className="page-footer">
          <span>
            RecipeVault <span className="text-clay">♥</span> A Database-Driven Culinary Intelligence System
          </span>
          <span>Crafted with love for home cooks and food lovers</span>
        </footer>
      </main>
    </div>
  );
}