import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 h-10 w-10 rounded-full shadow-lg border border-border bg-card/90 text-foreground backdrop-blur-md hover:bg-card hover:scale-110 active:scale-95 transition-all duration-300 animate-in fade-in zoom-in-75"
      aria-label="Scroll back to top of page"
      title="Scroll back to top"
    >
      <ArrowUp size={16} />
    </Button>
  );
}
