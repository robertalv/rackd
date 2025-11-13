import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent, e as CardFooter } from "./card-CNeVhZxM.js";
import { R as Route, B as Button } from "./router-CozkPsbM.js";
import { I as Input } from "./input-DCxY3WWX.js";
import { L as Label } from "./label-Z8WohVOh.js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
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
const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
function ResetPasswordPage() {
  const navigate = useNavigate();
  const [isResetting, setIsResetting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm({
    resolver: zodResolver(resetPasswordSchema)
  });
  const search = Route.useSearch();
  const token = search.token || void 0;
  const urlParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  let tokenFromUrl = token || urlParams.get("token") || urlParams.get("password_reset_token") || void 0;
  if (tokenFromUrl) {
    console.log("Raw token from URL:", tokenFromUrl);
    console.log("Full URL:", typeof window !== "undefined" ? window.location.href : "N/A");
    tokenFromUrl = tokenFromUrl.replace(/{token}/g, "");
    if (tokenFromUrl.includes("?token=")) {
      const parts = tokenFromUrl.split("?token=");
      tokenFromUrl = parts[parts.length - 1];
    }
    if (tokenFromUrl.includes("#")) {
      tokenFromUrl = tokenFromUrl.split("#")[0];
    }
    tokenFromUrl = tokenFromUrl.trim();
    if (!tokenFromUrl) {
      tokenFromUrl = void 0;
    }
    console.log("Cleaned token:", tokenFromUrl);
  }
  const onSubmit = async (data) => {
    const resetToken = tokenFromUrl;
    if (!resetToken) {
      toast.error("Invalid reset link", {
        description: "The password reset link is missing the token. Please request a new one."
      });
      return;
    }
    setIsResetting(true);
    try {
      toast.success("Password reset successfully!", {
        description: "You can now sign in with your new password."
      });
      setTimeout(() => {
        navigate({
          to: "/login"
        });
      }, 1500);
    } catch (error) {
      console.error("Password reset failed:", error);
      toast.error("Failed to reset password", {
        description: error.message || "The reset link may be invalid or expired. Please request a new one."
      });
      setIsResetting(false);
    }
  };
  if (!tokenFromUrl) {
    return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl font-bold", children: "Invalid Reset Link" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "This password reset link is invalid or missing the required token." })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Please request a new password reset link from the login page." }) }),
      /* @__PURE__ */ jsxs(CardFooter, { className: "flex flex-col space-y-4", children: [
        /* @__PURE__ */ jsx(Button, { className: "w-full", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/login", children: "Go to Sign In" }) }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", className: "w-full", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/forgot-password", children: "Request New Reset Link" }) })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1", children: [
      /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl font-bold", children: "Reset your password" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Enter your new password below. Make sure it's at least 8 characters long." })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "New Password" }),
        /* @__PURE__ */ jsx(Input, { id: "password", type: "password", placeholder: "Enter your new password", ...register("password"), disabled: isResetting }),
        errors.password && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: errors.password.message })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "confirmPassword", children: "Confirm Password" }),
        /* @__PURE__ */ jsx(Input, { id: "confirmPassword", type: "password", placeholder: "Confirm your new password", ...register("confirmPassword"), disabled: isResetting }),
        errors.confirmPassword && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: errors.confirmPassword.message })
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: isResetting, children: isResetting ? "Resetting Password..." : "Reset Password" })
    ] }) }),
    /* @__PURE__ */ jsx(CardFooter, { className: "flex flex-col space-y-4", children: /* @__PURE__ */ jsx("div", { className: "text-center text-sm text-muted-foreground w-full", children: /* @__PURE__ */ jsx(Link, { to: "/login", className: "underline underline-offset-4 hover:text-primary", children: "Back to sign in" }) }) })
  ] }) });
}
export {
  ResetPasswordPage as component
};
