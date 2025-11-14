import { Toaster } from "sonner";

import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
	useRouteContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
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
import '@rackd/ui/globals.css';

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
	return (
		<RootDocument>
			<ThemeProvider defaultTheme="light">
				<ConvexBetterAuthProvider
					client={context.convexClient}
					authClient={authClient}
				>
					<SettingsProvider>
						<Outlet />
						<Toaster richColors />
					</SettingsProvider>
				</ConvexBetterAuthProvider>
			</ThemeProvider>
		</RootDocument>
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
				<TanStackRouterDevtools position="bottom-left" />
				<Scripts />
			</body>
		</html>
	);
}
