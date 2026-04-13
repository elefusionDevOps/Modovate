import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { MapPin, Home, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHomeowner } from "@/context/HomeownerContext";
import { usePlacesAutocomplete, getStaticMapUrl } from "@/hooks/use-places-autocomplete";

const satelliteImg = `${import.meta.env.BASE_URL}satellite-placeholder.png`;

export default function Welcome() {
  useDocumentTitle("Welcome");
  const [, setLocation] = useLocation();
  const { address, currentScreen, setAddress, resetState } = useHomeowner();
  const [inputValue, setInputValue] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const hasExistingSession = !!(address && currentScreen > 1);

  const screenRoutes: Record<number, string> = {
    2: "/intake",
    3: "/assessment",
    4: "/recommendations",
    5: "/equipment/heat_pump",
    6: "/rebates",
    7: "/contractors",
    8: "/summary",
  };

  const handlePlaceSelect = useCallback((result: { formatted_address: string; lat: number; lng: number }) => {
    setInputValue(result.formatted_address);
    setCoords({ lat: result.lat, lng: result.lng });
  }, []);

  const {
    suggestions,
    showDropdown,
    fetchSuggestions,
    selectSuggestion,
    dismissDropdown,
  } = usePlacesAutocomplete(handlePlaceSelect);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setCoords(null);
    fetchSuggestions(val);
  };

  const handleContinue = () => {
    if (!inputValue.trim()) return;
    resetState();
    setAddress(inputValue);
    if (coords && !isNaN(coords.lat) && !isNaN(coords.lng)) {
      sessionStorage.setItem("modovate_coords", JSON.stringify(coords));
    }
    setLocation("/intake");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleContinue();
    }
  };

  const satelliteSrc = coords && !isNaN(coords.lat) && !isNaN(coords.lng)
    ? getStaticMapUrl(coords.lat, coords.lng, 800, 600, 19)
    : satelliteImg;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col font-sans">
      <header className="w-full px-8 py-5 flex items-center justify-between">
        <span className="font-display font-bold text-xl tracking-tight text-foreground">Modovate</span>
        <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:bg-muted transition-colors" data-testid="button-user-menu">
          <User className="h-4.5 w-4.5" />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 pt-10 pb-6">
        <div className="w-full max-w-2xl text-center space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="font-display font-bold text-[2.75rem] sm:text-5xl text-foreground tracking-tight leading-[1.12]">
            Your home's energy upgrade,{"\n"}engineered for you.
          </h1>
          <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Answer a few questions and get a personalized energy upgrade plan
            with real rebates, matched contractors, and an ROI breakdown.
          </p>
        </div>

        <div className="w-full max-w-[540px] mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <MapPin className="h-5 w-5 text-secondary fill-secondary/20" />
            </div>
            <input
              type="text"
              placeholder="Enter your home address — e.g., 142 Maple Street, Toronto, ON"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={dismissDropdown}
              autoComplete="off"
              className="w-full h-14 pl-12 pr-5 rounded-xl text-[15px] bg-card border border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-muted-foreground/50"
              data-testid="input-address"
            />
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s.placeId}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      selectSuggestion(s);
                      setInputValue(s.description);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-muted/60 transition-colors flex items-center gap-3 border-b border-border/30 last:border-b-0"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{s.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-border/30">
            <img
              src={satelliteSrc}
              alt="Satellite aerial view of a residential neighborhood"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "center 55%" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="inline-block px-3 py-1.5 bg-secondary/90 text-secondary-foreground text-xs font-semibold tracking-wider uppercase rounded-md shadow-md">
                Satellite View
              </span>
            </div>
            {!coords && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-11 h-11 rounded-full bg-primary/90 flex items-center justify-center shadow-xl ring-3 ring-white/30">
                  <Home className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 pt-2">
            <Button
              onClick={handleContinue}
              className="h-14 px-12 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground text-base font-semibold shadow-lg transition-all hover:shadow-xl"
              data-testid="button-get-report"
            >
              Get My Home Energy Report
            </Button>
            {hasExistingSession && (
              <button
                onClick={() => setLocation(screenRoutes[currentScreen] || "/intake")}
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
                data-testid="button-continue-session"
              >
                Continue where you left off
              </button>
            )}
            <p className="text-sm text-muted-foreground">
              Built for Ontario's <span className="font-bold text-foreground">$11 billion</span> in available energy incentives.
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full px-8 py-5 flex items-center justify-between border-t border-border/40">
        <span className="text-sm text-muted-foreground">© 2024 Modovate. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Use</a>
        </div>
      </footer>
    </div>
  );
}
