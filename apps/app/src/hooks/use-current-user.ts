import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { useConvexAuth } from "convex/react";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

/**
 * Hook that provides user data from both Better Auth and the users table
 * Uses Better Auth's session management and merges data from both sources
 * Returns combined user object with all fields from both tables
 */
export function useCurrentUser() {
  const { isAuthenticated } = useConvexAuth();

  // Get both Better Auth user and users table user
  const userData = useQuery(
    api.auth.getCurrentUserWithUsersTable,
    isAuthenticated ? {} : "skip"
  );

  const betterAuthUser = userData?.betterAuthUser;
  const usersTableUser = userData?.usersTableUser;

  // Combine data from both Better Auth and users table
  const combinedUser = betterAuthUser
    ? {
        // Start with users table data if available (has more fields)
        ...(usersTableUser || {}),
        
        // Better Auth user fields (prefer users table values, fallback to Better Auth)
        _id: usersTableUser?._id || (betterAuthUser._id as unknown as Id<"users">),
        id: usersTableUser?._id || (betterAuthUser._id as unknown as Id<"users">),
        email: usersTableUser?.email || betterAuthUser.email,
        name: usersTableUser?.name || betterAuthUser.name,
        emailVerified: usersTableUser?.emailVerified ?? betterAuthUser.emailVerified ?? false,
        image: usersTableUser?.image || betterAuthUser.image || null,
        
        // Users table specific fields
        betterAuthId: usersTableUser?.betterAuthId || (betterAuthUser._id as unknown as string),
        displayName: usersTableUser?.displayName || usersTableUser?.name || betterAuthUser.name || betterAuthUser.email || "User",
        fullName: usersTableUser?.name || betterAuthUser.name || undefined,
        username: usersTableUser?.username || undefined,
        bio: usersTableUser?.bio || undefined,
        city: usersTableUser?.city || undefined,
        country: usersTableUser?.country || undefined,
        coverImage: usersTableUser?.coverImage || undefined,
        firstName: usersTableUser?.firstName || undefined,
        lastName: usersTableUser?.lastName || undefined,
        role: usersTableUser?.role || undefined,
        onboardingComplete: usersTableUser?.onboardingComplete ?? false,
        locale: usersTableUser?.locale || undefined,
        interests: usersTableUser?.interests || undefined,
        playerId: usersTableUser?.playerId || undefined,
        followerCount: usersTableUser?.followerCount ?? 0,
        followingCount: usersTableUser?.followingCount ?? 0,
        postCount: usersTableUser?.postCount ?? 0,
        isPrivate: usersTableUser?.isPrivate ?? false,
        allowMessages: usersTableUser?.allowMessages ?? true,
        lastActive: usersTableUser?.lastActive || usersTableUser?._creationTime || betterAuthUser._creationTime,
        banned: usersTableUser?.banned || false,
        banReason: usersTableUser?.banReason || undefined,
        banExpires: usersTableUser?.banExpires || undefined,
        createdAt: usersTableUser?.createdAt || usersTableUser?._creationTime || betterAuthUser._creationTime,
        updatedAt: usersTableUser?.updatedAt || usersTableUser?._creationTime || betterAuthUser._creationTime,
        
        // Image URL
        imageUrl: usersTableUser?.image || betterAuthUser.image || undefined,
        imageSource: (usersTableUser?.image || betterAuthUser.image) ? 'better-auth' : undefined,
      }
    : null;

  return {
    user: combinedUser,
    authUser: betterAuthUser,
    convexUser: usersTableUser || betterAuthUser,
    betterAuthUser,
    usersTableUser,
    isLoading: !isAuthenticated ? false : userData === undefined,
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

