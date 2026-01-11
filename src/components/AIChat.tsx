import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { venues, searchVenues, gujaratCities } from "@/data/venues";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

type BookingState = "IDLE" | "BOOKING_INTENT" | "AWAITING_SPORT" | "AWAITING_CITY" | "AWAITING_DATE" | "AWAITING_CONFIRMATION" | "BOOKED";

interface BookingData {
  sport: string;
  city: string;
  date: string;
  venueId: string;
}

const quickPrompts = [
  "Book a cricket slot",
  "Tennis courts nearby?",
  "Find football turfs",
  "Badminton in Ahmedabad",
];

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! 👋 How can I help you book your next game or find a sports slot today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [bookingState, setBookingState] = useState<BookingState>("IDLE");
  const [bookingData, setBookingData] = useState<BookingData>({
    sport: "",
    city: "",
    date: "",
    venueId: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase();

    // Context Reset / Exit
    if (lower.includes("exit") || lower.includes("cancel") || lower.includes("stop")) {
      setBookingState("IDLE");
      return "No problem! Let me know if you need anything else. How can I help you today?";
    }

    // State Machine
    switch (bookingState) {
      case "IDLE":
        if (lower.includes("book") || lower.includes("slot") || lower.includes("play")) {
          setBookingState("BOOKING_INTENT");

          // Check if they already provided some info
          let detectedSport = "";
          ["cricket", "football", "badminton", "tennis", "pickleball"].forEach(s => {
            if (lower.includes(s)) detectedSport = s.charAt(0).toUpperCase() + s.slice(1);
          });

          if (detectedSport) {
            setBookingData(prev => ({ ...prev, sport: detectedSport }));
            setBookingState("AWAITING_CITY");
            return "Great! Let’s find the right slot for you. Which city are you in? (e.g., Ahmedabad, Surat)";
          }

          return "Great! Let’s find the right slot for you. Which sport are you interested in?";
        }
        return "I'm here to help! You can ask me to book a slot, find players nearby, or check tournament details. What's on your mind?";

      case "BOOKING_INTENT":
      case "AWAITING_SPORT":
        const sports = ["cricket", "football", "badminton", "tennis", "pickleball"];
        const foundSport = sports.find(s => lower.includes(s));
        if (foundSport) {
          const sportName = foundSport.charAt(0).toUpperCase() + foundSport.slice(1);
          setBookingData(prev => ({ ...prev, sport: sportName }));
          setBookingState("AWAITING_CITY");
          return `Awesome, ${sportName}! 🏏 Which city are you looking to play in? (e.g., Ahmedabad, Surat)`;
        }
        return "I'm not sure which sport that is. We have Cricket, Football, Badminton, Tennis, and Pickleball! Which one would you like?";

      case "AWAITING_CITY":
        const foundCity = gujaratCities.find(c => lower.includes(c.name.toLowerCase()));
        if (foundCity) {
          setBookingData(prev => ({ ...prev, city: foundCity.name }));
          setBookingState("AWAITING_DATE");
          return `Perfect, ${foundCity.name} has some great venues! For which date would you like to book? (e.g., Today, Tomorrow, or Saturday)`;
        }
        return `I couldn't find matches in that location. We currently support ${gujaratCities.slice(0, 5).map(c => c.name).join(", ")} and more. Where are you located?`;

      case "AWAITING_DATE":
        setBookingData(prev => ({ ...prev, date: userMessage }));
        const searchResults = searchVenues("", bookingData.city).filter(v =>
          v.sports.includes(bookingData.sport)
        );

        if (searchResults.length > 0) {
          const venue = searchResults[0];
          setBookingData(prev => ({ ...prev, venueId: venue.id }));
          setBookingState("AWAITING_CONFIRMATION");
          return `Good news! ${venue.name} in ${venue.location} has slots available for ${bookingData.sport} on ${userMessage}.\n\nIt's rated ${venue.rating}⭐ and costs ₹${venue.pricePerHour}/hour. Would you like to confirm this booking?`;
        } else {
          // Suggest alternative in same city
          const otherVenues = searchVenues("", bookingData.city).slice(0, 2);
          if (otherVenues.length > 0) {
            return `Sorry, I couldn't find a ${bookingData.sport} slot in that specific area. How about checking out ${otherVenues.map(v => v.name).join(" or ")}? They have great facilities! Or would you like to try another date?`;
          }
          setBookingState("IDLE");
          return `I'm sorry, I couldn't find any suitable slots for ${bookingData.sport} in ${bookingData.city} right now. Would you like to try a different sport or city?`;
        }

      case "AWAITING_CONFIRMATION":
        if (lower.includes("yes") || lower.includes("sure") || lower.includes("confirm") || lower.includes("okay")) {
          setBookingState("BOOKED");
          return "Your slot is booked! 🎉 You’ll receive a confirmation shortly on your registered mobile number. See you on the field!";
        }
        setBookingState("IDLE");
        return "No problem, I've canceled the request. Let me know if you want to look for something else!";

      case "BOOKED":
        setBookingState("IDLE");
        return "Your previous booking is all set! Want to find another game or find some players nearby?";

      default:
        return "I'm here to help! Would you like to book a slot or find players?";
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 500);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-hero shadow-glow flex items-center justify-center text-primary-foreground"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <MessageCircle className="w-6 h-6" />
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] rounded-2xl bg-card border border-border shadow-card overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="p-4 gradient-hero text-primary-foreground flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">PlayPal AI</h3>
                  <p className="text-xs opacity-80">Online & Ready to Book</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-primary-foreground/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border border-border text-foreground shadow-sm"
                      }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-card text-foreground border border-border rounded-tl-none"
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <span className="text-[10px] opacity-50 mt-1 block text-right">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-card border border-border shadow-sm">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-primary/40"
                          animate={{ y: [0, -4, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-3 border-t border-border flex gap-2 overflow-x-auto bg-card">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="px-3 py-1.5 rounded-full bg-secondary/80 text-secondary-foreground text-xs font-semibold whitespace-nowrap hover:bg-primary hover:text-primary-foreground transition-all border border-border/50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 rounded-xl bg-secondary/50 text-foreground placeholder:text-muted-foreground outline-none border border-transparent focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                />
                <Button
                  onClick={handleSend}
                  size="icon"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-[46px] w-[46px] shadow-lg shadow-primary/20"
                  disabled={!input.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChat;
