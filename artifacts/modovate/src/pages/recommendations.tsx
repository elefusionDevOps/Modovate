import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Snowflake, Home, Zap, Sun, Car, BatteryCharging, LayoutGrid,
  Compass, TrendingUp, Headphones, Flag, ArrowRight, ChevronLeft,
} from "lucide-react";
import { useHomeowner } from "@/context/HomeownerContext";
import { getRecommendations, lookupAddressProfile } from "@/lib/energy-calculator";
import type { UpgradeRecommendation, IntakeAnswers } from "@/lib/energy-calculator";

const categoryIcons: Record<string, typeof Snowflake> = {
  heat_pump: Snowflake,
  insulation: Home,
  electrical_panel: Zap,
  solar_pv: Sun,
  ev_charger: Car,
  battery_storage: BatteryCharging,
  windows: LayoutGrid,
};

const categoryTags: Record<string, { label: string; color: string }[]> = {
  heat_pump: [],
  insulation: [],
  electrical_panel: [{ label: "Future Ready", color: "text-[#b8860b] bg-[#fef9e7] border-[#f0e0a0]" }],
  solar_pv: [{ label: "30% Tax Credit", color: "text-[#4a6741] bg-[#f0f4ed] border-[#c5cfc0]" }],
  ev_charger: [{ label: "Convenience", color: "text-[#b8860b] bg-[#fef9e7] border-[#f0e0a0]" }],
  battery_storage: [{ label: "Energy Security", color: "text-[#4a6741] bg-[#f0f4ed] border-[#c5cfc0]" }],
  windows: [{ label: "Federal Tax Credit", color: "text-[#4a6741] bg-[#f0f4ed] border-[#c5cfc0]" }],
};

const sidebarItems = [
  { icon: Compass, label: "Overview" },
  { icon: TrendingUp, label: "Upgrades", active: true },
  { icon: Flag, label: "Savings" },
  { icon: Headphones, label: "Support" },
];

export default function Recommendations() {
  const [, setLocation] = useLocation();
  const { intakeAnswers, homeProfile, setCurrentScreen } = useHomeowner();

  useEffect(() => {
    setCurrentScreen(4);
  }, [setCurrentScreen]);

  const defaultIntake: IntakeAnswers = {
    heatingSystem: "gas_furnace",
    homeSize: "medium",
    utilityTypes: ["natural_gas", "electricity"],
    annualUtilitySpend: "2000_3500",
    primaryGoals: ["lower_bills", "comfort"],
  };

  const recommendations = useMemo(() => {
    const intake = intakeAnswers || defaultIntake;
    const profile = homeProfile || lookupAddressProfile("142 Maple Street, Toronto, ON");
    return getRecommendations(intake, profile);
  }, [intakeAnswers, homeProfile]);

  const handleExplore = (rec: UpgradeRecommendation) => {
    setLocation(`/equipment/${rec.category}`);
  };

  const getRebateText = (rec: UpgradeRecommendation) => {
    if (!rec.hasRebates) return null;
    const rebateMax = Math.round(rec.costMax * 0.2);
    return `Up to $${rebateMax.toLocaleString()} rebate`;
  };

  return (
    <div className="min-h-[100dvh] bg-background flex font-sans">
      <aside className="w-[200px] flex-shrink-0 border-r border-border/30 flex flex-col py-6 px-4 sticky top-0 h-screen">
        <div className="mb-10">
          <span className="font-display font-bold text-xl tracking-tight text-foreground">Modovate</span>
          <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/60 mt-0.5">Architectural Advisor</p>
        </div>

        <nav className="flex-1 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? "text-foreground bg-muted/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => setLocation("/assessment")}
          className="w-full py-3 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted/50 transition-colors mb-2"
          data-testid="button-back-assessment"
        >
          <ChevronLeft className="h-4 w-4 inline mr-1" />
          Back
        </button>
        <button
          onClick={() => setLocation("/rebates")}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          data-testid="button-review-plan"
        >
          Review Plan
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="w-full px-8 py-5 flex items-center justify-end">
          <span className="text-sm font-medium text-muted-foreground">Step 3 of 8</span>
        </header>

        <main className="flex-1 px-8 pb-12 max-w-[880px]">
          <div className="mb-8">
            <h1 className="font-display font-bold text-[32px] leading-tight text-foreground tracking-tight">
              Your Personalized Upgrade Plan
            </h1>
            <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed max-w-[560px]">
              Based on your home profile, here are the upgrades with the highest impact for your situation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {recommendations.map((rec) => {
              const Icon = categoryIcons[rec.category] || Zap;
              const isRecommended = rec.priority === "high" || rec.priority === "medium";
              const tags = categoryTags[rec.category] || [];
              const rebateText = getRebateText(rec);
              const savingsAvg = Math.round((rec.annualSavingsMin + rec.annualSavingsMax) / 2);
              const isLastOddItem = recommendations.length % 2 !== 0 && recommendations.indexOf(rec) === recommendations.length - 1;

              return (
                <div
                  key={rec.category}
                  className={`bg-card border border-border/50 rounded-2xl p-6 flex flex-col ${isLastOddItem ? "col-span-2 max-w-[calc(50%-10px)]" : ""}`}
                  data-testid={`card-recommendation-${rec.category}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      {isRecommended && (
                        <span className="inline-block text-[10px] font-bold tracking-[0.1em] uppercase px-2.5 py-1 rounded bg-primary text-primary-foreground mb-3">
                          Recommended
                        </span>
                      )}
                      <h3 className="font-display font-bold text-lg text-foreground leading-snug">{rec.label}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 ml-3">
                      <Icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                    {rec.description}
                  </p>

                  <div className="space-y-3 mb-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        ~${rec.costMin.toLocaleString()} to ${rec.costMax.toLocaleString()} installed
                      </span>
                      <span className="text-xs font-semibold text-[#4a6741] bg-[#e8f5e2] px-2 py-0.5 rounded">
                        Save ~${savingsAvg.toLocaleString()}/yr
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {rebateText && (
                        <span className="text-xs text-muted-foreground">{rebateText}</span>
                      )}
                      {tags.map((tag) => (
                        <span
                          key={tag.label}
                          className={`text-[11px] font-medium px-2 py-0.5 rounded border ${tag.color}`}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleExplore(rec)}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                    data-testid={`button-explore-${rec.category}`}
                  >
                    Explore Options
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-12 bg-primary rounded-2xl p-8 flex items-center gap-8 overflow-hidden relative">
            <div className="flex-1 space-y-4 z-10">
              <h2 className="font-display font-bold text-[28px] leading-tight text-primary-foreground">
                Confused about where to start?
              </h2>
              <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-[340px]">
                Our experts can help you prioritize these upgrades based on your budget and long-term energy goals. Schedule a 15-minute consultation today.
              </p>
              <button className="px-6 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/90 transition-colors">
                Talk to an Advisor
              </button>
            </div>
            <div className="w-[120px] h-[120px] rounded-2xl bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
              <LayoutGrid className="h-12 w-12 text-secondary/80" />
            </div>
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
    </div>
  );
}
