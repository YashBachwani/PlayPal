import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Trophy, Users, IndianRupee, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChat from "@/components/AIChat";
import { tournaments, getTournamentsByCity } from "@/data/tournaments";
import { useLocation } from "@/contexts/LocationContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Tournaments = () => {
  const navigate = useNavigate();
  const { selectedCity } = useLocation();
  const { isAuthenticated } = useAuth();
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const sports = ["Cricket", "Football", "Badminton", "Tennis", "Pickleball"];

  const filteredTournaments = tournaments.filter(t => {
    const matchesSport = !selectedSport || t.sport === selectedSport;
    return matchesSport;
  });

  const handleRegister = (tournamentName: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to register");
      navigate("/login");
      return;
    }
    toast.success(`Registered for ${tournamentName}! 🏆`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Tournaments</h1>
            <p className="text-muted-foreground">Compete, win, and earn rewards</p>
          </div>

          {/* Sport Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium ${!selectedSport ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
              onClick={() => setSelectedSport(null)}
            >
              All Sports
            </button>
            {sports.map(sport => (
              <button
                key={sport}
                className={`px-4 py-2 rounded-full text-sm font-medium ${selectedSport === sport ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                onClick={() => setSelectedSport(sport)}
              >
                {sport}
              </button>
            ))}
          </div>

          {/* Tournaments Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredTournaments.map((tournament, index) => (
              <motion.div
                key={tournament.id}
                className="bg-card border rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="relative h-48">
                  <img src={tournament.image} alt={tournament.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium">
                      {tournament.sport}
                    </span>
                    <h3 className="text-white font-bold text-xl mt-2">{tournament.name}</h3>
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-medium">
                    {tournament.status}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      {new Date(tournament.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      {tournament.time}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      {tournament.city}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-primary" />
                      {tournament.registeredTeams}/{tournament.maxTeams} teams
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary rounded-lg mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Entry Fee</p>
                      <p className="font-bold flex items-center">
                        <IndianRupee className="w-4 h-4" />
                        {tournament.entryFee}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Prize Pool</p>
                      <p className="font-bold text-primary flex items-center justify-end">
                        <Trophy className="w-4 h-4 mr-1" />
                        ₹{tournament.prizePool.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {tournament.description}
                  </p>

                  <Button 
                    className="w-full" 
                    onClick={() => handleRegister(tournament.name)}
                    disabled={tournament.registeredTeams >= tournament.maxTeams}
                  >
                    {tournament.registeredTeams >= tournament.maxTeams ? "Fully Booked" : "Register Now"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <AIChat />
    </div>
  );
};

export default Tournaments;
