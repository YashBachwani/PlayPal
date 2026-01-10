import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Filter } from "lucide-react";
import VenueCard from "@/components/VenueCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChat from "@/components/AIChat";
import { venues, getVenuesByCity } from "@/data/venues";
import { useLocation } from "@/contexts/LocationContext";

const Venues = () => {
  const navigate = useNavigate();
  const { selectedCity, cities, setSelectedCity } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const sports = ["Cricket", "Football", "Badminton", "Tennis", "Pickleball"];

  const filteredVenues = venues.filter(venue => {
    const matchesCity = venue.city.toLowerCase() === selectedCity.name.toLowerCase();
    const matchesSearch = !searchQuery ||
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = !selectedSport || venue.sports.includes(selectedSport);
    return matchesCity && matchesSearch && matchesSport;
  });

  // Also show venues from other cities if the user has searched
  const otherCityVenues = searchQuery ? venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.city.toLowerCase().includes(searchQuery.toLowerCase());
    const differentCity = venue.city.toLowerCase() !== selectedCity.name.toLowerCase();
    const matchesSport = !selectedSport || venue.sports.includes(selectedSport);
    return differentCity && matchesSearch && matchesSport;
  }) : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Sports Venues</h1>
            <p className="text-muted-foreground">Find and book the best sports facilities near you</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search venues, sports, or cities..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="h-10 px-4 rounded-md border bg-background"
              value={selectedCity.name}
              onChange={(e) => {
                const city = cities.find(c => c.name === e.target.value);
                if (city) setSelectedCity(city);
              }}
            >
              {cities.map(city => (
                <option key={city.name} value={city.name}>{city.name}</option>
              ))}
            </select>
          </div>

          {/* Sport Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedSport ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
              onClick={() => setSelectedSport(null)}
            >
              All Sports
            </button>
            {sports.map(sport => (
              <button
                key={sport}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedSport === sport ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                onClick={() => setSelectedSport(sport)}
              >
                {sport}
              </button>
            ))}
          </div>

          {/* Venues Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Venues in {selectedCity.name}</h2>
            {filteredVenues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVenues.map((venue, index) => (
                  <motion.div
                    key={venue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="h-full"
                  >
                    <VenueCard
                      {...venue}
                      sport={venue.sports[0]}
                      price={venue.pricePerHour}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No venues found in {selectedCity.name}</p>
              </div>
            )}
          </div>

          {/* Other Cities */}
          {otherCityVenues.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Venues in Other Cities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherCityVenues.map((venue, index) => (
                  <motion.div
                    key={venue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="h-full"
                  >
                    <VenueCard
                      {...venue}
                      sport={venue.sports[0]}
                      price={venue.pricePerHour}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <AIChat />
    </div>
  );
};

export default Venues;
