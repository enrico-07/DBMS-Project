import { Link, useRouter, useRouterState } from '@tanstack/react-router';
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
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVault } from '@/components/vault-provider';
import { ThemeSlider } from '@/components/theme-slider';
import { RecipeVaultLogo } from '@/components/recipe-vault-logo';
import { CommandPalette } from '@/components/command-palette';
import { NotificationCenter } from '@/components/notification-center';
import { BackToTop } from '@/components/back-to-top';

const navigation = [
  { to: '/' as const, label: 'Discover', icon: Compass },
  { to: '/cookbook' as const, label: 'My cookbook', icon: BookOpen },
  { to: '/planner' as const, label: 'Meal planner', icon: CalendarDays },
  { to: '/ingredients' as const, label: 'Ingredient library', icon: Sprout },
  { to: '/nutrition' as const, label: 'Nutrition & wellbeing', icon: HeartPulse },
];

export function VaultShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const router = useRouter();
  const path = useRouterState({ select: s => s.location.pathname });
  const { currentUser, allUsers, switchUser, resetDatabase, pantry, plan, saved, theme, logoutUser, isAuthenticated } = useVault();

  const handleLogout = () => {
    setOpen(false);
    logoutUser();
    router.navigate({ to: '/login', replace: true });
  };

  // If on /login route, present fullscreen auth experience without sidebar/topbar
  if (path === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="app-layout">
      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      {/* Floating Back to Top Button */}
      <BackToTop />

      {/* Mobile Sticky Header */}
      <header className="mobile-header">
        <Link to="/" className="brand">
          <RecipeVaultLogo size={32} />
          RecipeVault<span className="text-clay">.</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-foreground"
            aria-label="Search recipes and commands"
            onClick={() => setCommandOpen(true)}
          >
            <Search size={17} />
          </Button>
          <NotificationCenter />
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
          <RecipeVaultLogo size={32} />
          RecipeVault<span className="text-clay">.</span>
        </Link>
        <p className="sidebar-caption">A LITTLE SPACE FOR GOOD FOOD</p>

        {/* Quick Search in Sidebar */}
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setCommandOpen(true);
          }}
          className="my-3 mx-1 flex items-center justify-between p-2.5 rounded-xl border border-border bg-card/60 hover:bg-card text-muted-foreground hover:text-foreground text-xs shadow-2xs transition-all duration-200 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Search size={14} className="text-primary" />
            <span>Search or jump to...</span>
          </span>
          <kbd className="inline-flex h-4.5 select-none items-center rounded border border-border/80 bg-muted px-1.5 font-mono text-[9px] font-medium text-muted-foreground">
            Ctrl+K
          </kbd>
        </button>

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
        {isAuthenticated && (
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
        )}

        {/* Sidebar Bottom Profile & Controls */}
        <div className="sidebar-bottom">
          <Button asChild variant="ghost" className="nav-item">
            <Link to="/profile" onClick={() => setOpen(false)}>
              <Settings2 size={16} />
              Kitchen preferences
            </Link>
          </Button>

          {isAuthenticated ? (
            <>
              <Button asChild variant="ghost" className="nav-item">
                <Link to="/login" onClick={() => setOpen(false)}>
                  <LogIn size={16} />
                  Account & switch
                </Link>
              </Button>

              <Button
                variant="ghost"
                className="nav-item text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
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
            </>
          ) : (
            <Button asChild className="nav-item bg-primary text-primary-foreground font-semibold">
              <Link to="/login" onClick={() => setOpen(false)}>
                <LogIn size={16} />
                Sign in to kitchen
              </Link>
            </Button>
          )}

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
        {/* Clean, Breathable Top Navigation Bar */}
        <header className="vault-topbar">
          <div className="flex items-center gap-6">
            <div className="topbar-welcome flex items-center gap-2 flex-nowrap whitespace-nowrap">
              {theme === 'morning' ? (
                <Sun size={16} className="text-primary shrink-0 animate-in fade-in zoom-in-75 duration-300" />
              ) : theme === 'night' ? (
                <Moon size={16} className="text-primary shrink-0 animate-in fade-in zoom-in-75 duration-300" />
              ) : (
                <Sunset size={16} className="text-primary shrink-0 animate-in fade-in zoom-in-75 duration-300" />
              )}
              <span className="whitespace-nowrap text-sm">
                {theme === 'morning' ? 'Good morning' : theme === 'sunset' ? 'Good evening' : 'Have a peaceful night'},{' '}
                <strong className="text-foreground ml-0.5">{currentUser.name.split(' ')[0]}</strong>
              </span>
            </div>

            {/* Expansive Quick Search Button (Non-Wrapping) */}
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="hidden md:flex items-center justify-between gap-3 h-9 px-4 rounded-full border border-border bg-card/70 hover:bg-card text-muted-foreground hover:text-foreground text-xs shadow-2xs transition-all duration-200 cursor-pointer min-w-[240px] whitespace-nowrap"
              title="Search recipes, ingredients, and shortcuts (Ctrl+K)"
            >
              <span className="flex items-center gap-2">
                <Search size={14} className="text-primary" />
                <span>Search recipes, ingredients…</span>
              </span>
              <kbd className="pointer-events-none inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-border/80 bg-muted px-1.5 font-mono text-[9px] font-medium text-muted-foreground">
                Ctrl+K
              </kbd>
            </button>
          </div>

          <div className="topbar-actions flex items-center gap-3">
            {/* Atmosphere Slider */}
            <ThemeSlider />

            {/* Notification Center */}
            <NotificationCenter />

            {/* Clean Chef Avatar / Profile Link */}
            <Link
              to="/profile"
              className="flex items-center gap-2 h-9 pl-1 pr-3 rounded-full border border-border bg-card/60 hover:bg-card hover:border-clay/40 transition-all text-xs text-foreground font-medium"
              title="Open profile & kitchen preferences"
            >
              <span className="avatar w-7 h-7 text-xs bg-clay text-white font-bold">{currentUser.avatar}</span>
              <span className="hidden sm:inline font-semibold">{currentUser.name.split(' ')[0]}</span>
            </Link>
          </div>
        </header>

        {children}

        <footer className="page-footer">
          <span>
            RecipeVault <span className="text-clay">♥</span> A Database-Driven Culinary Intelligence System
          </span>
          <span>Crafted with love for home cooks and food lovers</span>
        </footer>

        {/* Mobile Bottom Dock for Fast 1-Tap Navigation */}
        <nav className="mobile-bottom-dock md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 border-t border-border/80 backdrop-blur-md px-3 py-2 flex items-center justify-around">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              path === '/' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Compass size={18} />
            <span>Discover</span>
          </Link>
          <Link
            to="/cookbook"
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              path === '/cookbook' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen size={18} />
            <span>Cookbook</span>
          </Link>
          <Link
            to="/create"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-clay text-white shadow-md -mt-4 hover:scale-105 active:scale-95 transition-all"
            title="Add recipe"
          >
            <Plus size={20} />
          </Link>
          <Link
            to="/planner"
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              path === '/planner' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CalendarDays size={18} />
            <span>Planner</span>
          </Link>
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="flex flex-col items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search size={18} />
            <span>Search</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
