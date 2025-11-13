import { useConvexAuth, useQuery } from "convex/react";
import { b as api } from "./globals-Bsfdm3JA.js";
function useCurrentUser() {
  const { isAuthenticated } = useConvexAuth();
  const userData = useQuery(
    api.auth.getCurrentUserWithUsersTable,
    isAuthenticated ? {} : "skip"
  );
  const betterAuthUser = userData?.betterAuthUser;
  const usersTableUser = userData?.usersTableUser;
  const combinedUser = betterAuthUser ? {
    // Start with users table data if available (has more fields)
    ...usersTableUser || {},
    // Better Auth user fields (prefer users table values, fallback to Better Auth)
    _id: usersTableUser?._id || betterAuthUser._id,
    id: usersTableUser?._id || betterAuthUser._id,
    email: usersTableUser?.email || betterAuthUser.email,
    name: usersTableUser?.name || betterAuthUser.name,
    emailVerified: usersTableUser?.emailVerified ?? betterAuthUser.emailVerified ?? false,
    image: usersTableUser?.image || betterAuthUser.image || null,
    // Users table specific fields
    betterAuthId: usersTableUser?.betterAuthId || betterAuthUser._id,
    displayName: usersTableUser?.displayName || usersTableUser?.name || betterAuthUser.name || betterAuthUser.email || "User",
    fullName: usersTableUser?.name || betterAuthUser.name || void 0,
    username: usersTableUser?.username || void 0,
    bio: usersTableUser?.bio || void 0,
    city: usersTableUser?.city || void 0,
    country: usersTableUser?.country || void 0,
    coverImage: usersTableUser?.coverImage || void 0,
    firstName: usersTableUser?.firstName || void 0,
    lastName: usersTableUser?.lastName || void 0,
    role: usersTableUser?.role || void 0,
    onboardingComplete: usersTableUser?.onboardingComplete ?? false,
    locale: usersTableUser?.locale || void 0,
    interests: usersTableUser?.interests || void 0,
    playerId: usersTableUser?.playerId || void 0,
    followerCount: usersTableUser?.followerCount ?? 0,
    followingCount: usersTableUser?.followingCount ?? 0,
    postCount: usersTableUser?.postCount ?? 0,
    isPrivate: usersTableUser?.isPrivate ?? false,
    allowMessages: usersTableUser?.allowMessages ?? true,
    lastActive: usersTableUser?.lastActive || usersTableUser?._creationTime || betterAuthUser._creationTime,
    banned: usersTableUser?.banned || false,
    banReason: usersTableUser?.banReason || void 0,
    banExpires: usersTableUser?.banExpires || void 0,
    createdAt: usersTableUser?.createdAt || usersTableUser?._creationTime || betterAuthUser._creationTime,
    updatedAt: usersTableUser?.updatedAt || usersTableUser?._creationTime || betterAuthUser._creationTime,
    // Image URL
    imageUrl: usersTableUser?.image || betterAuthUser.image || void 0,
    imageSource: usersTableUser?.image || betterAuthUser.image ? "better-auth" : void 0
  } : null;
  return {
    user: combinedUser,
    authUser: betterAuthUser,
    convexUser: usersTableUser || betterAuthUser,
    betterAuthUser,
    usersTableUser,
    isLoading: !isAuthenticated ? false : userData === void 0,
    error: null
  };
}
function useIsCurrentUser(userId) {
  const { user: currentUser } = useCurrentUser();
  if (!currentUser?._id) return false;
  const currentUserId = currentUser._id;
  return currentUserId === userId;
}
export {
  useIsCurrentUser as a,
  useCurrentUser as u
};
