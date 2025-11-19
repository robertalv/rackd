"use client";

import React, { createContext, useContext, useState } from "react";

interface FeedContextType {
  refreshKey: number;
  refreshFeed: () => void;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export function FeedProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshFeed = () => {
    setRefreshKey(prev => prev + 1);
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
    // Return a no-op function if context is not available
    return { refreshKey: 0, refreshFeed: () => {} };
  }
  return context;
}