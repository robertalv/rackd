import { jsx, jsxs } from "react/jsx-runtime";
import { d as createServerRpc, c as createServerFn, a as getRequest, b as getCookie } from "../server.js";
import { Toaster } from "sonner";
import { createRootRouteWithContext, useRouteContext, Outlet, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { fetchSession, getCookieName } from "@convex-dev/better-auth/react-start";
import { c as createAuth, T as ThemeProvider, a as authClient, S as SettingsProvider } from "./globals-Bsfdm3JA.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "better-auth/react";
import "@convex-dev/better-auth/client/plugins";
import "@convex-dev/better-auth";
import "@convex-dev/better-auth/plugins";
import "@better-auth/expo";
import "convex/server";
import "better-auth";
import "convex/values";
import "react";
const fetchAuth_createServerFn_handler = createServerRpc("6154ff9ba122adcee8332d695693036b02edeab9765af4af6c11e985f19736d6", (opts, signal) => {
  return fetchAuth.__executeServer(opts, signal);
});
const fetchAuth = createServerFn({
  method: "GET"
}).handler(fetchAuth_createServerFn_handler, async () => {
  const {
    session
  } = await fetchSession(getRequest());
  const sessionCookieName = getCookieName(createAuth);
  const token = getCookie(sessionCookieName);
  return {
    userId: session?.user.id,
    token
  };
});
const Route = createRootRouteWithContext()({
  head: () => ({
    meta: [{
      charSet: "utf-8"
    }, {
      name: "viewport",
      content: "width=device-width, initial-scale=1"
    }, {
      title: "Rackd | Your AI-powered billiard partner"
    }]
  }),
  component: RootComponent,
  notFoundComponent: () => /* @__PURE__ */ jsx("div", { children: "Not Found" }),
  beforeLoad: async (ctx) => {
    try {
      const {
        userId,
        token
      } = await fetchAuth();
      if (token) {
        ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
      }
      return {
        userId,
        token
      };
    } catch (error) {
      console.error("Auth fetch failed:", error);
      return {
        userId: void 0,
        token: void 0
      };
    }
  }
});
function RootComponent() {
  const context = useRouteContext({
    from: Route.id
  });
  return /* @__PURE__ */ jsx(RootDocument, { children: /* @__PURE__ */ jsx(ThemeProvider, { defaultTheme: "dark", children: /* @__PURE__ */ jsx(ConvexBetterAuthProvider, { client: context.convexClient, authClient, children: /* @__PURE__ */ jsxs(SettingsProvider, { children: [
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(Toaster, { richColors: true })
  ] }) }) }) });
}
function RootDocument({
  children
}) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", className: "dark", suppressHydrationWarning: true, children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { className: "font-sans antialiased", children: [
      /* @__PURE__ */ jsx("div", { className: "grid h-svh grid-rows-[auto_1fr]", children }),
      /* @__PURE__ */ jsx(TanStackRouterDevtools, { position: "bottom-left" }),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
export {
  fetchAuth_createServerFn_handler
};
