import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { MapPin, Home, Calendar, Ruler, Thermometer, DollarSign, Gauge } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHomeowner } from "@/context/HomeownerContext";
import { lookupAddressProfile, getEnerGuideRating, getEstimatedAnnualEnergyCost } from "@/lib/energy-calculator";
import type { HeatingSystem } from "@/lib/energy-calculator";
import Layout from "@/components/layout";

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

  const propertyCards = [
    { icon: Ruler, label: "Estimated Sq Ft", value: profile.estimatedSqft.toLocaleString() + " sq ft" },
    { icon: Calendar, label: "Year Built", value: profile.yearBuilt.toString() },
    { icon: Home, label: "Roof Area", value: profile.roofAreaSqm + " m²" },
    { icon: Thermometer, label: "Climate Zone", value: profile.climateZone },
    { icon: DollarSign, label: "Est. Annual Energy Cost", value: "$" + annualEnergyCost.toLocaleString() },
    { icon: Gauge, label: "EnerGuide Rating", value: energuideRating + " / 100" },
  ];

  const ratingPercent = energuideRating;

  return (
    <Layout step={3}>
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground tracking-tight">
            Property Assessment
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">{address || "Your home"}</p>
        </div>

        <div className="w-full aspect-[2.5/1] bg-muted rounded-2xl border border-border overflow-hidden relative flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
          <div className="relative flex flex-col items-center gap-3 bg-background/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-border/50">
            <MapPin className="h-10 w-10 text-secondary" />
            <span className="font-display font-semibold text-lg text-foreground">Satellite View</span>
            <span className="text-sm text-muted-foreground text-center max-w-[300px]">{address || "Address"}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {propertyCards.map((card) => (
            <Card key={card.label} className="border-border/50 shadow-sm hover:shadow-md transition-shadow" data-testid={`card-${card.label.toLowerCase().replace(/\s+/g, "-")}`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <card.icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">{card.label}</span>
                </div>
                <p className="text-2xl font-display font-bold text-foreground">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="font-display font-semibold text-lg text-foreground">Baseline Energy Rating</h3>
          <div className="relative h-6 rounded-full overflow-hidden bg-gradient-to-r from-red-400 via-yellow-400 to-green-500">
            <div
              className="absolute top-0 h-full w-1 bg-foreground rounded-full shadow-md"
              style={{ left: `${ratingPercent}%`, transform: "translateX(-50%)" }}
            />
            <div
              className="absolute -top-7 flex flex-col items-center"
              style={{ left: `${ratingPercent}%`, transform: "translateX(-50%)" }}
            >
              <span className="text-xs font-bold text-foreground bg-background px-2 py-0.5 rounded border border-border shadow-sm">
                {energuideRating}
              </span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Poor (0)</span>
            <span>Excellent (100)</span>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={() => setLocation("/recommendations")}
            className="h-14 px-10 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg font-medium shadow-lg"
            data-testid="button-continue-recommendations"
          >
            Continue to Recommendations
          </Button>
        </div>
      </div>
    </Layout>
  );
}
