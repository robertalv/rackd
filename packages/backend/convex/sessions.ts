import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./lib/utils";
import type { Id } from "./_generated/dataModel";

// Helper function to parse user agent and extract device/browser info
function parseUserAgent(userAgent: string | null | undefined) {
	if (!userAgent) {
		return {
			deviceName: null,
			browserName: null,
			browserAndOS: null,
		};
	}

	const ua = userAgent.toLowerCase();
	
	// Detect device type
	let deviceName: string | null = null;
	if (ua.includes("iphone")) {
		deviceName = "iPhone";
	} else if (ua.includes("ipad")) {
		deviceName = "iPad";
	} else if (ua.includes("android")) {
		deviceName = "Android Device";
	} else if (ua.includes("windows")) {
		deviceName = "Windows PC";
	} else if (ua.includes("macintosh") || ua.includes("mac os")) {
		deviceName = "Mac";
	} else if (ua.includes("linux")) {
		deviceName = "Linux PC";
	}

	// Detect browser
	let browserName: string | null = null;
	if (ua.includes("chrome") && !ua.includes("edg")) {
		browserName = "Chrome";
	} else if (ua.includes("firefox")) {
		browserName = "Firefox";
	} else if (ua.includes("safari") && !ua.includes("chrome")) {
		browserName = "Safari";
	} else if (ua.includes("edg")) {
		browserName = "Edge";
	} else if (ua.includes("opera") || ua.includes("opr")) {
		browserName = "Opera";
	}

	// Detect OS
	let osName: string | null = null;
	if (ua.includes("windows")) {
		const match = ua.match(/windows nt (\d+\.\d+)/);
		if (match) {
			const version = match[1];
			if (version.startsWith("10")) osName = "Windows 10/11";
			else if (version.startsWith("6.3")) osName = "Windows 8.1";
			else if (version.startsWith("6.2")) osName = "Windows 8";
			else if (version.startsWith("6.1")) osName = "Windows 7";
			else osName = "Windows";
		} else {
			osName = "Windows";
		}
	} else if (ua.includes("macintosh") || ua.includes("mac os")) {
		const match = ua.match(/mac os x (\d+[._]\d+)/);
		if (match) {
			osName = `macOS ${match[1].replace("_", ".")}`;
		} else {
			osName = "macOS";
		}
	} else if (ua.includes("android")) {
		const match = ua.match(/android (\d+\.\d+)/);
		if (match) {
			osName = `Android ${match[1]}`;
		} else {
			osName = "Android";
		}
	} else if (ua.includes("iphone os") || ua.includes("iphone")) {
		const match = ua.match(/os (\d+[._]\d+)/);
		if (match) {
			osName = `iOS ${match[1].replace("_", ".")}`;
		} else {
			osName = "iOS";
		}
	} else if (ua.includes("linux")) {
		osName = "Linux";
	}

	// Build browserAndOS string
	let browserAndOS: string | null = null;
	if (browserName && osName) {
		browserAndOS = `${browserName} on ${osName}`;
	} else if (browserName) {
		browserAndOS = browserName;
	} else if (osName) {
		browserAndOS = osName;
	}

	return {
		deviceName,
		browserName,
		browserAndOS,
	};
}

// Get current user's sessions
export const getMySessions = query({
	args: {},
	handler: async (ctx) => {
		const user = await getCurrentUser(ctx);
		if (!user) {
			throw new Error("Not authenticated");
		}

		// Get all sessions for this user from custom sessions table
		const sessions = await ctx.db
			.query("sessions")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.collect();

		// Try to get current session token from request headers
		// Better Auth stores the session token in the Authorization header or cookie
		let currentToken: string | null = null;
		try {
			// In Convex, we can access the request through ctx
			// Better Auth's adapter should provide the session token
			// For now, we'll identify current session by most recent update time
			// This is a reasonable heuristic for the active session
		} catch (error) {
			// If we can't get the current token, that's okay
			console.warn("Could not determine current session token:", error);
		}

		// Enrich sessions with parsed user agent info and status
		const now = Date.now();
		// Find the most recently updated non-expired session as the current one
		const mostRecentSession = sessions
			.filter((s) => s.expiresAt >= now)
			.sort((a, b) => b.updatedAt - a.updatedAt)[0];
		const currentSessionToken = mostRecentSession?.token || null;

		return sessions
			.map((session) => {
				const parsed = parseUserAgent(session.userAgent);
				const isExpired = session.expiresAt < now;
				const isCurrentSession = session.token === currentSessionToken && !isExpired;

				return {
					id: session._id,
					token: session.token,
					userId: session.userId,
					expiresAt: session.expiresAt,
					createdAt: session.createdAt,
					updatedAt: session.updatedAt,
					lastAccessedAt: session.updatedAt, // Use updatedAt as last accessed
					ipAddress: session.ipAddress ?? null,
					userAgent: session.userAgent ?? null,
					deviceName: parsed.deviceName,
					browserName: parsed.browserName,
					browserAndOS: parsed.browserAndOS,
					status: isExpired ? "expired" : "active",
					endedAt: isExpired ? session.expiresAt : null,
					isCurrentSession,
					impersonatedBy: session.impersonatedBy ?? null,
					activeOrganizationId: session.activeOrganizationId ?? null,
				};
			})
			.sort((a, b) => b.createdAt - a.createdAt); // Sort by newest first
	},
});

// Revoke a specific session
export const revokeSession = mutation({
	args: {
		sessionId: v.id("sessions"),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUser(ctx);
		if (!user) {
			throw new Error("Not authenticated");
		}

		// Get the session to verify it belongs to the user
		const session = await ctx.db.get(args.sessionId);
		if (!session) {
			throw new Error("Session not found");
		}

		if (session.userId !== user._id) {
			throw new Error("Unauthorized: Session does not belong to current user");
		}

		// Prevent revoking current session by checking if it's the most recent non-expired session
		const allSessions = await ctx.db
			.query("sessions")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.collect();
		
		const now = Date.now();
		const mostRecentSession = allSessions
			.filter((s) => s.expiresAt >= now)
			.sort((a, b) => b.updatedAt - a.updatedAt)[0];
		
		if (mostRecentSession && session.token === mostRecentSession.token) {
			throw new Error("Cannot revoke current session");
		}

		// Delete session from custom table
		// Better Auth's onCreate/onDelete hooks will sync this deletion
		// The session will be invalidated on the next request
		await ctx.db.delete(args.sessionId);

		return { success: true };
	},
});

// Revoke all other sessions (except current)
export const revokeAllOtherSessions = mutation({
	args: {},
	handler: async (ctx) => {
		const user = await getCurrentUser(ctx);
		if (!user) {
			throw new Error("Not authenticated");
		}

		// Get current session token by finding the most recent non-expired session
		const allSessions = await ctx.db
			.query("sessions")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.collect();
		
		const now = Date.now();
		const currentSession = allSessions
			.filter((s) => s.expiresAt >= now)
			.sort((a, b) => b.updatedAt - a.updatedAt)[0];
		
		if (!currentSession) {
			throw new Error("No active session found");
		}
		const currentToken = currentSession.token;

		// Get all sessions for this user
		const sessions = await ctx.db
			.query("sessions")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.collect();

		// Delete all sessions except the current one
		const sessionsToDelete = sessions.filter((s) => s.token !== currentToken);
		
		for (const session of sessionsToDelete) {
			await ctx.db.delete(session._id);
		}

		return {
			success: true,
			revokedCount: sessionsToDelete.length,
		};
	},
});

