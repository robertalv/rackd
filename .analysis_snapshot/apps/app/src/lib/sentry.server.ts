/**
 * Sentry Server Configuration
 * Initializes Sentry for server-side error tracking and performance monitoring
 */

import * as Sentry from "@sentry/react";

const dsn = process.env.VITE_SENTRY_DSN || process.env.SENTRY_DSN;
const environment = process.env.NODE_ENV || process.env.VITE_ENV || "development";
const release = process.env.VITE_SENTRY_RELEASE || process.env.SENTRY_RELEASE || undefined;
const tracesSampleRate = process.env.VITE_SENTRY_TRACES_SAMPLE_RATE || process.env.SENTRY_TRACES_SAMPLE_RATE
	? parseFloat(process.env.VITE_SENTRY_TRACES_SAMPLE_RATE || process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1")
	: environment === "production" ? 0.1 : 1.0;

export function initSentryServer() {
	if (!dsn) {
		console.warn("Sentry DSN not configured for server. Error monitoring disabled.");
		return;
	}

	Sentry.init({
		dsn,
		environment,
		release,
		sendDefaultPii: true,

		// Performance Monitoring
		tracesSampleRate,

		// Error filtering
		beforeSend(event) {
			// Don't send events in development unless explicitly testing
			if (environment === "development" && !process.env.VITE_SENTRY_ENABLE_DEV) {
				return null;
			}

			return event;
		},

		// Server-specific configuration
		initialScope: {
			tags: {
				component: "server",
			},
		},
	});
}

