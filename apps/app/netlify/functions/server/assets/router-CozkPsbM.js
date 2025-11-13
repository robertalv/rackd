import { jsx, jsxs } from "react/jsx-runtime";
import { createRootRouteWithContext, useRouteContext, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, redirect, createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn, a as getRequest, b as getCookie } from "../server.js";
import { Toaster } from "sonner";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { fetchSession, getCookieName, reactStartHandler } from "@convex-dev/better-auth/react-start";
import { T as ThemeProvider, a as authClient, S as SettingsProvider, c as createAuth } from "./globals-Bsfdm3JA.js";
import { z } from "zod";
import { clsx } from "clsx";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Loader2 } from "lucide-react";
const createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const fn = async (...args) => {
    const serverFn = await getServerFnById(functionId);
    return serverFn(...args);
  };
  return Object.assign(fn, {
    url,
    functionId,
    [TSS_SERVER_FUNCTION]: true
  });
};
const fetchAuth_createServerFn_handler = createSsrRpc("6154ff9ba122adcee8332d695693036b02edeab9765af4af6c11e985f19736d6");
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
const Route$m = createRootRouteWithContext()({
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
    from: Route$m.id
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
const $$splitComponentImporter$k = () => import("./_unauthenticated-VVfRUNFq.js");
const searchSchema = z.object({
  redirect: z.string().optional()
});
const Route$l = createFileRoute("/_unauthenticated")({
  validateSearch: searchSchema,
  beforeLoad: async ({
    context,
    search
  }) => {
    if (context.userId) {
      throw redirect({
        to: search.redirect || "/"
      });
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./_authenticated-CWXHKfbK.js");
const Route$k = createFileRoute("/_authenticated")({
  beforeLoad: async ({
    context,
    location
  }) => {
    if (!context.userId) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href
        }
      });
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./index-CWd-1s8J.js");
const Route$j = createFileRoute("/_authenticated/")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./verify-email-CajnScYX.js");
z.object({
  code: z.string().min(6, "Code must be 6 digits").max(6, "Code must be 6 digits")
});
const Route$i = createFileRoute("/_unauthenticated/verify-email")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component"),
  validateSearch: (search) => {
    return {
      userId: search.userId || "",
      email: search.email || ""
    };
  }
});
const $$splitComponentImporter$g = () => import("./signup-N18aHPwx.js");
const Route$h = createFileRoute("/_unauthenticated/signup")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./reset-password-C5JgTWNW.js");
z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
const Route$g = createFileRoute("/_unauthenticated/reset-password")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component"),
  validateSearch: (search) => {
    return {
      token: search.token || search.password_reset_token || ""
    };
  }
});
const $$splitComponentImporter$e = () => import("./login-Bl7nSVTw.js");
const Route$f = createFileRoute("/_unauthenticated/login")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./forgot-password-B7Us7w7M.js");
const Route$e = createFileRoute("/_unauthenticated/forgot-password")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./tournaments-yICrvAv0.js");
const Route$d = createFileRoute("/_authenticated/tournaments")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./players-L8CmbI_7.js");
const Route$c = createFileRoute("/_authenticated/players")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const $$splitComponentImporter$a = () => import("./discover-C8UhGrvL.js");
const Route$b = createFileRoute("/_authenticated/discover")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./_username-BO5iU5hn.js");
const Route$a = createFileRoute("/_authenticated/$username")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./index-CgxUl8AS.js");
const Route$9 = createFileRoute("/_authenticated/venues/")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./index-DdNMOocQ.js");
const Route$8 = createFileRoute("/_authenticated/tournaments/")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-accent/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "button",
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}
const $$splitComponentImporter$6 = () => import("./index-DSUV34sp.js");
const Route$7 = createFileRoute("/_authenticated/players/")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./index-1hTY_Pb4.js");
const Route$6 = createFileRoute("/_authenticated/feed/")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const Route$5 = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => {
        return reactStartHandler(request);
      },
      POST: ({ request }) => {
        return reactStartHandler(request);
      }
    }
  }
});
const $$splitComponentImporter$4 = () => import("./new-CeGAd8lb.js");
const Route$4 = createFileRoute("/_authenticated/venues/new")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./_id-GnyMYJOA.js");
const Route$3 = createFileRoute("/_authenticated/venues/$id")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./new-didwngKE.js");
const Route$2 = createFileRoute("/_authenticated/tournaments/new")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./_id-BdYA0Hkp.js");
const Route$1 = createFileRoute("/_authenticated/tournaments/$id")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./_id-D3vq0Cbm.js");
const Route = createFileRoute("/_authenticated/players/$id")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const UnauthenticatedRoute = Route$l.update({
  id: "/_unauthenticated",
  getParentRoute: () => Route$m
});
const AuthenticatedRoute = Route$k.update({
  id: "/_authenticated",
  getParentRoute: () => Route$m
});
const AuthenticatedIndexRoute = Route$j.update({
  id: "/",
  path: "/",
  getParentRoute: () => AuthenticatedRoute
});
const UnauthenticatedVerifyEmailRoute = Route$i.update({
  id: "/verify-email",
  path: "/verify-email",
  getParentRoute: () => UnauthenticatedRoute
});
const UnauthenticatedSignupRoute = Route$h.update({
  id: "/signup",
  path: "/signup",
  getParentRoute: () => UnauthenticatedRoute
});
const UnauthenticatedResetPasswordRoute = Route$g.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => UnauthenticatedRoute
});
const UnauthenticatedLoginRoute = Route$f.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => UnauthenticatedRoute
});
const UnauthenticatedForgotPasswordRoute = Route$e.update({
  id: "/forgot-password",
  path: "/forgot-password",
  getParentRoute: () => UnauthenticatedRoute
});
const AuthenticatedTournamentsRoute = Route$d.update({
  id: "/tournaments",
  path: "/tournaments",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedPlayersRoute = Route$c.update({
  id: "/players",
  path: "/players",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedDiscoverRoute = Route$b.update({
  id: "/discover",
  path: "/discover",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedUsernameRoute = Route$a.update({
  id: "/$username",
  path: "/$username",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedVenuesIndexRoute = Route$9.update({
  id: "/venues/",
  path: "/venues/",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedTournamentsIndexRoute = Route$8.update({
  id: "/",
  path: "/",
  getParentRoute: () => AuthenticatedTournamentsRoute
});
const AuthenticatedPlayersIndexRoute = Route$7.update({
  id: "/",
  path: "/",
  getParentRoute: () => AuthenticatedPlayersRoute
});
const AuthenticatedFeedIndexRoute = Route$6.update({
  id: "/feed/",
  path: "/feed/",
  getParentRoute: () => AuthenticatedRoute
});
const ApiAuthSplatRoute = Route$5.update({
  id: "/api/auth/$",
  path: "/api/auth/$",
  getParentRoute: () => Route$m
});
const AuthenticatedVenuesNewRoute = Route$4.update({
  id: "/venues/new",
  path: "/venues/new",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedVenuesIdRoute = Route$3.update({
  id: "/venues/$id",
  path: "/venues/$id",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedTournamentsNewRoute = Route$2.update({
  id: "/new",
  path: "/new",
  getParentRoute: () => AuthenticatedTournamentsRoute
});
const AuthenticatedTournamentsIdRoute = Route$1.update({
  id: "/$id",
  path: "/$id",
  getParentRoute: () => AuthenticatedTournamentsRoute
});
const AuthenticatedPlayersIdRoute = Route.update({
  id: "/$id",
  path: "/$id",
  getParentRoute: () => AuthenticatedPlayersRoute
});
const AuthenticatedPlayersRouteChildren = {
  AuthenticatedPlayersIdRoute,
  AuthenticatedPlayersIndexRoute
};
const AuthenticatedPlayersRouteWithChildren = AuthenticatedPlayersRoute._addFileChildren(AuthenticatedPlayersRouteChildren);
const AuthenticatedTournamentsRouteChildren = {
  AuthenticatedTournamentsIdRoute,
  AuthenticatedTournamentsNewRoute,
  AuthenticatedTournamentsIndexRoute
};
const AuthenticatedTournamentsRouteWithChildren = AuthenticatedTournamentsRoute._addFileChildren(
  AuthenticatedTournamentsRouteChildren
);
const AuthenticatedRouteChildren = {
  AuthenticatedUsernameRoute,
  AuthenticatedDiscoverRoute,
  AuthenticatedPlayersRoute: AuthenticatedPlayersRouteWithChildren,
  AuthenticatedTournamentsRoute: AuthenticatedTournamentsRouteWithChildren,
  AuthenticatedIndexRoute,
  AuthenticatedVenuesIdRoute,
  AuthenticatedVenuesNewRoute,
  AuthenticatedFeedIndexRoute,
  AuthenticatedVenuesIndexRoute
};
const AuthenticatedRouteWithChildren = AuthenticatedRoute._addFileChildren(
  AuthenticatedRouteChildren
);
const UnauthenticatedRouteChildren = {
  UnauthenticatedForgotPasswordRoute,
  UnauthenticatedLoginRoute,
  UnauthenticatedResetPasswordRoute,
  UnauthenticatedSignupRoute,
  UnauthenticatedVerifyEmailRoute
};
const UnauthenticatedRouteWithChildren = UnauthenticatedRoute._addFileChildren(
  UnauthenticatedRouteChildren
);
const rootRouteChildren = {
  AuthenticatedRoute: AuthenticatedRouteWithChildren,
  UnauthenticatedRoute: UnauthenticatedRouteWithChildren,
  ApiAuthSplatRoute
};
const routeTree = Route$m._addFileChildren(rootRouteChildren)._addFileTypes();
function Loader() {
  return /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center h-full w-full p-12", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }) });
}
function getRouter() {
  const CONVEX_URL = "https://valuable-jackal-755.convex.cloud";
  const convex = new ConvexReactClient(CONVEX_URL, {
    unsavedChangesWarning: false
  });
  const convexQueryClient = new ConvexQueryClient(convex);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn()
      }
    }
  });
  convexQueryClient.connect(queryClient);
  const router2 = routerWithQueryClient(
    createRouter({
      routeTree,
      defaultPreload: "intent",
      defaultPendingComponent: () => /* @__PURE__ */ jsx(Loader, {}),
      defaultNotFoundComponent: () => /* @__PURE__ */ jsx("div", { children: "Not Found" }),
      context: { queryClient, convexClient: convex, convexQueryClient },
      Wrap: ({ children }) => /* @__PURE__ */ jsx(ConvexProvider, { client: convexQueryClient.convexClient, children })
    }),
    queryClient
  );
  return router2;
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Button as B,
  Route$g as R,
  Route$a as a,
  Route$3 as b,
  cn as c,
  buttonVariants as d,
  Route$1 as e,
  Route as f,
  router as r
};
