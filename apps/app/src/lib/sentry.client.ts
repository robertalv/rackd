/**
 * Sentry Client Configuration
 * Initializes Sentry for client-side error tracking and performance monitoring
 */

import * as Sentry from "@sentry/react";

const dsn = "https://2240391d1e0a39416bb08ac714b3cfa9@o4510354603835392.ingest.us.sentry.io/4510372093362176";
const environment = import.meta.env.MODE || import.meta.env.VITE_ENV || "development";
const release = import.meta.env.VITE_SENTRY_RELEASE || undefined;
const tracesSampleRate = import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE
	? parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE)
	: environment === "production" ? 0.1 : 1.0;

export function initSentry() {
	if (!dsn) {
		console.warn("Sentry DSN not configured. Error monitoring disabled.");
		return;
	}

	Sentry.init({
		dsn,
		environment,
		release,
		sendDefaultPii: true,

		// Performance Monitoring
		tracesSampleRate,

		// Session Replay (optional - can be enabled per session or globally)
		replaysSessionSampleRate: environment === "production" ? 0.1 : 1.0,
		replaysOnErrorSampleRate: 1.0, // Always record replays for error sessions

		// Integrations
		integrations: [
			Sentry.browserTracingIntegration({
				// Enable tracing for TanStack Router
				enableInp: true,
			}),
			Sentry.replayIntegration({
				maskAllText: true, // Mask all text for privacy
				blockAllMedia: false, // Allow media to be captured
			}),
		],

		// Error filtering
		beforeSend(event, hint) {
			// Allow events in development if explicitly enabled OR if it's a test error
			const isTestError = hint.originalException instanceof Error && 
				hint.originalException.message === "This is your first error!";
			
			if (environment === "development" && !import.meta.env.VITE_SENTRY_ENABLE_DEV && !isTestError) {
				console.log("[Sentry] Event blocked in development mode. Set VITE_SENTRY_ENABLE_DEV=true to enable.");
				return null;
			}

			// Filter out known non-critical errors
			const error = hint.originalException;
			if (error instanceof Error) {
				// Filter out network errors that are expected
				if (
					error.message.includes("Failed to fetch") ||
					error.message.includes("NetworkError") ||
					error.message.includes("Load failed")
				) {
					// Only send if it's not a common network issue
					return null;
				}
			}

			return event;
		},

		// Set user context when available
		initialScope: {
			tags: {
				component: "client",
			},
		},
	});
}

/**
 * Set user context for Sentry
 */
export function setSentryUser(user: { id: string; email?: string; username?: string }) {
	Sentry.setUser({
		id: user.id,
		email: user.email,
		username: user.username,
	});
}

/**
 * Clear user context (on logout)
 */
export function clearSentryUser() {
	Sentry.setUser(null);
}

