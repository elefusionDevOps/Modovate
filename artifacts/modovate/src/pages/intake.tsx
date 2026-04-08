import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useHomeowner } from "@/context/HomeownerContext";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/layout";
import type { HeatingSystem } from "@/lib/energy-calculator";

interface Question {
  id: string;
  text: string;
  multiSelect: boolean;
  options: { label: string; value: string }[];
}

const questions: Question[] = [
  {
    id: "heatingSystem",
    text: "What type of heating system does your home currently use?",
    multiSelect: false,
    options: [
      { label: "Gas Furnace", value: "gas_furnace" },
      { label: "Oil Furnace", value: "oil_furnace" },
      { label: "Electric Baseboard", value: "electric_baseboard" },
      { label: "Propane Furnace", value: "propane_furnace" },
    ],
  },
  {
    id: "homeSize",
    text: "How large is your home?",
    multiSelect: false,
    options: [
      { label: "Under 1,200 sq ft", value: "small" },
      { label: "1,200 – 2,000 sq ft", value: "medium" },
      { label: "Over 2,000 sq ft", value: "large" },
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

export default function Intake() {
  const [, setLocation] = useLocation();
  const { setIntakeAnswers, setCurrentScreen } = useHomeowner();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [multiSelections, setMultiSelections] = useState<string[]>([]);
  const [showingQuestion, setShowingQuestion] = useState(true);
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

  const progress = ((currentQ + (showFinalMessage ? 1 : 0)) / questions.length) * 100;

  const handleSingleSelect = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    setShowingQuestion(false);

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setShowingQuestion(true);
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
    setShowingQuestion(false);

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setShowingQuestion(true);
        setMultiSelections([]);
      } else {
        finalize(newAnswers);
      }
    }, 400);
  };

  const finalize = (finalAnswers: Record<string, string | string[]>) => {
    setShowFinalMessage(true);
    setIntakeAnswers({
      heatingSystem: finalAnswers.heatingSystem as HeatingSystem,
      homeSize: finalAnswers.homeSize as string,
      utilityTypes: finalAnswers.utilityTypes as string[],
      annualUtilitySpend: finalAnswers.annualUtilitySpend as string,
      primaryGoals: finalAnswers.primaryGoals as string[],
    });

    setTimeout(() => {
      setLocation("/assessment");
    }, 1500);
  };

  return (
    <Layout step={2}>
      <div className="flex-1 flex flex-col">
        <div className="container mx-auto max-w-2xl px-4 pt-4">
          <Progress value={progress} className="h-1.5 bg-muted" data-testid="progress-intake" />
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto container mx-auto max-w-2xl px-4 py-8 space-y-6">
          {questions.slice(0, currentQ + 1).map((q, idx) => {
            const isActive = idx === currentQ && !showFinalMessage;
            const answered = answers[q.id];

            return (
              <div key={q.id} className={`space-y-4 ${!isActive ? "opacity-50" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-foreground font-display font-bold text-sm">M</span>
                  </div>
                  <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm max-w-[85%]">
                    <p className="text-foreground font-medium">{q.text}</p>
                  </div>
                </div>

                {isActive && showingQuestion && !answered ? (
                  <div className="pl-11 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {q.options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          q.multiSelect ? handleMultiToggle(opt.value) : handleSingleSelect(q.id, opt.value)
                        }
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                          q.multiSelect && multiSelections.includes(opt.value)
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-muted"
                        }`}
                        data-testid={`chip-${q.id}-${opt.value}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                    {q.multiSelect && (
                      <button
                        onClick={handleMultiConfirm}
                        disabled={multiSelections.length === 0}
                        className="px-6 py-2.5 rounded-full text-sm font-medium bg-secondary text-secondary-foreground disabled:opacity-40 transition-all hover:bg-secondary/90 shadow-sm"
                        data-testid={`button-confirm-${q.id}`}
                      >
                        Continue
                      </button>
                    )}
                  </div>
                ) : answered ? (
                  <div className="pl-11 flex justify-end">
                    <div className="bg-primary/5 border border-primary/10 rounded-2xl rounded-tr-sm px-5 py-3 text-sm text-foreground/80">
                      {Array.isArray(answered) ? answered.map((v) => {
                        const opt = q.options.find((o) => o.value === v);
                        return opt?.label;
                      }).join(", ") : q.options.find((o) => o.value === answered)?.label}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}

          {showFinalMessage && (
            <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-foreground font-display font-bold text-sm">M</span>
              </div>
              <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                <p className="text-foreground font-medium">Great. We're building your home energy report.</p>
                <div className="mt-3 flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
