import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, StoredUser } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"user" | "turf_owner">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { cities } = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    city: "Ahmedabad"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isLogin) {
      const success = await login(formData.email, formData.password, role);
      if (success) {
        toast.success("Welcome back!");
        navigate(role === "turf_owner" ? "/owner-dashboard" : "/dashboard");
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } else {
      // For demo, create account in localStorage
      const users: StoredUser[] = JSON.parse(localStorage.getItem("playpal_registered_users") || "[]");
      if (users.some((u) => u.email === formData.email)) {
        toast.error("Email already registered");
      } else {
        users.push({ ...formData, role: "user", id: `user_${Date.now()}`, points: 100, createdAt: new Date().toISOString() });
        localStorage.setItem("playpal_registered_users", JSON.stringify(users));
        const success = await login(formData.email, formData.password, "user");
        if (success) {
          toast.success("Account created! Welcome to PlayPal!");
          navigate("/dashboard");
        }
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link to="/" className="inline-block mb-8">
            <span className="text-3xl font-bold">
              <span className="text-foreground">P</span>
              <span className="text-primary">l</span>
              <span className="text-foreground">ayPal</span>
            </span>
          </Link>

          <h1 className="text-3xl font-bold mb-2">
            {isLogin ? "Welcome back!" : "Create account"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isLogin ? "Sign in to continue your sports journey" : "Start your sports journey today"}
          </p>

          {/* Role Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-secondary rounded-lg">
            <button
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${role === "user" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              onClick={() => setRole("user")}
            >
              Player
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${role === "turf_owner" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              onClick={() => setRole("turf_owner")}
            >
              Turf Owner
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && role === "user" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Full Name"
                  className="pl-10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                className="pl-10"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            {!isLogin && role === "user" && (
              <>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Phone Number"
                    className="pl-10"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-foreground"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  >
                    {cities.map(city => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="pl-10 pr-10"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <p className="mt-6 text-center text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              className="text-primary font-medium hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>

          {role === "turf_owner" && isLogin && (
            <div className="mt-6 p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Demo Credentials:</strong><br />
                Email: elite@playpal.com<br />
                Password: elite123
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Right - Image */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
        <motion.div
          className="text-center text-primary-foreground"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold mb-4">Your one stop for sports & sport partners</h2>
          <p className="text-xl opacity-90">Book venues, find players, join tournaments - all in one place!</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
