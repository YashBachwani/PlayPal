import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BookingProvider } from "@/contexts/BookingContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { EventProvider } from "@/contexts/EventContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Venues from "./pages/Venues";
import VenueDetails from "./pages/VenueDetails";
import Players from "./pages/Players";
import Tournaments from "./pages/Tournaments";
import OwnerDashboard from "./pages/OwnerDashboard";
import Invoice from "./pages/Invoice";
import NotFound from "./pages/NotFound";
import MatchMode from "./pages/MatchMode";
import LiveBroadcast from "./pages/LiveBroadcast";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LocationProvider>
          <BookingProvider>
            <Toaster />
            <Sonner />
            <EventProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/venues" element={<Venues />} />
                  <Route path="/venue/:id" element={<VenueDetails />} />
                  <Route path="/players" element={<Players />} />
                  <Route path="/match/:bookingId" element={<MatchMode />} />
                  <Route path="/broadcast" element={<LiveBroadcast />} />
                  <Route path="/tournaments" element={<Tournaments />} />
                  <Route path="/owner-dashboard" element={<OwnerDashboard />} />
                  <Route path="/invoice/:id" element={<Invoice />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </EventProvider>
          </BookingProvider>
        </LocationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
