import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHomeowner } from "@/context/HomeownerContext";

interface LayoutProps {
  children: ReactNode;
  step?: number;
  totalSteps?: number;
  hideNav?: boolean;
}

export default function Layout({ children, step, totalSteps = 8, hideNav = false }: LayoutProps) {
  const [, setLocation] = useLocation();
  const { currentScreen, setCurrentScreen } = useHomeowner();

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col font-sans">
      {!hideNav && (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
          <div className="container mx-auto max-w-5xl h-16 flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="text-foreground hover:bg-muted"
                data-testid="button-back"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Link href="/" className="font-display font-bold text-xl tracking-tight text-primary">
                Modovate
              </Link>
            </div>
            {step && (
              <div className="text-sm font-medium text-muted-foreground">
                Step {step} of {totalSteps}
              </div>
            )}
          </div>
        </header>
      )}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
