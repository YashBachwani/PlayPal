import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "user" | "turf_owner";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  city: string;
  points: number;
  createdAt: Date;
  skills?: { sport: string; level: "Beginner" | "Intermediate" | "Advanced" | "Pro" }[];
  reputation?: number; // 0-5 stars
  feedbackCount?: number;
}

export interface TurfOwner extends User {
  turfId: string;
  turfName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  addPoints: (points: number) => void;
}

// Define types for stored user data to avoid "any"
interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  city: string;
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  city: string;
  points: number;
  createdAt: string; // Stored as string in local storage
  password?: string; // Present in registered users list
  skills?: { sport: string; level: "Beginner" | "Intermediate" | "Advanced" | "Pro" }[];
  reputation?: number;
  feedbackCount?: number;
}

// Mock turf owner credentials
const TURF_OWNER_CREDENTIALS = [
  { id: "owner1", email: "elite@playpal.com", password: "elite123", turfId: "ahm-001", turfName: "Elite Cricket Arena" },
  { id: "owner2", email: "shuttle@playpal.com", password: "shuttle123", turfId: "ahm-002", turfName: "Shuttle Masters Badminton" },
  { id: "owner3", email: "goalzone@playpal.com", password: "goal123", turfId: "ahm-003", turfName: "Goal Zone Football Turf" },
  { id: "owner4", email: "diamond@playpal.com", password: "diamond123", turfId: "srt-001", turfName: "Diamond City Cricket Ground" },
  { id: "owner5", email: "baroda@playpal.com", password: "baroda123", turfId: "vad-001", turfName: "Baroda Cricket Academy" },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem("playpal_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          ...parsedUser,
          createdAt: new Date(parsedUser.createdAt)
        });
      } catch (e) {
        localStorage.removeItem("playpal_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (role === "turf_owner") {
      // Check turf owner credentials
      const owner = TURF_OWNER_CREDENTIALS.find(
        o => o.email === email && o.password === password
      );

      if (owner) {
        const turfOwner: TurfOwner = {
          id: owner.id,
          name: owner.turfName + " Admin",
          email: owner.email,
          phone: "+91 98765 00000",
          role: "turf_owner",
          city: "Ahmedabad",
          points: 0,
          createdAt: new Date(),
          turfId: owner.turfId,
          turfName: owner.turfName
        };
        setUser(turfOwner);
        localStorage.setItem("playpal_user", JSON.stringify(turfOwner));
        setIsLoading(false);
        return true;
      }
    } else {
      // User login - check localStorage for registered users
      const registeredUsers: StoredUser[] = JSON.parse(localStorage.getItem("playpal_registered_users") || "[]");
      const foundUser = registeredUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (foundUser) {
        const loggedInUser: User = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          phone: foundUser.phone,
          role: "user",
          city: foundUser.city,
          points: foundUser.points || 100,
          createdAt: new Date(foundUser.createdAt),
          skills: foundUser.skills || [],
          reputation: foundUser.reputation || 4.8,
          feedbackCount: foundUser.feedbackCount || 12
        };
        setUser(loggedInUser);
        localStorage.setItem("playpal_user", JSON.stringify(loggedInUser));
        setIsLoading(false);
        return true;
      }
    }

    setIsLoading(false);
    return false;
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const registeredUsers = JSON.parse(localStorage.getItem("playpal_registered_users") || "[]");

    // Check if email already exists
    if (registeredUsers.some((u: StoredUser) => u.email === data.email)) {
      setIsLoading(false);
      return false;
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      city: data.city,
      points: 0, // Start with 0 points
      createdAt: new Date().toISOString()
    };

    registeredUsers.push(newUser);
    localStorage.setItem("playpal_registered_users", JSON.stringify(registeredUsers));

    const loggedInUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: "user",
      city: newUser.city,
      points: newUser.points,
      createdAt: new Date(),
      skills: [],
      reputation: 5.0, // Start with good rep
      feedbackCount: 0
    };

    setUser(loggedInUser);
    localStorage.setItem("playpal_user", JSON.stringify(loggedInUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("playpal_user");
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("playpal_user", JSON.stringify(updatedUser));
    }
  };

  const addPoints = (points: number) => {
    if (user) {
      const newPoints = user.points + points;
      const updatedUser = { ...user, points: newPoints };
      setUser(updatedUser);
      localStorage.setItem("playpal_user", JSON.stringify(updatedUser));

      // Persist to registered users list (database simulation) only for regular users
      if (user.role === "user") {
        const registeredUsers: StoredUser[] = JSON.parse(localStorage.getItem("playpal_registered_users") || "[]");
        const index = registeredUsers.findIndex((u) => u.email === user.email);
        if (index !== -1) {
          registeredUsers[index].points = newPoints;
          localStorage.setItem("playpal_registered_users", JSON.stringify(registeredUsers));
        }
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        addPoints
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
