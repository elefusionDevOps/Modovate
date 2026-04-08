import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HomeownerProvider } from "@/context/HomeownerContext";

import Welcome from "@/pages/welcome";
import Intake from "@/pages/intake";
import Assessment from "@/pages/assessment";
import Recommendations from "@/pages/recommendations";
import Equipment from "@/pages/equipment";
import Rebates from "@/pages/rebates";
import Contractors from "@/pages/contractors";
import Summary from "@/pages/summary";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/intake" component={Intake} />
      <Route path="/assessment" component={Assessment} />
      <Route path="/recommendations" component={Recommendations} />
      <Route path="/equipment" component={Equipment} />
      <Route path="/equipment/:category" component={Equipment} />
      <Route path="/rebates" component={Rebates} />
      <Route path="/contractors" component={Contractors} />
      <Route path="/summary" component={Summary} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HomeownerProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </HomeownerProvider>
    </QueryClientProvider>
  );
}

export default App;
