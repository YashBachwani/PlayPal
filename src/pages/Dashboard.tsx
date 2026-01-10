import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, Trophy, Star, Gift, Users, ChevronRight, LogOut, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChat from "@/components/AIChat";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getBookingsByUser } = useBooking();
  const [activeTab, setActiveTab] = useState("upcoming");

  if (!user) {
    navigate("/login");
    return null;
  }

  const bookings = getBookingsByUser(user.id);
  const upcomingBookings = bookings.filter(b => b.status === "Confirmed");
  const pastBookings = bookings.filter(b => b.status === "Completed" || b.status === "Cancelled");

  const rewards = [
    { points: 500, reward: "10% Discount", status: user.points >= 500 ? "unlocked" : "locked" },
    { points: 1000, reward: "1 Hour Free", status: user.points >= 1000 ? "unlocked" : "locked" },
    { points: 2000, reward: "Free Tournament Entry", status: user.points >= 2000 ? "unlocked" : "locked" },
    { points: 5000, reward: "Premium Membership", status: user.points >= 5000 ? "unlocked" : "locked" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Welcome, {user.name}! 👋</h1>
              <p className="text-muted-foreground">{user.city}, Gujarat</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-xl bg-primary/10">
                <span className="text-primary font-bold text-xl">{user.points}</span>
                <span className="text-muted-foreground ml-1">points</span>
              </div>
              <Button variant="outline" onClick={() => { logout(); navigate("/"); }}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left - Bookings */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="flex gap-4 mb-6">
                <button
                  className={`px-4 py-2 rounded-lg font-medium ${activeTab === "upcoming" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
                  onClick={() => setActiveTab("upcoming")}
                >
                  Upcoming ({upcomingBookings.length})
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium ${activeTab === "past" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
                  onClick={() => setActiveTab("past")}
                >
                  Past Bookings ({pastBookings.length})
                </button>
              </div>

              {/* Booking Cards */}
              <div className="space-y-4">
                {(activeTab === "upcoming" ? upcomingBookings : pastBookings).map((booking) => (
                  <motion.div
                    key={booking.id}
                    className="p-4 bg-card border rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{booking.venueName}</h3>
                        <p className="text-muted-foreground">{booking.sport}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${booking.status === "Confirmed" ? "bg-primary/10 text-primary" :
                        booking.status === "Completed" ? "bg-green-100 text-green-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {booking.timeSlot}
                      </span>
                      <span className="font-medium text-foreground">₹{booking.totalAmount}</span>
                    </div>

                    {activeTab === "upcoming" && (
                      <div className="flex gap-2 w-full mt-4">
                        <Button className="flex-1" variant="outline" onClick={() => navigate(`/invoice/${booking.id}`)}>
                          View Invoice
                        </Button>
                        <Button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0 text-white shadow-lg shadow-orange-500/20" onClick={() => navigate(`/match/${booking.id}`)}>
                          <Play className="w-4 h-4 mr-2 fill-white" /> Start Match
                        </Button>
                      </div>
                    )}

                    {activeTab !== "upcoming" && (
                      <Button className="w-full mt-4" variant="outline" onClick={() => navigate(`/invoice/${booking.id}`)}>
                        View Invoice
                      </Button>
                    )}
                  </motion.div>
                ))}

                {(activeTab === "upcoming" ? upcomingBookings : pastBookings).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No {activeTab} bookings</p>
                    <Button className="mt-4" onClick={() => navigate("/venues")}>
                      Book Now
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right - Sidebar */}
            <div className="space-y-6">
              {/* Rewards */}
              <div className="bg-card border rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  Rewards Progress
                </h3>
                <div className="space-y-3">
                  {rewards.map((r, i) => (
                    <div key={i} className={`p-3 rounded-lg ${r.status === "unlocked" ? "bg-primary/10" : "bg-secondary"}`}>
                      <div className="flex items-center justify-between">
                        <span className={r.status === "unlocked" ? "text-primary font-medium" : "text-muted-foreground"}>
                          {r.reward}
                        </span>
                        <span className="text-sm">{r.points} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-card border rounded-xl p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button className="w-full justify-between bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" onClick={() => navigate("/venues")}>
                    Book New Slot <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between" onClick={() => navigate("/venues")}>
                    Find Venues <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between" onClick={() => navigate("/players")}>
                    Find Players <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between" onClick={() => navigate("/tournaments")}>
                    Tournaments <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <AIChat />
    </div>
  );
};

export default Dashboard;
