"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@rackd/ui/components/button";
import { Input } from "@rackd/ui/components/input";
import { Checkbox } from "@rackd/ui/components/checkbox";
import { cn } from "@rackd/ui/lib/utils";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { LogoIcon } from "@/components/logo";
import { Icon, Mail01Icon } from "@rackd/ui/icons";
import { useTurnstile } from "@rackd/cloudflare/client/turnstile";
import { verifyTurnstileToken } from "@/lib/functions/verify-turnstile";

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
  
  // Turnstile bot protection
  const turnstileSiteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY;
  const { token: turnstileToken, containerRef: turnstileContainerRef, reset: resetTurnstile, isLoading: turnstileLoading } = useTurnstile({
    siteKey: turnstileSiteKey || "",
    theme: "auto",
    size: "normal",
    onError: (error) => {
      console.error("Turnstile error:", error);
    },
  });

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
      // Verify Turnstile token if site key is configured
      if (turnstileSiteKey) {
        if (!turnstileToken) {
          setError("root", {
            message: "Please complete the security verification.",
          });
          toast.error("Security verification required", {
            description: "Please complete the security check below.",
          });
          setIsLoading(false);
          return;
        }

        // Verify the token on the server
        const verification = await (verifyTurnstileToken as any)({ token: turnstileToken }) as {
          success: boolean;
          verified?: boolean;
          error?: string;
          hostname?: string;
        };
        
        if (!verification.success || !verification.verified) {
          setError("root", {
            message: verification.error || "Security verification failed. Please try again.",
          });
          toast.error("Verification failed", {
            description: verification.error || "Please complete the security check again.",
          });
          resetTurnstile();
          setIsLoading(false);
          return;
        }
      }

      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
      });

      if (result.error) {
        throw result.error;
      }

      const betterAuthUserId = result.data?.user?.id;

      // Immediately sync user to custom users table (don't wait for hook)
      // Pass user data from signup result since session might not be established yet
      try {
        await syncUserToCustomTable({
          email: data.email,
          name: `${data.firstName} ${data.lastName}`,
          username: data.username.toLowerCase(),
          betterAuthUserId,
        });
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


      // Create player profile immediately
      try {
        const player = await createPlayerProfile();
      } catch (err: any) {
        // Player profile creation is idempotent, so errors are non-critical
        console.warn("Failed to create player profile (may already exist):", err);
        // Don't fail the signup if player profile creation fails
      }

      toast.success("Account created!", {
        description: "You have successfully signed up.",
      });

      // Reset Turnstile after successful signup
      if (turnstileSiteKey) {
        resetTurnstile();
      }

      // Redirect to home page after successful signup
      navigate({ to: "/", search: { postId: undefined } })
    } catch (error: any) {
      console.error('Signup error:', error);
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
    <section className="flex min-h-screen bg-background px-4 py-16 md:py-32">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-2xl m-auto h-fit w-full"
      >
        <div className="p-6">
          <div className="flex flex-col items-center justify-center">
            <LogoIcon className="h-16 w-16" />
            <h1 className="mt-1 text-2xl font-bold tracking-tighter">Welcome to rackd</h1>
          </div>

          <div className="mt-6">
            <Button
              type="button"
              onClick={() => handleSocialSignup('google')}
              disabled={isLoading}
              size="lg"
              variant="auth"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="0.98em"
                height="1em"
                viewBox="0 0 256 262"
              >
                <path
                  fill="#4285f4"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                />
                <path
                  fill="#34a853"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                />
                <path
                  fill="#fbbc05"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                />
                <path
                  fill="#eb4335"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                />
              </svg>
              <span>Continue with Google</span>
            </Button>
          </div>

          <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <hr className="border-dashed" />
            <span className="text-muted-foreground text-xs">Or continue with</span>
            <hr className="border-dashed" />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  required
                  placeholder="First name"
                  id="firstName"
                  {...register("firstName")}
                  className={cn(errors.firstName && "border-destructive")}
                  autoComplete="given-name"
                  size="lg"
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  type="text"
                  required
                  placeholder="Last name"
                  id="lastName"
                  {...register("lastName")}
                  className={cn(errors.lastName && "border-destructive")}
                  autoComplete="family-name"
                  size="lg"
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="text"
                  required
                  placeholder="Username"
                  id="username"
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
                  autoComplete="username"
                  size="lg"
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
              {errors.username && errors.username.type !== "manual" && (
                <p className="text-sm text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                type="email"
                required
                placeholder="Email"
                id="email"
                {...register("email")}
                className={cn(errors.email && "border-destructive")}
                autoComplete="email"
                size="lg"
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                type="password"
                required
                placeholder="Password"
                id="password"
                {...register("password")}
                className={cn(errors.password && "border-destructive")}
                autoComplete="new-password"
                size="lg"
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                type="password"
                required
                placeholder="Confirm Password"
                id="confirmPassword"
                {...register("confirmPassword")}
                className={cn(errors.confirmPassword && "border-destructive")}
                autoComplete="new-password"
                size="lg"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
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

            <div className="space-y-2">
              {errors.root && (
                <p className="text-sm text-destructive">
                  {errors.root.message}
                </p>
              )}
            </div>

            {/* Turnstile widget - floating bottom right */}
            {turnstileSiteKey && (
              <div className="fixed bottom-4 right-4 z-50">
                <div ref={turnstileContainerRef} />
              </div>
            )}

            <Button 
              type="submit"
              size="lg"
              variant="auth"
              disabled={isLoading || (turnstileSiteKey && (!turnstileToken || turnstileLoading))}
              className="w-full"
            >
              <Icon icon={Mail01Icon} className="h-4 w-4" />
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </div>
        </div>

        <p className="text-center text-sm">
          Already have an account?{' '}
          <Button
            asChild
            variant="link"
          >
            <Link to="/login">Sign in</Link>
          </Button>
        </p>
      </form>
    </section>
  );
}

