import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
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
import { cn } from "@rackd/ui/lib/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

const otpSchema = z.object({
  code: z.string().min(6, "Code must be 6 digits").max(6, "Code must be 6 digits"),
});

type OtpFormData = z.infer<typeof otpSchema>;

export const Route = createFileRoute('/_unauthenticated/verify-email')({
  component: VerifyEmailPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      userId: (search.userId as string) || '',
      email: (search.email as string) || '',
    };
  },
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const { userId, email } = useSearch({ from: '/_unauthenticated/verify-email' });
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data: OtpFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          code: data.code,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Verification failed');
      }

      toast.success("Email verified!", {
        description: "Your account has been verified. You can now sign in.",
      });

      // Redirect to login page
      navigate({ to: '/login' });
    } catch (error: any) {
      toast.error("Verification failed", {
        description: error.message || "Invalid code. Please try again.",
      });
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend code');
      }

      toast.success("Code resent!", {
        description: "Check your email for a new verification code.",
      });
    } catch (error: any) {
      toast.error("Failed to resend code", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!userId || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Request</CardTitle>
            <CardDescription>
              Missing user information. Please try signing up again.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/signup">
              <Button>Back to Sign Up</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
          <CardDescription>
            We sent a 6-digit code to <strong>{email}</strong>. Enter it below to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                maxLength={6}
                {...register("code")}
                className={cn(
                  "text-center text-2xl tracking-widest",
                  errors.code && "border-destructive"
                )}
                autoFocus
              />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground w-full">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="underline underline-offset-4 hover:text-primary disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend code"}
            </button>
          </div>
          <div className="text-center text-sm text-muted-foreground w-full">
            <Link to="/login" className="underline underline-offset-4 hover:text-primary">
              Back to Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

