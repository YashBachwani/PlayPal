import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Plus, Users, IndianRupee, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, TurfOwner } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingContext";
import { getVenueById } from "@/data/venues";
import { toast } from "sonner";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getBookingsByVenue, addBooking, getAvailableSlots } = useBooking();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [manualBooking, setManualBooking] = useState({ name: "", phone: "", slot: "" });

  if (!user || user.role !== "turf_owner") {
    navigate("/login");
    return null;
  }

  const owner = user as TurfOwner;
  const venue = getVenueById(owner.turfId);
  const bookings = getBookingsByVenue(owner.turfId);
  const todayBookings = bookings.filter(b => b.date === selectedDate && b.status !== "Cancelled");
  const slots = getAvailableSlots(owner.turfId, selectedDate);

  const totalRevenue = bookings.filter(b => b.status === "Completed").reduce((sum, b) => sum + b.totalAmount, 0);
  const todayRevenue = todayBookings.reduce((sum, b) => sum + b.paidAmount, 0);

  const handleAddManualBooking = () => {
    if (!manualBooking.name || !manualBooking.phone || !manualBooking.slot) {
      toast.error("Please fill all fields");
      return;
    }

    addBooking({
      venueId: owner.turfId,
      venueName: venue?.name || owner.turfName,
      sport: venue?.sports[0] || "Cricket",
      date: selectedDate,
      timeSlot: manualBooking.slot,
      duration: 1,
      totalAmount: 1000,
      paidAmount: 1000,
      remainingAmount: 0,
      status: "Confirmed",
      userId: "manual",
      userName: manualBooking.name,
      userPhone: manualBooking.phone,
      isManual: true
    });

    toast.success("Booking added successfully!");
    setManualBooking({ name: "", phone: "", slot: "" });
    setShowAddBooking(false);
  };

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold">
              <span className="text-foreground">P</span>
              <span className="text-primary">l</span>
              <span className="text-foreground">ayPal</span>
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="font-medium">{owner.turfName}</span>
          </div>
          <Button variant="outline" onClick={() => { logout(); navigate("/"); }}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border rounded-xl p-6">
            <p className="text-muted-foreground text-sm">Today's Bookings</p>
            <p className="text-3xl font-bold">{todayBookings.length}</p>
          </div>
          <div className="bg-card border rounded-xl p-6">
            <p className="text-muted-foreground text-sm">Today's Revenue</p>
            <p className="text-3xl font-bold text-primary">₹{todayRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-card border rounded-xl p-6">
            <p className="text-muted-foreground text-sm">Total Bookings</p>
            <p className="text-3xl font-bold">{bookings.length}</p>
          </div>
          <div className="bg-card border rounded-xl p-6">
            <p className="text-muted-foreground text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-primary">₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar & Slots */}
          <div className="lg:col-span-2">
            {/* Date Picker */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Booking Calendar</h2>
              <Button onClick={() => setShowAddBooking(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Manual Booking
              </Button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {dates.map(date => {
                const d = new Date(date);
                const count = bookings.filter(b => b.date === date && b.status !== "Cancelled").length;
                return (
                  <button
                    key={date}
                    className={`flex-shrink-0 px-4 py-3 rounded-xl text-center min-w-[80px] ${selectedDate === date ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="text-xs">{d.toLocaleDateString('en', { weekday: 'short' })}</div>
                    <div className="text-xl font-bold">{d.getDate()}</div>
                    <div className="text-xs mt-1">{count} bookings</div>
                  </button>
                );
              })}
            </div>

            {/* Time Slots Grid */}
            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-semibold mb-4">Time Slots</h3>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {slots.map(slot => {
                  const booking = todayBookings.find(b => b.timeSlot === slot.time);
                  return (
                    <div
                      key={slot.time}
                      className={`p-3 rounded-lg text-center ${
                        booking ? 'bg-primary/10 border-primary border' : 'bg-secondary'
                      }`}
                    >
                      <div className="font-medium">{slot.time}</div>
                      {booking && (
                        <div className="text-xs mt-1 text-primary truncate">{booking.userName}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Today's Bookings */}
          <div>
            <h2 className="text-xl font-bold mb-4">Today's Schedule</h2>
            <div className="space-y-3">
              {todayBookings.length > 0 ? todayBookings.map(booking => (
                <div key={booking.id} className="bg-card border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{booking.timeSlot}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${booking.isManual ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
                      {booking.isManual ? 'Walk-in' : 'Online'}
                    </span>
                  </div>
                  <p className="font-medium">{booking.userName}</p>
                  <p className="text-sm text-muted-foreground">{booking.userPhone}</p>
                  <p className="text-sm text-primary mt-1">₹{booking.paidAmount} paid</p>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No bookings for this day</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Manual Booking Modal */}
        {showAddBooking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-card rounded-xl p-6 w-full max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h3 className="text-xl font-bold mb-4">Add Manual Booking</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Customer Name</label>
                  <Input
                    value={manualBooking.name}
                    onChange={(e) => setManualBooking({ ...manualBooking, name: e.target.value })}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone Number</label>
                  <Input
                    value={manualBooking.phone}
                    onChange={(e) => setManualBooking({ ...manualBooking, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Time Slot</label>
                  <select
                    className="w-full h-10 px-3 rounded-md border bg-background"
                    value={manualBooking.slot}
                    onChange={(e) => setManualBooking({ ...manualBooking, slot: e.target.value })}
                  >
                    <option value="">Select a slot</option>
                    {slots.filter(s => s.isAvailable).map(s => (
                      <option key={s.time} value={s.time}>{s.time}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddBooking(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAddManualBooking}>
                  Add Booking
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;
