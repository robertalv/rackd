import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { B as Button } from "./router-CozkPsbM.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent, e as CardFooter } from "./card-CNeVhZxM.js";
import { I as Input } from "./input-DCxY3WWX.js";
import { L as Label } from "./label-Z8WohVOh.js";
import "@tanstack/react-query";
import "@tanstack/react-router-with-query";
import "@convex-dev/react-query";
import "convex/react";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "sonner";
import "@tanstack/react-router-devtools";
import "@convex-dev/better-auth/react";
import "@convex-dev/better-auth/react-start";
import "./globals-Bsfdm3JA.js";
import "better-auth/react";
import "@convex-dev/better-auth/client/plugins";
import "@convex-dev/better-auth";
import "@convex-dev/better-auth/plugins";
import "@better-auth/expo";
import "convex/server";
import "better-auth";
import "convex/values";
import "react";
import "zod";
import "clsx";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "tailwind-merge";
import "lucide-react";
import "@radix-ui/react-label";
function ForgotPasswordPage() {
  return /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1", children: [
      /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl font-bold", children: "Reset your password" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Enter your email address and we'll send you a link to reset your password" })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsx(Input, { id: "email", type: "email", placeholder: "name@example.com" })
      ] }),
      /* @__PURE__ */ jsx(Button, { className: "w-full", asChild: true, children: /* @__PURE__ */ jsx("a", { href: "#", children: "Send Reset Link" }) })
    ] }),
    /* @__PURE__ */ jsxs(CardFooter, { className: "flex flex-col space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "text-center text-sm text-muted-foreground w-full", children: /* @__PURE__ */ jsx(Link, { to: "/login", className: "underline underline-offset-4 hover:text-primary", children: "Back to sign in" }) }),
      /* @__PURE__ */ jsxs("p", { className: "text-center text-sm text-muted-foreground w-full", children: [
        "Don't have an account?",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/signup", className: "underline underline-offset-4 hover:text-primary", children: "Sign up" })
      ] })
    ] })
  ] });
}
export {
  ForgotPasswordPage as component
};
