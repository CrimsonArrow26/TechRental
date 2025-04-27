import React, { createContext, useContext, useEffect, useState } from "react";

// Define the shape of your statistics
interface Statistics {
  totalRented: number;
  totalComponents: number;
  totalReviews: number;
  rate: number; // e.g., rental rate or review rate
}

interface StatisticsContextType {
  statistics: Statistics;
  refreshStatistics: () => void;
}

const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined);

export const StatisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [statistics, setStatistics] = useState<Statistics>({
    totalRented: 0,
    totalComponents: 0,
    totalReviews: 0,
    rate: 0,
  });

  // Simulate fetching live statistics from backend
  const fetchStatistics = async () => {
    // Replace this with your actual API call or Supabase query
    // Example:
    // const { data } = await supabase.from('statistics').select('*').single();
    // setStatistics(data);

    // Simulated data for demonstration
    setStatistics({
      totalRented: Math.floor(Math.random() * 100),
      totalComponents: 200,
      totalReviews: Math.floor(Math.random() * 50),
      rate: Math.round(Math.random() * 100) / 10, // e.g., 0.0 to 10.0
    });
  };

  useEffect(() => {
    fetchStatistics();
    // Optionally, poll for live updates every 10 seconds
    const interval = setInterval(fetchStatistics, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <StatisticsContext.Provider value={{ statistics, refreshStatistics: fetchStatistics }}>
      {children}
    </StatisticsContext.Provider>
  );
};

export const useStatistics = () => {
  const context = useContext(StatisticsContext);
  if (!context) {
    throw new Error("useStatistics must be used within a StatisticsProvider");
  }
  return context;
};