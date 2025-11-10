"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@rackd/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@rackd/ui/components/card";
import { Input } from "@rackd/ui/components/input";
import { Label } from "@rackd/ui/components/label";
import { Checkbox } from "@rackd/ui/components/checkbox";
import { Separator } from "@rackd/ui/components/separator";
import { cn } from "@rackd/ui/lib/utils";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-z0-9-_]+$/, "Username can only contain lowercase letters, numbers, hyphens, and underscores"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
  root: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
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
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      terms: false,
    },
  });

  const termsAccepted = watch("terms");
  const username = watch("username");

  // Check username availability in real-time
  const isUsernameAvailable = useQuery(
    api.users.checkUsername,
    username && username.length >= 3 && /^[a-z0-9-_]+$/.test(username)
      ? { username: username.toLowerCase() }
      : "skip"
  );

  // Validate username availability
  useEffect(() => {
    if (username && username.length >= 3 && /^[a-z0-9-_]+$/.test(username)) {
      if (isUsernameAvailable === false) {
        setError("username", {
          type: "manual",
          message: "Username is already taken",
        });
      } else if (isUsernameAvailable === true && errors.username?.type === "manual") {
        // Clear the error if username becomes available
        setError("username", { type: "manual", message: "" });
      }
    }
  }, [username, isUsernameAvailable, setError, errors.username]);

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);

    try {
      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
      });

      if (result.error) {
        throw result.error;
      }

      console.log("Signup result:", result);

      const betterAuthUserId = result.data?.user?.id;
      const sessionToken = result.data?.token;

      // Immediately sync user to custom users table (don't wait for hook)
      // Pass user data from signup result since session might not be established yet
      try {
        await syncUserToCustomTable({
          email: data.email,
          name: `${data.firstName} ${data.lastName}`,
          username: data.username.toLowerCase(),
          betterAuthUserId,
        });
        console.log("User synced to custom table");
      } catch (err: any) {
        console.warn("Failed to sync user to custom table:", err);
        // If username error, show it to user
        if (err?.message?.includes("Username")) {
          setError("username", {
            type: "manual",
            message: err.message,
          });
          setIsLoading(false);
          return;
        }
        // Continue anyway - hook might handle it
      }

      // Sync account and session immediately if onCreate hook hasn't fired yet
      if (betterAuthUserId) {
        // Sync email/password account
        try {
          await syncEmailPasswordAccount({
            betterAuthUserId,
            email: data.email,
          });
          console.log("Account synced to custom table");
        } catch (err: any) {
          console.warn("Failed to sync account (may already exist):", err);
          // Continue anyway - hook might handle it
        }

        // Sync session if token is available
        if (sessionToken) {
          try {
            await syncSessionFromToken({
              token: sessionToken,
              betterAuthUserId,
            });
            console.log("Session synced to custom table");
          } catch (err: any) {
            console.warn("Failed to sync session (may already exist):", err);
            // Continue anyway - hook might handle it
          }
        }
      }

      // Create player profile immediately
      try {
        const player = await createPlayerProfile();
        if (player) {
          console.log("Player profile created/verified:", player);
        }
      } catch (err: any) {
        // Player profile creation is idempotent, so errors are non-critical
        console.warn("Failed to create player profile (may already exist):", err);
        // Don't fail the signup if player profile creation fails
      }

      toast.success("Account created!", {
        description: "You have successfully signed up.",
      });

      // Redirect to home page after successful signup
      navigate({ to: "/" });
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      const errorMessage = 
        error?.message || 
        error?.code === "EMAIL_ALREADY_EXISTS"
          ? "An account with this email already exists."
          : "Failed to create account. Please try again.";
      
      setError("root", {
        message: errorMessage,
      });
      
      toast.error("Sign up failed", {
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    try {
      const result = await authClient.signIn.social({
        provider,
      });

      if (result.error) {
        throw result.error;
      }

      // Social login redirects automatically, so we don't need to handle navigation
    } catch (error: any) {
      toast.error("Something went wrong", {
        description: error?.message || "Failed to redirect to social sign up. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>Enter your information to get started</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input 
                id="firstName" 
                type="text" 
                placeholder="John"
                {...register("firstName")}
                className={cn(errors.firstName && "border-destructive")}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input 
                id="lastName" 
                type="text" 
                placeholder="Doe"
                {...register("lastName")}
                className={cn(errors.lastName && "border-destructive")}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input 
                id="username" 
                type="text" 
                placeholder="johndoe"
                {...register("username", {
                  onChange: (e) => {
                    // Convert to lowercase as user types
                    const value = e.target.value.toLowerCase();
                    setValue("username", value);
                  },
                })}
                className={cn(
                  errors.username && "border-destructive",
                  "pr-14" // Ensure there's space for the icon
                )}
              />
              <div className="absolute inset-y-0 right-2 flex items-center h-full pointer-events-none">
                {/* Show the checkbox if username is valid and available */}
                {username && username.length >= 3 && /^[a-z0-9-_]+$/.test(username) && isUsernameAvailable ? (
                  <Checkbox 
                    checked
                    tabIndex={-1}
                    className="pointer-events-auto cursor-default scale-90"
                    aria-label="Username available"
                    disabled
                    id="username-availability"
                  />
                ) : null}
                {/* Show an "X" icon if there's an error or if username has invalid characters */}
                {(errors.username || (username && /[^a-z0-9-_]/.test(username))) && (
                  <svg
                    className="text-destructive w-4 h-4 ml-1 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-label="Username invalid"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                  </svg>
                )}
              </div>
            </div>
            {/* No error message below, only icon on the right */}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com"
              {...register("email")}
              className={cn(errors.email && "border-destructive")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Create a password"
              {...register("password")}
              className={cn(errors.password && "border-destructive")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              placeholder="Confirm your password"
              {...register("confirmPassword")}
              className={cn(errors.confirmPassword && "border-destructive")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setValue("terms", checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{' '}
              <a href="#" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.terms && (
            <p className="text-sm text-destructive">{errors.terms.message}</p>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => handleSocialSignup('google')}
            disabled={isLoading}
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
          <Button 
            type="button"
            variant="outline" 
            onClick={() => handleSocialSignup('apple')}
            disabled={isLoading}
          >
            <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.14 3.74-4.66 1.5 2.5 1.18 5.96-.64 7.86-1.78-1.2-2.6-2.9-3.1-3.2z"/>
            </svg>
            Apple
          </Button>
        </div>
        {errors.root && (
          <p className="text-sm text-destructive text-center">
            {errors.root.message}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-center text-sm text-muted-foreground w-full">
          Already have an account?{' '}
          <Link to="/login" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

