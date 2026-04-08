import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Thermometer, Home, Zap, Sun, Car, Battery, SquareStack, ArrowRight, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHomeowner } from "@/context/HomeownerContext";
import { getRecommendations } from "@/lib/energy-calculator";
import type { UpgradeCategory, UpgradeRecommendation } from "@/lib/energy-calculator";
import Layout from "@/components/layout";

const categoryIcons: Record<string, typeof Thermometer> = {
  heat_pump: Thermometer,
  insulation: Home,
  electrical_panel: Zap,
  solar_pv: Sun,
  ev_charger: Car,
  battery_storage: Battery,
  windows: SquareStack,
};

export default function Recommendations() {
  const [, setLocation] = useLocation();
  const { intakeAnswers, homeProfile, selectedUpgrades, toggleUpgrade, setCurrentScreen } = useHomeowner();

  useEffect(() => {
    setCurrentScreen(4);
  }, [setCurrentScreen]);

  const recommendations = useMemo(() => {
    if (!intakeAnswers || !homeProfile) return [];
    return getRecommendations(intakeAnswers, homeProfile);
  }, [intakeAnswers, homeProfile]);

  const handleExplore = (rec: UpgradeRecommendation) => {
    if (rec.category === "heat_pump") {
      setLocation("/equipment");
    } else {
      toggleUpgrade(rec.category);
    }
  };

  const isSelected = (category: UpgradeCategory) => selectedUpgrades.includes(category);

  return (
    <Layout step={4}>
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground tracking-tight">
            Your Personalized Upgrade Plan
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Based on your home profile and goals, we recommend these energy upgrades.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {recommendations.map((rec) => {
            const Icon = categoryIcons[rec.category] || Zap;
            const selected = isSelected(rec.category);

            return (
              <Card
                key={rec.category}
                className={`border transition-all duration-200 ${
                  selected ? "border-primary shadow-md ring-1 ring-primary/20" : "border-border/50 shadow-sm hover:shadow-md"
                }`}
                data-testid={`card-recommendation-${rec.category}`}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg text-foreground">{rec.label}</h3>
                        {rec.priority === "high" && (
                          <Badge variant="default" className="mt-1 bg-primary/10 text-primary border-0 text-xs">
                            High Priority
                          </Badge>
                        )}
                        {rec.priority === "medium" && (
                          <Badge variant="secondary" className="mt-1 text-xs">Recommended</Badge>
                        )}
                      </div>
                    </div>
                    {selected && <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">{rec.description}</p>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs font-medium">
                      ${rec.costMin.toLocaleString()} – ${rec.costMax.toLocaleString()}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-medium text-green-700 border-green-200 bg-green-50">
                      Save ${rec.annualSavingsMin.toLocaleString()} – ${rec.annualSavingsMax.toLocaleString()}/yr
                    </Badge>
                    {rec.hasRebates && (
                      <Badge className="text-xs bg-secondary/10 text-secondary border-secondary/20 border">
                        Rebates Available
                      </Badge>
                    )}
                  </div>

                  <Button
                    onClick={() => handleExplore(rec)}
                    variant={selected ? "outline" : "default"}
                    className={`w-full rounded-full ${
                      rec.category === "heat_pump" && !selected
                        ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                        : selected
                        ? ""
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    }`}
                    data-testid={`button-explore-${rec.category}`}
                  >
                    {rec.category === "heat_pump" ? (
                      <>Explore Equipment Options <ArrowRight className="ml-2 h-4 w-4" /></>
                    ) : selected ? (
                      "Remove from Project"
                    ) : (
                      "Add to Project"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedUpgrades.length > 0 && (
          <div className="bg-card border border-border/50 rounded-2xl p-6 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <p className="font-display font-semibold text-lg text-foreground">
                {selectedUpgrades.length} upgrade{selectedUpgrades.length > 1 ? "s" : ""} selected
              </p>
              <p className="text-sm text-muted-foreground">Ready to see matched contractors and rebates?</p>
            </div>
            <Button
              onClick={() => setLocation("/rebates")}
              className="rounded-full h-12 px-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium shadow-lg"
              data-testid="button-view-rebates"
            >
              View Rebates
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
