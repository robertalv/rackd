import { jsxs, jsx } from "react/jsx-runtime";
import { zodResolver } from "@hookform/resolvers/zod";
import { c as cn, B as Button } from "./router-CozkPsbM.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent, e as CardFooter } from "./card-CNeVhZxM.js";
import { I as Input } from "./input-DCxY3WWX.js";
import { L as Label } from "./label-Z8WohVOh.js";
import { C as Checkbox } from "./checkbox-Bd8KRozL.js";
import { S as Separator } from "./separator-DLNU66HB.js";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { b as api, a as authClient } from "./globals-Bsfdm3JA.js";
import { useMutation, useQuery } from "convex/react";
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
import "lucide-react";
import "@radix-ui/react-label";
import "@radix-ui/react-checkbox";
import "@radix-ui/react-separator";
import "better-auth/react";
import "@convex-dev/better-auth/client/plugins";
import "@convex-dev/better-auth";
import "@convex-dev/better-auth/plugins";
import "@better-auth/expo";
import "convex/server";
import "better-auth";
import "convex/values";
const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters").regex(/^[a-z0-9-_]+$/, "Username can only contain lowercase letters, numbers, hyphens, and underscores"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions"
  }),
  root: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const syncUserToCustomTable = useMutation(api.auth.syncUserToCustomTable);
  const createPlayerProfile = useMutation(api.auth.createPlayerProfile);
  const syncSessionFromToken = useMutation(api.auth.syncSessionFromToken);
  const syncEmailPasswordAccount = useMutation(api.auth.syncEmailPasswordAccount);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      terms: false
    }
  });
  const termsAccepted = watch("terms");
  const username = watch("username");
  const isUsernameAvailable = useQuery(
    api.users.checkUsername,
    username && username.length >= 3 && /^[a-z0-9-_]+$/.test(username) ? { username: username.toLowerCase() } : "skip"
  );
  useEffect(() => {
    if (username && username.length >= 3 && /^[a-z0-9-_]+$/.test(username)) {
      if (isUsernameAvailable === false) {
        setError("username", {
          type: "manual",
          message: "Username is already taken"
        });
      } else if (isUsernameAvailable === true && errors.username?.type === "manual") {
        setError("username", { type: "manual", message: "" });
      }
    }
  }, [username, isUsernameAvailable, setError, errors.username]);
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`
      });
      if (result.error) {
        throw result.error;
      }
      console.log("Signup result:", result);
      const betterAuthUserId = result.data?.user?.id;
      const sessionToken = result.data?.token;
      try {
        await syncUserToCustomTable({
          email: data.email,
          name: `${data.firstName} ${data.lastName}`,
          username: data.username.toLowerCase(),
          betterAuthUserId
        });
        console.log("User synced to custom table");
      } catch (err) {
        console.warn("Failed to sync user to custom table:", err);
        if (err?.message?.includes("Username")) {
          setError("username", {
            type: "manual",
            message: err.message
          });
          setIsLoading(false);
          return;
        }
      }
      if (betterAuthUserId) {
        try {
          await syncEmailPasswordAccount({
            betterAuthUserId,
            email: data.email
          });
          console.log("Account synced to custom table");
        } catch (err) {
          console.warn("Failed to sync account (may already exist):", err);
        }
        if (sessionToken) {
          try {
            await syncSessionFromToken({
              token: sessionToken,
              betterAuthUserId
            });
            console.log("Session synced to custom table");
          } catch (err) {
            console.warn("Failed to sync session (may already exist):", err);
          }
        }
      }
      try {
        const player = await createPlayerProfile();
        if (player) {
          console.log("Player profile created/verified:", player);
        }
      } catch (err) {
        console.warn("Failed to create player profile (may already exist):", err);
      }
      toast.success("Account created!", {
        description: "You have successfully signed up."
      });
      navigate({ to: "/" });
    } catch (error) {
      console.error("❌ Signup error:", error);
      const errorMessage = error?.message || error?.code === "EMAIL_ALREADY_EXISTS" ? "An account with this email already exists." : "Failed to create account. Please try again.";
      setError("root", {
        message: errorMessage
      });
      toast.error("Sign up failed", {
        description: errorMessage
      });
      setIsLoading(false);
    }
  };
  const handleSocialSignup = async (provider) => {
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
        description: error?.message || "Failed to redirect to social sign up. Please try again."
      });
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1", children: [
      /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl font-bold", children: "Create an account" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Enter your information to get started" })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "firstName", children: "First name" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "firstName",
                type: "text",
                placeholder: "John",
                ...register("firstName"),
                className: cn(errors.firstName && "border-destructive")
              }
            ),
            errors.firstName && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: errors.firstName.message })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "lastName", children: "Last name" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "lastName",
                type: "text",
                placeholder: "Doe",
                ...register("lastName"),
                className: cn(errors.lastName && "border-destructive")
              }
            ),
            errors.lastName && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: errors.lastName.message })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "username", children: "Username" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "username",
                type: "text",
                placeholder: "johndoe",
                ...register("username", {
                  onChange: (e) => {
                    const value = e.target.value.toLowerCase();
                    setValue("username", value);
                  }
                }),
                className: cn(
                  errors.username && "border-destructive",
                  "pr-14"
                  // Ensure there's space for the icon
                )
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "absolute inset-y-0 right-2 flex items-center h-full pointer-events-none", children: [
              username && username.length >= 3 && /^[a-z0-9-_]+$/.test(username) && isUsernameAvailable ? /* @__PURE__ */ jsx(
                Checkbox,
                {
                  checked: true,
                  tabIndex: -1,
                  className: "pointer-events-auto cursor-default scale-90",
                  "aria-label": "Username available",
                  disabled: true,
                  id: "username-availability"
                }
              ) : null,
              (errors.username || username && /[^a-z0-9-_]/.test(username)) && /* @__PURE__ */ jsx(
                "svg",
                {
                  className: "text-destructive w-4 h-4 ml-1 pointer-events-none",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: 2,
                  viewBox: "0 0 24 24",
                  "aria-label": "Username invalid",
                  children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M18 6L6 18M6 6l12 12" })
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "email",
              type: "email",
              placeholder: "name@example.com",
              ...register("email"),
              className: cn(errors.email && "border-destructive")
            }
          ),
          errors.email && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: errors.email.message })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "password",
              type: "password",
              placeholder: "Create a password",
              ...register("password"),
              className: cn(errors.password && "border-destructive")
            }
          ),
          errors.password && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: errors.password.message })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "confirmPassword", children: "Confirm Password" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "confirmPassword",
              type: "password",
              placeholder: "Confirm your password",
              ...register("confirmPassword"),
              className: cn(errors.confirmPassword && "border-destructive")
            }
          ),
          errors.confirmPassword && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: errors.confirmPassword.message })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx(
            Checkbox,
            {
              id: "terms",
              checked: termsAccepted,
              onCheckedChange: (checked) => setValue("terms", checked)
            }
          ),
          /* @__PURE__ */ jsxs(
            "label",
            {
              htmlFor: "terms",
              className: "text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              children: [
                "I agree to the",
                " ",
                /* @__PURE__ */ jsx("a", { href: "#", className: "underline underline-offset-4 hover:text-primary", children: "Terms of Service" }),
                " ",
                "and",
                " ",
                /* @__PURE__ */ jsx("a", { href: "#", className: "underline underline-offset-4 hover:text-primary", children: "Privacy Policy" })
              ]
            }
          )
        ] }),
        errors.terms && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: errors.terms.message }),
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? "Creating account..." : "Create Account" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsx(Separator, {}) }),
        /* @__PURE__ */ jsx("div", { className: "relative flex justify-center text-xs uppercase", children: /* @__PURE__ */ jsx("span", { className: "bg-background px-2 text-muted-foreground", children: "Or continue with" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => handleSocialSignup("google"),
            disabled: isLoading,
            children: [
              /* @__PURE__ */ jsxs("svg", { className: "h-4 w-4 mr-2", viewBox: "0 0 24 24", children: [
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
              ] }),
              "Google"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => handleSocialSignup("apple"),
            disabled: isLoading,
            children: [
              /* @__PURE__ */ jsx("svg", { className: "h-4 w-4 mr-2", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { d: "M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.14 3.74-4.66 1.5 2.5 1.18 5.96-.64 7.86-1.78-1.2-2.6-2.9-3.1-3.2z" }) }),
              "Apple"
            ]
          }
        )
      ] }),
      errors.root && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive text-center", children: errors.root.message })
    ] }),
    /* @__PURE__ */ jsx(CardFooter, { children: /* @__PURE__ */ jsxs("p", { className: "text-center text-sm text-muted-foreground w-full", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/login", className: "underline underline-offset-4 hover:text-primary", children: "Sign in" })
    ] }) })
  ] });
}
function SignupPage() {
  return /* @__PURE__ */ jsx(SignupForm, {});
}
export {
  SignupPage as component
};
