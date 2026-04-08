import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { DollarSign, ExternalLink, Building2, Landmark, Zap, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHomeowner } from "@/context/HomeownerContext";
import { getApplicableRebates } from "@/lib/energy-calculator";
import Layout from "@/components/layout";

const levelIcons: Record<string, typeof Landmark> = {
  federal: Landmark,
  provincial: Building2,
  utility: Zap,
};

export default function Rebates() {
  const [, setLocation] = useLocation();
  const { selectedUpgrades, address, setCurrentScreen } = useHomeowner();

  useEffect(() => {
    setCurrentScreen(6);
  }, [setCurrentScreen]);

  const rebates = useMemo(() => getApplicableRebates(selectedUpgrades, address), [selectedUpgrades, address]);
  const grants = rebates.filter((r) => !r.isLoan);
  const loans = rebates.filter((r) => r.isLoan);
  const totalGrants = grants.reduce((sum, r) => sum + r.amount, 0);

  return (
    <Layout step={6}>
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-500">
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground shadow-lg">
          <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Available for your project</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl mt-2">
            Up to ${totalGrants.toLocaleString()} in rebates
          </h1>
          <p className="mt-3 opacity-80 text-lg">
            Based on {selectedUpgrades.length} selected upgrade{selectedUpgrades.length !== 1 ? "s" : ""}
          </p>
        </div>

        {grants.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-2xl text-foreground">Grants and Rebates</h2>
            <div className="grid gap-4">
              {grants.map((rebate) => {
                const LevelIcon = levelIcons[rebate.level] || DollarSign;
                return (
                  <Card key={rebate.programId} className="border-border/50 shadow-sm hover:shadow-md transition-shadow" data-testid={`card-rebate-${rebate.programId}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                            <LevelIcon className="h-5 w-5 text-green-700" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-display font-bold text-lg text-foreground">{rebate.name}</h3>
                            <p className="text-sm text-muted-foreground">{rebate.administrator}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-xs capitalize">{rebate.level}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-display font-bold text-2xl text-green-700">
                            ${rebate.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                        <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{rebate.notes}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {loans.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-2xl text-foreground">Financing Options</h2>
            <div className="grid gap-4">
              {loans.map((loan) => {
                const LevelIcon = levelIcons[loan.level] || DollarSign;
                return (
                  <Card key={loan.programId} className="border-border/50 shadow-sm" data-testid={`card-loan-${loan.programId}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <LevelIcon className="h-5 w-5 text-blue-700" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-display font-bold text-lg text-foreground">{loan.name}</h3>
                            <p className="text-sm text-muted-foreground">{loan.administrator}</p>
                            <Badge className="mt-2 bg-blue-100 text-blue-700 border-0 text-xs">
                              Interest-Free Loan
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-display font-bold text-2xl text-blue-700">
                            Up to ${loan.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                        <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{loan.notes}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Grant Rebates</p>
              <p className="font-display font-bold text-3xl text-green-700">${totalGrants.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={() => setLocation("/contractors")}
            className="h-14 px-10 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg font-medium shadow-lg"
            data-testid="button-continue-contractors"
          >
            Find Matched Contractors
          </Button>
        </div>
      </div>
    </Layout>
  );
}
