import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/60 dark:bg-muted/30",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmerSweep_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 dark:before:via-white/10 before:to-transparent",
        className,
      )}
      {...props}
    />
  );
}

export function RecipeCardSkeleton() {
  return (
    <div className="recipe-card flex flex-col pointer-events-none select-none border border-border/80">
      {/* Photo Area Skeleton */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/50">
        <Skeleton className="h-full w-full rounded-none" />
        <Skeleton className="absolute top-3 left-3 h-5 w-20 rounded-full" />
        <Skeleton className="absolute top-3 right-3 h-8 w-8 rounded-full" />
      </div>

      {/* Card Content Skeleton */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-2.5">
        <Skeleton className="h-3.5 w-28 rounded-md" />
        <Skeleton className="h-5 w-4/5 rounded-md" />
        <Skeleton className="h-3.5 w-full rounded-md mt-1" />
        <Skeleton className="h-3.5 w-2/3 rounded-md" />

        <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-14 rounded-full" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
          <Skeleton className="h-4 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function RecipeGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function RecipeDetailSkeleton() {
  return (
    <div className="standard-page max-w-5xl mx-auto py-6 sm:py-10 space-y-8 animate-pulse select-none">
      {/* Back button and quick actions */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-24 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>

      {/* Hero Header Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-4">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-10 w-4/5 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4 rounded-md" />

          {/* Metadata badges */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>

        <div className="lg:col-span-5">
          <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
        </div>
      </div>

      {/* Serving Stepper & Action Banner */}
      <div className="bg-card border border-border p-6 rounded-3xl flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-3 w-48 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      {/* Two-Column Recipe Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ingredients Column */}
        <div className="lg:col-span-5 bg-card border border-border p-6 rounded-3xl space-y-4">
          <Skeleton className="h-6 w-36 rounded-md" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded-sm" />
                  <Skeleton className="h-4 w-32 rounded-md" />
                </div>
                <Skeleton className="h-4 w-12 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Directions Column */}
        <div className="lg:col-span-7 bg-card border border-border p-6 rounded-3xl space-y-4">
          <Skeleton className="h-6 w-40 rounded-md" />
          <div className="space-y-5 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="space-y-2 flex-1 pt-1">
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-5/6 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlannerSkeleton() {
  return (
    <div className="standard-page space-y-6 animate-pulse select-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-36 rounded-full" />
        </div>
      </div>

      {/* Week Navigator */}
      <div className="flex items-center justify-between bg-card border border-border p-4 rounded-2xl">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-5 w-48 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      {/* 7 Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-3 w-14 rounded-md" />
            <div className="space-y-2.5 pt-2">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function IngredientGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse select-none">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-28 rounded-md" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-3/4 rounded-md" />
          <Skeleton className="h-3 w-full rounded-md" />
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
