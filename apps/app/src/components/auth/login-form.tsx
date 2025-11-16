"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@rackd/ui/components/button";
import { Input } from "@rackd/ui/components/input";
import { cn } from "@rackd/ui/lib/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { LogoIcon } from "@/components/logo";
import { Icon, Mail01Icon } from "@rackd/ui/icons";
import { useTurnstile } from "@rackd/cloudflare/client/turnstile";
import { verifyTurnstileToken } from "@/lib/functions/verify-turnstile";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  root: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Turnstile bot protection
  const turnstileSiteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY;
  const { token: turnstileToken, containerRef: turnstileContainerRef, reset: resetTurnstile, isLoading: turnstileLoading } = useTurnstile({
    siteKey: turnstileSiteKey || "",
    theme: "auto",
    size: "normal",
    onError: (error) => {
      console.error("Turnstile error:", error);
      // Error 110200 typically means invalid site key or hostname mismatch
      if (error.includes("110200")) {
        console.error("Turnstile error 110200: Check that your site key matches Cloudflare and the current hostname is configured");
      }
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
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

      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        throw result.error;
      }

      toast.success("Welcome back!", {
        description: "You have successfully signed in.",
      });

      // Reset Turnstile after successful login
      if (turnstileSiteKey) {
        resetTurnstile();
      }

      // Redirect to home page
      navigate({ to: "/", search: { postId: undefined } });
    } catch (error: any) {
      const errorMessage = 
        error?.message || 
        error?.code === "INVALID_CREDENTIALS" 
          ? "Invalid email or password. Please try again."
          : "Sign in failed. Please try again.";
      
      setError("root", {
        message: errorMessage,
      });
      
      toast.error("Sign in failed", {
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
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
        description: error?.message || "Failed to redirect to social login. Please try again.",
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
              onClick={() => handleSocialLogin('google')}
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
                autoComplete="current-password"
                size="lg"
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

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
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </div>

        <p className="text-center text-sm">
          Don&apos;t have an account?
          <Button
            asChild
            variant="link"
          >
            <Link to="/signup">Create account</Link>
          </Button>
        </p>
      </form>
    </section>
  );
}
