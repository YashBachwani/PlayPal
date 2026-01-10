import { motion } from "framer-motion";
import VenueCard from "./VenueCard";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { venues as allVenues } from "@/data/venues";

// Map real data to component props
const venues = allVenues.slice(0, 4).map(venue => ({
  id: venue.id,
  name: venue.name,
  image: venue.images[0] || venue.image,
  sport: venue.sports[0],
  location: venue.location,
  distance: venue.distance,
  price: venue.pricePerHour,
  rating: venue.rating,
  reviews: venue.reviews,
  crowdLevel: venue.crowdLevel,
  weather: venue.weather,
  slotsAvailable: venue.slotsAvailable,
  isVerified: venue.isVerified,
}));

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
