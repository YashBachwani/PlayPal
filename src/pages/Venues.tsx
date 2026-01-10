import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Filter, Star, Users, Clock, IndianRupee } from "lucide-react";
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVenues.map((venue, index) => (
                  <motion.div
                    key={venue.id}
                    className="bg-card border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/venue/${venue.id}`)}
                  >
                    <div className="relative h-48">
                      <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 px-2 py-1 bg-card/90 rounded-full text-xs font-medium">
                        {venue.sports[0]}
                      </div>
                      <div className="absolute bottom-3 right-3 px-2 py-1 bg-card/90 rounded-lg flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        <span className="font-bold">{venue.pricePerHour}</span>
                        <span className="text-xs text-muted-foreground">/hr</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{venue.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4" />
                        {venue.location}
                        <span className="text-primary">• {venue.distance}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{venue.rating}</span>
                          <span className="text-muted-foreground">({venue.reviews})</span>
                        </div>
                        <span className="text-sm text-primary">{venue.slotsAvailable} slots available</span>
                      </div>
                    </div>
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherCityVenues.map((venue, index) => (
                  <motion.div
                    key={venue.id}
                    className="bg-card border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/venue/${venue.id}`)}
                  >
                    <div className="relative h-48">
                      <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 px-2 py-1 bg-card/90 rounded-full text-xs font-medium">
                        {venue.city}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{venue.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {venue.location}, {venue.city}
                      </div>
                    </div>
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
