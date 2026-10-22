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
  LogIn,
  LogOut,
  Sun,
  Sunset,
  Moon,
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
  { to: '/settings' as const, label: 'Settings', icon: Settings2 },
];

export function VaultShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const router = useRouter();
  const path = useRouterState({ select: s => s.location.pathname });
  const { currentUser, theme, logoutUser, isAuthenticated } = useVault();

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

        {/* Navigation Items */}
        <div className="nav-group mt-3">
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

        {/* Sidebar Bottom Profile & Controls */}
        <div className="mt-auto pt-4 border-t border-border/60">
          {isAuthenticated ? (
            <div className="flex items-center justify-between gap-2.5">
              <Link
                to="/profile"
                className="flex items-center gap-2.5 flex-1 min-w-0 p-1.5 -ml-1 rounded-xl hover:bg-card/80 transition-colors text-foreground group"
                onClick={() => setOpen(false)}
                title={`Signed in as ${currentUser.name} (${currentUser.role})`}
              >
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold text-xs shrink-0 shadow-2xs">
                  {currentUser.avatar}
                </span>
                <div className="flex-1 min-w-0 leading-tight">
                  <span className="block text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {currentUser.name}
                  </span>
                  <span className="block text-[11px] text-muted-foreground truncate mt-0.5">
                    {currentUser.role}
                  </span>
                </div>
              </Link>
              <button
                type="button"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer"
                onClick={handleLogout}
                title="Sign out of kitchen"
                aria-label="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Button asChild className="w-full bg-primary text-primary-foreground font-semibold rounded-xl h-9.5">
              <Link to="/login" onClick={() => setOpen(false)}>
                <LogIn size={15} className="mr-2" />
                Sign in to kitchen
              </Link>
            </Button>
          )}
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

            {/* Chef Profile Avatar */}
            <Link
              to="/profile"
              className="w-8.5 h-8.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold text-xs shadow-2xs hover:ring-2 hover:ring-primary/40 hover:scale-105 transition-all shrink-0 cursor-pointer"
              title={`Chef ${currentUser.name} (${currentUser.role}) · View profile & kitchen preferences`}
              aria-label="Chef profile"
            >
              {currentUser.avatar}
            </Link>
          </div>
        </header>

        {children}

        <footer className="page-footer">
          <span>
            RecipeVault <span className="text-primary">♥</span> A Database-Driven Culinary Intelligence System
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
            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-md -mt-4 hover:scale-105 active:scale-95 transition-all"
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
