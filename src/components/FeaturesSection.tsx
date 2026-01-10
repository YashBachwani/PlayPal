import { motion } from "framer-motion";
import { 
  Bot, 
  MapPin, 
  Users, 
  Trophy, 
  Gift, 
  Cloud, 
  Calendar,
  Zap
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Chat Agent",
    description: "Book venues, find players, and get recommendations through natural conversation",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: MapPin,
    title: "Smart Discovery",
    description: "Find nearby venues with real-time slot availability and crowd predictions",
    color: "bg-sport-cricket/10 text-sport-cricket",
  },
  {
    icon: Users,
    title: "Find Players",
    description: "Match with players of similar skill level for casual or competitive games",
    color: "bg-sport-football/10 text-sport-football",
  },
  {
    icon: Trophy,
    title: "Tournaments",
    description: "Join local tournaments, view brackets, and compete for prizes",
    color: "bg-sport-badminton/10 text-sport-badminton",
  },
  {
    icon: Gift,
    title: "Rewards System",
    description: "Earn points on every booking and unlock exclusive discounts",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Cloud,
    title: "Weather Intelligence",
    description: "Get weather-based recommendations and indoor alternatives",
    color: "bg-sport-pickleball/10 text-sport-pickleball",
  },
  {
    icon: Calendar,
    title: "Instant Booking",
    description: "Book slots in seconds with secure payments and instant confirmation",
    color: "bg-sport-tennis/10 text-sport-tennis",
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Live slot availability, crowd levels, and dynamic pricing",
    color: "bg-primary/10 text-primary",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            Everything You Need to{" "}
            <span className="text-gradient">Play Smarter</span>
          </h2>
          <p className="text-muted-foreground mt-4">
            From AI-powered booking to finding the perfect teammates, 
            PlayPal has everything for your sports journey
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
