
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Checklist from "./pages/Checklist";
import SelectChecklist from "./pages/SelectChecklist";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import ServerConnectionStatus from "./components/ServerConnectionStatus";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="fixed bottom-2 right-2 z-50">
          <ServerConnectionStatus />
        </div>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/select-checklist" element={<SelectChecklist />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
