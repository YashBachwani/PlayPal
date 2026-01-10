import { motion } from "framer-motion";
import { Search, Calendar, Users, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Discover",
    description: "Search venues by sport, location, or just ask our AI assistant",
  },
  {
    icon: Calendar,
    step: "02",
    title: "Book",
    description: "Select your slot, confirm timing, and pay securely online",
  },
  {
    icon: Users,
    step: "03",
    title: "Team Up",
    description: "Find players to complete your team or join existing games",
  },
  {
    icon: Trophy,
    step: "04",
    title: "Play & Win",
    description: "Show up, play hard, earn points and unlock rewards",
  },
];

const HowItWorks = () => {
  const navigate = useNavigate();
  return (
    <section className="py-20 bg-secondary/30">
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
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            Start Playing in{" "}
            <span className="text-gradient">4 Simple Steps</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="relative text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-border" />
              )}

              {/* Icon */}
              <div className="relative mx-auto w-24 h-24 rounded-2xl gradient-hero shadow-glow flex items-center justify-center text-primary-foreground mb-6">
                <step.icon className="w-10 h-10" />
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-card border-2 border-primary text-primary text-sm font-bold flex items-center justify-center">
                  {step.step}
                </div>
              </div>

              <h3 className="font-semibold text-xl text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-12">
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8" onClick={() => navigate("/venues")}>
          Start Booking Now
        </Button>
      </div>
    </section>
  );
};

export default HowItWorks;
