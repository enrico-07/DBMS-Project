import { Link, useRouter, useRouterState } from '@tanstack/react-router';
import { useState, useEffect, type ReactNode } from 'react';
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
  ShoppingBag,
  PanelLeftClose,
  PanelLeft,
  User,
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
  { to: '/ingredients' as const, label: 'Pantry', icon: ShoppingBag },
  { to: '/nutrition' as const, label: 'Nutrition & wellbeing', icon: HeartPulse },
  { to: '/profile' as const, label: 'Kitchen profile', icon: User },
  { to: '/settings' as const, label: 'Settings', icon: Settings2 },
];

export function VaultShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const router = useRouter();
  const path = useRouterState({ select: s => s.location.pathname });
  const { currentUser, theme, setTheme, logoutUser, isAuthenticated } = useVault();

  const showCollapsed = desktopCollapsed && !open;

  // Close mobile sidebar on Escape key & lock scroll when drawer open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open]);

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
      <header className="mobile-header flex items-center justify-between px-3.5 py-2.5">
        <Link to="/" className="brand flex items-center gap-2 min-w-0" onClick={() => setOpen(false)}>
          <RecipeVaultLogo size={28} className="shrink-0" />
          <span className="truncate text-lg sm:text-xl font-serif font-bold tracking-tight">
            RecipeVault<span className="text-clay">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          <NotificationCenter />
          <Link
            to="/profile"
            className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold text-xs shadow-2xs hover:ring-2 hover:ring-primary/40 transition-all shrink-0 cursor-pointer"
            title={`Chef ${currentUser.name} · View kitchen profile`}
            aria-label="Chef profile"
            onClick={() => setOpen(false)}
          >
            {currentUser.avatar}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8.5 w-8.5 text-foreground rounded-full hover:bg-muted cursor-pointer"
            aria-label={open ? 'Close navigation drawer' : 'Open navigation drawer'}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </Button>
        </div>
      </header>

      {/* Main Persistent Shelf Sidebar */}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''} ${showCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Sidebar Header with Brand and Close/Collapse Controls */}
        {showCollapsed ? (
          <div className="flex flex-col items-center w-full mb-3 shrink-0">
            <Link
              to="/"
              className="flex items-center justify-center p-1 rounded-xl hover:bg-card/80 transition-colors"
              title="RecipeVault - Discover recipes"
            >
              <RecipeVaultLogo size={32} className="shrink-0" />
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 w-full mb-1 shrink-0">
            <Link
              to="/"
              className="brand flex items-center gap-2.5 min-w-0"
              onClick={() => setOpen(false)}
              title="RecipeVault - Discover recipes"
            >
              <RecipeVaultLogo size={32} className="shrink-0" />
              <span className="truncate">
                RecipeVault<span className="text-clay">.</span>
              </span>
            </Link>

            {/* Close button for Mobile Slide-Out Drawer */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer shrink-0 md:hidden"
              onClick={() => setOpen(false)}
              aria-label="Close sidebar"
              title="Close sidebar"
            >
              <X size={18} />
            </Button>

            {/* Collapse Toggle on Desktop */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer shrink-0 hidden md:flex"
              onClick={() => setDesktopCollapsed(true)}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={17} />
            </Button>
          </div>
        )}
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
              <Link to={to} onClick={() => setOpen(false)} title={label}>
                <Icon size={17} className="shrink-0" />
                <span className="nav-item-text">{label}</span>
                {path === to && <span className="active-dot" />}
              </Link>
            </Button>
          ))}
        </div>

        {/* Add Recipe Action */}
        <Button asChild className="sidebar-add">
          <Link to="/create" onClick={() => setOpen(false)} title="Add a recipe">
            <Plus size={16} className="shrink-0" />
            <span className="sidebar-add-text">Add a recipe</span>
          </Link>
        </Button>

        {/* Atmosphere Control in Sidebar (Only for Mobile Slide-Out Drawer) */}
        <div className="md:hidden mt-4 pt-3.5 border-t border-border/60">
          <span className="nav-label block mb-2 px-1 text-[10px] tracking-widest text-muted-foreground/80 font-bold uppercase">
            ATMOSPHERE
          </span>
          <ThemeSlider className="w-full" iconOnly />
        </div>

        {/* Sidebar Bottom Profile & Controls */}
        <div className="mt-auto pt-3 border-t border-border/60 w-full">
          {showCollapsed ? (
            isAuthenticated ? (
              <div className="flex flex-col items-center gap-2 w-full py-1">
                <Link
                  to="/profile"
                  className="flex items-center justify-center p-1 rounded-xl hover:bg-card/80 transition-colors group"
                  title={`Signed in as ${currentUser.name} (${currentUser.role})`}
                >
                  <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold text-xs shadow-2xs ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                    {currentUser.avatar}
                  </span>
                </Link>
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  onClick={handleLogout}
                  title="Sign out of kitchen"
                  aria-label="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center py-1">
                <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to="/login" title="Sign in to kitchen">
                    <LogIn size={15} />
                  </Link>
                </Button>
              </div>
            )
          ) : (
            isAuthenticated ? (
              <div className="flex items-center justify-between gap-2.5 sidebar-bottom-row">
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 flex-1 min-w-0 p-1.5 -ml-1 rounded-xl hover:bg-card/80 transition-colors text-foreground group"
                  onClick={() => setOpen(false)}
                  title={`Signed in as ${currentUser.name} (${currentUser.role})`}
                >
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold text-xs shrink-0 shadow-2xs">
                    {currentUser.avatar}
                  </span>
                  <div className="sidebar-profile-info flex-1 min-w-0 leading-tight">
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
                  <span className="nav-item-text">Sign in to kitchen</span>
                </Link>
              </Button>
            )
          )}
        </div>
      </aside>

      {/* Mobile scrim overlay */}
      {open && <div className="mobile-scrim" onClick={() => setOpen(false)} />}

      {/* Main Content Area */}
      <main className={`main-content ${showCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Clean, Breathable Top Navigation Bar */}
        <header className="vault-topbar">
          <div className="flex items-center gap-4">
            {showCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground shrink-0 hidden md:flex cursor-pointer"
                onClick={() => setDesktopCollapsed(false)}
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeft size={18} />
              </Button>
            )}
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
          <div className="flex items-start justify-between gap-3 sm:gap-6 w-full text-[11px]">
            {/* Left Column: Brand & Descriptor */}
            <div className="text-left min-w-0">
              <div className="flex items-center gap-1 font-semibold text-foreground text-[11px] leading-tight">
                <span>RecipeVault</span>
                <span className="text-primary font-bold">♥</span>
                <span className="hidden sm:inline font-normal text-muted-foreground ml-1">
                  — A Database-Driven Culinary Intelligence System
                </span>
              </div>
              <div className="sm:hidden text-muted-foreground text-[10px] leading-tight mt-0.5 truncate">
                Database-Driven System
              </div>
            </div>

            {/* Right Column: Dedication to Home Cooks */}
            <div className="text-right shrink-0">
              <div className="font-semibold text-foreground sm:text-muted-foreground text-[11px] leading-tight">
                Crafted with love
                <span className="hidden sm:inline font-normal sm:ml-1">
                  for home cooks &amp; food lovers
                </span>
              </div>
              <div className="sm:hidden text-muted-foreground text-[10px] leading-tight mt-0.5">
                for home cooks &amp; food lovers
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Mobile App Bottom Tab Bar (Fixed Dock outside transformed containers) */}
      <nav
        className="mobile-bottom-dock md:hidden fixed bottom-0 inset-x-0 z-50 bg-card/95 border-t border-border/80 backdrop-blur-md px-2 py-1.5 grid grid-cols-5 items-center justify-items-center w-full shadow-lg"
        style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom, 0px))' }}
        aria-label="Mobile Bottom Navigation"
      >
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-medium transition-colors ${
            path === '/' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Compass size={20} className={path === '/' ? 'stroke-[2.4]' : ''} />
          <span className="mt-0.5 tracking-tight">Discover</span>
        </Link>

        <Link
          to="/cookbook"
          className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-medium transition-colors ${
            path === '/cookbook' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen size={20} className={path === '/cookbook' ? 'stroke-[2.4]' : ''} />
          <span className="mt-0.5 tracking-tight">Cookbook</span>
        </Link>

        {/* Elevated Floating Primary Add Button */}
        <Link
          to="/create"
          className="flex items-center justify-center w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-md -mt-5 hover:scale-105 active:scale-95 transition-all border-2 border-background"
          title="Add a new family recipe"
          aria-label="Add a new recipe"
        >
          <Plus size={22} className="stroke-[2.5]" />
        </Link>

        <Link
          to="/planner"
          className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-medium transition-colors ${
            path === '/planner' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <CalendarDays size={20} className={path === '/planner' ? 'stroke-[2.4]' : ''} />
          <span className="mt-0.5 tracking-tight">Planner</span>
        </Link>

        <Link
          to="/ingredients"
          className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-medium transition-colors ${
            path === '/ingredients' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShoppingBag size={20} className={path === '/ingredients' ? 'stroke-[2.4]' : ''} />
          <span className="mt-0.5 tracking-tight">Pantry</span>
        </Link>
      </nav>
    </div>
  );
}
