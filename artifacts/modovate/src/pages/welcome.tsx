import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHomeowner } from "@/context/HomeownerContext";
import Layout from "@/components/layout";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { setAddress, resetState, setCurrentScreen } = useHomeowner();
  const [inputValue, setInputValue] = useState("");
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    resetState();
    setCurrentScreen(1);
  }, [resetState, setCurrentScreen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setShowMap(true);
  };

  const handleContinue = () => {
    setAddress(inputValue);
    setLocation("/intake");
  };

  return (
    <Layout hideNav>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto w-full">
        <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="font-display font-bold tracking-tight text-primary text-2xl mb-8">Modovate</h2>
          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-foreground tracking-tight leading-[1.1]">
            Your Home Energy Upgrade Starts Here.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Discover your home's energy potential. We analyze your property to provide a curated, actionable upgrade plan.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto w-full relative">
            <Input
              type="text"
              placeholder="Enter your home address..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="h-14 px-6 rounded-full text-lg shadow-ambient border-border bg-card"
              data-testid="input-address"
            />
            {!showMap && (
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 top-2 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                data-testid="button-submit-address"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            )}
          </form>

          {showMap && (
            <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full max-w-2xl mx-auto">
              <div className="w-full aspect-video bg-muted rounded-2xl border border-border overflow-hidden relative flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-40 grayscale" />
                <div className="relative flex flex-col items-center gap-3 bg-background/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-border/50">
                  <MapPin className="h-8 w-8 text-secondary" />
                  <span className="font-medium text-foreground">Satellite View</span>
                  <span className="text-sm text-muted-foreground text-center max-w-[250px] truncate">{inputValue}</span>
                </div>
              </div>
              <Button
                onClick={handleContinue}
                className="w-full sm:w-auto h-14 px-8 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg font-medium shadow-lg"
                data-testid="button-get-report"
              >
                Get My Home Energy Report
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
