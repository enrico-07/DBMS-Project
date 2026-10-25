import { useState, useEffect, useRef } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  ChefHat,
  ListFilter,
  Maximize2,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Recipe } from "@/lib/recipes";
import { toast } from "sonner";

export function CookingModeModal({
  recipe,
  open,
  onOpenChange,
}: {
  recipe: Recipe;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min default
  const [timerRunning, setTimerRunning] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const steps = recipe.steps.length > 0 ? recipe.steps : [
    { stepNumber: 1, instruction: "Refer to directions in the recipe description.", durationMinutes: 10 }
  ];

  // Set timer when switching step if step has duration
  useEffect(() => {
    const stepDuration = steps[currentStep]?.durationMinutes;
    if (stepDuration && stepDuration > 0) {
      setTimerSeconds(stepDuration * 60);
      setTimerRunning(false);
    }
  }, [currentStep, steps]);

  // Timer interval
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimerRunning(false);
            toast.success(`⏰ Timer completed for Step ${currentStep + 1}!`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, currentStep]);

  // Keyboard navigation: Left/Right arrows for steps
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && currentStep < steps.length - 1) {
        e.preventDefault();
        setCurrentStep((s) => s + 1);
      } else if (e.key === "ArrowLeft" && currentStep > 0) {
        e.preventDefault();
        setCurrentStep((s) => s - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentStep, steps.length]);

  const toggleStepDone = (idx: number) => {
    setCompletedSteps((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleFinishCooking = () => {
    onOpenChange(false);
    toast.success(`🎉 Delicious! You finished cooking "${recipe.title}". Bon appétit!`);
  };

  const activeStep = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-[90vw] h-[85vh] p-0 overflow-hidden rounded-3xl border border-border bg-card flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-card/60 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ChefHat size={18} />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-serif font-bold text-foreground truncate max-w-sm sm:max-w-md">
                Cook-Along Mode: {recipe.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Step {currentStep + 1} of {steps.length} · Propped counter assistant
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showIngredients ? "default" : "outline"}
              size="sm"
              className="rounded-full text-xs gap-1.5 h-8"
              onClick={() => setShowIngredients(!showIngredients)}
            >
              <ListFilter size={13} />
              <span>{showIngredients ? "Hide Ingredients" : "Ingredients"}</span>
            </Button>
          </div>
        </div>

        {/* Progress bar across top */}
        <div className="w-full h-1.5 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col justify-between">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Step Content */}
            <div className={`${showIngredients ? "lg:col-span-8" : "lg:col-span-12"} space-y-6`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {currentStep + 1}
                  </span>
                  STEP {currentStep + 1} OF {steps.length}
                </span>

                <button
                  type="button"
                  onClick={() => toggleStepDone(currentStep)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    completedSteps.includes(currentStep)
                      ? "bg-sage text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <CheckCircle2 size={14} />
                  <span>{completedSteps.includes(currentStep) ? "Completed" : "Mark as done"}</span>
                </button>
              </div>

              {/* Large Step Instruction */}
              <div className="bg-background/60 border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xs">
                <p className="text-xl sm:text-2xl font-serif text-foreground leading-relaxed sm:leading-loose">
                  {activeStep?.instruction}
                </p>

                {activeStep?.tip && (
                  <div className="mt-6 pt-4 border-t border-border flex items-start gap-2 text-xs text-muted-foreground">
                    <span>
                      <strong className="text-foreground">Chef's Tip:</strong> {activeStep.tip}
                    </span>
                  </div>
                )}
              </div>

              {/* Interactive Kitchen Timer Widget */}
              <div className="bg-card border border-border rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-semibold uppercase">
                      Kitchen Timer
                    </span>
                    <span className="text-2xl sm:text-3xl font-mono font-bold text-foreground tabular-nums">
                      {formatTimer(timerSeconds)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant={timerRunning ? "outline" : "default"}
                    className={`rounded-full gap-1.5 font-semibold text-xs h-9 px-4 ${
                      !timerRunning ? "bg-clay text-white hover:bg-clay/90" : ""
                    }`}
                    onClick={() => setTimerRunning(!timerRunning)}
                  >
                    {timerRunning ? <Pause size={14} /> : <Play size={14} />}
                    {timerRunning ? "Pause Timer" : "Start Timer"}
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full"
                    onClick={() => {
                      setTimerRunning(false);
                      setTimerSeconds((activeStep?.durationMinutes || 5) * 60);
                    }}
                    title="Reset Timer"
                  >
                    <RotateCcw size={14} />
                  </Button>

                  <div className="flex items-center gap-1 border-l border-border pl-2">
                    <button
                      type="button"
                      onClick={() => setTimerSeconds((s) => s + 60)}
                      className="px-2 py-1 text-xs rounded-md bg-muted hover:bg-muted/80 text-foreground"
                    >
                      +1m
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimerSeconds((s) => s + 180)}
                      className="px-2 py-1 text-xs rounded-md bg-muted hover:bg-muted/80 text-foreground"
                    >
                      +3m
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimerSeconds((s) => s + 300)}
                      className="px-2 py-1 text-xs rounded-md bg-muted hover:bg-muted/80 text-foreground"
                    >
                      +5m
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide-out Ingredients Checklist if Open */}
            {showIngredients && (
              <div className="lg:col-span-4 bg-background border border-border rounded-3xl p-5 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Recipe Ingredients
                  </h4>
                  <span className="text-xs text-muted-foreground">{recipe.ingredients.length} items</span>
                </div>
                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                  {recipe.ingredients.map((ing, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-card border border-border/70 text-xs"
                    >
                      <span className="truncate">{ing.name}</span>
                      <span className="text-muted-foreground tabular font-medium shrink-0 ml-2">
                        {ing.quantity} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Step Navigation Bar */}
          <div className="mt-8 pt-4 border-t border-border flex items-center justify-between gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-1 text-xs h-9 px-3"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">Previous Step</span>
              <span className="sm:hidden">Prev</span>
            </Button>

            <div className="hidden sm:flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentStep
                      ? "w-6 bg-primary"
                      : completedSteps.includes(idx)
                      ? "bg-sage"
                      : "bg-muted hover:bg-muted-foreground/30"
                  }`}
                  title={`Jump to step ${idx + 1}`}
                />
              ))}
            </div>

            <span className="sm:hidden text-xs font-semibold text-muted-foreground tabular">
              {currentStep + 1} / {steps.length}
            </span>

            {currentStep < steps.length - 1 ? (
              <Button
                size="sm"
                className="rounded-full bg-clay text-white hover:bg-clay/90 gap-1 text-xs font-semibold shadow-sm h-9 px-3.5"
                onClick={() => {
                  toggleStepDone(currentStep);
                  setCurrentStep((s) => s + 1);
                }}
              >
                <span>Next</span>
                <span className="hidden sm:inline">Step</span>
                <ChevronRight size={14} />
              </Button>
            ) : (
              <Button
                size="sm"
                className="rounded-full bg-sage text-white hover:bg-sage/90 gap-1 text-xs font-semibold shadow-sm h-9 px-3.5"
                onClick={handleFinishCooking}
              >
                <CheckCircle2 size={14} />
                <span>Finish</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
