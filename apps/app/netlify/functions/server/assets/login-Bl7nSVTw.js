import { jsxs, jsx } from "react/jsx-runtime";
import { zodResolver } from "@hookform/resolvers/zod";
import { c as cn, B as Button } from "./router-CozkPsbM.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent, e as CardFooter } from "./card-CNeVhZxM.js";
import { I as Input } from "./input-DCxY3WWX.js";
import { L as Label } from "./label-Z8WohVOh.js";
import { S as Separator } from "./separator-DLNU66HB.js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { a as authClient } from "./globals-Bsfdm3JA.js";
import { EyeOff, Eye } from "lucide-react";
import { useConvexAuth } from "convex/react";
import "@tanstack/react-query";
import "@tanstack/react-router-with-query";
import "@convex-dev/react-query";
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
import "@tanstack/react-router-devtools";
import "@convex-dev/better-auth/react";
import "@convex-dev/better-auth/react-start";
import "clsx";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-separator";
import "better-auth/react";
import "@convex-dev/better-auth/client/plugins";
import "@convex-dev/better-auth";
import "@convex-dev/better-auth/plugins";
import "@better-auth/expo";
import "convex/server";
import "better-auth";
import "convex/values";
function AuthLayout({ children, className, ...props }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("min-h-screen flex flex-col", className), ...props, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-3 pt-8 pb-6", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: "/logo.png",
          alt: "Rackd logo",
          className: "h-16 w-16"
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "font-bold lowercase tracking-tighter md:block text-4xl", children: "rackd" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center px-4 pb-8", children }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-20 pb-8 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: "© 2025 Rackd" }),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/privacy-policy",
          className: "underline-offset-4 hover:text-foreground hover:underline",
          children: "Privacy Policy"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/support",
          className: "underline-offset-4 hover:text-foreground hover:underline",
          children: "Support"
        }
      )
    ] })
  ] });
}
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  root: z.string().optional()
});
function LoginForm({
  className,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    resolver: zodResolver(loginSchema)
  });
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password
      });
      if (result.error) {
        throw result.error;
      }
      toast.success("Welcome back!", {
        description: "You have successfully signed in."
      });
      navigate({ to: "/" });
    } catch (error) {
      const errorMessage = error?.message || error?.code === "INVALID_CREDENTIALS" ? "Invalid email or password. Please try again." : "Sign in failed. Please try again.";
      setError("root", {
        message: errorMessage
      });
      toast.error("Sign in failed", {
        description: errorMessage
      });
      setIsLoading(false);
    }
  };
  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    try {
      const result = await authClient.signIn.social({
        provider
      });
      if (result.error) {
        throw result.error;
      }
    } catch (error) {
      toast.error("Something went wrong", {
        description: error?.message || "Failed to redirect to social login. Please try again."
      });
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsx(AuthLayout, { className, ...props, children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1 text-center", children: [
      /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl font-bold tracking-tight", children: "Welcome back" }),
      /* @__PURE__ */ jsx(CardDescription, { className: "text-base", children: "Sign in to continue your billiards journey" })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            type: "button",
            variant: "outline",
            className: "w-full",
            onClick: () => handleSocialLogin("google"),
            disabled: isLoading,
            children: [
              /* @__PURE__ */ jsxs(
                "svg",
                {
                  className: "h-4 w-4",
                  viewBox: "0 0 24 24",
                  children: [
                    /* @__PURE__ */ jsx(
                      "path",
                      {
                        d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z",
                        fill: "#4285F4"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "path",
                      {
                        d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z",
                        fill: "#34A853"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "path",
                      {
                        d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z",
                        fill: "#FBBC05"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "path",
                      {
                        d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z",
                        fill: "#EA4335"
                      }
                    )
                  ]
                }
              ),
              "Google"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            type: "button",
            variant: "outline",
            className: "w-full",
            onClick: () => handleSocialLogin("apple"),
            disabled: isLoading,
            children: [
              /* @__PURE__ */ jsx(
                "svg",
                {
                  className: "h-4 w-4",
                  fill: "currentColor",
                  viewBox: "0 0 24 24",
                  children: /* @__PURE__ */ jsx("path", { d: "M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.14 3.74-4.66 1.5 2.5 1.18 5.96-.64 7.86-1.78-1.2-2.6-2.9-3.1-3.2z" })
                }
              ),
              "Apple"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsx(Separator, {}) }),
        /* @__PURE__ */ jsx("div", { className: "relative flex justify-center text-xs uppercase", children: /* @__PURE__ */ jsx("span", { className: "bg-background px-2 text-muted-foreground", children: "Or continue with email" }) })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "email",
              type: "email",
              placeholder: "you@example.com",
              ...register("email"),
              className: cn(errors.email && "border-destructive"),
              autoComplete: "email"
            }
          ),
          errors.email && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: errors.email.message })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/forgot-password",
                className: "text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline",
                children: "Forgot password?"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "password",
                type: showPassword ? "text" : "password",
                placeholder: "Enter your password",
                ...register("password"),
                className: cn(
                  errors.password && "border-destructive",
                  "pr-10"
                ),
                autoComplete: "current-password"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowPassword(!showPassword),
                className: "absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors",
                "aria-label": showPassword ? "Hide password" : "Show password",
                children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
              }
            )
          ] }),
          errors.password && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: errors.password.message }),
          errors.root && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: errors.root.message })
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            className: "w-full",
            disabled: isLoading,
            size: "lg",
            children: isLoading ? "Signing in..." : "Sign in"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(CardFooter, { children: /* @__PURE__ */ jsxs("p", { className: "text-center text-sm text-muted-foreground w-full", children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/signup",
          className: "font-medium text-foreground underline-offset-4 hover:underline",
          children: "Sign up"
        }
      )
    ] }) })
  ] }) });
}
function LoginPage() {
  const {
    isLoading
  } = useConvexAuth();
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { children: "Loading..." });
  }
  return /* @__PURE__ */ jsx(LoginForm, {});
}
export {
  LoginPage as component
};
