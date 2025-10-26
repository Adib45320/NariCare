import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PeriodTracker from "./pages/PeriodTracker";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SubscriptionSelection from "./pages/SubscriptionSelection";
import SubscriptionPlan from "./pages/SubscriptionPlan";
import SubscriptionPayment from "./pages/SubscriptionPayment";
import SubscriptionManage from "./pages/SubscriptionManage";
import Admin from "./pages/Admin";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/period-tracker" element={<PeriodTracker />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subscribe" element={<SubscriptionSelection />} />
          <Route path="/subscribe/plan" element={<SubscriptionPlan />} />
          <Route path="/subscribe/payment" element={<SubscriptionPayment />} />
          <Route path="/subscription-manage" element={<SubscriptionManage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/checkout" element={<Checkout />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
