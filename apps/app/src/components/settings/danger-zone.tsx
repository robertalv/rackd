"use client"

import * as React from "react"
import { Button } from "@rackd/ui/components/button"
import { Input } from "@rackd/ui/components/input"
import { Label } from "@rackd/ui/components/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@rackd/ui/components/alert-dialog"
import { Trash2, Mail, CheckCircle2, KeyRound } from "lucide-react"
import { useAction } from "convex/react"
import { api } from "@rackd/backend/convex/_generated/api"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

interface DangerZoneProps {
  user: any
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const createPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
type CreatePasswordFormData = z.infer<typeof createPasswordSchema>;

export function DangerZone({ user }: DangerZoneProps) {
  const [deleteConfirmation, setDeleteConfirmation] = React.useState("")
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [passwordResetSent, setPasswordResetSent] = React.useState(false)
  const [isSendingReset, setIsSendingReset] = React.useState(false)
  
  const createPasswordReset = useAction(api.workos.createPasswordReset)
  const updatePassword = useAction(api.workos.updatePassword)
  const checkPasswordExists = useAction(api.workos.checkPasswordExists)
  
  const [hasPassword, setHasPassword] = React.useState<boolean | null>(null)
  const [isCheckingPassword, setIsCheckingPassword] = React.useState(true)
  
  // Check if user has password on mount
  React.useEffect(() => {
    const checkPassword = async () => {
      if (!user?.workos?.id) {
        setIsCheckingPassword(false)
        return
      }
      
      try {
        const result = await checkPasswordExists({ userId: user.workos.id })
        setHasPassword(result.hasPassword)
      } catch (error) {
        console.error("Failed to check password:", error)
        // Default to false if check fails (show create password option)
        setHasPassword(false)
      } finally {
        setIsCheckingPassword(false)
      }
    }
    
    checkPassword()
  }, [user?.workos?.id, checkPasswordExists])
  
  // Use the checked password status, or fallback to heuristic
  const likelyHasPassword = React.useMemo(() => {
    if (hasPassword !== null) {
      return hasPassword
    }
    // Fallback heuristic while checking
    const hasOAuthProfile = user?.workos?.profilePictureUrl || user?.coverImage
    return !hasOAuthProfile
  }, [hasPassword, user])

  // Form for changing password (if user has password)
  const changePasswordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Form for creating password (if user doesn't have password)
  const createPasswordForm = useForm<CreatePasswordFormData>({
    resolver: zodResolver(createPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") return
    
    setIsDeleting(true)
    // TODO: Implement account deletion logic
    console.log("Deleting account...")
    setIsDeleting(false)
  }

  const handleChangePassword = async (data: ChangePasswordFormData) => {
    if (!user?.workos?.id) {
      toast.error("User information not available")
      return
    }

    setIsSendingReset(true)
    
    try {
      // Verify current password and trigger password reset email
      await updatePassword({
        userId: user.workos.id,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      
      setPasswordResetSent(true)
      changePasswordForm.reset()
      toast.success("Password verified", {
        description: "Check your email for instructions to set your new password",
      })
    } catch (error: any) {
      console.error("Failed to change password:", error)
      toast.error("Failed to change password", {
        description: error.message || "Please check your current password and try again",
      })
    } finally {
      setIsSendingReset(false)
    }
  }

  const handleCreatePassword = async () => {
    if (!user?.workos?.id) {
      toast.error("User information not available")
      return
    }

    setIsSendingReset(true)
    
    try {
      // Get the current URL to construct the password reset URL
      // WorkOS will replace {token} with the actual password reset token
      // IMPORTANT: This URL must match what's in WorkOS dashboard under Redirects → Password reset URL
      // The URL format should be: http://localhost:3000/reset-password?token={token}
      const baseUrl = window.location.origin
      // Don't pass passwordResetUrl - we'll send custom email via webhook
      // The passwordResetUrl parameter is for post-reset redirects, not the email link
      // Our webhook handler will construct the email URL with the actual token
      
      await createPasswordReset({
        userId: user.workos.id,
        // Note: We don't pass passwordResetUrl here because:
        // 1. We're sending custom emails via the password_reset.created webhook
        // 2. passwordResetUrl is for redirects after password reset, not the email link
        // 3. The webhook handler constructs the email URL with the actual token
      })
      
      setPasswordResetSent(true)
      toast.success("Password setup email sent", {
        description: likelyHasPassword 
          ? "Check your email for instructions to change your password"
          : "Check your email for instructions to create your password",
      })
    } catch (error: any) {
      console.error("Failed to create password reset:", error)
      toast.error("Failed to send password email", {
        description: error.message || "Please try again later",
      })
    } finally {
      setIsSendingReset(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Password / Change Password */}
      <div className="space-y-2 flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Password</span>
          <span className="text-xs text-muted-foreground">
            {likelyHasPassword
              ? "Change your password to keep your account secure."
              : "Create a password for your account to enable email and password sign-in. You'll receive an email with instructions."}
          </span>
        </div>

        {isCheckingPassword ? (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
            <KeyRound className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">
              Checking password status...
            </span>
          </div>
        ) : passwordResetSent ? (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
            <span className="text-sm text-green-800 dark:text-green-200">
              Password {likelyHasPassword ? "reset" : "setup"} email sent to {user?.workos?.email || user?.email}
            </span>
          </div>
        ) : likelyHasPassword ? (
          // Show password change form if user likely has a password
          <form onSubmit={changePasswordForm.handleSubmit(handleChangePassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter your current password"
                {...changePasswordForm.register("currentPassword")}
                disabled={isSendingReset}
              />
              {changePasswordForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">
                  {changePasswordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter your new password"
                {...changePasswordForm.register("newPassword")}
                disabled={isSendingReset}
              />
              {changePasswordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {changePasswordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                {...changePasswordForm.register("confirmPassword")}
                disabled={isSendingReset}
              />
              {changePasswordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {changePasswordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                type="submit"
                variant="default" 
                size="sm" 
                disabled={isSendingReset}
              >
                {isSendingReset ? (
                  <>
                    <KeyRound className="mr-2 h-4 w-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          // Show email-based flow if user doesn't have a password
          <div className="flex flex-col gap-2">
            <div className="p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground mb-2">
                WorkOS uses a secure email-based flow for password management. This works for:
              </p>
              <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                <li>Creating your first password (if you signed up via OAuth)</li>
                <li>Changing your existing password</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleCreatePassword}
                disabled={isSendingReset}
              >
                {isSendingReset ? (
                  <>
                    <Mail className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Create Password
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {passwordResetSent && (
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setPasswordResetSent(false)
                changePasswordForm.reset()
                createPasswordForm.reset()
              }}
            >
              Send Another Email
            </Button>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="space-y-2 flex flex-col gap-2 border-destructive border p-4 rounded-md">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Danger Zone</span>
          <span className="text-xs text-muted-foreground">Delete your account and all your data</span>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs text-destructive">
            Permanently remove your personal account and all of its contents from the rankd platform. 
            This action is not reversible, so please continue with caution.
          </p>
        </div>

        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-6">
                  <p className="text-xs">
                    This action cannot be undone. This will permanently delete your account 
                    and remove all your data from our servers.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">This will delete:</p>
                    <ul className="list-disc list-inside text-xs space-y-1 ml-4">
                      <li>Your profile and personal information</li>
                      <li>All tournaments you've created</li>
                      <li>Player records and statistics</li>
                      <li>Venue information</li>
                      <li>All associated data</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <Label htmlFor="delete-confirmation" className="text-xs">
                      Please type <strong>DELETE</strong> to confirm:
                    </Label>
                    <Input
                      id="delete-confirmation"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="Type DELETE here"
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== "DELETE" || isDeleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}