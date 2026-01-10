import { motion } from "framer-motion";
import { MapPin, Star, Users, Clock, Cloud, IndianRupee, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface VenueCardProps {
  id: string; // Added ID
  name: string;
  image: string;
  sport: string;
  location: string;
  distance: string;
  price: number;
  rating: number;
  reviews: number;
  crowdLevel: "Low" | "Medium" | "High";
  weather: string;
  slotsAvailable: number;
  isVerified?: boolean;
}

const VenueCard = ({
  id,
  name,
  image,
  sport,
  location,
  distance,
  price,
  rating,
  reviews,
  crowdLevel,
  weather,
  slotsAvailable,
  isVerified = false,
}: VenueCardProps) => {
  const navigate = useNavigate();

  const crowdColors = {
    Low: "bg-sport-football/20 text-sport-football",
    Medium: "bg-sport-cricket/20 text-sport-cricket",
    High: "bg-destructive/20 text-destructive",
  };

  return (
    <motion.div
      className="group rounded-2xl bg-card border border-border overflow-hidden shadow-soft hover:shadow-hover transition-all duration-300 h-full flex flex-col"
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/venue/${id}`)}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden shrink-0">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />

        {/* Sport Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm text-xs font-medium text-foreground">
          {sport}
        </div>

        {/* Verified Badge */}
        {isVerified && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium border border-primary/20">
            <CheckCircle className="w-3 h-3" />
            Verified
          </div>
        )}

        {/* Price Tag */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-card/95 backdrop-blur-sm shadow-sm">
          <IndianRupee className="w-3.5 h-3.5 text-primary" />
          <span className="font-bold text-foreground">{price}</span>
          <span className="text-xs text-muted-foreground">/hr</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title & Rating */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground text-lg line-clamp-1 group-hover:text-primary transition-colors">{name}</h3>
          <div className="flex items-center gap-1 text-sm bg-secondary/50 px-1.5 py-0.5 rounded-md">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-bold text-foreground">{rating}</span>
            <span className="text-muted-foreground text-xs">({reviews})</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <MapPin className="w-3.5 h-3.5" />
          <span className="line-clamp-1">{location}</span>
          <span className="text-primary font-medium ml-auto whitespace-nowrap">• {distance}</span>
        </div>

        {/* Info Pills */}
        <div className="flex flex-wrap gap-2 mb-4 mt-auto">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-transparent ${crowdColors[crowdLevel]}`}>
            <Users className="w-3 h-3" />
            {crowdLevel} Crowd
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/50 text-secondary-foreground text-xs font-medium border border-border">
            <Cloud className="w-3 h-3" />
            {weather}
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/5 text-primary text-xs font-medium border border-primary/10">
            <Clock className="w-3 h-3" />
            {slotsAvailable} slots
          </div>
        </div>

        {/* Action */}
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md group-hover:shadow-lg transition-all"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/venue/${id}`);
          }}
        >
          Book Now
        </Button>
      </div>
    </motion.div>
  );
};

export default VenueCard;
