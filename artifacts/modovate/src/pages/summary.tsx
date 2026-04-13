import { useEffect, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Check, Leaf, MessageSquareMore, FileText, FileDown, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHomeowner } from "@/context/HomeownerContext";
import { calculateProjectSummary, getApplicableRebates } from "@/lib/energy-calculator";
import type { UpgradeCategory } from "@/lib/energy-calculator";
import equipmentCatalog from "@/data/equipment-catalog.json";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

const defaultUpgrades: UpgradeCategory[] = ["heat_pump", "insulation", "electrical_panel", "ev_charger"];

interface UpgradeBreakdownItem {
  label: string;
  cost: number;
  rebate: number;
}

function buildUpgradeBreakdown(
  upgrades: UpgradeCategory[],
  selectedProducts: Record<string, string>
): UpgradeBreakdownItem[] {
  return upgrades.map((cat) => {
    const catData = equipmentCatalog[cat as keyof typeof equipmentCatalog];
    if (!catData) return { label: cat, cost: 0, rebate: 0 };
    const productId = selectedProducts[cat];
    const product = catData.products.find((p) => p.id === productId) || catData.products[0];
    const avgCost = Math.round((product.installedCostMin + product.installedCostMax) / 2);
    return { label: catData.label, cost: avgCost, rebate: 0 };
  });
}

function assignRebatesToBreakdown(
  items: UpgradeBreakdownItem[],
  upgrades: UpgradeCategory[],
  totalRebates: number
): UpgradeBreakdownItem[] {
  const grossTotal = items.reduce((s, i) => s + i.cost, 0);
  if (grossTotal === 0) return items;
  return items.map((item) => ({
    ...item,
    rebate: Math.round((item.cost / grossTotal) * totalRebates),
  }));
}

const fallbackSummary = {
  totalCostMin: 34200,
  totalCostMax: 34200,
  totalRebates: 13400,
  netCostMin: 20800,
  netCostMax: 20800,
  annualSavingsMin: 2100,
  annualSavingsMax: 2100,
  paybackYearsMin: 10,
  paybackYearsMax: 10,
  co2ReductionTonnes: 4.2,
  tenYearSavings: [2100, 4200, 6300, 8400, 10500, 12600, 14700, 16800, 18900, 21000],
};

const fallbackBreakdown: UpgradeBreakdownItem[] = [
  { label: "Heat Pump", cost: 18500, rebate: 6000 },
  { label: "Insulation", cost: 4200, rebate: 1200 },
  { label: "Electrical Panel", cost: 5500, rebate: 3200 },
  { label: "EV Charger", cost: 6000, rebate: 3000 },
];

export default function Summary() {
  useDocumentTitle("Project Summary");
  const [, setLocation] = useLocation();
  const { selectedUpgrades, selectedProducts, intakeAnswers, homeProfile, setCurrentScreen } = useHomeowner();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentScreen(8);
  }, [setCurrentScreen]);

  const hasSession = !!(intakeAnswers && homeProfile);
  const upgrades = selectedUpgrades.length > 0 ? selectedUpgrades : defaultUpgrades;

  const summary = useMemo(() => {
    if (!hasSession) return fallbackSummary;
    return calculateProjectSummary(upgrades, selectedProducts, intakeAnswers!, homeProfile!);
  }, [hasSession, upgrades, selectedProducts, intakeAnswers, homeProfile]);

  const breakdown = useMemo(() => {
    if (!hasSession) return fallbackBreakdown;
    const items = buildUpgradeBreakdown(upgrades, selectedProducts);
    return assignRebatesToBreakdown(items, upgrades, summary.totalRebates);
  }, [hasSession, upgrades, selectedProducts, summary.totalRebates]);

  const grossTotal = breakdown.reduce((s, i) => s + i.cost, 0);
  const totalRebates = breakdown.reduce((s, i) => s + i.rebate, 0);
  const netCost = grossTotal - totalRebates;
  const annualSavings = Math.round((summary.annualSavingsMin + summary.annualSavingsMax) / 2);
  const paybackYear = Math.round((summary.paybackYearsMin + summary.paybackYearsMax) / 2);
  const carsEquivalent = Math.max(1, Math.round(summary.co2ReductionTonnes / 4.6));

  const chartData = [{ year: "Y0", savings: 0 }].concat(
    summary.tenYearSavings.map((value, i) => ({
      year: `Y${i + 1}`,
      savings: value,
    }))
  );

  const handleDownloadReport = useCallback(() => {
    const reportHtml = `
<!DOCTYPE html>
<html>
<head>
<title>Modovate Energy Upgrade Report</title>
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 40px; color: #002428; }
  .header { text-align: center; border-bottom: 3px solid #002428; padding-bottom: 24px; margin-bottom: 32px; }
  .header h1 { font-size: 28px; margin: 0 0 8px; color: #002428; }
  .header p { font-size: 14px; color: #666; margin: 0; }
  .section { margin-bottom: 32px; }
  .section h2 { font-size: 20px; color: #002428; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 16px; }
  .summary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .summary-card { background: #f5f5f0; border-radius: 8px; padding: 20px; text-align: center; }
  .summary-card .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; }
  .summary-card .value { font-size: 28px; font-weight: bold; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #eee; }
  th { background: #002428; color: white; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  .footer { text-align: center; margin-top: 48px; padding-top: 24px; border-top: 2px solid #002428; font-size: 12px; color: #888; }
  .badge { display: inline-block; background: #795900; color: white; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <div class="header">
    <h1>Modovate</h1>
    <p>Your Personalized Energy Upgrade Report</p>
    <p style="margin-top:4px;font-size:12px;">Generated ${new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</p>
  </div>
  <div class="summary-grid">
    <div class="summary-card">
      <div class="label">Total Project Cost</div>
      <div class="value">$${grossTotal.toLocaleString()}</div>
    </div>
    <div class="summary-card">
      <div class="label">Available Rebates</div>
      <div class="value" style="color:#4a6741;">-$${totalRebates.toLocaleString()}</div>
    </div>
    <div class="summary-card">
      <div class="label">Net Cost</div>
      <div class="value" style="color:#795900;">$${netCost.toLocaleString()}</div>
    </div>
  </div>
  <div class="section">
    <h2>Annual Savings</h2>
    <p>Estimated annual savings: <strong>$${annualSavings.toLocaleString()}/year</strong></p>
    <p>Estimated payback period: <strong>${paybackYear} years</strong></p>
    <p>CO2 reduction: <strong>${summary.co2ReductionTonnes.toFixed(1)} tonnes/year</strong></p>
  </div>
  <div class="section">
    <h2>Upgrade Breakdown</h2>
    <table>
      <thead><tr><th>Upgrade</th><th>Estimated Cost</th><th>Rebate</th><th>Net Cost</th></tr></thead>
      <tbody>
        ${breakdown.map((item) => `<tr><td>${item.label}</td><td>$${item.cost.toLocaleString()}</td><td>-$${item.rebate.toLocaleString()}</td><td>$${(item.cost - item.rebate).toLocaleString()}</td></tr>`).join("")}
      </tbody>
    </table>
  </div>
  <div class="section">
    <h2>Environmental Impact</h2>
    <p>Your selected upgrades will reduce approximately <strong>${summary.co2ReductionTonnes.toFixed(1)} tonnes of CO2 per year</strong>, equivalent to taking <strong>${carsEquivalent} car${carsEquivalent > 1 ? "s" : ""}</strong> off the road.</p>
  </div>
  <div class="section">
    <h2>Next Steps</h2>
    <p>1. Review available rebate programs and apply before starting work.</p>
    <p>2. Connect with a verified Modovate contractor for detailed quotes.</p>
    <p>3. Schedule your upgrades to maximize seasonal availability and savings.</p>
  </div>
  <div class="footer">
    <p>This report was generated by Modovate Architectural Advisor.</p>
    <p>Data is based on Ontario energy program information as of 2024. Actual costs, rebates, and savings may vary.</p>
    <p>&copy; 2024 Modovate Editorial Intelligence</p>
  </div>
</body>
</html>`;
    const blob = new Blob([reportHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Modovate-Energy-Report.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Report Downloaded", description: "Your energy upgrade report has been saved." });
  }, [grossTotal, totalRebates, netCost, annualSavings, paybackYear, summary, breakdown, carsEquivalent, toast]);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col font-sans">
      <header className="w-full px-4 md:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => setLocation("/contractors")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-back"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">Modovate</span>
        </div>
        <span className="hidden sm:block text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">
          Your Complete Energy Upgrade Plan
        </span>
      </header>

      <main className="flex-1 px-4 md:px-8 pb-16 max-w-[1000px] mx-auto w-full">
        <div className="mb-8">
          <h1 className="font-display font-bold text-[26px] md:text-[34px] leading-tight text-foreground tracking-tight mb-2">
            Your Modovate Energy Upgrade Plan
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed max-w-[540px]">
            Here is the full picture for your selected upgrades, including costs, rebates, savings, and your environmental impact.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-10">
          <div className="bg-card border border-border/50 rounded-2xl p-5 md:p-6" data-testid="card-total-cost">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground/70 mb-2">
              Total Project Cost
            </p>
            <p className="font-display font-bold text-[28px] md:text-[32px] text-foreground leading-none mb-2">
              ${grossTotal.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Estimated installed cost for all selected upgrades
            </p>
          </div>

          <div className="bg-primary rounded-2xl p-5 md:p-6" data-testid="card-net-cost">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-primary-foreground/70 mb-2">
              After Rebates
            </p>
            <p className="font-display font-bold text-[28px] md:text-[32px] text-primary-foreground leading-none mb-2">
              ${netCost.toLocaleString()}
            </p>
            <p className="text-xs text-primary-foreground/70 leading-relaxed">
              Estimated net cost after stacked rebates of ${totalRebates.toLocaleString()}
            </p>
          </div>

          <div className="bg-card border border-border/50 rounded-2xl p-5 md:p-6" data-testid="card-annual-savings">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground/70 mb-2">
              Estimated Annual Savings
            </p>
            <p className="font-display font-bold text-[28px] md:text-[32px] text-secondary leading-none mb-2">
              ${annualSavings.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Estimated year-over-year savings on energy bills
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h2 className="font-display font-bold text-[22px] text-foreground tracking-tight mb-10">
                Investment Payback Timeline
              </h2>
              <div className="relative mb-4">
                <div className="relative">
                  <div className="absolute -top-7 z-10" style={{ left: `${Math.min(95, (paybackYear / 15) * 100)}%`, transform: "translateX(-50%)" }}>
                    <div className="bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap">
                      Estimated Payback Point
                    </div>
                    <div className="w-0 h-0 mx-auto border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-foreground" />
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-[#3a6b6e] rounded-full"
                      style={{ width: `${Math.min(100, (paybackYear / 15) * 100)}%` }}
                    />
                  </div>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-foreground border-2 border-background shadow-md z-10"
                    style={{ left: `${Math.min(100, (paybackYear / 15) * 100)}%`, transform: "translate(-50%, -50%)" }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Year 0</span>
                  <span>Year 5</span>
                  <span>Year 10</span>
                  <span>Year 15</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                Your upgrades are projected to pay for themselves within{" "}
                <strong className="text-foreground">{paybackYear} years</strong> through cumulative energy savings and immediate tax incentives.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-foreground tracking-tight mb-4">
                Cumulative 10-Year Savings
              </h2>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#002428" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#002428" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e5" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#999" }} axisLine={{ stroke: "#e8e8e5" }} tickLine={false} />
                    <YAxis
                      tickFormatter={(v: number) => v === 0 ? "$0" : `$${(v / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 11, fill: "#999" }}
                      axisLine={false}
                      tickLine={false}
                      width={45}
                    />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Cumulative Savings"]}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "13px" }}
                    />
                    <ReferenceLine
                      y={netCost}
                      stroke="#999"
                      strokeDasharray="6 4"
                      label={{
                        value: `INVESTMENT RECOVERY ($${netCost.toLocaleString()})`,
                        position: "insideTopRight",
                        fill: "#666",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="savings"
                      stroke="#002428"
                      strokeWidth={2}
                      fill="url(#savingsGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-6 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-xs text-muted-foreground">Projected Savings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0 border-t border-dashed border-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Net Investment</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#2d4a2e] rounded-2xl p-6" data-testid="card-co2-reduction">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/60 mb-3">
                Environmental Impact
              </p>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-display font-bold text-[22px] text-white leading-snug">
                    {summary.co2ReductionTonnes} tonnes of CO2 reduced per year
                  </p>
                  <p className="text-sm text-white/60 mt-2 leading-relaxed">
                    Equivalent to removing {carsEquivalent === 1 ? "one car" : `${carsEquivalent} cars`} from the road each year.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-lg text-foreground mb-4">Upgrade Breakdown</h3>
              <div className="space-y-0 divide-y divide-border/50">
                {breakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Check className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{item.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">${item.cost.toLocaleString()}</p>
                      {item.rebate > 0 && (
                        <p className="text-[11px] text-[#4a6741]">-${item.rebate.toLocaleString()} Rebate</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/50 mt-1 pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Gross Total</span>
                  <span className="text-sm font-semibold text-foreground">${grossTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Rebates</span>
                  <span className="text-sm font-semibold text-[#4a6741]">-${totalRebates.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t-2 border-foreground mt-3 pt-3 flex justify-between">
                <span className="text-base font-bold text-foreground">Net Project Cost</span>
                <span className="text-base font-bold text-foreground">${netCost.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
          <div className="bg-card border border-border/50 rounded-2xl p-5 md:p-6 flex flex-col items-center text-center">
            <MessageSquareMore className="h-7 w-7 text-muted-foreground mb-3" />
            <h3 className="font-display font-bold text-base text-foreground mb-4">Get Contractor Quotes</h3>
            <button
              onClick={() => setLocation("/contractors")}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              data-testid="button-get-quotes"
            >
              View Contractors
            </button>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl p-5 md:p-6 flex flex-col items-center text-center">
            <FileText className="h-7 w-7 text-muted-foreground mb-3" />
            <h3 className="font-display font-bold text-base text-foreground mb-4">Apply for Rebates</h3>
            <button
              onClick={() => setLocation("/rebates")}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              data-testid="button-apply-rebates"
            >
              View Rebates
            </button>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl p-5 md:p-6 flex flex-col items-center text-center">
            <FileDown className="h-7 w-7 text-muted-foreground mb-3" />
            <h3 className="font-display font-bold text-base text-foreground mb-4">Download Your Report</h3>
            <button
              onClick={handleDownloadReport}
              className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/90 transition-colors"
              data-testid="button-download-report"
            >
              Download PDF
            </button>
          </div>
        </div>
      </main>

      <footer className="w-full px-4 md:px-0 py-8 flex flex-col items-center gap-3 border-t border-border/40">
        <span className="font-display font-bold text-xl text-foreground">Modovate</span>
        <div className="flex items-center gap-4 md:gap-6">
          <a href="#" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
          <a href="#" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">Support</a>
        </div>
        <span className="text-xs text-muted-foreground">&copy; 2024 Modovate Editorial Intelligence</span>
      </footer>
    </div>
  );
}
