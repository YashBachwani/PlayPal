import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Search, MapPin, Calendar, Users, Zap, Star, Trophy, ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set(clientX / innerWidth - 0.5);
    mouseY.set(clientY / innerHeight - 0.5);
  };

  const xSpring = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const ySpring = useSpring(mouseY, { stiffness: 100, damping: 30 });

  const moveX = useTransform(xSpring, [-0.5, 0.5], [20, -20]);
  const moveY = useTransform(ySpring, [-0.5, 0.5], [20, -20]);
  const moveXReverse = useTransform(xSpring, [-0.5, 0.5], [-20, 20]);
  const moveYReverse = useTransform(ySpring, [-0.5, 0.5], [-20, 20]);

  const handleSearch = () => {
    navigate(`/venues?search=${encodeURIComponent(searchQuery)}`);
  };

  // Cycling text effect
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const words = ["Team", "Court", "Game", "Passion"];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const sports = [
    { name: "Cricket", icon: "🏏", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    { name: "Football", icon: "⚽", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { name: "Badminton", icon: "🏸", color: "bg-green-500/10 text-green-500 border-green-500/20" },
    { name: "Tennis", icon: "🎾", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  ];

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[110vh] pt-32 pb-20 overflow-hidden flex items-center justify-center bg-background"
    >
      {/* Immersive Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Animated Gradient Mesh - Warm & Premium */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[60%] bg-accent/20 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-secondary/30 rounded-full blur-[80px]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/30 backdrop-blur-md border border-primary/10 text-sm font-medium text-primary mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Trusted by 10,000+ active players
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, type: "spring" }}
          >
            <span className="block text-foreground">Play Better,</span>
            <span className="block">
              Find Your{" "}
              <motion.span
                key={words[activeWordIndex]}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-600 to-amber-600"
              >
                {words[activeWordIndex]}
              </motion.span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl text-muted-foreground max-w-2xl mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            The smartest way to book sports venues and find players nearby.
            Join the community that's changing the game.
          </motion.p>

          {/* Enhanced Search Bar */}
          <motion.div
            className="w-full max-w-2xl relative mb-16 z-20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl opacity-20 blur-lg transition duration-1000 group-hover:opacity-100" />
            <div className="relative flex items-center gap-2 p-2 bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl">
              <div className="flex-1 flex items-center gap-3 px-4 h-14">
                <Search className="w-6 h-6 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search 'Cricket in Ahmedabad'..."
                  className="flex-1 bg-transparent outline-none text-lg text-foreground placeholder:text-muted-foreground/60"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button
                size="lg"
                onClick={handleSearch}
                className="h-14 px-8 rounded-xl text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
              >
                Search
              </Button>
            </div>

            {/* Quick Filters */}
            <div className="absolute top-full left-0 right-0 mt-4 flex items-center justify-center gap-3">
              {sports.map((sport, i) => (
                <motion.button
                  key={sport.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-background/50 backdrop-blur-sm transition-all hover:scale-105 hover:bg-background ${sport.color}`}
                  onClick={() => navigate(`/venues?sport=${sport.name}`)}
                >
                  <span className="text-sm">{sport.icon}</span>
                  {sport.name}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Floating Cards (Parallax) */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Card 1: Venue */}
            <motion.div
              style={{ x: moveX, y: moveY }}
              className="absolute top-[15%] left-[5%] md:left-[10%] hidden lg:block"
            >
              <div className="bg-background/80 backdrop-blur-md p-4 rounded-2xl border border-primary/10 shadow-2xl flex gap-4 items-center animate-float">
                <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Trophy className="text-orange-600 w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">Top Rated Turf</p>
                  <div className="flex text-amber-500 text-xs gap-0.5">
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Player Match */}
            <motion.div
              style={{ x: moveXReverse, y: moveYReverse }}
              className="absolute bottom-[20%] right-[5%] md:right-[10%] hidden lg:block"
            >
              <div className="bg-background/80 backdrop-blur-md p-4 rounded-2xl border border-primary/10 shadow-2xl flex gap-4 items-center animate-float-delayed">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-secondary border-2 border-background flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary opacity-70" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">3 Players Needed</p>
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Match Starting soon!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
