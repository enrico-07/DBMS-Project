import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CheckCheck,
  Trash2,
  Bookmark,
  Calendar,
  Sprout,
  ChefHat,
  Info,
  ExternalLink,
  Inbox,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useVault, type VaultNotification } from "@/components/vault-provider";

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  } catch {
    return "Recently";
  }
}

function getNotificationIcon(type: VaultNotification["type"]) {
  switch (type) {
    case "save":
      return <Bookmark size={15} className="text-honey fill-honey/20" />;
    case "plan":
      return <Calendar size={15} className="text-clay" />;
    case "pantry":
      return <Sprout size={15} className="text-sage" />;
    case "recipe":
      return <ChefHat size={15} className="text-primary" />;
    case "system":
    default:
      return <Info size={15} className="text-amber-500" />;
  }
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const navigate = useNavigate();

  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
  } = useVault();

  const displayedNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.read : true,
  );

  const handleNotificationClick = (n: VaultNotification) => {
    markNotificationAsRead(n.id);
    if (n.link) {
      setOpen(false);
      navigate({ to: n.link as any });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-colors"
          aria-label="View activity notifications"
          title="Notification center & activity"
        >
          <Bell size={17} />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm ring-2 ring-background animate-in zoom-in-50 duration-200">
              {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-card border-l border-border">
        {/* Header */}
        <SheetHeader className="p-5 border-b border-border bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-primary/10 text-primary">
                <Bell size={16} />
              </div>
              <SheetTitle className="text-base font-serif font-semibold">Kitchen Activity</SheetTitle>
              {unreadNotificationsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary">
                  {unreadNotificationsCount} new
                </span>
              )}
            </div>
          </div>
          <SheetDescription className="text-xs text-muted-foreground mt-1">
            Real-time culinary updates, pantry restocks, and meal planner logs.
          </SheetDescription>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-3 mt-1 border-t border-border/50 text-xs">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === "all"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === "unread"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                Unread ({unreadNotificationsCount})
              </button>
            </div>

            <div className="flex items-center gap-1">
              {unreadNotificationsCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsAsRead}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
                  title="Mark all notifications as read"
                >
                  <CheckCheck size={13} />
                  <span>Mark all read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearNotifications}
                  className="text-muted-foreground hover:text-destructive p-1 rounded-md hover:bg-destructive/10 transition-colors"
                  title="Clear all notifications"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Notification Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {displayedNotifications.length === 0 ? (
            <div className="py-16 text-center space-y-3 px-6">
              <div className="w-12 h-12 rounded-2xl bg-muted/70 flex items-center justify-center mx-auto text-muted-foreground">
                <Inbox size={22} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">All caught up!</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                {filter === "unread"
                  ? "You have no unread notifications. Check back when you save new recipes or update meal plans."
                  : "No recent notifications in your kitchen activity log."}
              </p>
            </div>
          ) : (
            displayedNotifications.map((n) => (
              <div
                key={n.id}
                role="button"
                tabIndex={0}
                onClick={() => handleNotificationClick(n)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleNotificationClick(n);
                  }
                }}
                className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer text-left flex gap-3 ${
                  n.read
                    ? "bg-card/40 border-border/60 hover:bg-card hover:border-border"
                    : "bg-card border-primary/20 shadow-xs hover:border-primary/40 hover:bg-accent/40"
                }`}
              >
                {/* Icon bubble */}
                <div className="shrink-0 w-8 h-8 rounded-xl bg-muted/80 flex items-center justify-center mt-0.5">
                  {getNotificationIcon(n.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-semibold text-foreground truncate">{n.title}</h4>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-clay shrink-0" />}
                  </div>
                  <p className="text-[11.5px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                    {n.description}
                  </p>
                  <span className="text-[10px] text-muted-foreground/80 mt-1.5 inline-block tabular-nums">
                    {formatRelativeTime(n.timestamp)}
                  </span>
                </div>

                {/* Arrow hint */}
                {n.link && (
                  <ExternalLink
                    size={12}
                    className="text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0 self-center"
                  />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-border bg-card/40 text-center">
          <span className="text-[10.5px] text-muted-foreground">
            Activity is synchronized with your local kitchen vault
          </span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
