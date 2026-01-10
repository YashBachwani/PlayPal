import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Booking {
  id: string;
  venueId: string;
  venueName: string;
  sport: string;
  date: string;
  timeSlot: string;
  duration: number; // in hours
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "Confirmed" | "Completed" | "Cancelled" | "Pending";
  userId: string;
  userName: string;
  userPhone: string;
  createdAt: string;
  isManual?: boolean; // For turf owner manual bookings
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  price: number;
}

interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, "id" | "createdAt">) => Booking;
  cancelBooking: (bookingId: string) => void;
  completeBooking: (bookingId: string) => void;
  getBookingsByUser: (userId: string) => Booking[];
  getBookingsByVenue: (venueId: string) => Booking[];
  getBookingsByDate: (venueId: string, date: string) => Booking[];
  getAvailableSlots: (venueId: string, date: string) => TimeSlot[];
  isSlotAvailable: (venueId: string, date: string, time: string) => boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Generate time slots from 6 AM to 11 PM
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 6; hour <= 23; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    slots.push(time);
  }
  return slots;
};

const ALL_TIME_SLOTS = generateTimeSlots();

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    // Load bookings from localStorage
    const storedBookings = localStorage.getItem("playpal_bookings");
    if (storedBookings) {
      try {
        setBookings(JSON.parse(storedBookings));
      } catch (e) {
        localStorage.removeItem("playpal_bookings");
      }
    }
  }, []);

  const saveBookings = (newBookings: Booking[]) => {
    setBookings(newBookings);
    localStorage.setItem("playpal_bookings", JSON.stringify(newBookings));
  };

  const addBooking = (bookingData: Omit<Booking, "id" | "createdAt">): Booking => {
    const newBooking: Booking = {
      ...bookingData,
      id: `booking_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    const updatedBookings = [...bookings, newBooking];
    saveBookings(updatedBookings);
    return newBooking;
  };

  const cancelBooking = (bookingId: string) => {
    const updatedBookings = bookings.map(b =>
      b.id === bookingId ? { ...b, status: "Cancelled" as const } : b
    );
    saveBookings(updatedBookings);
  };

  const completeBooking = (bookingId: string) => {
    const updatedBookings = bookings.map(b =>
      b.id === bookingId ? { ...b, status: "Completed" as const, paidAmount: b.totalAmount, remainingAmount: 0 } : b
    );
    saveBookings(updatedBookings);
  };

  const getBookingsByUser = (userId: string): Booking[] => {
    return bookings.filter(b => b.userId === userId);
  };

  const getBookingsByVenue = (venueId: string): Booking[] => {
    return bookings.filter(b => b.venueId === venueId);
  };

  const getBookingsByDate = (venueId: string, date: string): Booking[] => {
    return bookings.filter(b =>
      b.venueId === venueId &&
      b.date === date &&
      b.status !== "Cancelled"
    );
  };

  const getAvailableSlots = (venueId: string, date: string): TimeSlot[] => {
    const dateBookings = getBookingsByDate(venueId, date);
    const bookedSlots = new Set(dateBookings.map(b => b.timeSlot));

    return ALL_TIME_SLOTS.map(time => ({
      time,
      isAvailable: !bookedSlots.has(time),
      price: getSlotPrice(time)
    }));
  };

  const getSlotPrice = (time: string): number => {
    const hour = parseInt(time.split(':')[0]);
    // Peak hours (6-10 AM, 5-10 PM) cost more
    if ((hour >= 6 && hour <= 10) || (hour >= 17 && hour <= 22)) {
      return 1500; // Peak price
    }
    return 1000; // Off-peak price
  };

  const isSlotAvailable = (venueId: string, date: string, time: string): boolean => {
    const slots = getAvailableSlots(venueId, date);
    const slot = slots.find(s => s.time === time);
    return slot?.isAvailable ?? false;
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        addBooking,
        cancelBooking,
        completeBooking,
        getBookingsByUser,
        getBookingsByVenue,
        getBookingsByDate,
        getAvailableSlots,
        isSlotAvailable
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
