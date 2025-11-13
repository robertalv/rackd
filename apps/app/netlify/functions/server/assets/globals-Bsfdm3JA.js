import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { expo } from "@better-auth/expo";
import { anyApi, componentsGeneric, internalMutationGeneric, queryGeneric, mutationGeneric } from "convex/server";
import { betterAuth } from "better-auth";
import { v } from "convex/values";
import { jsx } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect, createContext, useContext } from "react";
const authClient$1 = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : void 0,
  plugins: [convexClient()]
});
const api = anyApi;
const components = componentsGeneric();
const query = queryGeneric;
const mutation = mutationGeneric;
const internalMutation = internalMutationGeneric;
const siteUrl = process.env.SITE_URL;
const nativeAppUrl = process.env.NATIVE_APP_URL || "mybettertapp://";
const appleUrl = "https://appleid.apple.com";
const authClient = createClient(components.betterAuth);
const createAuth = (ctx, { optionsOnly = false } = {}) => {
  return betterAuth({
    logger: {
      disabled: optionsOnly
    },
    baseURL: siteUrl,
    trustedOrigins: [siteUrl, nativeAppUrl, appleUrl],
    database: authClient.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false
    },
    socialProviders: {
      google: {
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
        mapProfileToUser: async (profile) => {
          return {
            email: profile.email,
            image: profile.picture,
            name: profile.name
          };
        }
      },
      apple: {
        clientId: process.env.AUTH_APPLE_ID,
        clientSecret: process.env.AUTH_APPLE_SECRET,
        appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER
      }
    },
    plugins: [expo(), convex()],
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      // 30 days
      updateAge: 60 * 60 * 24 * 15
      // 15 days
    },
    user: {
      additionalFields: {
        username: {
          required: false,
          type: "string"
        },
        locale: {
          required: false,
          type: "string"
        },
        paymentsCustomerId: {
          required: false,
          type: "string"
        }
      }
    }
  });
};
createAuth({}, { optionsOnly: true });
internalMutation({
  args: {
    model: v.string(),
    data: v.any()
  },
  handler: async (ctx, args) => {
    return args.data;
  }
});
internalMutation({
  args: {
    model: v.string(),
    doc: v.any()
  },
  handler: async (ctx, args) => {
    console.log("[onCreate Hook] Called with model:", args.model);
    if (args.model === "user") {
      const betterAuthUser = args.doc;
      console.log("[onCreate Hook] Creating user in custom users table:", betterAuthUser._id, betterAuthUser.email);
      const now = Date.now();
      let user = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", betterAuthUser.email)).first();
      if (!user) {
        const username = betterAuthUser.username || betterAuthUser.email?.split("@")[0] || "user";
        const displayName = betterAuthUser.name || betterAuthUser.email?.split("@")[0] || "User";
        const userId = await ctx.db.insert("users", {
          name: betterAuthUser.name,
          email: betterAuthUser.email,
          betterAuthId: betterAuthUser._id,
          emailVerified: betterAuthUser.emailVerified ?? false,
          image: betterAuthUser.image ?? void 0,
          createdAt: betterAuthUser.createdAt ?? now,
          updatedAt: betterAuthUser.updatedAt ?? now,
          username,
          displayName,
          locale: betterAuthUser.locale ?? void 0,
          paymentsCustomerId: betterAuthUser.paymentsCustomerId ?? void 0,
          onboardingComplete: false,
          role: void 0,
          banned: void 0,
          banReason: void 0,
          banExpires: void 0,
          interests: void 0,
          playerId: void 0,
          // Will be set after player creation
          followerCount: 0,
          followingCount: 0,
          postCount: 0,
          isPrivate: false,
          allowMessages: true,
          lastActive: now
        });
        console.log("[onCreate Hook] User created in custom users table with ID:", userId);
        user = await ctx.db.get(userId);
      } else {
        const patchUpdates = {
          updatedAt: now
        };
        if (betterAuthUser.name) patchUpdates.name = betterAuthUser.name;
        if (betterAuthUser.email) patchUpdates.email = betterAuthUser.email;
        if (betterAuthUser.emailVerified !== void 0) patchUpdates.emailVerified = betterAuthUser.emailVerified;
        if (betterAuthUser.image !== void 0) patchUpdates.image = betterAuthUser.image ?? void 0;
        if (betterAuthUser.username !== void 0) patchUpdates.username = betterAuthUser.username ?? void 0;
        if (betterAuthUser.locale !== void 0) patchUpdates.locale = betterAuthUser.locale ?? void 0;
        if (betterAuthUser.paymentsCustomerId !== void 0) patchUpdates.paymentsCustomerId = betterAuthUser.paymentsCustomerId ?? void 0;
        await ctx.db.patch(user._id, patchUpdates);
        console.log("[onCreate Hook] User updated in custom users table");
      }
      if (!user) {
        throw new Error("Failed to create user in custom users table");
      }
      if (user.playerId) {
        const existingPlayer2 = await ctx.db.get(user.playerId);
        if (existingPlayer2) {
          console.log("[onCreate Hook] Player profile already exists:", user.playerId);
          return;
        }
      }
      const existingPlayer = await ctx.db.query("players").withIndex("by_user", (q) => q.eq("userId", user._id)).first();
      if (existingPlayer) {
        await ctx.db.patch(user._id, {
          playerId: existingPlayer._id,
          updatedAt: now
        });
        console.log("[onCreate Hook] Linked existing player to user");
        return;
      }
      console.log("[onCreate Hook] Creating player profile for user:", user._id, user.email);
      const playerId = await ctx.db.insert("players", {
        name: user.name || user.email?.split("@")[0] || "Player",
        userId: user._id,
        bio: null,
        avatarUrl: user.image ?? null,
        city: null,
        homeRoom: null,
        homeVenue: null,
        isVerified: false,
        updatedAt: now,
        // Optional fields
        fargoId: null,
        fargoReadableId: null,
        fargoMembershipId: null,
        fargoRating: null,
        fargoRobustness: null,
        league: null,
        apaId: null,
        apaSkillLevel: null,
        bcaId: null
      });
      await ctx.db.patch(user._id, {
        playerId,
        updatedAt: now
      });
      await ctx.db.insert("playerStats", {
        playerId,
        totalMatches: 0,
        wins: 0,
        losses: 0,
        tournamentsPlayed: 0,
        tournamentsWon: 0,
        averageScore: 0,
        lastUpdated: now
      });
      console.log("[onCreate Hook] Player profile and stats created successfully");
    } else if (args.model === "account") {
      const betterAuthAccount = args.doc;
      console.log("[onCreate Hook] Creating account in custom accounts table:", betterAuthAccount.accountId);
      const user = await ctx.db.query("users").withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", betterAuthAccount.userId)).first();
      if (!user) {
        console.warn("[onCreate Hook] User not found for account, skipping account sync");
        return;
      }
      const existingAccount = await ctx.db.query("accounts").withIndex(
        "accountId_providerId",
        (q) => q.eq("accountId", betterAuthAccount.accountId).eq("providerId", betterAuthAccount.providerId)
      ).first();
      if (!existingAccount) {
        await ctx.db.insert("accounts", {
          accountId: betterAuthAccount.accountId,
          providerId: betterAuthAccount.providerId,
          userId: user._id,
          accessToken: betterAuthAccount.accessToken ?? null,
          refreshToken: betterAuthAccount.refreshToken ?? null,
          idToken: betterAuthAccount.idToken ?? null,
          expiresAt: betterAuthAccount.expiresAt ?? null,
          password: betterAuthAccount.password ?? null,
          accessTokenExpiresAt: betterAuthAccount.accessTokenExpiresAt ?? null,
          refreshTokenExpiresAt: betterAuthAccount.refreshTokenExpiresAt ?? null,
          scope: betterAuthAccount.scope ?? null,
          createdAt: betterAuthAccount.createdAt,
          updatedAt: betterAuthAccount.updatedAt
        });
        console.log("[onCreate Hook] Account created in custom accounts table");
      }
    } else if (args.model === "session") {
      const betterAuthSession = args.doc;
      console.log("[onCreate Hook] Creating session in custom sessions table");
      const user = await ctx.db.query("users").withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", betterAuthSession.userId)).first();
      if (!user) {
        console.warn("[onCreate Hook] User not found for session, skipping session sync");
        return;
      }
      const existingSession = await ctx.db.query("sessions").withIndex("by_token", (q) => q.eq("token", betterAuthSession.token)).first();
      if (!existingSession) {
        await ctx.db.insert("sessions", {
          token: betterAuthSession.token,
          userId: user._id,
          expiresAt: betterAuthSession.expiresAt,
          createdAt: betterAuthSession.createdAt,
          updatedAt: betterAuthSession.updatedAt,
          ipAddress: betterAuthSession.ipAddress ?? null,
          userAgent: betterAuthSession.userAgent ?? null,
          impersonatedBy: betterAuthSession.impersonatedBy ?? null,
          activeOrganizationId: betterAuthSession.activeOrganizationId ?? null
        });
        console.log("[onCreate Hook] Session created in custom sessions table");
      }
    }
  }
});
internalMutation({
  args: {
    model: v.string(),
    data: v.any()
  },
  handler: async (ctx, args) => {
    return args.data;
  }
});
internalMutation({
  args: {
    model: v.string(),
    doc: v.any()
  },
  handler: async (ctx, args) => {
  }
});
internalMutation({
  args: {
    model: v.string(),
    id: v.string()
  },
  handler: async (ctx, args) => {
  }
});
internalMutation({
  args: {
    model: v.string(),
    doc: v.any()
  },
  handler: async (ctx, args) => {
  }
});
query({
  args: {},
  returns: v.any(),
  handler: async function(ctx) {
    return await authClient.getAuthUser(ctx);
  }
});
query({
  args: {},
  returns: v.any(),
  handler: async function(ctx) {
    const betterAuthUser = await authClient.getAuthUser(ctx);
    if (!betterAuthUser) {
      return null;
    }
    const betterAuthId = betterAuthUser._id;
    const usersTableUser = await ctx.db.query("users").withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", betterAuthId)).first();
    return {
      betterAuthUser,
      usersTableUser: usersTableUser || null
    };
  }
});
query({
  args: {
    id: v.id("users")
  },
  handler: async function(ctx, args) {
    return ctx.db.get(args.id);
  }
});
query({
  args: {
    email: v.string()
  },
  handler: async function(ctx, args) {
    return ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).first();
  }
});
query({
  args: {
    userId: v.id("users")
  },
  handler: async function(ctx, args) {
    return ctx.db.query("sessions").withIndex("by_user", (q) => q.eq("userId", args.userId)).collect();
  }
});
query({
  args: {
    userId: v.id("users")
  },
  handler: async function(ctx, args) {
    return ctx.db.query("accounts").withIndex("by_user", (q) => q.eq("userId", args.userId)).collect();
  }
});
mutation({
  args: {
    token: v.string(),
    betterAuthUserId: v.string()
  },
  handler: async function(ctx, args) {
    const user = await ctx.db.query("users").withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", args.betterAuthUserId)).first();
    if (!user) {
      throw new Error("User not found in custom users table. Please sync user first.");
    }
    const existingSession = await ctx.db.query("sessions").withIndex("by_token", (q) => q.eq("token", args.token)).first();
    if (existingSession) {
      return {
        success: true,
        message: "Session already exists",
        session: existingSession
      };
    }
    try {
      const expiresAt = Date.now() + 60 * 60 * 24 * 30 * 1e3;
      const now = Date.now();
      const sessionId = await ctx.db.insert("sessions", {
        token: args.token,
        userId: user._id,
        expiresAt,
        createdAt: now,
        updatedAt: now,
        ipAddress: null,
        userAgent: null,
        impersonatedBy: null,
        activeOrganizationId: null
      });
      const session = await ctx.db.get(sessionId);
      console.log("[syncSessionFromToken] Session synced to custom table:", sessionId);
      return {
        success: true,
        message: "Session synced successfully",
        session
      };
    } catch (err) {
      console.error("[syncSessionFromToken] Failed to sync session:", err);
      throw err;
    }
  }
});
mutation({
  args: {
    betterAuthUserId: v.string(),
    email: v.string()
  },
  handler: async function(ctx, args) {
    const user = await ctx.db.query("users").withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", args.betterAuthUserId)).first();
    if (!user) {
      throw new Error("User not found in custom users table. Please sync user first.");
    }
    const existingAccount = await ctx.db.query("accounts").withIndex(
      "accountId_providerId",
      (q) => q.eq("accountId", args.email).eq("providerId", "credential")
    ).first();
    if (existingAccount) {
      return {
        success: true,
        message: "Account already exists",
        account: existingAccount
      };
    }
    const now = Date.now();
    const accountId = await ctx.db.insert("accounts", {
      accountId: args.email,
      providerId: "credential",
      // email/password uses "credential" provider
      userId: user._id,
      accessToken: null,
      refreshToken: null,
      idToken: null,
      expiresAt: null,
      password: null,
      // Password is hashed and stored separately by Better Auth
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: null,
      createdAt: now,
      updatedAt: now
    });
    const account = await ctx.db.get(accountId);
    console.log("[syncEmailPasswordAccount] Account synced to custom table:", accountId);
    return {
      success: true,
      message: "Account synced successfully",
      account
    };
  }
});
mutation({
  args: {
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    image: v.optional(v.string()),
    locale: v.optional(v.string())
  },
  handler: async function(ctx, args) {
    const user = await authClient.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const updates = {
      updatedAt: Date.now()
    };
    if (args.name !== void 0) {
      updates.name = args.name;
    }
    if (args.username !== void 0) {
      updates.username = args.username || void 0;
    }
    if (args.image !== void 0) {
      updates.image = args.image || void 0;
    }
    if (args.locale !== void 0) {
      updates.locale = args.locale || void 0;
    }
    const userId = user._id;
    await ctx.db.patch(userId, updates);
    return await ctx.db.get(userId);
  }
});
mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authClient.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    await ctx.db.patch(user._id, {
      onboardingComplete: true,
      updatedAt: Date.now()
    });
    return await ctx.db.get(user._id);
  }
});
mutation({
  args: {
    betterAuthUserId: v.optional(v.string()),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    username: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let authUser = await authClient.getAuthUser(ctx).catch(() => null);
    if (!authUser && args.email && args.name) {
      const betterAuthUser = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).first();
      if (betterAuthUser) {
        authUser = betterAuthUser;
      } else if (args.betterAuthUserId) {
        const userById = await ctx.db.get(args.betterAuthUserId);
        if (userById) {
          authUser = userById;
        }
      }
    }
    if (!authUser && !args.email) {
      throw new Error("Not authenticated and no user data provided");
    }
    const now = Date.now();
    const userEmail = authUser?.email || args.email;
    const userName = authUser?.name || args.name;
    const betterAuthId = authUser?._id ? authUser._id : args.betterAuthUserId;
    const username = args.username || authUser?.username || userEmail?.split("@")[0] || "user";
    {
      if (!/^[a-z0-9-_]+$/.test(username)) {
        throw new Error("Username can only contain lowercase letters, numbers, hyphens, and underscores");
      }
      if (username.length < 3 || username.length > 20) {
        throw new Error("Username must be between 3 and 20 characters");
      }
      const existingUsername = await ctx.db.query("users").withIndex("by_username", (q) => q.eq("username", username)).first();
      if (existingUsername) {
        throw new Error("Username is already taken");
      }
    }
    let user = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", userEmail)).first();
    if (!user) {
      const displayName = userName || userEmail?.split("@")[0] || "User";
      const userId = await ctx.db.insert("users", {
        name: userName,
        email: userEmail,
        betterAuthId,
        emailVerified: authUser?.emailVerified ?? false,
        image: authUser?.image ?? void 0,
        createdAt: authUser?.createdAt ?? now,
        updatedAt: authUser?.updatedAt ?? now,
        username,
        displayName,
        locale: authUser?.locale ?? void 0,
        paymentsCustomerId: authUser?.paymentsCustomerId ?? void 0,
        onboardingComplete: false,
        role: void 0,
        banned: void 0,
        banReason: void 0,
        banExpires: void 0,
        interests: void 0,
        playerId: void 0,
        followerCount: 0,
        followingCount: 0,
        postCount: 0,
        isPrivate: false,
        allowMessages: true,
        lastActive: now
      });
      user = await ctx.db.get(userId);
      console.log("[syncUserToCustomTable] User created in custom users table:", userId);
    } else {
      const updates = {
        updatedAt: now
      };
      if (betterAuthId) {
        updates.betterAuthId = betterAuthId;
      }
      if (!user.username) {
        updates.username = username;
      }
      await ctx.db.patch(user._id, updates);
      console.log("[syncUserToCustomTable] User already exists, updated betterAuthId and/or username");
    }
    return user;
  }
});
mutation({
  args: {},
  handler: async (ctx) => {
    const authUser = await authClient.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }
    const userId = authUser._id;
    let user = await ctx.db.get(userId);
    if (!user) {
      user = await ctx.db.query("users").withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", userId)).first();
    }
    if (!user && authUser.email) {
      user = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", authUser.email)).first();
    }
    if (!user) {
      console.warn("User not found in database yet, onCreate hook may still be processing");
      return null;
    }
    if (user.playerId) {
      const existingPlayer2 = await ctx.db.get(user.playerId);
      if (existingPlayer2) {
        return existingPlayer2;
      }
    }
    const existingPlayer = await ctx.db.query("players").withIndex("by_user", (q) => q.eq("userId", user._id)).first();
    if (existingPlayer) {
      if (!user.playerId) {
        await ctx.db.patch(user._id, {
          playerId: existingPlayer._id,
          updatedAt: Date.now()
        });
      }
      return existingPlayer;
    }
    const playerId = await ctx.db.insert("players", {
      name: user.name || user.email?.split("@")[0] || "Player",
      userId: user._id,
      bio: null,
      avatarUrl: user.image ?? null,
      city: null,
      homeRoom: null,
      homeVenue: null,
      isVerified: false,
      updatedAt: Date.now(),
      fargoId: null,
      fargoReadableId: null,
      fargoMembershipId: null,
      fargoRating: null,
      fargoRobustness: null,
      league: null,
      apaId: null,
      apaSkillLevel: null,
      bcaId: null
    });
    await ctx.db.patch(user._id, {
      playerId,
      updatedAt: Date.now()
    });
    const existingStats = await ctx.db.query("playerStats").withIndex("by_player", (q) => q.eq("playerId", playerId)).first();
    if (!existingStats) {
      await ctx.db.insert("playerStats", {
        playerId,
        totalMatches: 0,
        wins: 0,
        losses: 0,
        tournamentsPlayed: 0,
        tournamentsWon: 0,
        averageScore: 0,
        lastUpdated: Date.now()
      });
    }
    return await ctx.db.get(playerId);
  }
});
const initialState = {
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null,
  toggleTheme: () => null
};
const ThemeProviderContext = createContext(initialState);
function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function resolveTheme(theme) {
  return theme === "system" ? getSystemTheme() : theme;
}
function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  ...props
}) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === "undefined") return defaultTheme;
    try {
      return localStorage.getItem(storageKey) || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });
  const [resolvedTheme, setResolvedTheme] = useState(
    () => resolveTheme(theme)
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const effectiveTheme = resolveTheme(theme);
    setResolvedTheme(effectiveTheme);
    root.classList.remove("light", "dark");
    root.classList.add(effectiveTheme);
    root.style.colorScheme = effectiveTheme;
  }, [theme, mounted]);
  useEffect(() => {
    if (!mounted) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        setResolvedTheme(systemTheme);
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(systemTheme);
        root.style.colorScheme = systemTheme;
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);
  const setTheme = (newTheme) => {
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch {
    }
    setThemeState(newTheme);
  };
  const handleThemeToggle = (coords) => {
    const root = document.documentElement;
    const currentResolved = resolvedTheme;
    const newResolved = currentResolved === "light" ? "dark" : "light";
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!document.startViewTransition || prefersReducedMotion) {
      setTheme(newResolved);
      return;
    }
    if (coords) {
      root.style.setProperty("--x", `${coords.x}px`);
      root.style.setProperty("--y", `${coords.y}px`);
    }
    const transition = document.startViewTransition(() => {
      setTheme(newResolved);
    });
    transition.finished.then(() => {
      root.style.removeProperty("--x");
      root.style.removeProperty("--y");
    }).catch(() => {
    });
  };
  const value = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme: handleThemeToggle
  };
  if (!mounted) {
    return null;
  }
  return /* @__PURE__ */ jsx(ThemeProviderContext.Provider, { ...props, value, children });
}
const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === void 0) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
const SettingsContext = React.createContext(void 0);
function SettingsProvider({ children }) {
  const [open, setOpen] = React.useState(false);
  const [initialTab, setInitialTab] = React.useState("account");
  const openSettingsDialog = React.useCallback((tab = "account") => {
    setInitialTab(tab);
    setOpen(true);
  }, []);
  const closeSettingsDialog = React.useCallback(() => {
    setOpen(false);
  }, []);
  const value = React.useMemo(
    () => ({
      openSettingsDialog,
      closeSettingsDialog,
      open,
      setOpen,
      initialTab,
      setInitialTab
    }),
    [openSettingsDialog, closeSettingsDialog, open, initialTab]
  );
  return /* @__PURE__ */ jsx(SettingsContext.Provider, { value, children });
}
function useSettingsState() {
  const context = React.useContext(SettingsContext);
  if (context === void 0) {
    throw new Error("useSettingsState must be used within SettingsProvider");
  }
  return {
    open: context.open,
    setOpen: context.setOpen,
    initialTab: context.initialTab,
    setInitialTab: context.setInitialTab
  };
}
export {
  SettingsProvider as S,
  ThemeProvider as T,
  authClient$1 as a,
  api as b,
  createAuth as c,
  useTheme as d,
  useSettingsState as u
};
