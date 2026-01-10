import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Trophy, Users, Zap, Target, Medal, Activity } from "lucide-react";

interface PreloaderProps {
  onComplete: () => void;
}

const quotes = [
  "Champions keep playing until they get it right.",
  "Hard work beats talent when talent doesn't work hard.",
  "It's not whether you get knocked down; it's whether you get up.",
  "Winning isn't everything, but wanting to win is.",
  "Your only limit is your mind.",
];

const icons = [
  { Component: Trophy, color: "text-yellow-500" },
  { Component: Zap, color: "text-blue-500" },
  { Component: Target, color: "text-red-500" },
  { Component: Users, color: "text-green-500" },
  { Component: Medal, color: "text-purple-500" },
  { Component: Activity, color: "text-orange-500" },
];

const Preloader = ({ onComplete }: PreloaderProps) => {
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  useEffect(() => {
    // Cycle icons
    const iconInterval = setInterval(() => {
      setCurrentIconIndex((prev) => (prev + 1) % icons.length);
    }, 400);

    // Complete loader
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearInterval(iconInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  const CurrentIcon = icons[currentIconIndex].Component;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated Icon Container */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Pulsing Background */}
          <motion.div
            className="absolute inset-0 bg-primary/10 rounded-full blur-xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            key={currentIconIndex}
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
            transition={{ duration: 0.2 }}
            className={`relative z-10 p-4 rounded-2xl bg-secondary/50 backdrop-blur-sm ${icons[currentIconIndex].color}`}
          >
            <CurrentIcon className="w-12 h-12 md:w-16 md:h-16" />
          </motion.div>
        </motion.div>

        {/* Brand Name */}
        <motion.div
          className="text-4xl md:text-6xl font-bold tracking-tight mb-6 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="text-foreground inline-block">Play</span>
          <motion.span
            className="text-primary inline-block"
            animate={{
              textShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 0px 20px rgba(var(--primary), 0.5)", "0px 0px 0px rgba(0,0,0,0)"]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Pal
          </motion.span>
        </motion.div>

        {/* Quote */}
        <motion.p
          className="text-muted-foreground text-sm md:text-base text-center max-w-md px-6 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          "{quote}"
        </motion.p>

        {/* Loading Bar */}
        <motion.div
          className="absolute bottom-10 w-48 h-1 bg-secondary rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Preloader;
