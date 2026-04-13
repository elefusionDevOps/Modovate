import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Star, ArrowLeft, ArrowRight, User } from "lucide-react";
import { useHomeowner } from "@/context/HomeownerContext";
import type { UpgradeCategory } from "@/lib/energy-calculator";
import equipmentCatalog from "@/data/equipment-catalog.json";

const productImages: Record<string, string> = {
  "lennox-xp25h": "hp-lennox.png",
  "mitsubishi-zuba": "hp-mitsubishi.png",
  "bosch-ids-ultra": "hp-bosch.png",
};

type CatalogCategory = keyof typeof equipmentCatalog;

const categoryLabels: Record<string, string> = {
  heat_pump: "Heat Pump Options",
  insulation: "Insulation Options",
  electrical_panel: "Electrical Panel Options",
  solar_pv: "Solar PV Options",
  ev_charger: "EV Charger Options",
  battery_storage: "Battery Storage Options",
  windows: "Window Options",
};

function getSpecTags(product: any, category: string): string[] {
  const specs = product.specs;
  switch (category) {
    case "heat_pump":
      return [
        `COP: ${specs.cop}`,
        `HSPF2: ${specs.hspf2}`,
        `${specs.btu?.toLocaleString()} BTU`,
        `Min Temp: ${specs.minOperatingTemp}\u00b0C`,
      ];
    case "insulation":
      return [
        `R-Value: ${specs.rValue}`,
        `Coverage: ${specs.coverageSqFt?.toLocaleString()} sq ft`,
        specs.moistureBarrier ? "Moisture Barrier" : "No Moisture Barrier",
      ];
    case "electrical_panel":
      return [
        `${specs.amperage}A`,
        `${specs.circuits} Circuits`,
        specs.surgProtection ? "Surge Protection" : "No Surge Protection",
      ];
    case "solar_pv":
      return [
        `${specs.wattage}W per panel`,
        `${specs.efficiency}% Efficiency`,
        `${specs.warranty}-year warranty`,
      ];
    case "ev_charger":
      return [
        `${specs.amperage}A`,
        `${specs.power} kW`,
        specs.connector || "J1772",
        specs.wifi ? "WiFi Enabled" : "No WiFi",
      ];
    case "battery_storage":
      return [
        `${specs.capacityKwh} kWh`,
        `${specs.powerKw} kW`,
        `${specs.roundTripEfficiency}% Efficiency`,
      ];
    case "windows":
      return [
        `U-Factor: ${specs.uFactor}`,
        `${specs.panes}-pane`,
        `${specs.gassFill} Fill`,
      ];
    default:
      return [];
  }
}

function getProductDisplayName(product: any): string {
  const brandWords = product.brand.split(" ");
  let name = product.name;
  for (const word of brandWords) {
    name = name.replace(word + " ", "");
  }
  return name;
}

export default function Equipment() {
  useDocumentTitle("Equipment Options");
  const [, setLocation] = useLocation();
  const params = useParams<{ category?: string }>();
  const { selectedProducts, setSelectedProduct, addUpgrade, setCurrentScreen } = useHomeowner();

  useEffect(() => {
    setCurrentScreen(5);
  }, [setCurrentScreen]);

  const category = (params.category || "heat_pump") as CatalogCategory;
  const catData = equipmentCatalog[category];
  const navLabel = categoryLabels[category] || "Equipment Options";
  const selectedId = selectedProducts[category];
  const basePath = import.meta.env.BASE_URL || "/";

  if (!catData) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center font-sans">
        <h1 className="font-display font-bold text-2xl text-foreground mb-4">Category not found</h1>
        <button onClick={() => setLocation("/recommendations")} className="text-primary underline">
          Back to Recommendations
        </button>
      </div>
    );
  }

  const handleAddToProject = (productId: string) => {
    setSelectedProduct(category, productId);
    addUpgrade(category as UpgradeCategory);
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col font-sans">
      <header className="w-full px-4 md:px-8 py-4 flex items-center justify-between bg-background border-b border-border/30">
        <span className="font-display font-bold text-xl tracking-tight text-foreground">Modovate</span>
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => setLocation("/recommendations")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Your Plan
          </button>
          <span className="text-sm font-semibold text-foreground">{navLabel}</span>
        </nav>
        <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      </header>

      <main className="flex-1 px-4 md:px-8 py-8 max-w-[1100px] mx-auto w-full">
        <div className="mb-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <button onClick={() => setLocation("/recommendations")} className="hover:text-foreground transition-colors">Your Plan</button>
            <span>›</span>
            <span className="font-semibold text-foreground">{navLabel}</span>
          </div>

          <h1 className="font-display font-bold text-[36px] leading-tight text-foreground tracking-tight mb-4">
            {catData.label} for Your Home.
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed max-w-[560px]">
            {catData.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {catData.products.map((product) => {
            const isSelected = selectedId === product.id;
            const isBestMatch = product.bestMatch;
            const imgFile = productImages[product.id];
            const specTags = getSpecTags(product, category);

            return (
              <div
                key={product.id}
                className={`relative bg-card border rounded-2xl overflow-hidden transition-all duration-200 flex flex-col ${
                  isBestMatch
                    ? "border-primary shadow-xl ring-1 ring-primary/10 -mt-2 mb-2"
                    : "border-border/50 shadow-sm hover:shadow-md"
                } ${isSelected ? "ring-2 ring-primary" : ""}`}
                data-testid={`card-product-${product.id}`}
              >
                {isBestMatch && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="text-[10px] font-bold tracking-[0.08em] uppercase px-3 py-1.5 rounded bg-primary text-primary-foreground shadow-md whitespace-nowrap">
                      Best Match for Your Home
                    </span>
                  </div>
                )}

                <div className="w-full h-[200px] bg-[#f0efec] flex items-center justify-center overflow-hidden">
                  {imgFile ? (
                    <img
                      src={`${basePath}${imgFile}`}
                      alt={product.name}
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                      <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center">
                        <span className="text-2xl font-bold text-muted-foreground/30">{product.brand.charAt(0)}</span>
                      </div>
                      <span className="text-xs">{product.brand}</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground/70 mb-1">
                    {product.brand}
                  </p>
                  <h3 className="font-display font-bold text-xl text-foreground mb-4">
                    {getProductDisplayName(product)}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {specTags.map((tag) => (
                      <span key={tag} className="text-[11px] font-medium px-2 py-1 rounded border border-border/60 bg-muted/30 text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 mb-3">
                    <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                    <span className="text-sm font-medium text-foreground">{product.rating} stars</span>
                  </div>

                  {product.rebateEligible && (
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded border border-[#c5cfc0] bg-[#f0f4ed] text-[#4a6741] w-fit mb-4">
                      Rebate eligible
                    </span>
                  )}

                  <div className="mb-5">
                    <span className="text-xl font-display font-bold text-foreground">
                      ~${product.installedCostMin.toLocaleString()} – ${product.installedCostMax.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1.5">installed</span>
                  </div>

                  <div className="mt-auto space-y-2.5">
                    <button
                      onClick={() => handleAddToProject(product.id)}
                      className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
                        isSelected
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                      data-testid={`button-add-${product.id}`}
                    >
                      {isSelected ? "Added to Project" : "Add to Project"}
                    </button>
                    <button className="w-full py-3 rounded-xl text-sm font-semibold border border-border/60 text-foreground hover:bg-muted/30 transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-16 pt-8 border-t border-border/40">
          <button
            onClick={() => setLocation("/recommendations")}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Recommendations
          </button>
          <button
            onClick={() => setLocation("/rebates")}
            className="h-13 px-8 py-3.5 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground text-sm font-semibold shadow-lg transition-all flex items-center gap-2"
            data-testid="button-continue-rebates"
          >
            Continue to Rebate Summary
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>

      <footer className="w-full px-4 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3 border-t border-border/40">
        <span className="text-xs md:text-sm text-muted-foreground">© 2024 Modovate. All rights reserved.</span>
        <div className="flex items-center gap-4 md:gap-6">
          <a href="#" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
