// Players Data for Matchmaking

export interface Player {
  id: string;
  name: string;
  avatar: string;
  city: string;
  sports: string[];
  skillLevel: "Beginner" | "Intermediate" | "Advanced" | "Pro";
  playStyle: "Casual" | "Competitive";
  age: number;
  gender: "Male" | "Female" | "Other";
  matchesPlayed: number;
  rating: number;
  badges: string[];
  points: number;
  bio: string;
  availability: string[];
  lookingFor: string[];
  isOnline: boolean;
}

export const players: Player[] = [
  {
    id: "p001",
    name: "Arjun Patel",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop",
    city: "Ahmedabad",
    sports: ["Cricket", "Football"],
    skillLevel: "Advanced",
    playStyle: "Competitive",
    age: 28,
    gender: "Male",
    matchesPlayed: 156,
    rating: 4.8,
    badges: ["Tournament Winner", "Century Scorer", "Team Captain"],
    points: 2450,
    bio: "Weekend warrior looking for quality cricket matches. Love competitive games!",
    availability: ["Evening", "Weekend"],
    lookingFor: ["Cricket", "Football"],
    isOnline: true
  },
  {
    id: "p002",
    name: "Priya Sharma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop",
    city: "Ahmedabad",
    sports: ["Badminton", "Tennis"],
    skillLevel: "Intermediate",
    playStyle: "Casual",
    age: 25,
    gender: "Female",
    matchesPlayed: 89,
    rating: 4.6,
    badges: ["Rising Star", "Consistent Player"],
    points: 1200,
    bio: "Love playing badminton after work. Always up for a friendly match!",
    availability: ["Evening", "Night"],
    lookingFor: ["Badminton"],
    isOnline: true
  },
  {
    id: "p003",
    name: "Rahul Mehta",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop",
    city: "Ahmedabad",
    sports: ["Football"],
    skillLevel: "Pro",
    playStyle: "Competitive",
    age: 30,
    gender: "Male",
    matchesPlayed: 234,
    rating: 4.9,
    badges: ["Pro Player", "Tournament Winner", "Goal Machine"],
    points: 3800,
    bio: "Ex-college football captain. Looking for serious players for weekend matches.",
    availability: ["Weekend", "Morning"],
    lookingFor: ["Football"],
    isOnline: false
  },
  {
    id: "p004",
    name: "Sneha Desai",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop",
    city: "Surat",
    sports: ["Tennis", "Pickleball"],
    skillLevel: "Advanced",
    playStyle: "Competitive",
    age: 27,
    gender: "Female",
    matchesPlayed: 145,
    rating: 4.7,
    badges: ["Tennis Pro", "Quick Learner"],
    points: 2100,
    bio: "Tennis enthusiast exploring pickleball. Let's play!",
    availability: ["Morning", "Evening"],
    lookingFor: ["Tennis", "Pickleball"],
    isOnline: true
  },
  {
    id: "p005",
    name: "Vikram Singh",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop",
    city: "Vadodara",
    sports: ["Cricket"],
    skillLevel: "Intermediate",
    playStyle: "Casual",
    age: 32,
    gender: "Male",
    matchesPlayed: 78,
    rating: 4.4,
    badges: ["Team Player", "Reliable"],
    points: 980,
    bio: "Cricket lover since childhood. Looking for weekend gully cricket matches!",
    availability: ["Weekend"],
    lookingFor: ["Cricket"],
    isOnline: false
  },
  {
    id: "p006",
    name: "Kavya Joshi",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop",
    city: "Ahmedabad",
    sports: ["Badminton"],
    skillLevel: "Beginner",
    playStyle: "Casual",
    age: 23,
    gender: "Female",
    matchesPlayed: 34,
    rating: 4.2,
    badges: ["New Player", "Enthusiast"],
    points: 450,
    bio: "Just started playing badminton. Looking for patient partners to learn with!",
    availability: ["Evening", "Weekend"],
    lookingFor: ["Badminton"],
    isOnline: true
  },
  {
    id: "p007",
    name: "Nikhil Agarwal",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&auto=format&fit=crop",
    city: "Rajkot",
    sports: ["Cricket", "Tennis"],
    skillLevel: "Advanced",
    playStyle: "Competitive",
    age: 29,
    gender: "Male",
    matchesPlayed: 189,
    rating: 4.8,
    badges: ["All-Rounder", "Tournament Regular"],
    points: 2890,
    bio: "Play both cricket and tennis at competitive level. Always looking for worthy opponents!",
    availability: ["Morning", "Evening", "Weekend"],
    lookingFor: ["Cricket", "Tennis"],
    isOnline: true
  },
  {
    id: "p008",
    name: "Ananya Reddy",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop",
    city: "Gandhinagar",
    sports: ["Football", "Badminton"],
    skillLevel: "Intermediate",
    playStyle: "Casual",
    age: 26,
    gender: "Female",
    matchesPlayed: 67,
    rating: 4.5,
    badges: ["Versatile Player", "Team Spirit"],
    points: 890,
    bio: "Love team sports! Looking for mixed football teams and badminton partners.",
    availability: ["Evening", "Weekend"],
    lookingFor: ["Football", "Badminton"],
    isOnline: false
  },
  {
    id: "p009",
    name: "Harsh Trivedi",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop",
    city: "Surat",
    sports: ["Cricket"],
    skillLevel: "Pro",
    playStyle: "Competitive",
    age: 35,
    gender: "Male",
    matchesPlayed: 312,
    rating: 4.9,
    badges: ["Veteran", "Coach", "Tournament Winner"],
    points: 5200,
    bio: "Former district level player. Now coaching and playing for fun. Can help beginners!",
    availability: ["Morning", "Weekend"],
    lookingFor: ["Cricket"],
    isOnline: true
  },
  {
    id: "p010",
    name: "Riya Shah",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop",
    city: "Ahmedabad",
    sports: ["Pickleball", "Tennis"],
    skillLevel: "Beginner",
    playStyle: "Casual",
    age: 24,
    gender: "Female",
    matchesPlayed: 23,
    rating: 4.3,
    badges: ["Quick Learner", "Positive Energy"],
    points: 320,
    bio: "New to racket sports but loving every moment. Weekends are for sports!",
    availability: ["Weekend"],
    lookingFor: ["Pickleball"],
    isOnline: true
  },
  {
    id: "p011",
    name: "Dev Patel",
    avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&auto=format&fit=crop",
    city: "Bhavnagar",
    sports: ["Football", "Cricket"],
    skillLevel: "Intermediate",
    playStyle: "Competitive",
    age: 27,
    gender: "Male",
    matchesPlayed: 112,
    rating: 4.6,
    badges: ["Goal Scorer", "Team Player"],
    points: 1560,
    bio: "Football first, cricket second. Looking for regular weekend games!",
    availability: ["Evening", "Weekend"],
    lookingFor: ["Football"],
    isOnline: false
  },
  {
    id: "p012",
    name: "Meera Iyer",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop",
    city: "Vadodara",
    sports: ["Badminton", "Tennis"],
    skillLevel: "Advanced",
    playStyle: "Competitive",
    age: 28,
    gender: "Female",
    matchesPlayed: 178,
    rating: 4.7,
    badges: ["Smash Queen", "Tournament Regular"],
    points: 2340,
    bio: "Competitive badminton player. State level qualifier. Looking for serious matches!",
    availability: ["Morning", "Evening"],
    lookingFor: ["Badminton"],
    isOnline: true
  }
];

export const getPlayersByCity = (city: string): Player[] => {
  return players.filter(p => p.city.toLowerCase() === city.toLowerCase());
};

export const getPlayersBySport = (sport: string): Player[] => {
  return players.filter(p => 
    p.sports.some(s => s.toLowerCase() === sport.toLowerCase())
  );
};

export const getCompatiblePlayers = (player: Player): Player[] => {
  return players.filter(p => 
    p.id !== player.id &&
    p.city === player.city &&
    p.sports.some(s => player.sports.includes(s)) &&
    Math.abs(["Beginner", "Intermediate", "Advanced", "Pro"].indexOf(p.skillLevel) - 
             ["Beginner", "Intermediate", "Advanced", "Pro"].indexOf(player.skillLevel)) <= 1
  );
};

export const searchPlayers = (query: string, city?: string, sport?: string): Player[] => {
  let results = players;
  
  if (city) {
    results = results.filter(p => p.city.toLowerCase() === city.toLowerCase());
  }
  
  if (sport) {
    results = results.filter(p => 
      p.sports.some(s => s.toLowerCase() === sport.toLowerCase())
    );
  }
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.bio.toLowerCase().includes(lowerQuery)
    );
  }
  
  return results;
};
