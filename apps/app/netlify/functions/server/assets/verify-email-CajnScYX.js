import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, useSearch, Link } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { B as Button, c as cn } from "./router-CozkPsbM.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, e as CardFooter, d as CardContent } from "./card-CNeVhZxM.js";
import { I as Input } from "./input-DCxY3WWX.js";
import { L as Label } from "./label-Z8WohVOh.js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
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
import "clsx";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "tailwind-merge";
import "lucide-react";
import "@radix-ui/react-label";
const otpSchema = z.object({
  code: z.string().min(6, "Code must be 6 digits").max(6, "Code must be 6 digits")
});
function VerifyEmailPage() {
  const navigate = useNavigate();
  const {
    userId,
    email
  } = useSearch({
    from: "/_unauthenticated/verify-email"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm({
    resolver: zodResolver(otpSchema)
  });
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          code: data.code
        })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Verification failed");
      }
      toast.success("Email verified!", {
        description: "Your account has been verified. You can now sign in."
      });
      navigate({
        to: "/login"
      });
    } catch (error) {
      toast.error("Verification failed", {
        description: error.message || "Invalid code. Please try again."
      });
      setIsLoading(false);
    }
  };
  const handleResendCode = async () => {
    setIsResending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId
        })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to resend code");
      }
      toast.success("Code resent!", {
        description: "Check your email for a new verification code."
      });
    } catch (error) {
      toast.error("Failed to resend code", {
        description: error.message || "Please try again later."
      });
    } finally {
      setIsResending(false);
    }
  };
  if (!userId || !email) {
    return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Invalid Request" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Missing user information. Please try signing up again." })
      ] }),
      /* @__PURE__ */ jsx(CardFooter, { children: /* @__PURE__ */ jsx(Link, { to: "/signup", children: /* @__PURE__ */ jsx(Button, { children: "Back to Sign Up" }) }) })
    ] }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1", children: [
      /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl font-bold", children: "Verify your email" }),
      /* @__PURE__ */ jsxs(CardDescription, { children: [
        "We sent a 6-digit code to ",
        /* @__PURE__ */ jsx("strong", { children: email }),
        ". Enter it below to verify your account."
      ] })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "code", children: "Verification Code" }),
        /* @__PURE__ */ jsx(Input, { id: "code", type: "text", placeholder: "000000", maxLength: 6, ...register("code"), className: cn("text-center text-2xl tracking-widest", errors.code && "border-destructive"), autoFocus: true }),
        errors.code && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: errors.code.message })
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? "Verifying..." : "Verify Email" })
    ] }) }),
    /* @__PURE__ */ jsxs(CardFooter, { className: "flex flex-col space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center text-sm text-muted-foreground w-full", children: [
        "Didn't receive the code?",
        " ",
        /* @__PURE__ */ jsx("button", { type: "button", onClick: handleResendCode, disabled: isResending, className: "underline underline-offset-4 hover:text-primary disabled:opacity-50", children: isResending ? "Sending..." : "Resend code" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-center text-sm text-muted-foreground w-full", children: /* @__PURE__ */ jsx(Link, { to: "/login", className: "underline underline-offset-4 hover:text-primary", children: "Back to Sign In" }) })
    ] })
  ] }) });
}
export {
  VerifyEmailPage as component
};
