import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Star, MapPin, Bell, User, ArrowRight, CheckCircle, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useHomeowner } from "@/context/HomeownerContext";
import contractorData from "@/data/contractor-profiles.json";

export default function Contractors() {
  const [, setLocation] = useLocation();
  const { setCurrentScreen } = useHomeowner();
  const { toast } = useToast();
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formMessage, setFormMessage] = useState("I'm interested in getting a quote for my home energy upgrade project.");

  useEffect(() => {
    setCurrentScreen(7);
  }, [setCurrentScreen]);

  const basePath = import.meta.env.BASE_URL || "/";

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedContractor(null);
    toast({
      title: "Quote Request Sent",
      description: "Your contractor will respond within 24-48 hours.",
    });
    setFormName("");
    setFormEmail("");
    setFormPhone("");
  };

  const pinPositions = [
    { left: "56%", top: "42%", initials: "GH", bg: "bg-secondary" },
    { left: "44%", top: "65%", initials: "ER", bg: "bg-secondary" },
    { left: "65%", top: "55%", initials: "VE", bg: "bg-primary" },
  ];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col font-sans">
      <header className="w-full px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation("/rebates")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-back"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">Modovate</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </header>

      <main className="flex-1 px-8 pb-12 max-w-[1000px] mx-auto w-full">
        <div className="mb-6">
          <h1 className="font-display font-bold text-[36px] leading-tight text-foreground tracking-tight mb-3">
            Matched Contractors Near You.
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed max-w-[560px]">
            Pre-qualified for your specific upgrades in the Greater Toronto Area. All contractors are verified for licensing, insurance, and customer ratings.
          </p>
        </div>

        <div className="relative w-full h-[220px] bg-[#2a2e33] rounded-2xl overflow-hidden mb-10">
          <img
            src={`${basePath}map-dark.png`}
            alt="Map of contractor locations"
            className="w-full h-full object-cover opacity-70"
          />
          {pinPositions.map((pin, i) => (
            <div
              key={i}
              className="absolute flex flex-col items-center"
              style={{ left: pin.left, top: pin.top, transform: "translate(-50%, -100%)" }}
            >
              <div className={`w-8 h-8 rounded-full ${pin.bg} flex items-center justify-center text-[10px] font-bold text-white shadow-lg`}>
                {pin.initials}
              </div>
              <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-secondary" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-5 mb-10">
          {contractorData.contractors.map((contractor) => (
            <div
              key={contractor.id}
              className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col"
              data-testid={`card-contractor-${contractor.id}`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                  contractor.topMatch ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
                }`}>
                  {contractor.initials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-[16px] text-foreground leading-snug">{contractor.name}</h3>
                    {contractor.topMatch && (
                      <span className="text-[9px] font-bold tracking-[0.08em] uppercase px-2 py-0.5 rounded bg-primary text-primary-foreground">
                        Top Match
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-secondary" />
                    <span className="text-xs text-muted-foreground">{contractor.serviceArea}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {contractor.specialties.map((spec) => (
                  <span key={spec} className="text-[11px] font-medium px-2 py-1 rounded border border-border/60 bg-muted/30 text-muted-foreground">
                    {spec}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-6 mb-3">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground/70 mb-1">Rating</p>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-foreground">{contractor.rating}</span>
                    <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                    <span className="text-xs text-muted-foreground">({contractor.reviewCount})</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground/70 mb-1">Experience</p>
                  <span className="text-sm font-bold text-foreground">{contractor.yearsInBusiness} years</span>
                </div>
              </div>

              <span className="text-[11px] font-medium px-2.5 py-1 rounded border border-[#c5cfc0] bg-[#f0f4ed] text-[#4a6741] w-fit mb-5">
                {contractor.availability}
              </span>

              <button
                onClick={() => setSelectedContractor(contractor.id)}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors mt-auto"
                data-testid={`button-quote-${contractor.id}`}
              >
                Request Quote
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 bg-card border border-border/50 rounded-xl px-6 py-4 mb-10">
          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            All contractors are pre-qualified by Modovate for licensing, insurance, TSSA certification, and customer performance ratings. Contractor profiles are updated quarterly.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => setLocation("/summary")}
            className="flex items-center gap-2 text-base font-semibold text-foreground hover:text-primary transition-colors"
            data-testid="button-view-summary"
          >
            Continue to Project Summary
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </main>

      <footer className="w-full px-8 py-5 flex items-center justify-between border-t border-border/40">
        <span className="text-sm text-muted-foreground">© 2024 Modovate. Your data is secured with architectural-grade encryption.</span>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline">Trust & Safety</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline">Privacy Policy</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline">Contractor Standards</a>
        </div>
      </footer>

      <Dialog open={!!selectedContractor} onOpenChange={() => setSelectedContractor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Request a Quote</DialogTitle>
            <DialogDescription>
              Fill in your details and the contractor will reach out within 24-48 hours.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitQuote} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Your name"
                className="mt-1"
                required
                data-testid="input-quote-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1"
                required
                data-testid="input-quote-email"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Phone</label>
              <Input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="(416) 555-0100"
                className="mt-1"
                data-testid="input-quote-phone"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Message</label>
              <Textarea
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                className="mt-1"
                rows={3}
                data-testid="input-quote-message"
              />
            </div>
            <DialogFooter>
              <button type="submit" className="w-full py-3 rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground text-sm font-semibold transition-colors" data-testid="button-submit-quote">
                Send Quote Request
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
