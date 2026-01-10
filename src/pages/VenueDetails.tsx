import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Star, Clock, Users, Cloud, Phone, CheckCircle, ChevronLeft, ChevronRight, Calendar, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChat from "@/components/AIChat";
import { getVenueById } from "@/data/venues";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingContext";
import { toast } from "sonner";

const VenueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const venue = getVenueById(id || "");
  const { user, isAuthenticated, addPoints } = useAuth();
  const { getAvailableSlots, addBooking } = useBooking();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Venue not found</p>
      </div>
    );
  }

  const slots = getAvailableSlots(venue.id, selectedDate);

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast.error("Please login to book");
      navigate("/login");
      return;
    }
    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }

    const slotTime = parseInt(selectedSlot.split(':')[0]);
    const isPeakHour = slotTime >= 20 || slotTime < 4;
    const basePrice = venue.pricePerHour;
    const peakSurcharge = isPeakHour ? 200 : 0;
    const totalAmount = basePrice + peakSurcharge;
    const paidAmount = Math.round(totalAmount); // Full amount or keep 85%? keeping 85% as per original code if intended, but original was 85%.
    // Actually user said "keep the same amount", original code had 85% pay now. I'll keep the 85% logic but on the NEW total.
    const payNowAmount = Math.round(totalAmount * 1.0); // Wait, previous code was totalAmount * 0.85. 
    // Let's stick to the previous 85% logic if that's the "pay now" convention.
    // Line 48: const paidAmount = Math.round(totalAmount * 0.85);

    const booking = addBooking({
      venueId: venue.id,
      venueName: venue.name,
      sport: venue.sports[0], // simplified
      date: selectedDate,
      timeSlot: selectedSlot,
      duration: 1,
      totalAmount,
      paidAmount: Math.round(totalAmount * 0.85),
      remainingAmount: totalAmount - Math.round(totalAmount * 0.85),
      status: "Confirmed",
      userId: user!.id,
      userName: user!.name,
      userPhone: user!.phone
    });

    addPoints(10);
    toast.success("Booking confirmed! +10 Points earned 🎉");
    navigate(`/invoice/${booking.id}`);

  };

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Image Gallery */}
          <div className="relative h-[400px] rounded-2xl overflow-hidden mb-8">
            <img
              src={venue.images[currentImageIndex]}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
            {venue.images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background"
                  onClick={() => setCurrentImageIndex(i => i === 0 ? venue.images.length - 1 : i - 1)}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background"
                  onClick={() => setCurrentImageIndex(i => i === venue.images.length - 1 ? 0 : i + 1)}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            {venue.isVerified && (
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground">
                <CheckCircle className="w-4 h-4" />
                Verified Venue
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left - Details */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {venue.sports.map(sport => (
                    <span key={sport} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {sport}
                    </span>
                  ))}
                </div>
                <h1 className="text-3xl font-bold mb-2">{venue.name}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {venue.address}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-sport-cricket fill-sport-cricket" />
                    {venue.rating} ({venue.reviews} reviews)
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground">{venue.description}</p>

              <div>
                <h3 className="font-semibold mb-3">Facilities</h3>
                <div className="flex flex-wrap gap-2">
                  {venue.facilities.map(f => (
                    <span key={f} className="px-3 py-1.5 rounded-lg bg-secondary text-sm">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Rules</h3>
                <ul className="space-y-2">
                  {venue.rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right - Booking */}
            <motion.div
              className="bg-card border rounded-2xl p-6 h-fit sticky top-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-3xl font-bold text-primary">₹{venue.pricePerHour}</span>
                  <span className="text-muted-foreground">/hour</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" />
                  {venue.crowdLevel} Crowd
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Select Date</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {dates.map(date => {
                    const d = new Date(date);
                    return (
                      <button
                        key={date}
                        className={`flex-shrink-0 px-3 py-2 rounded-lg text-center ${selectedDate === date ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                        onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                      >
                        <div className="text-xs">{d.toLocaleDateString('en', { weekday: 'short' })}</div>
                        <div className="font-semibold">{d.getDate()}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Select Time</label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {slots.map(slot => (
                    <button
                      key={slot.time}
                      disabled={!slot.isAvailable}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${!slot.isAvailable
                        ? 'bg-muted text-muted-foreground cursor-not-allowed line-through'
                        : selectedSlot === slot.time
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      onClick={() => setSelectedSlot(slot.time)}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>

              {selectedSlot && (
                <div className="mb-6 p-4 bg-secondary rounded-lg border border-border">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Rate per hour</span>
                    <span className="font-semibold">₹{venue.pricePerHour}</span>
                  </div>

                  {(parseInt(selectedSlot.split(':')[0]) >= 20 || parseInt(selectedSlot.split(':')[0]) < 4) && (
                    <div className="flex justify-between mb-2 text-amber-600">
                      <span className="flex items-center gap-1 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Peak Hour Charge
                      </span>
                      <span className="font-semibold">+₹200</span>
                    </div>
                  )}

                  <div className="h-px bg-border/50 my-2" />

                  <div className="flex justify-between mb-2 text-lg font-bold text-foreground">
                    <span>Total Amount</span>
                    <span>
                      ₹{venue.pricePerHour + ((parseInt(selectedSlot.split(':')[0]) >= 20 || parseInt(selectedSlot.split(':')[0]) < 4) ? 200 : 0)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground bg-background/50 p-2 rounded">
                    <span>Pay Now (85%)</span>
                    <span className="text-primary font-bold">
                      ₹{Math.round((venue.pricePerHour + ((parseInt(selectedSlot.split(':')[0]) >= 20 || parseInt(selectedSlot.split(':')[0]) < 4) ? 200 : 0)) * 0.85)}
                    </span>
                  </div>
                </div>
              )}

              <Button className="w-full" size="lg" onClick={handleBooking}>
                Book Now
              </Button>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                {venue.contactPhone}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
      <AIChat />
    </div>
  );
};

export default VenueDetails;
