import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { MapPin, LayoutGrid, Calendar, ArrowUpFromDot, FileText, Monitor, PieChart, ArrowRight } from "lucide-react";
import { useHomeowner } from "@/context/HomeownerContext";
import { lookupAddressProfile, getEnerGuideRating, getEstimatedAnnualEnergyCost } from "@/lib/energy-calculator";
import type { HeatingSystem } from "@/lib/energy-calculator";

function getPerformanceLabel(rating: number): string {
  if (rating >= 80) return "Excellent";
  if (rating >= 65) return "Good";
  if (rating >= 50) return "Average";
  if (rating >= 35) return "Below Average";
  return "Poor";
}

function getPerformancePercent(rating: number): number {
  return Math.min(Math.max(rating, 5), 95);
}

export default function Assessment() {
  const [, setLocation] = useLocation();
  const { address, intakeAnswers, setHomeProfile, setCurrentScreen } = useHomeowner();

  useEffect(() => {
    setCurrentScreen(3);
  }, [setCurrentScreen]);

  const profile = useMemo(() => lookupAddressProfile(address), [address]);
  const heatingSystem = (intakeAnswers?.heatingSystem || profile.heatingSystemAssumption) as HeatingSystem;
  const energuideRating = useMemo(() => getEnerGuideRating(profile.yearBuilt, heatingSystem), [profile, heatingSystem]);
  const annualEnergyCost = useMemo(
    () => getEstimatedAnnualEnergyCost(profile.estimatedSqft, profile.yearBuilt, heatingSystem),
    [profile, heatingSystem]
  );

  useEffect(() => {
    setHomeProfile(profile);
  }, [profile, setHomeProfile]);

  const performanceLabel = getPerformanceLabel(energuideRating);
  const markerPercent = getPerformancePercent(energuideRating);
  const potentialSavings = Math.round(annualEnergyCost * 0.33);
  const roofAreaSqft = Math.round(profile.roofAreaSqm * 10.764);

  const propertyCards = [
    { icon: LayoutGrid, label: "Property Size", value: profile.estimatedSqft.toLocaleString() + " sq ft", highlight: false },
    { icon: Calendar, label: "Year Built", value: profile.yearBuilt.toString(), highlight: false },
    { icon: ArrowUpFromDot, label: "Estimated Roof Area", value: roofAreaSqft.toLocaleString() + " sq ft", highlight: false },
    { icon: FileText, label: "Climate Zone", value: profile.climateZone, highlight: false },
    { icon: Monitor, label: "Annual Energy Cost", value: "$" + annualEnergyCost.toLocaleString(), highlight: false },
    { icon: PieChart, label: "Current Energy Rating", value: performanceLabel, highlight: true },
  ];

  const basePath = import.meta.env.BASE_URL || "/";

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col font-sans">
      <header className="w-full px-8 py-4 flex items-center justify-between bg-background z-10">
        <span className="font-display font-bold text-xl tracking-tight text-foreground">Modovate</span>
        <nav className="flex items-center gap-6">
          <span className="text-sm font-semibold text-foreground">Property Assessment</span>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Solutions</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</a>
          <button
            onClick={() => setLocation("/")}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            Edit Address
          </button>
        </nav>
      </header>

      <div className="relative w-full h-[340px] overflow-hidden">
        <img
          src={`${basePath}roof-satellite.png`}
          alt="Aerial view of your property"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />
        <div className="absolute bottom-5 left-8 flex items-center gap-2 bg-foreground/90 text-background px-4 py-2.5 rounded-full text-sm font-medium shadow-lg">
          <MapPin className="h-4 w-4" />
          <span>{address || "142 Maple Street, Toronto, ON"}</span>
        </div>
      </div>

      <main className="flex-1 px-8 py-10 max-w-[960px] mx-auto w-full space-y-10">
        <h1 className="font-display font-bold text-[32px] leading-tight text-foreground tracking-tight">
          Here's what we found about your home.
        </h1>

        <div className="grid grid-cols-3 gap-4">
          {propertyCards.map((card) => (
            <div
              key={card.label}
              className="bg-card border border-border/50 rounded-2xl p-6 flex items-start gap-4"
              data-testid={`card-${card.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="w-11 h-11 rounded-xl bg-[#e8f0f0] flex items-center justify-center flex-shrink-0">
                <card.icon className="h-5 w-5 text-primary" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground/70 mb-1.5">{card.label}</p>
                <p className={`text-[22px] font-display font-bold leading-tight ${card.highlight ? "text-secondary" : "text-foreground"}`}>
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-foreground">Performance Analysis</h2>
            <span className="text-xs font-medium px-3 py-1.5 rounded-full border border-[#c5cfc0] bg-[#f0f4ed] text-[#4a6741]">
              Status: Action Recommended
            </span>
          </div>

          <div className="space-y-2">
            <div className="relative pt-6 pb-1">
              <div
                className="absolute top-0 flex flex-col items-center"
                style={{ left: `${markerPercent}%`, transform: "translateX(-50%)" }}
              >
                <svg width="12" height="8" viewBox="0 0 12 8" className="text-foreground">
                  <polygon points="6,8 0,0 12,0" fill="currentColor" />
                </svg>
              </div>
              <div className="h-3 rounded-full overflow-hidden bg-gradient-to-r from-red-500 via-yellow-400 via-50% to-green-500">
                <div
                  className="absolute top-6 h-3 w-0.5 bg-foreground/60 rounded-full"
                  style={{ left: `${markerPercent}%`, transform: "translateX(-50%)" }}
                />
              </div>
              <div
                className="absolute top-[18px] transform -translate-x-1/2"
                style={{ left: `${markerPercent}%` }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider bg-foreground text-background px-2 py-0.5 rounded whitespace-nowrap">
                  Your Home
                </span>
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-semibold tracking-widest uppercase text-muted-foreground pt-4">
              <span>Poor</span>
              <span>Below Average</span>
              <span>Average</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>

          <div className="flex items-start justify-between gap-8 pt-2">
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[520px]">
              Your home's estimated energy performance is{" "}
              <strong className="text-foreground">{performanceLabel.toLowerCase()}</strong>{" "}
              for Ontario homes of this size and age. Targeted upgrades can move this to Good or Excellent, reducing your annual spend significantly.
            </p>
            <div className="text-right flex-shrink-0">
              <p className="text-3xl font-display font-bold text-foreground">${potentialSavings.toLocaleString()}</p>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a6741] mt-1">Potential Savings / Yr</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-2 pb-4">
          <button
            onClick={() => setLocation("/recommendations")}
            className="h-14 px-10 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg font-semibold shadow-lg transition-all flex items-center gap-3"
            data-testid="button-continue-recommendations"
          >
            See Your Upgrade Recommendations
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </main>

      <footer className="w-full px-8 py-5 flex items-center justify-between border-t border-border/40">
        <span className="text-sm text-muted-foreground">© 2024 Modovate. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact Support</a>
        </div>
      </footer>
    </div>
  );
}
