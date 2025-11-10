import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { useConvexAuth } from "convex/react";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

/**
 * Hook that provides Better Auth user data from Convex
 * Uses Better Auth's session management and Convex for user data
 */
export function useCurrentUser() {
  const { isAuthenticated } = useConvexAuth();

  // Get Convex user data using Better Auth's getCurrentUser query
  // This returns the authenticated user from Better Auth's user table
  const convexUser = useQuery(
    api.auth.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );

  // Combine data from Better Auth user object
  const combinedUser = convexUser
    ? {
        // Convex user data (from Better Auth schema)
        ...convexUser,
        
        // Better Auth user fields (already in convexUser from getCurrentUser)
        id: convexUser._id,
        email: convexUser.email,
        name: convexUser.name,
        emailVerified: convexUser.emailVerified,
        image: convexUser.image || null,
        
        // Computed fields
        displayName: convexUser.name || convexUser.email || "User",
        fullName: convexUser.name || undefined,
        
        // Image URL
        imageUrl: convexUser.image || undefined,
        imageSource: convexUser.image ? 'better-auth' : undefined,
        
        // Additional fields from Convex schema (if they exist)
        username: (convexUser as any).username || undefined,
        role: (convexUser as any).role || undefined,
        onboardingComplete: (convexUser as any).onboardingComplete || false,
        locale: (convexUser as any).locale || undefined,
        createdAt: (convexUser as any).createdAt || convexUser._creationTime,
        updatedAt: (convexUser as any).updatedAt || convexUser._creationTime,
      }
    : null;

  return {
    user: combinedUser,
    authUser: convexUser,
    convexUser,
    isLoading: !isAuthenticated ? false : convexUser === undefined,
    error: null,
  };
}

export function useIsCurrentUser(userId: Id<"users">) {
  const { user: currentUser } = useCurrentUser();
  if (!currentUser?._id) return false;
  // Convert Better Auth's Id<"user"> to Id<"users"> for comparison
  const currentUserId = currentUser._id as unknown as Id<"users">;
  return currentUserId === userId;
}

