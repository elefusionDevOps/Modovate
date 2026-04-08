import { useEffect } from "react";
import { useLocation } from "wouter";
import { Star, Check, Shield, Snowflake, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHomeowner } from "@/context/HomeownerContext";
import equipmentCatalog from "@/data/equipment-catalog.json";
import Layout from "@/components/layout";

export default function Equipment() {
  const [, setLocation] = useLocation();
  const { selectedProducts, setSelectedProduct, addUpgrade, setCurrentScreen } = useHomeowner();

  useEffect(() => {
    setCurrentScreen(5);
  }, [setCurrentScreen]);

  const heatPumpData = equipmentCatalog.heat_pump;
  const selectedId = selectedProducts.heat_pump;

  const handleAddToProject = (productId: string) => {
    setSelectedProduct("heat_pump", productId);
    addUpgrade("heat_pump");
  };

  return (
    <Layout step={5}>
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground tracking-tight">
            Cold Climate Heat Pumps for Your Home
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {heatPumpData.description}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {heatPumpData.products.map((product) => {
            const isSelected = selectedId === product.id;
            const isBestMatch = product.bestMatch;

            return (
              <Card
                key={product.id}
                className={`relative border transition-all duration-200 ${
                  isBestMatch ? "border-secondary shadow-lg ring-1 ring-secondary/20" : "border-border/50 shadow-sm hover:shadow-md"
                } ${isSelected ? "ring-2 ring-primary" : ""}`}
                data-testid={`card-product-${product.id}`}
              >
                {isBestMatch && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-secondary text-secondary-foreground shadow-md px-4 py-1 text-xs font-semibold">
                      Best Match
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6 space-y-5 pt-8">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{product.brand}</p>
                    <h3 className="font-display font-bold text-xl text-foreground mt-1">{product.name}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-secondary text-secondary" : "text-border"}`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">{product.rating}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs gap-1">
                      <Zap className="h-3 w-3" /> COP {product.specs.cop}
                    </Badge>
                    <Badge variant="outline" className="text-xs gap-1">
                      {(product.specs.btu / 1000).toFixed(0)}k BTU
                    </Badge>
                    <Badge variant="outline" className="text-xs gap-1">
                      HSPF2 {product.specs.hspf2}
                    </Badge>
                    <Badge variant="outline" className="text-xs gap-1">
                      <Snowflake className="h-3 w-3" /> {product.specs.minOperatingTemp}°C
                    </Badge>
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <p className="text-2xl font-display font-bold text-foreground">
                      ${product.installedCostMin.toLocaleString()} – ${product.installedCostMax.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Installed cost estimate</p>
                  </div>

                  {product.rebateEligible && (
                    <Badge className="bg-secondary/10 text-secondary border border-secondary/20 text-xs">
                      <Shield className="h-3 w-3 mr-1" /> Rebate Eligible
                    </Badge>
                  )}

                  <ul className="space-y-2">
                    {product.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        {h}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleAddToProject(product.id)}
                    className={`w-full rounded-full ${
                      isSelected
                        ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    }`}
                    data-testid={`button-add-${product.id}`}
                  >
                    {isSelected ? "Selected" : "Add to Project"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedId && (
          <div className="flex justify-center pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Button
              onClick={() => setLocation("/rebates")}
              className="h-14 px-10 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg font-medium shadow-lg"
              data-testid="button-continue-rebates"
            >
              Continue to Rebates
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
