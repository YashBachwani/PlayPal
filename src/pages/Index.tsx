import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import VenuesSection from "@/components/VenuesSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorks from "@/components/HowItWorks";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import AIChat from "@/components/AIChat";

const Index = () => {
  const [isLoading, setIsLoading] = useState(() => !sessionStorage.getItem("hasSeenPreloader"));

  const handlePreloaderComplete = () => {
    sessionStorage.setItem("hasSeenPreloader", "true");
    setIsLoading(false);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <Preloader onComplete={handlePreloaderComplete} />}
      </AnimatePresence>

      <AnimatePresence>
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Navbar />
            <main>
              <Hero />
              <VenuesSection />
              <FeaturesSection />
              <HowItWorks />
              <CTASection />
            </main>
            <Footer />
            <AIChat />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Index;
