import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@rackd/ui/components/card"
import { Button } from "@rackd/ui/components/button"
import { Input } from "@rackd/ui/components/input"
import { Label } from "@rackd/ui/components/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { authClient } from "@/lib/auth-client"

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const Route = createFileRoute('/_unauthenticated/reset-password')({
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || (search.password_reset_token as string) || '',
    };
  },
});

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [isResetting, setIsResetting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Get token from URL query params
  // Better Auth uses 'token' as the parameter name
  const search = Route.useSearch()
  const token = search.token || undefined
  
  // Also try to get token from URL directly as fallback
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  let tokenFromUrl = token || urlParams.get('token') || undefined

  // Clean up token - handle cases where URL might be malformed
  // e.g., if token contains '{token}?token=actualToken', extract just the actual token
  if (tokenFromUrl) {
    // Log the raw token for debugging
    console.log('Raw token from URL:', tokenFromUrl);
    console.log('Full URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');
    
    // Remove any literal {token} placeholder
    tokenFromUrl = tokenFromUrl.replace(/{token}/g, '')
    
    // If token contains '?token=', extract the part after it
    if (tokenFromUrl.includes('?token=')) {
      const parts = tokenFromUrl.split('?token=')
      tokenFromUrl = parts[parts.length - 1] // Get the last part after ?token=
    }
    
    // Remove any hash fragments
    if (tokenFromUrl.includes('#')) {
      tokenFromUrl = tokenFromUrl.split('#')[0]
    }
    
    // Trim whitespace
    tokenFromUrl = tokenFromUrl.trim()
    
    // If empty after cleaning, set to undefined
    if (!tokenFromUrl) {
      tokenFromUrl = undefined
    }
    
    console.log('Cleaned token:', tokenFromUrl);
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    const resetToken = tokenFromUrl
    
    if (!resetToken) {
      toast.error("Invalid reset link", {
        description: "The password reset link is missing the token. Please request a new one.",
      })
      return
    }

    setIsResetting(true)

    try {
      // Use better-auth's resetPassword method
      await authClient.resetPassword({
        token: resetToken,
        newPassword: data.password,
      })

      toast.success("Password reset successfully!", {
        description: "You can now sign in with your new password.",
      })

      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate({ to: '/login' })
      }, 1500)
    } catch (error: any) {
      console.error("Password reset failed:", error)
      toast.error("Failed to reset password", {
        description: error.message || "The reset link may be invalid or expired. Please request a new one.",
      })
      setIsResetting(false)
    }
  }

  if (!tokenFromUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Invalid Reset Link</CardTitle>
          <CardDescription>
            This password reset link is invalid or missing the required token.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please request a new password reset link from the login page.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full" asChild>
            <Link to="/login">Go to Sign In</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/forgot-password">Request New Reset Link</Link>
          </Button>
        </CardFooter>
      </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
        <CardDescription>
          Enter your new password below. Make sure it's at least 8 characters long.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your new password"
              {...register("password")}
              disabled={isResetting}
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
              placeholder="Confirm your new password"
              {...register("confirmPassword")}
              disabled={isResetting}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isResetting}>
            {isResetting ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm text-muted-foreground w-full">
          <Link to="/login" className="underline underline-offset-4 hover:text-primary">
            Back to sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
    </div>
  )
}
