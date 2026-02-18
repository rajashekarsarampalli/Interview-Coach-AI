import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import NewInterview from "@/pages/NewInterview";
import InterviewRoom from "@/pages/InterviewRoom";
import Feedback from "@/pages/Feedback";
import Jobs from "@/pages/Jobs";

function Router() {
  const [location] = useLocation();
  
  // Hide sidebar on specific routes like the interview room itself to maximize space
  const hideNav = location.includes("/interview/") && !location.includes("/new");

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      {!hideNav && <Navigation />}
      <main className={`flex-1 transition-all duration-300 ${!hideNav ? "sm:ml-20 md:ml-64" : ""}`}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/interview/new" component={NewInterview} />
          <Route path="/interview/:id" component={InterviewRoom} />
          <Route path="/feedback/:id" component={Feedback} />
          <Route path="/jobs" component={Jobs} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
