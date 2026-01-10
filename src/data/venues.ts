// Real Gujarat Sports Venues Data

export interface Venue {
  id: string;
  name: string;
  image: string;
  sports: string[];
  location: string;
  city: string;
  district: string;
  address: string;
  distance: string;
  pricePerHour: number;
  rating: number;
  reviews: number;
  crowdLevel: "Low" | "Medium" | "High";
  weather: string;
  slotsAvailable: number;
  isVerified: boolean;
  facilities: string[];
  rules: string[];
  contactPhone: string;
  openTime: string;
  closeTime: string;
  images: string[];
  description: string;
}

export interface City {
  name: string;
  district: string;
  state: string;
}

export const gujaratCities: City[] = [
  { name: "Ahmedabad", district: "Ahmedabad", state: "Gujarat" },
  { name: "Surat", district: "Surat", state: "Gujarat" },
  { name: "Vadodara", district: "Vadodara", state: "Gujarat" },
  { name: "Rajkot", district: "Rajkot", state: "Gujarat" },
  { name: "Gandhinagar", district: "Gandhinagar", state: "Gujarat" },
  { name: "Bhavnagar", district: "Bhavnagar", state: "Gujarat" },
  { name: "Jamnagar", district: "Jamnagar", state: "Gujarat" },
  { name: "Junagadh", district: "Junagadh", state: "Gujarat" },
  { name: "Anand", district: "Anand", state: "Gujarat" },
  { name: "Nadiad", district: "Kheda", state: "Gujarat" },
  { name: "Morbi", district: "Morbi", state: "Gujarat" },
  { name: "Mehsana", district: "Mehsana", state: "Gujarat" },
  { name: "Bharuch", district: "Bharuch", state: "Gujarat" },
  { name: "Vapi", district: "Valsad", state: "Gujarat" },
  { name: "Navsari", district: "Navsari", state: "Gujarat" },
  { name: "Veraval", district: "Gir Somnath", state: "Gujarat" },
  { name: "Porbandar", district: "Porbandar", state: "Gujarat" },
  { name: "Godhra", district: "Panchmahal", state: "Gujarat" },
  { name: "Bhuj", district: "Kutch", state: "Gujarat" },
  { name: "Palanpur", district: "Banaskantha", state: "Gujarat" },
];

export const venues: Venue[] = [
  // Ahmedabad Venues
  {
    id: "ahm-001",
    name: "Elite Cricket Arena",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop",
    sports: ["Cricket"],
    location: "Satellite Road",
    city: "Ahmedabad",
    district: "Ahmedabad",
    address: "Near Jodhpur Cross Roads, Satellite Road, Ahmedabad - 380015",
    distance: "2.5 km",
    pricePerHour: 1200,
    rating: 4.8,
    reviews: 324,
    crowdLevel: "Medium",
    weather: "32°C Sunny",
    slotsAvailable: 4,
    isVerified: true,
    facilities: ["Floodlights", "Drinking Water", "Changing Room", "Parking", "First Aid", "Scoreboard"],
    rules: ["Wear proper cricket shoes", "No metal spikes allowed", "Book 2 hours in advance"],
    contactPhone: "+91 98765 43210",
    openTime: "06:00",
    closeTime: "23:00",
    images: [
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&auto=format&fit=crop"
    ],
    description: "Elite Cricket Arena is Ahmedabad's premier cricket facility featuring international-standard turf and professional-grade equipment."
  },
  {
    id: "ahm-002",
    name: "Shuttle Masters Badminton",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop",
    sports: ["Badminton"],
    location: "Prahladnagar",
    city: "Ahmedabad",
    district: "Ahmedabad",
    address: "Corporate Road, Prahladnagar, Ahmedabad - 380015",
    distance: "1.8 km",
    pricePerHour: 400,
    rating: 4.9,
    reviews: 512,
    crowdLevel: "Low",
    weather: "32°C Sunny",
    slotsAvailable: 8,
    isVerified: true,
    facilities: ["AC Courts", "Pro Shop", "Coaching", "Cafeteria", "Parking", "Shower"],
    rules: ["Non-marking shoes only", "Rackets available for rent", "Prior booking required"],
    contactPhone: "+91 98765 43211",
    openTime: "06:00",
    closeTime: "22:00",
    images: [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1613918431703-aa50889e3be4?w=800&auto=format&fit=crop"
    ],
    description: "Premium air-conditioned badminton courts with wooden flooring and professional lighting."
  },
  {
    id: "ahm-003",
    name: "Goal Zone Football Turf",
    image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop",
    sports: ["Football"],
    location: "SG Highway",
    city: "Ahmedabad",
    district: "Ahmedabad",
    address: "Near Karnavati Club, SG Highway, Ahmedabad - 380054",
    distance: "4.2 km",
    pricePerHour: 1500,
    rating: 4.7,
    reviews: 289,
    crowdLevel: "High",
    weather: "32°C Sunny",
    slotsAvailable: 2,
    isVerified: true,
    facilities: ["FIFA Standard Turf", "Floodlights", "Changing Room", "Refreshments", "Parking"],
    rules: ["Football studs only", "Team jersey recommended", "Minimum 5 players per team"],
    contactPhone: "+91 98765 43212",
    openTime: "05:00",
    closeTime: "24:00",
    images: [
      "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop"
    ],
    description: "Professional 5-a-side and 7-a-side football turfs with FIFA-standard artificial grass."
  },
  {
    id: "ahm-004",
    name: "Ace Tennis Academy",
    image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop",
    sports: ["Tennis"],
    location: "Bodakdev",
    city: "Ahmedabad",
    district: "Ahmedabad",
    address: "Judges Bungalow Road, Bodakdev, Ahmedabad - 380054",
    distance: "3.1 km",
    pricePerHour: 600,
    rating: 4.6,
    reviews: 178,
    crowdLevel: "Low",
    weather: "32°C Sunny",
    slotsAvailable: 6,
    isVerified: true,
    facilities: ["Clay Courts", "Hard Courts", "Pro Coaching", "Equipment Rental", "Parking"],
    rules: ["Tennis shoes mandatory", "White dress preferred", "Book 1 hour minimum"],
    contactPhone: "+91 98765 43213",
    openTime: "06:00",
    closeTime: "21:00",
    images: [
      "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop"
    ],
    description: "Premier tennis facility with both clay and hard courts, professional coaching available."
  },
  {
    id: "ahm-005",
    name: "Pickle Point Arena",
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop",
    sports: ["Pickleball"],
    location: "Vastrapur",
    city: "Ahmedabad",
    district: "Ahmedabad",
    address: "Near Vastrapur Lake, Vastrapur, Ahmedabad - 380015",
    distance: "2.8 km",
    pricePerHour: 350,
    rating: 4.5,
    reviews: 89,
    crowdLevel: "Low",
    weather: "32°C Sunny",
    slotsAvailable: 10,
    isVerified: false,
    facilities: ["Indoor Courts", "Equipment Rental", "Coaching", "Cafeteria"],
    rules: ["Paddles available for rent", "Court shoes required"],
    contactPhone: "+91 98765 43214",
    openTime: "07:00",
    closeTime: "21:00",
    images: [
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop"
    ],
    description: "Gujarat's first dedicated Pickleball arena with professional courts and equipment."
  },
  
  // Surat Venues
  {
    id: "srt-001",
    name: "Diamond City Cricket Ground",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop",
    sports: ["Cricket"],
    location: "Vesu",
    city: "Surat",
    district: "Surat",
    address: "VIP Road, Vesu, Surat - 395007",
    distance: "3.5 km",
    pricePerHour: 1000,
    rating: 4.7,
    reviews: 256,
    crowdLevel: "Medium",
    weather: "34°C Sunny",
    slotsAvailable: 5,
    isVerified: true,
    facilities: ["Night Lights", "Practice Nets", "Changing Room", "Parking", "Canteen"],
    rules: ["Cricket whites preferred", "Bring your own equipment"],
    contactPhone: "+91 98765 43220",
    openTime: "05:30",
    closeTime: "23:00",
    images: [
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop"
    ],
    description: "Premium cricket facility in Surat with excellent pitch conditions and facilities."
  },
  {
    id: "srt-002",
    name: "Surat Sports Complex",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop",
    sports: ["Football", "Cricket", "Tennis"],
    location: "Athwa",
    city: "Surat",
    district: "Surat",
    address: "Athwa Gate, Surat - 395001",
    distance: "2.0 km",
    pricePerHour: 800,
    rating: 4.5,
    reviews: 189,
    crowdLevel: "High",
    weather: "34°C Sunny",
    slotsAvailable: 3,
    isVerified: true,
    facilities: ["Multi-Sport", "Gym", "Swimming Pool", "Cafeteria", "Parking"],
    rules: ["Membership available", "Day passes accepted"],
    contactPhone: "+91 98765 43221",
    openTime: "06:00",
    closeTime: "22:00",
    images: [
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop"
    ],
    description: "Multi-sport complex offering various sports facilities under one roof."
  },
  {
    id: "srt-003",
    name: "Smash Badminton Hub",
    image: "https://images.unsplash.com/photo-1613918431703-aa50889e3be4?w=800&auto=format&fit=crop",
    sports: ["Badminton"],
    location: "Adajan",
    city: "Surat",
    district: "Surat",
    address: "Adajan BRTS Road, Surat - 395009",
    distance: "4.5 km",
    pricePerHour: 350,
    rating: 4.8,
    reviews: 423,
    crowdLevel: "Medium",
    weather: "34°C Sunny",
    slotsAvailable: 6,
    isVerified: true,
    facilities: ["Wooden Courts", "AC", "Pro Shop", "Coaching"],
    rules: ["Non-marking shoes only", "Booking required"],
    contactPhone: "+91 98765 43222",
    openTime: "06:00",
    closeTime: "22:00",
    images: [
      "https://images.unsplash.com/photo-1613918431703-aa50889e3be4?w=800&auto=format&fit=crop"
    ],
    description: "Premium badminton facility with 8 courts and professional coaching."
  },

  // Vadodara Venues
  {
    id: "vad-001",
    name: "Baroda Cricket Academy",
    image: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&auto=format&fit=crop",
    sports: ["Cricket"],
    location: "Alkapuri",
    city: "Vadodara",
    district: "Vadodara",
    address: "Race Course Road, Alkapuri, Vadodara - 390007",
    distance: "1.5 km",
    pricePerHour: 1100,
    rating: 4.9,
    reviews: 567,
    crowdLevel: "Medium",
    weather: "33°C Sunny",
    slotsAvailable: 4,
    isVerified: true,
    facilities: ["International Standard", "Video Analysis", "Coaching", "Gym"],
    rules: ["Professional gear required", "Training programs available"],
    contactPhone: "+91 98765 43230",
    openTime: "05:00",
    closeTime: "22:00",
    images: [
      "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&auto=format&fit=crop"
    ],
    description: "Historic cricket academy that has produced many national players."
  },
  {
    id: "vad-002",
    name: "Striker Football Arena",
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop",
    sports: ["Football"],
    location: "Manjalpur",
    city: "Vadodara",
    district: "Vadodara",
    address: "NH-48, Manjalpur, Vadodara - 390011",
    distance: "5.2 km",
    pricePerHour: 1200,
    rating: 4.6,
    reviews: 234,
    crowdLevel: "Low",
    weather: "33°C Sunny",
    slotsAvailable: 7,
    isVerified: true,
    facilities: ["Artificial Turf", "Floodlights", "Refreshments", "Parking"],
    rules: ["Studs allowed", "Team bookings preferred"],
    contactPhone: "+91 98765 43231",
    openTime: "06:00",
    closeTime: "23:00",
    images: [
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop"
    ],
    description: "Modern football facility with premium artificial turf and night lighting."
  },

  // Rajkot Venues
  {
    id: "rjk-001",
    name: "Saurashtra Cricket Hub",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop",
    sports: ["Cricket"],
    location: "Kalavad Road",
    city: "Rajkot",
    district: "Rajkot",
    address: "Near Aji Dam, Kalavad Road, Rajkot - 360005",
    distance: "3.8 km",
    pricePerHour: 900,
    rating: 4.7,
    reviews: 312,
    crowdLevel: "Medium",
    weather: "35°C Sunny",
    slotsAvailable: 5,
    isVerified: true,
    facilities: ["Practice Nets", "Floodlights", "Canteen", "Parking"],
    rules: ["Helmet mandatory for batting", "Cricket shoes required"],
    contactPhone: "+91 98765 43240",
    openTime: "05:30",
    closeTime: "22:00",
    images: [
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop"
    ],
    description: "Premier cricket facility in Saurashtra region with excellent amenities."
  },
  {
    id: "rjk-002",
    name: "Race Course Sports Club",
    image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop",
    sports: ["Tennis", "Badminton", "Cricket"],
    location: "Race Course",
    city: "Rajkot",
    district: "Rajkot",
    address: "Race Course Ring Road, Rajkot - 360001",
    distance: "2.0 km",
    pricePerHour: 500,
    rating: 4.5,
    reviews: 178,
    crowdLevel: "Low",
    weather: "35°C Sunny",
    slotsAvailable: 8,
    isVerified: true,
    facilities: ["Multi-Sport", "Club House", "Restaurant", "Parking"],
    rules: ["Membership preferred", "Guest passes available"],
    contactPhone: "+91 98765 43241",
    openTime: "06:00",
    closeTime: "21:00",
    images: [
      "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop"
    ],
    description: "Exclusive sports club with tennis, badminton, and cricket facilities."
  },

  // Gandhinagar Venues
  {
    id: "gnd-001",
    name: "Capital Sports Arena",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop",
    sports: ["Football", "Cricket"],
    location: "Sector 21",
    city: "Gandhinagar",
    district: "Gandhinagar",
    address: "Sector 21, Gandhinagar - 382021",
    distance: "1.2 km",
    pricePerHour: 1000,
    rating: 4.6,
    reviews: 145,
    crowdLevel: "Low",
    weather: "31°C Sunny",
    slotsAvailable: 9,
    isVerified: true,
    facilities: ["Government Facility", "Olympic Standard", "Gym", "Pool"],
    rules: ["ID proof required", "Booking through app only"],
    contactPhone: "+91 98765 43250",
    openTime: "06:00",
    closeTime: "21:00",
    images: [
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop"
    ],
    description: "State-of-the-art sports facility in Gujarat's capital city."
  },

  // Bhavnagar Venues
  {
    id: "bhv-001",
    name: "Nilambagh Sports Ground",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop",
    sports: ["Cricket", "Football"],
    location: "Nilambagh",
    city: "Bhavnagar",
    district: "Bhavnagar",
    address: "Near Nilambagh Palace, Bhavnagar - 364001",
    distance: "2.5 km",
    pricePerHour: 700,
    rating: 4.4,
    reviews: 98,
    crowdLevel: "Low",
    weather: "33°C Sunny",
    slotsAvailable: 6,
    isVerified: false,
    facilities: ["Natural Grass", "Pavilion", "Parking"],
    rules: ["Prior booking required", "Groups welcome"],
    contactPhone: "+91 98765 43260",
    openTime: "06:00",
    closeTime: "20:00",
    images: [
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop"
    ],
    description: "Historic sports ground near the famous Nilambagh Palace."
  },

  // Jamnagar Venues
  {
    id: "jmn-001",
    name: "Lakhota Sports Complex",
    image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop",
    sports: ["Football", "Cricket", "Tennis"],
    location: "Lakhota",
    city: "Jamnagar",
    district: "Jamnagar",
    address: "Near Lakhota Lake, Jamnagar - 361001",
    distance: "1.8 km",
    pricePerHour: 600,
    rating: 4.3,
    reviews: 87,
    crowdLevel: "Medium",
    weather: "34°C Sunny",
    slotsAvailable: 5,
    isVerified: true,
    facilities: ["Multi-Sport", "Lake View", "Cafeteria", "Parking"],
    rules: ["Sports shoes mandatory", "ID required"],
    contactPhone: "+91 98765 43270",
    openTime: "06:00",
    closeTime: "21:00",
    images: [
      "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop"
    ],
    description: "Beautiful sports complex with stunning lake views."
  },

  // Anand Venues
  {
    id: "and-001",
    name: "Amul Sports Ground",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop",
    sports: ["Cricket"],
    location: "GCMMF Road",
    city: "Anand",
    district: "Anand",
    address: "Near GCMMF, Anand - 388001",
    distance: "1.0 km",
    pricePerHour: 800,
    rating: 4.5,
    reviews: 123,
    crowdLevel: "Medium",
    weather: "32°C Sunny",
    slotsAvailable: 4,
    isVerified: true,
    facilities: ["Practice Nets", "Floodlights", "Canteen"],
    rules: ["Cricket gear required", "Team bookings preferred"],
    contactPhone: "+91 98765 43280",
    openTime: "06:00",
    closeTime: "22:00",
    images: [
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop"
    ],
    description: "Well-maintained cricket ground in the heart of Anand."
  },
];

export const getVenuesByCity = (city: string): Venue[] => {
  return venues.filter(venue => venue.city.toLowerCase() === city.toLowerCase());
};

export const getVenuesBySport = (sport: string): Venue[] => {
  return venues.filter(venue => 
    venue.sports.some(s => s.toLowerCase() === sport.toLowerCase())
  );
};

export const getVenueById = (id: string): Venue | undefined => {
  return venues.find(venue => venue.id === id);
};

export const searchVenues = (query: string, city?: string): Venue[] => {
  let results = venues;
  
  if (city) {
    results = results.filter(venue => venue.city.toLowerCase() === city.toLowerCase());
  }
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(venue => 
      venue.name.toLowerCase().includes(lowerQuery) ||
      venue.sports.some(s => s.toLowerCase().includes(lowerQuery)) ||
      venue.location.toLowerCase().includes(lowerQuery)
    );
  }
  
  return results;
};
