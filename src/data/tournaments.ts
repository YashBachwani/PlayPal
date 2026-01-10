// Tournaments Data

export interface Tournament {
  id: string;
  name: string;
  sport: string;
  image: string;
  city: string;
  venue: string;
  date: string;
  time: string;
  entryFee: number;
  prizePool: number;
  maxTeams: number;
  registeredTeams: number;
  format: string;
  description: string;
  rules: string[];
  prizes: { position: string; prize: string }[];
  organizer: string;
  contactPhone: string;
  status: "Upcoming" | "Ongoing" | "Completed" | "Registration Open";
  registrationDeadline: string;
}

export const tournaments: Tournament[] = [
  {
    id: "t001",
    name: "Ahmedabad Premier Cricket League",
    sport: "Cricket",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop",
    city: "Ahmedabad",
    venue: "Elite Cricket Arena, Satellite",
    date: "2025-02-15",
    time: "08:00 AM",
    entryFee: 5000,
    prizePool: 100000,
    maxTeams: 16,
    registeredTeams: 12,
    format: "T20",
    description: "The biggest cricket tournament in Ahmedabad! Teams from across the city compete for glory and massive prizes.",
    rules: [
      "Team of 11 players + 4 substitutes",
      "20 overs per side",
      "DRS not available",
      "Matches start sharp at scheduled time"
    ],
    prizes: [
      { position: "1st", prize: "₹50,000 + Trophy" },
      { position: "2nd", prize: "₹25,000" },
      { position: "3rd", prize: "₹15,000" },
      { position: "Best Batsman", prize: "₹5,000" },
      { position: "Best Bowler", prize: "₹5,000" }
    ],
    organizer: "PlayPal Sports",
    contactPhone: "+91 98765 11111",
    status: "Registration Open",
    registrationDeadline: "2025-02-10"
  },
  {
    id: "t002",
    name: "Gujarat Badminton Open",
    sport: "Badminton",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop",
    city: "Ahmedabad",
    venue: "Shuttle Masters, Prahladnagar",
    date: "2025-02-08",
    time: "09:00 AM",
    entryFee: 500,
    prizePool: 25000,
    maxTeams: 64,
    registeredTeams: 48,
    format: "Singles & Doubles",
    description: "Open badminton tournament for all skill levels. Separate categories for beginners and advanced players.",
    rules: [
      "BWF rules apply",
      "Best of 3 games",
      "21 points per game",
      "Own equipment required"
    ],
    prizes: [
      { position: "Singles Winner", prize: "₹10,000 + Trophy" },
      { position: "Singles Runner-up", prize: "₹5,000" },
      { position: "Doubles Winner", prize: "₹6,000" },
      { position: "Doubles Runner-up", prize: "₹4,000" }
    ],
    organizer: "Shuttle Masters Academy",
    contactPhone: "+91 98765 22222",
    status: "Registration Open",
    registrationDeadline: "2025-02-05"
  },
  {
    id: "t003",
    name: "5-A-Side Football Championship",
    sport: "Football",
    image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop",
    city: "Surat",
    venue: "Diamond City Ground, Vesu",
    date: "2025-02-22",
    time: "06:00 PM",
    entryFee: 3000,
    prizePool: 50000,
    maxTeams: 12,
    registeredTeams: 8,
    format: "5-a-Side",
    description: "Fast-paced 5-a-side football tournament under floodlights. Perfect for corporate teams and friend groups!",
    rules: [
      "5 players per team + 3 substitutes",
      "20 minutes per half",
      "Rolling substitutions",
      "No offside rule"
    ],
    prizes: [
      { position: "1st", prize: "₹25,000 + Trophy" },
      { position: "2nd", prize: "₹15,000" },
      { position: "3rd", prize: "₹10,000" }
    ],
    organizer: "Surat Sports Club",
    contactPhone: "+91 98765 33333",
    status: "Registration Open",
    registrationDeadline: "2025-02-18"
  },
  {
    id: "t004",
    name: "Tennis Masters Vadodara",
    sport: "Tennis",
    image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop",
    city: "Vadodara",
    venue: "Baroda Sports Club",
    date: "2025-03-01",
    time: "07:00 AM",
    entryFee: 1000,
    prizePool: 40000,
    maxTeams: 32,
    registeredTeams: 18,
    format: "Singles",
    description: "Prestigious tennis tournament attracting players from across Gujarat.",
    rules: [
      "ITF rules apply",
      "Best of 3 sets",
      "Tie-break at 6-6",
      "White dress code preferred"
    ],
    prizes: [
      { position: "Winner", prize: "₹20,000 + Trophy" },
      { position: "Runner-up", prize: "₹12,000" },
      { position: "Semi-finalists", prize: "₹4,000 each" }
    ],
    organizer: "Vadodara Tennis Association",
    contactPhone: "+91 98765 44444",
    status: "Upcoming",
    registrationDeadline: "2025-02-25"
  },
  {
    id: "t005",
    name: "Corporate Cricket Cup",
    sport: "Cricket",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop",
    city: "Gandhinagar",
    venue: "Capital Sports Arena",
    date: "2025-02-28",
    time: "08:00 AM",
    entryFee: 8000,
    prizePool: 150000,
    maxTeams: 8,
    registeredTeams: 6,
    format: "T10",
    description: "Exclusive tournament for corporate teams. Network while you play!",
    rules: [
      "Corporate teams only",
      "10 overs per side",
      "Team of 8 players",
      "Company ID required"
    ],
    prizes: [
      { position: "1st", prize: "₹75,000 + Trophy" },
      { position: "2nd", prize: "₹40,000" },
      { position: "3rd", prize: "₹25,000" },
      { position: "MVP", prize: "₹10,000" }
    ],
    organizer: "PlayPal Corporate",
    contactPhone: "+91 98765 55555",
    status: "Registration Open",
    registrationDeadline: "2025-02-22"
  },
  {
    id: "t006",
    name: "Pickleball Premiere League",
    sport: "Pickleball",
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop",
    city: "Ahmedabad",
    venue: "Pickle Point Arena, Vastrapur",
    date: "2025-02-12",
    time: "10:00 AM",
    entryFee: 300,
    prizePool: 15000,
    maxTeams: 32,
    registeredTeams: 24,
    format: "Doubles",
    description: "Gujarat's first major pickleball tournament! Perfect for beginners and enthusiasts.",
    rules: [
      "USA Pickleball rules",
      "Best of 3 games to 11",
      "Paddles provided if needed",
      "Mixed doubles category available"
    ],
    prizes: [
      { position: "Winners", prize: "₹8,000 + Trophy" },
      { position: "Runners-up", prize: "₹4,000" },
      { position: "3rd Place", prize: "₹3,000" }
    ],
    organizer: "Pickle Point Academy",
    contactPhone: "+91 98765 66666",
    status: "Registration Open",
    registrationDeadline: "2025-02-08"
  },
  {
    id: "t007",
    name: "Rajkot Football League",
    sport: "Football",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop",
    city: "Rajkot",
    venue: "Race Course Sports Club",
    date: "2025-03-10",
    time: "05:00 PM",
    entryFee: 4000,
    prizePool: 60000,
    maxTeams: 10,
    registeredTeams: 4,
    format: "7-a-Side",
    description: "Premier football league in Rajkot. League format with playoffs!",
    rules: [
      "7 players per team",
      "League + Knockout format",
      "25 minutes per half",
      "Yellow/Red card system"
    ],
    prizes: [
      { position: "Champions", prize: "₹30,000 + Trophy" },
      { position: "Runners-up", prize: "₹18,000" },
      { position: "3rd Place", prize: "₹12,000" }
    ],
    organizer: "Rajkot Football Club",
    contactPhone: "+91 98765 77777",
    status: "Upcoming",
    registrationDeadline: "2025-03-05"
  },
  {
    id: "t008",
    name: "Women's Badminton Championship",
    sport: "Badminton",
    image: "https://images.unsplash.com/photo-1613918431703-aa50889e3be4?w=800&auto=format&fit=crop",
    city: "Surat",
    venue: "Smash Badminton Hub, Adajan",
    date: "2025-02-20",
    time: "09:00 AM",
    entryFee: 400,
    prizePool: 20000,
    maxTeams: 48,
    registeredTeams: 32,
    format: "Singles & Doubles",
    description: "Exclusive women's badminton tournament to encourage female participation in sports.",
    rules: [
      "Women only",
      "Age categories: U-18, Open, 35+",
      "BWF rules apply",
      "Medals for all finalists"
    ],
    prizes: [
      { position: "Open Singles", prize: "₹8,000" },
      { position: "Open Doubles", prize: "₹6,000" },
      { position: "U-18 Winner", prize: "₹3,000" },
      { position: "35+ Winner", prize: "₹3,000" }
    ],
    organizer: "Gujarat Women Sports Association",
    contactPhone: "+91 98765 88888",
    status: "Registration Open",
    registrationDeadline: "2025-02-15"
  }
];

export const getTournamentsByCity = (city: string): Tournament[] => {
  return tournaments.filter(t => t.city.toLowerCase() === city.toLowerCase());
};

export const getTournamentsBySport = (sport: string): Tournament[] => {
  return tournaments.filter(t => t.sport.toLowerCase() === sport.toLowerCase());
};

export const getTournamentById = (id: string): Tournament | undefined => {
  return tournaments.find(t => t.id === id);
};

export const getUpcomingTournaments = (): Tournament[] => {
  const today = new Date();
  return tournaments.filter(t => new Date(t.date) >= today);
};
