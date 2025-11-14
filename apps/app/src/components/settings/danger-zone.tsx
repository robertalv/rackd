"use client"

import { useState, useEffect } from "react"
import { Button } from "@rackd/ui/components/button"
import { Input } from "@rackd/ui/components/input"
import { HeaderLabel, Label } from "@rackd/ui/components/label"
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
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authClient } from "@/lib/auth-client"
import { CheckmarkSquare02Icon, Delete03Icon, Icon, LockKeyIcon, Mail01Icon } from "@rackd/ui/icons"

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
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [passwordResetSent, setPasswordResetSent] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [hasPassword, setHasPassword] = useState<boolean | null>(null)
  const [isCheckingPassword, setIsCheckingPassword] = useState(true)
  
  useEffect(() => {
    const checkPassword = async () => {
      if (!user?.email) {
        setIsCheckingPassword(false)
        setHasPassword(false)
        return
      }
      
      try {
        const accountsResult = await authClient.listAccounts()
        const accounts = accountsResult?.data && Array.isArray(accountsResult.data) 
          ? accountsResult.data 
          : null
        
        if (accounts) {
          const hasPasswordAccount = accounts.some(
            (account: any) => account.providerId === "credential"
          )
          setHasPassword(hasPasswordAccount)
        } else {
          const hasOAuthImage = user?.imageUrl || user?.coverImage
          setHasPassword(!hasOAuthImage && !!user?.email)
        }
      } catch (error) {
        console.error("Failed to check password account:", error)
        const hasOAuthImage = user?.imageUrl || user?.coverImage
        setHasPassword(!hasOAuthImage && !!user?.email)
      } finally {
        setIsCheckingPassword(false)
      }
    }
    
    checkPassword()
  }, [user?.email, user?.imageUrl, user?.coverImage])
  
  const likelyHasPassword = hasPassword ?? false

  const changePasswordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

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
    if (!user?.email) {
      toast.error("User information not available")
      return
    }

    setIsChangingPassword(true)
    
    try {
      await authClient.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: false,
      })
      
      changePasswordForm.reset()
      toast.success("Password changed successfully", {
        description: "Your password has been updated.",
      })
    } catch (error: any) {
      console.error("Failed to change password:", error)
      toast.error("Failed to change password", {
        description: error.message || "Please check your current password and try again",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleCreatePassword = async () => {
    if (!user?.email) {
      toast.error("User information not available")
      return
    }

    setIsSendingReset(true)
    
    try {
      await authClient.forgetPassword({
        email: user.email,
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      setPasswordResetSent(true)
      toast.success("Password reset email sent", {
        description: likelyHasPassword 
          ? "Check your email for instructions to change your password"
          : "Check your email for instructions to create your password",
      })
    } catch (error: any) {
      console.error("Failed to send password reset email:", error)
      toast.error("Failed to send password email", {
        description: error.message || "Please try again later",
      })
    } finally {
      setIsSendingReset(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 flex flex-col gap-2">
        <div className="flex flex-col gap-2">
        <HeaderLabel size="2xl">Password</HeaderLabel>
          <span className="text-md text-muted-foreground">
            {likelyHasPassword
              ? "Change your password to keep your account secure."
              : "Create a password for your account to enable email and password sign-in. You'll receive an email with instructions."}
          </span>
        </div>

        {isCheckingPassword ? (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
            <Icon icon={LockKeyIcon} className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">
              Checking password status...
            </span>
          </div>
        ) : passwordResetSent ? (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
            <Icon icon={CheckmarkSquare02Icon} className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
            <span className="text-sm text-green-800 dark:text-green-200">
              Password {likelyHasPassword ? "reset" : "setup"} email sent to {user?.email}
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
                disabled={isChangingPassword}
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
                disabled={isChangingPassword}
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
                disabled={isChangingPassword}
              />
              {changePasswordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {changePasswordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit"
                variant="default" 
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <Icon icon={LockKeyIcon} className="h-4 w-4" />
                    Changing...
                  </>
                ) : (
                  <>
                    <Icon icon={LockKeyIcon} className="h-4 w-4" />
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground mb-2">
                Better Auth uses a secure email-based flow for password management. This works for:
              </p>
              <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                <li>Creating your first password (if you signed up via OAuth)</li>
                <li>Resetting your existing password</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="default" 
                onClick={handleCreatePassword}
                disabled={isSendingReset}
              >
                {isSendingReset ? (
                  <>
                    <Icon icon={Mail01Icon} className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Icon icon={LockKeyIcon} className="h-4 w-4" />
                    Create Password
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {passwordResetSent && (
          <div className="flex justify-end">
            <Button 
              variant="outline" 
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
          <HeaderLabel size="2xl">Danger Zone</HeaderLabel>
          <span className="text-md text-muted-foreground">Delete your account and all your data</span>
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
              <Button variant="destructive">
                <Icon icon={Delete03Icon} className="h-4 w-4" />
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