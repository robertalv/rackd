import { Toaster } from "sonner";

import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
	useRouteContext,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import type { ConvexQueryClient } from "@convex-dev/react-query";
import type { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

import { createServerFn } from "@tanstack/react-start";
import { getRequest, getCookie } from "@tanstack/react-start/server";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import {
	fetchSession,
	getCookieName,
} from "@convex-dev/better-auth/react-start";
import { authClient } from "@/lib/auth-client";
import { createAuth } from "@rackd/backend/convex/auth";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SettingsProvider } from "@/providers/SettingsProvider";
import { AutumnProvider } from "@/providers/AutumnProvider";
import '@rackd/ui/globals.css';
import { setSentryUser, clearSentryUser } from "@/lib/sentry.client";
import { useEffect } from "react";
import * as Sentry from "@sentry/react";

const fetchAuth = createServerFn({ method: "GET" }).handler(async () => {
	const { session } = await fetchSession(getRequest());
	const sessionCookieName = getCookieName(createAuth);
	const token = getCookie(sessionCookieName);
	return {
		userId: session?.user.id,
		token,
	};
});

export interface RouterAppContext {
	queryClient: QueryClient;
	convexClient: ConvexReactClient;
	convexQueryClient: ConvexQueryClient;
	userId?: string;
	token?: string;
}

// CSP policy - more lenient in development for Vite HMR, stricter in production
const getCSPPolicy = () => {
	// Vite requires direct property access (no optional chaining or dynamic access)
	// Access directly like in sentry.client.ts - Vite handles this at build time
	const isDevelopment = import.meta.env.MODE === 'development';
	
	// Sentry requires multiple subdomain levels - CSP wildcards only match one level
	// Must explicitly list the full URL for multi-level subdomains
	const sentryConnectSrc = "https://sentry.io https://*.sentry.io https://o4510354603835392.ingest.us.sentry.io";
	
	if (isDevelopment) {
		// Development CSP: Allow Vite HMR and more permissive settings
		return [
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* http://127.0.0.1:* https://challenges.cloudflare.com https://*.challenges.cloudflare.com https://cdn.jsdelivr.net https://sentry.io https://*.sentry.io blob:",
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
			"font-src 'self' https://fonts.gstatic.com data:",
			"img-src 'self' data: https: blob: http:",
			`connect-src 'self' ws: wss: http://localhost:* http://127.0.0.1:* https://challenges.cloudflare.com https://*.challenges.cloudflare.com https://*.convex.cloud https://*.convex.site https://api.useautumn.com https://*.useautumn.com https://dashboard.fargorate.com ${sentryConnectSrc}`,
			"frame-src 'self' https://challenges.cloudflare.com https://*.challenges.cloudflare.com",
			"worker-src 'self' blob: data:",
			"object-src 'none'",
			"base-uri 'self'",
			"form-action 'self'"
		].join("; ");
	}
	// Production CSP: Stricter policy
	return [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://*.challenges.cloudflare.com https://cdn.jsdelivr.net https://sentry.io https://*.sentry.io blob:",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"font-src 'self' https://fonts.gstatic.com data:",
		"img-src 'self' data: https: blob:",
		`connect-src 'self' wss: https://challenges.cloudflare.com https://*.challenges.cloudflare.com https://*.convex.cloud https://*.convex.site https://api.useautumn.com https://*.useautumn.com https://dashboard.fargorate.com ${sentryConnectSrc}`,
		"frame-src 'self' https://challenges.cloudflare.com https://*.challenges.cloudflare.com",
		"worker-src 'self' blob: data:",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'"
	].join("; ");
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Rackd | Your AI-powered billiard partner",
			},
			{
				httpEquiv: "Content-Security-Policy",
				content: getCSPPolicy(),
			},
		],
	}),

	component: RootComponent,
	notFoundComponent: () => <div>Not Found</div>,
	beforeLoad: async (ctx) => {
		try {
			const { userId, token } = await fetchAuth();
			if (token) {
				ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
			}
			return { userId, token };
		} catch (error) {
			// If auth fetch fails, continue without auth
			console.error('Auth fetch failed:', error);
			return { userId: undefined, token: undefined };
		}
	},
});

function RootComponent() {
	const context = useRouteContext({ from: Route.id });

	useEffect(() => {
		if (context.userId) {
			setSentryUser({
				id: context.userId,
			});
		} else {
			clearSentryUser();
		}
	}, [context.userId]);

	return (
		<Sentry.ErrorBoundary fallback={<ErrorFallback />} showDialog>
			<RootDocument>
				<ThemeProvider defaultTheme="light">
					<ConvexBetterAuthProvider
						client={context.convexClient}
						authClient={authClient}
					>
						<AutumnProvider convexClient={context.convexClient}>
							<SettingsProvider>
								<Outlet />
								<Toaster richColors />
							</SettingsProvider>
						</AutumnProvider>
					</ConvexBetterAuthProvider>
				</ThemeProvider>
			</RootDocument>
		</Sentry.ErrorBoundary>
	);
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en" className="light" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="font-sans antialiased">
				<div className="grid h-svh grid-rows-[auto_1fr]">
					{children}
				</div>
				{/* <TanStackRouterDevtools position="bottom-left" /> */}
				<Scripts />
			</body>
		</html>
	);
}

function ErrorFallback() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="text-center space-y-4 max-w-md">
				<h1 className="text-2xl font-bold">Something went wrong</h1>
				<p className="text-muted-foreground">
					We've been notified about this error and are working on fixing it.
				</p>
				<button
					onClick={() => window.location.reload()}
					className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
				>
					Reload Page
				</button>
			</div>
		</div>
	);
}
