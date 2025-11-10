"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface FeedContextValue {
  refreshKey: number;
  refreshFeed: () => void;
}

const FeedContext = createContext<FeedContextValue | undefined>(undefined);

export function FeedProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshFeed = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <FeedContext.Provider value={{ refreshKey, refreshFeed }}>
      {children}
    </FeedContext.Provider>
  );
}

export function useFeedRefresh() {
  const context = useContext(FeedContext);
  if (context === undefined) {
    throw new Error("useFeedRefresh must be used within a FeedProvider");
  }
  return context;
}


