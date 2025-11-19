import { AutumnProvider as AutumnProviderBase } from "autumn-js/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { ConvexReactClient } from "convex/react";

interface AutumnProviderProps {
  children: React.ReactNode;
  convexClient: ConvexReactClient;
}

export function AutumnProvider({ children, convexClient }: AutumnProviderProps) {
  return (
    <AutumnProviderBase convex={convexClient} convexApi={(api as any).autumn}>
      {children}
    </AutumnProviderBase>
  );
}

