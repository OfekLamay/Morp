import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from "./context/UserContext";

import Navbar from "@/components/layout/navbar";
import MerkazDashboard from "@/pages/merkaz-dashboard";
import KabamDashboard from "@/pages/kabam-dashboard";
import MerkazTickets from "@/pages/merkaz-tickets";
import KabamTickets from "@/pages/kabam-tickets";
import UserManagement from "@/pages/user-management";
import ManageRules from "@/pages/manage-rules";
import RulesPerformance from "@/pages/rules-performance";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";

function Router() {
  return (
    <div className="min-h-screen matrix-bg">
      <Navbar />
      <div className="container mx-auto pt-20 pb-10 px-4">
        <Switch>
          <Route path="/" component={MerkazDashboard} />
          <Route path="/kabam-dashboard" component={KabamDashboard} />
          <Route path="/merkaz-tickets" component={MerkazTickets} />
          <Route path="/kabam-tickets" component={KabamTickets} />
          <Route path="/users" component={UserManagement} />
          <Route path="/manage-rules" component={ManageRules} />
          <Route path="/rules-performance" component={RulesPerformance} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  const { user } = useUser();

  if (!user) {
    return <Login />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
