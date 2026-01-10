import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { gujaratCities, City } from "@/data/venues";

interface LocationContextType {
  selectedCity: City;
  setSelectedCity: (city: City) => void;
  cities: City[];
  detectLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCity, setSelectedCity] = useState<City>(gujaratCities[0]); // Default to Ahmedabad

  useEffect(() => {
    // Load saved city from localStorage
    const savedCity = localStorage.getItem("playpal_city");
    if (savedCity) {
      try {
        const city = JSON.parse(savedCity);
        const found = gujaratCities.find(c => c.name === city.name);
        if (found) {
          setSelectedCity(found);
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const handleSetCity = (city: City) => {
    setSelectedCity(city);
    localStorage.setItem("playpal_city", JSON.stringify(city));
  };

  const detectLocation = () => {
    // In a real app, we would use the Geolocation API
    // For now, we'll just default to Ahmedabad
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Mock: Just set to Ahmedabad for demo
          // In production, you'd use reverse geocoding
          handleSetCity(gujaratCities[0]);
        },
        (error) => {
          console.log("Location detection failed, using default");
          handleSetCity(gujaratCities[0]);
        }
      );
    }
  };

  return (
    <LocationContext.Provider
      value={{
        selectedCity,
        setSelectedCity: handleSetCity,
        cities: gujaratCities,
        detectLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
