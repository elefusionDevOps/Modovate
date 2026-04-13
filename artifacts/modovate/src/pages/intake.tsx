import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useHomeowner } from "@/context/HomeownerContext";
import type { HeatingSystem } from "@/lib/energy-calculator";

interface Question {
  id: string;
  text: string;
  multiSelect: boolean;
  options: { label: string; value: string }[];
}

const questions: Question[] = [
  {
    id: "homeSize",
    text: "What is your home's approximate size?",
    multiSelect: false,
    options: [
      { label: "Under 1,000 sq ft", value: "small" },
      { label: "1,000 to 1,500 sq ft", value: "medium" },
      { label: "1,500 to 2,500 sq ft", value: "large" },
      { label: "Over 2,500 sq ft", value: "xlarge" },
      { label: "Not Sure", value: "unknown" },
    ],
  },
  {
    id: "heatingSystem",
    text: "What type of heating system does your home currently use?",
    multiSelect: false,
    options: [
      { label: "Gas Furnace", value: "gas_furnace" },
      { label: "Electric Baseboard", value: "electric_baseboard" },
      { label: "Heat Pump (existing)", value: "heat_pump_existing" },
      { label: "Oil Furnace", value: "oil_furnace" },
      { label: "Not Sure", value: "not_sure" },
    ],
  },
  {
    id: "utilityTypes",
    text: "What utilities does your home use?",
    multiSelect: true,
    options: [
      { label: "Natural Gas", value: "natural_gas" },
      { label: "Electricity", value: "electricity" },
      { label: "Oil", value: "oil" },
      { label: "Propane", value: "propane" },
    ],
  },
  {
    id: "annualUtilitySpend",
    text: "What is your approximate annual utility spending?",
    multiSelect: false,
    options: [
      { label: "Under $2,000", value: "under_2000" },
      { label: "$2,000 – $3,500", value: "2000_3500" },
      { label: "$3,500 – $5,000", value: "3500_5000" },
      { label: "Over $5,000", value: "over_5000" },
    ],
  },
  {
    id: "primaryGoals",
    text: "What are your main goals for upgrading?",
    multiSelect: true,
    options: [
      { label: "Lower Energy Bills", value: "lower_bills" },
      { label: "Improve Comfort", value: "comfort" },
      { label: "Reduce Carbon Footprint", value: "sustainability" },
      { label: "EV Charging", value: "ev_charging" },
      { label: "Energy Independence", value: "energy_independence" },
    ],
  },
];

const TOTAL_STEPS = 7;

export default function Intake() {
  useDocumentTitle("Home Intake");
  const [, setLocation] = useLocation();
  const { setIntakeAnswers, setCurrentScreen } = useHomeowner();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [multiSelections, setMultiSelections] = useState<string[]>([]);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentScreen(2);
  }, [setCurrentScreen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentQ, showFinalMessage]);

  const handleSingleSelect = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setMultiSelections([]);
      } else {
        finalize(newAnswers);
      }
    }, 400);
  };

  const handleMultiToggle = (value: string) => {
    setMultiSelections((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleMultiConfirm = () => {
    if (multiSelections.length === 0) return;
    const questionId = questions[currentQ].id;
    const newAnswers = { ...answers, [questionId]: multiSelections };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setMultiSelections([]);
      } else {
        finalize(newAnswers);
      }
    }, 400);
  };

  const finalize = (finalAnswers: Record<string, string | string[]>) => {
    setShowFinalMessage(true);

    const heatingVal = finalAnswers.heatingSystem as string;
    let heatingSystem: HeatingSystem = "gas_furnace";
    if (heatingVal === "oil_furnace") heatingSystem = "oil_furnace";
    else if (heatingVal === "electric_baseboard") heatingSystem = "electric_baseboard";
    else if (heatingVal === "propane_furnace") heatingSystem = "propane_furnace";

    const sizeVal = finalAnswers.homeSize as string;
    let homeSize = "medium";
    if (sizeVal === "small") homeSize = "small";
    else if (sizeVal === "large" || sizeVal === "xlarge") homeSize = "large";

    setIntakeAnswers({
      heatingSystem,
      homeSize,
      utilityTypes: (finalAnswers.utilityTypes as string[]) || ["natural_gas", "electricity"],
      annualUtilitySpend: (finalAnswers.annualUtilitySpend as string) || "2000_3500",
      primaryGoals: (finalAnswers.primaryGoals as string[]) || ["lower_bills"],
    });

    setTimeout(() => {
      setLocation("/assessment");
    }, 1500);
  };

  const handleBack = () => {
    if (currentQ > 0) {
      const prevQ = questions[currentQ - 1];
      const newAnswers = { ...answers };
      delete newAnswers[prevQ.id];
      setAnswers(newAnswers);
      setCurrentQ(currentQ - 1);
      setMultiSelections([]);
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col font-sans">
      <header className="w-full px-8 py-5 flex items-center justify-between">
        <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
          Step 2 of {TOTAL_STEPS}
        </span>
        <span className="font-display font-bold text-xl tracking-tight text-foreground">Modovate</span>
      </header>

      <main className="flex-1 flex flex-col items-center px-6">
        <div ref={scrollRef} className="w-full max-w-[620px] flex-1 py-6 space-y-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="space-y-6">
            {questions.slice(0, currentQ + 1).map((q, idx) => {
              const isActive = idx === currentQ && !showFinalMessage;
              const answered = answers[q.id];

              return (
                <div key={q.id} className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-400">
                  {!isActive && answered ? (
                    <div className="space-y-3 opacity-50">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-primary-foreground font-display font-bold text-sm">M</span>
                        </div>
                        <div className="bg-muted/60 rounded-xl px-5 py-3">
                          <p className="text-sm text-muted-foreground">{q.text}</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-primary/5 border border-primary/10 rounded-xl px-5 py-2.5 text-sm text-foreground">
                          {Array.isArray(answered)
                            ? answered
                                .map((v) => q.options.find((o) => o.value === v)?.label)
                                .join(", ")
                            : q.options.find((o) => o.value === answered)?.label}
                        </div>
                      </div>
                    </div>
                  ) : isActive ? (
                    <div className="space-y-5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-primary-foreground font-display font-bold text-sm">M</span>
                        </div>
                        <div className="bg-card border border-border/50 rounded-xl px-5 py-4 shadow-sm">
                          <p className="text-foreground font-semibold text-[17px] leading-snug">{q.text}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {q.options.map((opt, optIdx) => {
                          const isLastOdd = q.options.length % 2 !== 0 && optIdx === q.options.length - 1;
                          const isMultiSelected = q.multiSelect && multiSelections.includes(opt.value);

                          return (
                            <button
                              key={opt.value}
                              onClick={() =>
                                q.multiSelect
                                  ? handleMultiToggle(opt.value)
                                  : handleSingleSelect(q.id, opt.value)
                              }
                              className={`text-left px-5 py-4 rounded-xl text-[15px] font-medium transition-all duration-200 border ${
                                isLastOdd ? "col-span-2" : ""
                              } ${
                                isMultiSelected
                                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                                  : "bg-card text-foreground border-border/60 hover:border-primary/40 hover:shadow-sm"
                              }`}
                              data-testid={`chip-${q.id}-${opt.value}`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                        {q.multiSelect && (
                          <button
                            onClick={handleMultiConfirm}
                            disabled={multiSelections.length === 0}
                            className="col-span-2 mt-1 px-6 py-3.5 rounded-xl text-[15px] font-semibold bg-secondary text-secondary-foreground disabled:opacity-40 transition-all hover:bg-secondary/90 shadow-sm"
                            data-testid={`button-confirm-${q.id}`}
                          >
                            Continue
                          </button>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}

            {showFinalMessage && (
              <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-foreground font-display font-bold text-sm">M</span>
                </div>
                <div className="bg-card border border-border/50 rounded-xl px-5 py-4 shadow-sm">
                  <p className="text-foreground font-semibold">Building your personalized energy report...</p>
                  <div className="mt-3 flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 pt-8 pb-4">
            <ShieldCheck className="h-4 w-4 text-muted-foreground/60" />
            <span className="text-sm text-muted-foreground/80">Your data is secure and used only for energy analysis.</span>
          </div>
        </div>
      </main>

      <footer className="w-full px-8 py-5 flex items-center justify-between border-t border-border/40">
        <span className="text-sm text-muted-foreground">© 2024 Modovate. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Use</a>
        </div>
      </footer>
    </div>
  );
}
