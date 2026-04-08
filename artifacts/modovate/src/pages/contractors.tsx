import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Star, MapPin, Clock, Award, Wrench, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useHomeowner } from "@/context/HomeownerContext";
import contractorData from "@/data/contractor-profiles.json";
import Layout from "@/components/layout";

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

  return (
    <Layout step={7}>
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground tracking-tight">
            Matched Contractors Near You
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Pre-vetted energy upgrade specialists in your area, matched to your project needs.
          </p>
        </div>

        <div className="w-full h-48 bg-muted rounded-2xl border border-border overflow-hidden relative flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
          <div className="relative flex items-center gap-3 bg-background/90 backdrop-blur-sm px-6 py-3 rounded-xl shadow border border-border/50">
            <MapPin className="h-5 w-5 text-secondary" />
            <span className="font-medium text-foreground">Toronto Area</span>
          </div>
          {[
            { left: "25%", top: "30%" },
            { left: "55%", top: "45%" },
            { left: "70%", top: "25%" },
          ].map((pos, i) => (
            <div key={i} className="absolute" style={pos}>
              <MapPin className="h-6 w-6 text-secondary drop-shadow-md" />
            </div>
          ))}
        </div>

        <div className="grid gap-5">
          {contractorData.contractors.map((contractor) => (
            <Card
              key={contractor.id}
              className={`border transition-all duration-200 ${
                contractor.topMatch ? "border-secondary shadow-lg ring-1 ring-secondary/20" : "border-border/50 shadow-sm hover:shadow-md"
              }`}
              data-testid={`card-contractor-${contractor.id}`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      {contractor.topMatch && (
                        <Badge className="bg-secondary text-secondary-foreground text-xs shadow-sm">Top Match</Badge>
                      )}
                      <h3 className="font-display font-bold text-xl text-foreground">{contractor.name}</h3>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {contractor.serviceArea}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {contractor.availability}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < Math.floor(contractor.rating) ? "fill-secondary text-secondary" : "text-border"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-foreground">{contractor.rating}</span>
                      <span className="text-sm text-muted-foreground">({contractor.reviewCount} reviews)</span>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">{contractor.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {contractor.specialties.map((spec) => (
                        <Badge key={spec} variant="outline" className="text-xs gap-1">
                          <Wrench className="h-3 w-3" /> {spec.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {contractor.certifications.map((cert) => (
                        <Badge key={cert} variant="outline" className="text-xs gap-1 border-green-200 bg-green-50 text-green-700">
                          <Award className="h-3 w-3" /> {cert}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="font-display font-bold text-lg text-foreground">{contractor.yearsInBusiness}</span>
                        <span className="text-muted-foreground ml-1">years</span>
                      </div>
                      <div>
                        <span className="font-display font-bold text-lg text-foreground">{contractor.projectsCompleted.toLocaleString()}</span>
                        <span className="text-muted-foreground ml-1">projects</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-3 md:min-w-[160px]">
                    <Button
                      onClick={() => setSelectedContractor(contractor.id)}
                      className="flex-1 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium shadow"
                      data-testid={`button-quote-${contractor.id}`}
                    >
                      Request Quote
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={() => setLocation("/summary")}
            className="h-14 px-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-medium shadow-lg"
            data-testid="button-view-summary"
          >
            View Your Project Summary
          </Button>
        </div>

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
                <Button type="submit" className="rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" data-testid="button-submit-quote">
                  Send Quote Request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
