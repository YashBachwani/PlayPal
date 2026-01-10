import { motion } from "framer-motion";
import { Menu, X, MapPin, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { selectedCity, cities, setSelectedCity } = useLocation();

  const navLinks = [
    { name: "Venues", href: "/venues" },
    { name: "Find Players", href: "/players" },
    { name: "Tournaments", href: "/tournaments" },
  ];

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-40 gradient-glass border-b border-border/50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold">
            <span className="text-foreground">P</span>
            <span className="text-primary">l</span>
            <span className="text-foreground">ayPal</span>
          </span>
        </Link>

        {/* Location Selector */}
        <div className="relative hidden md:block">
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 text-sm cursor-pointer hover:bg-secondary transition-colors"
            onClick={() => setShowCityDropdown(!showCityDropdown)}
          >
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-medium">{selectedCity.name}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
          {showCityDropdown && (
            <div className="absolute top-full mt-2 left-0 w-48 bg-card border rounded-lg shadow-lg py-2 max-h-64 overflow-y-auto z-50">
              {cities.map(city => (
                <button
                  key={city.name}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors"
                  onClick={() => { setSelectedCity(city); setShowCityDropdown(false); }}
                >
                  {city.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate(user?.role === "turf_owner" ? "/owner-dashboard" : "/dashboard")}>
                <User className="w-4 h-4 mr-2" />
                {user?.name?.split(' ')[0]}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { logout(); navigate("/"); }}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => navigate("/login")}>
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <motion.div
        className="md:hidden bg-background border-t border-border"
        initial={false}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={{ duration: 0.3 }}
        style={{ overflow: "hidden" }}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="px-3 py-2 text-foreground font-medium hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex gap-3 pt-2 border-t border-border">
            {isAuthenticated ? (
              <Button className="flex-1" onClick={() => { logout(); navigate("/"); setIsOpen(false); }}>
                Logout
              </Button>
            ) : (
              <>
                <Button variant="outline" className="flex-1" onClick={() => { navigate("/login"); setIsOpen(false); }}>
                  Login
                </Button>
                <Button className="flex-1" onClick={() => { navigate("/login"); setIsOpen(false); }}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default Navbar;
