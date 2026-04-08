import { useEffect } from "react";
import { useLocation } from "wouter";
import { Star, ArrowLeft, ArrowRight, User } from "lucide-react";
import { useHomeowner } from "@/context/HomeownerContext";
import equipmentCatalog from "@/data/equipment-catalog.json";

const productImages: Record<string, string> = {
  "lennox-xp25h": "hp-lennox.png",
  "mitsubishi-zuba": "hp-mitsubishi.png",
  "bosch-ids-ultra": "hp-bosch.png",
};

export default function Equipment() {
  const [, setLocation] = useLocation();
  const { selectedProducts, setSelectedProduct, addUpgrade, setCurrentScreen } = useHomeowner();

  useEffect(() => {
    setCurrentScreen(5);
  }, [setCurrentScreen]);

  const heatPumpData = equipmentCatalog.heat_pump;
  const selectedId = selectedProducts.heat_pump;
  const basePath = import.meta.env.BASE_URL || "/";

  const handleAddToProject = (productId: string) => {
    setSelectedProduct("heat_pump", productId);
    addUpgrade("heat_pump");
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col font-sans">
      <header className="w-full px-8 py-4 flex items-center justify-between bg-background border-b border-border/30">
        <span className="font-display font-bold text-xl tracking-tight text-foreground">Modovate</span>
        <nav className="flex items-center gap-6">
          <button
            onClick={() => setLocation("/recommendations")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Your Plan
          </button>
          <span className="text-sm font-semibold text-foreground border-b-2 border-foreground pb-0.5">Heat Pump Options</span>
        </nav>
        <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      </header>

      <main className="flex-1 px-8 py-8 max-w-[1100px] mx-auto w-full">
        <div className="mb-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <button onClick={() => setLocation("/recommendations")} className="hover:text-foreground transition-colors">Your Plan</button>
            <span>›</span>
            <span className="font-semibold text-foreground">Heat Pump Options</span>
          </div>

          <h1 className="font-display font-bold text-[36px] leading-tight text-foreground tracking-tight mb-4">
            Cold Climate Heat Pumps for Your Home.
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed max-w-[560px]">
            Three options matched to your home size and heating load. All models operate at full capacity down to -25°C or colder.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-5 mt-10">
          {heatPumpData.products.map((product) => {
            const isSelected = selectedId === product.id;
            const isBestMatch = product.bestMatch;
            const imgFile = productImages[product.id] || "hp-lennox.png";

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
                  <img
                    src={`${basePath}${imgFile}`}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground/70 mb-1">
                    {product.brand}
                  </p>
                  <h3 className="font-display font-bold text-xl text-foreground mb-4">{product.name.replace(product.brand + " ", "").replace("Mitsubishi ", "").replace("Lennox ", "").replace("Bosch ", "")}</h3>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-[11px] font-medium px-2 py-1 rounded border border-border/60 bg-muted/30 text-muted-foreground">
                      COP: {product.specs.cop}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-1 rounded border border-border/60 bg-muted/30 text-muted-foreground">
                      HSPF2: {product.specs.hspf2}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-1 rounded border border-border/60 bg-muted/30 text-muted-foreground">
                      {(product.specs.btu).toLocaleString()} BTU
                    </span>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-1 rounded border border-border/60 bg-muted/30 text-muted-foreground w-fit mb-4">
                    Min Temp: {product.specs.minOperatingTemp}°C
                  </span>

                  <div className="flex items-center gap-1.5 mb-3">
                    <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                    <span className="text-sm font-medium text-foreground">{product.rating} stars</span>
                  </div>

                  {product.rebateEligible && (
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded border border-[#c5cfc0] bg-[#f0f4ed] text-[#4a6741] w-fit mb-4">
                      Eligible: up to $5,000 in rebates
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

        <div className="flex items-center justify-between mt-16 pt-8 border-t border-border/40">
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
