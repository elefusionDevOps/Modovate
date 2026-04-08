import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { DollarSign, TrendingUp, Leaf, Check, Download, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useHomeowner } from "@/context/HomeownerContext";
import { calculateProjectSummary } from "@/lib/energy-calculator";
import equipmentCatalog from "@/data/equipment-catalog.json";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Layout from "@/components/layout";

export default function Summary() {
  const [, setLocation] = useLocation();
  const { selectedUpgrades, selectedProducts, intakeAnswers, homeProfile, setCurrentScreen, resetState } = useHomeowner();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentScreen(8);
  }, [setCurrentScreen]);

  const summary = useMemo(() => {
    if (!intakeAnswers || !homeProfile) return null;
    return calculateProjectSummary(selectedUpgrades, selectedProducts, intakeAnswers, homeProfile);
  }, [selectedUpgrades, selectedProducts, intakeAnswers, homeProfile]);

  if (!summary || !intakeAnswers || !homeProfile) {
    return (
      <Layout step={8}>
        <div className="container mx-auto max-w-5xl px-4 py-16 text-center">
          <h1 className="font-display font-bold text-3xl text-foreground">No Project Data</h1>
          <p className="text-muted-foreground mt-4">Please complete the previous steps to see your project summary.</p>
          <Button onClick={() => { resetState(); setLocation("/"); }} className="mt-8 rounded-full bg-primary text-primary-foreground" data-testid="button-start-over">
            Start Over
          </Button>
        </div>
      </Layout>
    );
  }

  const carsEquivalent = Math.max(1, Math.round(summary.co2ReductionTonnes / 4.6));
  const chartData = summary.tenYearSavings.map((value, i) => ({
    year: `Year ${i + 1}`,
    savings: value,
  }));

  const paybackYear = Math.ceil((summary.paybackYearsMin + summary.paybackYearsMax) / 2);

  return (
    <Layout step={8}>
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground tracking-tight">
            Your Project Summary
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Complete overview of your energy upgrade investment.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <Card className="border-border/50 shadow-sm" data-testid="card-total-cost">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">Total Project Cost</span>
              </div>
              <p className="font-display font-bold text-3xl text-foreground">
                ${summary.totalCostMin.toLocaleString()} – ${summary.totalCostMax.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 shadow-sm bg-green-50/30" data-testid="card-net-cost">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-700" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">Net Cost After Rebates</span>
              </div>
              <p className="font-display font-bold text-3xl text-green-700">
                ${summary.netCostMin.toLocaleString()} – ${summary.netCostMax.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-1">
                ${summary.totalRebates.toLocaleString()} in rebates applied
              </p>
            </CardContent>
          </Card>

          <Card className="border-secondary/30 shadow-sm bg-secondary/5" data-testid="card-annual-savings">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-secondary" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">Annual Savings</span>
              </div>
              <p className="font-display font-bold text-3xl text-secondary">
                ${summary.annualSavingsMin.toLocaleString()} – ${summary.annualSavingsMax.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Per year in energy costs</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-display font-bold text-xl text-foreground mb-2">Payback Timeline</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Estimated break-even in {summary.paybackYearsMin} – {summary.paybackYearsMax} years
                </p>
                <div className="relative">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-secondary to-green-500 rounded-full transition-all" style={{ width: `${Math.min(100, (paybackYear / 15) * 100)}%` }} />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Year 0</span>
                    <span className="text-green-700 font-semibold">Break-even ~Year {paybackYear}</span>
                    <span>Year 15</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-display font-bold text-xl text-foreground mb-4">10-Year Cumulative Savings</h3>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#795900" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#795900" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                      <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                      <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Cumulative Savings"]} contentStyle={{ borderRadius: "12px", border: "1px solid #e5e5e5" }} />
                      <Area type="monotone" dataKey="savings" stroke="#795900" strokeWidth={2.5} fill="url(#savingsGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card className="border-green-200 shadow-sm bg-green-50/30" data-testid="card-co2-reduction">
              <CardContent className="p-6 text-center">
                <Leaf className="h-10 w-10 text-green-700 mx-auto mb-3" />
                <p className="font-display font-bold text-4xl text-green-700">{summary.co2ReductionTonnes}</p>
                <p className="text-sm text-muted-foreground mt-1">tonnes CO2 reduced per year</p>
                <div className="mt-4 bg-green-100 rounded-xl px-4 py-3">
                  <p className="text-sm text-green-800 font-medium">
                    Equivalent to removing {carsEquivalent} car{carsEquivalent > 1 ? "s" : ""} from the road each year
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-display font-bold text-lg text-foreground mb-4">Selected Upgrades</h3>
                <div className="space-y-3">
                  {selectedUpgrades.map((upgrade) => {
                    const catData = equipmentCatalog[upgrade as keyof typeof equipmentCatalog];
                    return (
                      <div key={upgrade} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3.5 w-3.5 text-green-700" />
                        </div>
                        <span className="text-sm text-foreground font-medium">{catData?.label || upgrade.replace(/_/g, " ")}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 pt-4">
          <Button
            onClick={() => setLocation("/contractors")}
            className="h-14 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium shadow-lg"
            data-testid="button-get-quotes"
          >
            Get Contractor Quotes <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            onClick={() => setLocation("/rebates")}
            variant="outline"
            className="h-14 rounded-full border-primary text-primary hover:bg-primary/5 font-medium"
            data-testid="button-apply-rebates"
          >
            Apply for Rebates
          </Button>
          <Button
            onClick={() => toast({ title: "Coming Soon", description: "Report download will be available in the next release." })}
            variant="outline"
            className="h-14 rounded-full font-medium"
            data-testid="button-download-report"
          >
            <Download className="mr-2 h-4 w-4" /> Download Your Report
          </Button>
        </div>
      </div>
    </Layout>
  );
}
