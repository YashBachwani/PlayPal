import { motion } from "framer-motion";
import VenueCard from "./VenueCard";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const venues = [
  {
    id: "1",
    name: "Elite Cricket Arena",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&h=400&fit=crop",
    sport: "Cricket",
    location: "Satellite, Ahmedabad",
    distance: "2.5 km",
    price: 1200,
    rating: 4.8,
    reviews: 245,
    crowdLevel: "Low" as const,
    weather: "32°C Sunny",
    slotsAvailable: 5,
    isVerified: true,
  },
  {
    id: "2",
    name: "ProKick Football Zone",
    image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=600&h=400&fit=crop",
    sport: "Football",
    location: "SG Highway, Ahmedabad",
    distance: "4.2 km",
    price: 1500,
    rating: 4.6,
    reviews: 189,
    crowdLevel: "Medium" as const,
    weather: "31°C Clear",
    slotsAvailable: 3,
    isVerified: true,
  },
  {
    id: "3",
    name: "Shuttle Masters",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&h=400&fit=crop",
    sport: "Badminton",
    location: "Prahladnagar, Ahmedabad",
    distance: "1.8 km",
    price: 400,
    rating: 4.9,
    reviews: 312,
    crowdLevel: "High" as const,
    weather: "30°C Humid",
    slotsAvailable: 2,
    isVerified: false,
  },
  {
    id: "4",
    name: "AcePoint Tennis Club",
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=400&fit=crop",
    sport: "Tennis",
    location: "Vastrapur, Ahmedabad",
    distance: "3.1 km",
    price: 800,
    rating: 4.7,
    reviews: 156,
    crowdLevel: "Low" as const,
    weather: "29°C Breezy",
    slotsAvailable: 4,
    isVerified: true,
  },
];

const VenuesSection = () => {
  const navigate = useNavigate();

  return (
    <section id="venues" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Nearby Venues
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
              Top Rated Sports Venues
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Discover the best turfs and courts near you with real-time availability
            </p>
          </div>
          <Button
            variant="ghost"
            className="mt-4 md:mt-0 text-primary hover:text-primary/90"
            onClick={() => navigate("/venues")}
          >
            View All Venues
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>

        {/* Venue Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {venues.map((venue, index) => (
            <motion.div
              key={venue.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 50 }}
              className="h-full"
            >
              <VenueCard {...venue} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VenuesSection;
