import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { ExternalLink, Shield, CheckCircle, User, Settings, ChevronLeft } from "lucide-react";
import { useHomeowner } from "@/context/HomeownerContext";
import { getApplicableRebates } from "@/lib/energy-calculator";
import type { UpgradeCategory } from "@/lib/energy-calculator";

const levelColors: Record<string, { bg: string; text: string; border: string }> = {
  federal: { bg: "bg-primary", text: "text-primary-foreground", border: "border-primary" },
  provincial: { bg: "bg-secondary", text: "text-secondary-foreground", border: "border-secondary" },
  utility: { bg: "bg-[#4a6741]", text: "text-white", border: "border-[#4a6741]" },
};

const levelLabels: Record<string, string> = {
  federal: "Federal",
  provincial: "Ontario",
  utility: "Utility",
};

const defaultUpgrades: UpgradeCategory[] = ["heat_pump", "insulation", "electrical_panel", "solar_pv"];

export default function Rebates() {
  useDocumentTitle("Available Rebates");
  const [, setLocation] = useLocation();
  const { selectedUpgrades, address, setCurrentScreen } = useHomeowner();

  useEffect(() => {
    setCurrentScreen(6);
  }, [setCurrentScreen]);

  const upgrades = selectedUpgrades.length > 0 ? selectedUpgrades : defaultUpgrades;
  const rebates = useMemo(() => getApplicableRebates(upgrades, address), [upgrades, address]);
  const grants = rebates.filter((r) => !r.isLoan);
  const loans = rebates.filter((r) => r.isLoan);
  const totalGrants = grants.reduce((sum, r) => sum + r.amount, 0);
  const basePath = import.meta.env.BASE_URL || "/";

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col font-sans">
      <header className="w-full px-4 md:px-8 py-4 flex items-center justify-between bg-background border-b border-border/30">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => setLocation("/recommendations")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-back"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">Modovate</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => setLocation("/assessment")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home Profile</button>
          <button onClick={() => setLocation("/recommendations")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Energy Journey</button>
          <span className="text-sm font-semibold text-foreground">Rebates</span>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</a>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center">
            <Settings className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </header>

      <div className="w-full bg-primary py-8 md:py-10 text-center px-4">
        <p className="font-display font-bold text-[36px] md:text-[48px] text-primary-foreground tracking-tight">
          ${totalGrants.toLocaleString()}
        </p>
        <p className="text-primary-foreground/70 text-[15px] mt-1">
          in rebates and incentives available for your selected upgrades
        </p>
      </div>

      <main className="flex-1 px-4 md:px-8 py-8 md:py-10 max-w-[960px] mx-auto w-full">
        <div className="mb-8">
          <h2 className="font-display font-bold text-[28px] text-foreground tracking-tight">
            Available Programs for Your Upgrade Plan
          </h2>
          <p className="text-muted-foreground text-[15px] mt-2 leading-relaxed max-w-[640px]">
            You may be eligible for the following federal and Ontario programs based on your selected upgrades. Programs can be stacked for maximum benefit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {grants.map((rebate) => {
            const colors = levelColors[rebate.level] || levelColors.federal;
            const label = levelLabels[rebate.level] || rebate.level;

            return (
              <div
                key={rebate.programId}
                className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col"
                data-testid={`card-rebate-${rebate.programId}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[10px] font-bold tracking-[0.1em] uppercase px-2.5 py-1 rounded ${colors.bg} ${colors.text}`}>
                    {label}
                  </span>
                  <span className="font-display font-bold text-[28px] text-foreground leading-none">
                    {rebate.amount > 0 ? `$${rebate.amount.toLocaleString()}` : "Varies"}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-foreground mb-0.5">{rebate.name}</h3>
                <p className="text-xs text-muted-foreground/70 mb-3">{rebate.administrator}</p>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                  {rebate.notes}
                </p>

                {rebate.applicationUrl && (
                  <a
                    href={rebate.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Learn more at {new URL(rebate.applicationUrl).hostname.replace("www.", "")}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {loans.length > 0 && (
          <div className="mb-10">
            <h3 className="font-display font-bold text-xl text-foreground mb-1">Financing Options</h3>
            <p className="text-muted-foreground text-sm mb-4">Interest-free loans and forgivable loan programs to help fund your upgrades.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {loans.map((loan) => {
                const colors = levelColors[loan.level] || levelColors.federal;
                const label = levelLabels[loan.level] || loan.level;
                return (
                  <div
                    key={loan.programId}
                    className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col border-l-4"
                    style={{ borderLeftColor: loan.level === "federal" ? "#002428" : "#795900" }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`text-[10px] font-bold tracking-[0.1em] uppercase px-2.5 py-1 rounded ${colors.bg} ${colors.text}`}>
                        {label} Loan
                      </span>
                      <span className="font-display font-bold text-[22px] text-foreground leading-none">
                        up to ${loan.amount.toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-base text-foreground mb-0.5">{loan.name}</h3>
                    <p className="text-xs text-muted-foreground/70 mb-3">{loan.administrator}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{loan.notes}</p>
                    {loan.applicationUrl && (
                      <a
                        href={loan.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Learn more at {new URL(loan.applicationUrl).hostname.replace("www.", "")}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card border border-border/50 rounded-xl px-5 md:px-6 py-4 mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-foreground">
              Your selected upgrades qualify for an estimated <strong>${totalGrants.toLocaleString()}</strong> in stacked rebates.
            </p>
          </div>
          <p className="text-xs text-muted-foreground italic">Individual program eligibility conditions apply.</p>
        </div>

        <div className="flex justify-center mb-16">
          <button
            onClick={() => setLocation("/contractors")}
            className="h-14 px-10 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground text-base font-semibold shadow-lg transition-all"
            data-testid="button-continue-contractors"
          >
            Add Rebates to My Project Plan
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-10">
          <div className="flex-1 space-y-5">
            <h2 className="font-display font-bold text-[28px] text-foreground tracking-tight">
              Stack Your Savings
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[400px]">
              Our intelligence engine automatically identifies the optimal combination of federal, provincial, and utility rebates to minimize your out-of-pocket expenses while maximizing home efficiency.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground font-medium">Automatic eligibility matching</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground font-medium">Verified program compatibility</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground font-medium">Streamlined documentation prep</span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-[400px] h-[220px] md:h-[280px] rounded-2xl overflow-hidden flex-shrink-0">
            <img
              src={`${basePath}modern-home-solar.png`}
              alt="Modern home with solar panels"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </main>

      <footer className="w-full px-4 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3 border-t border-border/40">
        <span className="font-display font-bold text-lg text-foreground">Modovate</span>
        <div className="flex items-center gap-4 md:gap-6">
          <a href="#" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
        </div>
        <span className="text-sm text-muted-foreground">© 2024 Editorial Intelligence. All rights reserved.</span>
      </footer>
    </div>
  );
}
