"use client"

import * as React from "react"
import { useAction } from "convex/react"
import { api } from "@rackd/backend/convex/_generated/api"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rackd/ui/components/card"
import { Button } from "@rackd/ui/components/button"
import { Badge } from "@rackd/ui/components/badge"
import { 
  Chrome, 
  Apple,  
  Mail, 
  Link as LinkIcon,
  Unlink,
  Loader2
} from "lucide-react"
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

interface ConnectedAccountsProps {
  userId?: string
}

export function ConnectedAccounts({ userId }: ConnectedAccountsProps) {
  const [authMethods, setAuthMethods] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const getAuthMethods = useAction(api.workos.getAuthenticationMethods)

  React.useEffect(() => {
    if (userId) {
      loadAuthMethods()
    }
  }, [userId])

  const loadAuthMethods = async () => {
    try {
      setIsLoading(true)
      const methods = await getAuthMethods({ userId: userId! })
      console.log('🔍 Frontend - Received auth methods:', JSON.stringify(methods, null, 2))
      setAuthMethods(methods || [])
    } catch (error) {
      console.error("Failed to load authentication methods:", error)
      toast.error("Failed to load connected accounts")
    } finally {
      setIsLoading(false)
    }
  }

  const getProviderIcon = (method: any) => {
    const provider = getProviderName(method)
    const providerLower = provider.toLowerCase()
    
    if (providerLower.includes("google")) return <Chrome className="h-5 w-5" />
    if (providerLower.includes("apple")) return <Apple className="h-5 w-5" />
    if (providerLower.includes("github")) return <Github className="h-5 w-5" />
    if (providerLower.includes("email") || providerLower.includes("password")) {
      return <Mail className="h-5 w-5" />
    }
    return <LinkIcon className="h-5 w-5" />
  }

  const getProviderName = (method: any) => {
    console.log('🔍 Frontend - getProviderName called with method:', JSON.stringify(method, null, 2))
    
    // Method object should have: { type, provider, method }
    // Use the method field first (which is already formatted from backend)
    if (method.method) {
      console.log('✅ Using method.method:', method.method)
      return method.method;
    }
    
    // Fallback: try different field names that WorkOS might use
    const provider = method.provider || method.Provider || method.type || method.Type || ""
    
    // Normalize provider names
    const providerStr = String(provider).toLowerCase()
    
    if (providerStr.includes("google")) return "Google"
    if (providerStr.includes("apple")) return "Apple"
    if (providerStr.includes("github")) return "GitHub"
    if (providerStr.includes("microsoft")) return "Microsoft"
    if (providerStr.includes("facebook")) return "Facebook"
    if (providerStr.includes("email") || providerStr.includes("password") || providerStr === "email_password") {
      return "Email + Password"
    }
    
    // Return formatted version of the provider name
    return provider
      .split(/[_-]/)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  const getProviderBadgeVariant = (method: any) => {
    const provider = getProviderName(method).toLowerCase()
    if (provider.includes("email") || provider.includes("password")) {
      return "default" as const
    }
    return "secondary" as const
  }

  const handleDisconnect = async (method: any) => {
    // TODO: Implement account disconnection
    // This would require WorkOS API to disconnect OAuth providers
    toast.info("Account disconnection coming soon")
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Loading connected accounts...</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (authMethods.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            Manage your connected authentication methods
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            No connected accounts found. You can connect accounts when you sign in.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group methods by type
  const passwordMethods = authMethods.filter(m => {
    const name = getProviderName(m).toLowerCase()
    return name.includes("email") || name.includes("password")
  })
  
  const oauthMethods = authMethods.filter(m => {
    const name = getProviderName(m).toLowerCase()
    return !name.includes("email") && !name.includes("password")
  })

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Connected Accounts</h2>
        <p className="text-sm text-muted-foreground">
          Manage your connected authentication methods and social accounts
        </p>
      </div>

      {passwordMethods.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Password Authentication</h3>
          {passwordMethods.map((method, index) => (
            <Card key={index}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      {getProviderIcon(method)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{getProviderName(method)}</p>
                      <p className="text-xs text-muted-foreground">
                        Primary authentication method
                      </p>
                    </div>
                  </div>
                  <Badge variant={getProviderBadgeVariant(method)}>
                    Connected
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {oauthMethods.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Social Accounts</h3>
          {oauthMethods.map((method, index) => (
            <Card key={index}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      {getProviderIcon(method)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{getProviderName(method)}</p>
                      <p className="text-xs text-muted-foreground">
                        {getProviderName(method)} OAuth
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getProviderBadgeVariant(method)}>
                      Connected
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Unlink className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Disconnect {getProviderName(method)}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            You'll need to use another authentication method to sign in after disconnecting this account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDisconnect(method)}>
                            Disconnect
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
