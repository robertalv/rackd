"use client"

import * as React from "react"
import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "@rackd/backend/convex/_generated/api"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rackd/ui/components/card"
import { Button } from "@rackd/ui/components/button"
import { Badge } from "@rackd/ui/components/badge"
import { Input } from "@rackd/ui/components/input"
import { 
  Chrome, 
  Apple,  
  Mail, 
  Link as LinkIcon,
  Unlink,
  Loader2,
  Github,
  Search,
  Trophy
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

export function ConnectedAccounts() {
  const authMethods = useQuery(api.accounts.getMyAccounts) ?? []
  const fargoRateAccount = useQuery(api.accounts.getFargoRateAccount)
  const disconnectAccount = useMutation(api.accounts.disconnectAccount)
  const linkFargoRateAccount = useMutation(api.accounts.linkFargoRateAccount)
  const unlinkFargoRateAccount = useMutation(api.accounts.unlinkFargoRateAccount)
  const searchFargoRatePlayersAction = useAction(api.accounts.searchFargoRatePlayers)
  
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedPlayer, setSelectedPlayer] = React.useState<any>(null)
  const [searchResults, setSearchResults] = React.useState<any[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  
  // Handle search with debouncing
  React.useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }
    
    const timeoutId = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await searchFargoRatePlayersAction({ query: searchQuery })
        setSearchResults(results || [])
      } catch (error) {
        console.error("Failed to search FargoRate players:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300) // Debounce by 300ms
    
    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchFargoRatePlayersAction])
  
  const isLoading = authMethods === undefined || fargoRateAccount === undefined

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
    // Method object from backend has: { method, provider, type }
    return method.method || method.provider || "Unknown"
  }

  const getProviderBadgeVariant = (method: any) => {
    const provider = getProviderName(method).toLowerCase()
    if (provider.includes("email") || provider.includes("password")) {
      return "default" as const
    }
    return "secondary" as const
  }

  const handleDisconnect = async (method: any) => {
    try {
      await disconnectAccount({ accountId: method.id })
      toast.success(`${getProviderName(method)} disconnected successfully`)
    } catch (error: any) {
      console.error("Failed to disconnect account:", error)
      toast.error(error.message || "Failed to disconnect account")
    }
  }

  const handleLinkFargoRate = async () => {
    if (!selectedPlayer) return
    
    try {
      await linkFargoRateAccount({
        fargoId: selectedPlayer.id,
        fargoReadableId: selectedPlayer.readableId,
        name: selectedPlayer.name,
        fargoRating: parseInt(selectedPlayer.effectiveRating) || parseInt(selectedPlayer.provisionalRating) || 0,
        fargoRobustness: parseInt(selectedPlayer.robustness) || undefined,
        city: selectedPlayer.location || undefined,
      })
      toast.success("FargoRate account linked successfully")
      setSearchQuery("")
      setSelectedPlayer(null)
    } catch (error: any) {
      console.error("Failed to link FargoRate account:", error)
      toast.error(error.message || "Failed to link FargoRate account")
    }
  }

  const handleUnlinkFargoRate = async () => {
    try {
      await unlinkFargoRateAccount({})
      toast.success("FargoRate account unlinked successfully")
    } catch (error: any) {
      console.error("Failed to unlink FargoRate account:", error)
      toast.error(error.message || "Failed to unlink FargoRate account")
    }
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
  const passwordMethods = authMethods.filter(m => m.type === "password")
  const oauthMethods = authMethods.filter(m => m.type === "oauth")

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

      {/* FargoRate Account Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">FargoRate Account</h3>
        
        {fargoRateAccount ? (
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{fargoRateAccount.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {fargoRateAccount.fargoRating && (
                        <span>Rating: {fargoRateAccount.fargoRating.toLocaleString()}</span>
                      )}
                      {fargoRateAccount.city && (
                        <span>• {fargoRateAccount.city}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Connected</Badge>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Unlink FargoRate Account?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove your FargoRate account link. You can link it again later.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUnlinkFargoRate}>
                          Unlink
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Link your FargoRate account</p>
                  <p className="text-xs text-muted-foreground">
                    Connect your FargoRate player profile to track your ratings and statistics
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search for your FargoRate profile..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  {searchQuery.length >= 2 && (
                    <div className="max-h-60 overflow-y-auto rounded-md border">
                      {isSearching ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                          Searching...
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No players found
                        </div>
                      ) : (
                        <div className="divide-y">
                          {searchResults.map((player: any) => (
                            <button
                              key={player.id}
                              onClick={() => setSelectedPlayer(player)}
                              className={`w-full p-3 text-left hover:bg-muted ${
                                selectedPlayer?.id === player.id ? "bg-muted" : ""
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium">{player.name}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {player.location && <span>{player.location}</span>}
                                    {player.effectiveRating && (
                                      <span>• Rating: {parseInt(player.effectiveRating).toLocaleString()}</span>
                                    )}
                                  </div>
                                </div>
                                {selectedPlayer?.id === player.id && (
                                  <Badge variant="default">Selected</Badge>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedPlayer && (
                    <Button
                      onClick={handleLinkFargoRate}
                      className="w-full"
                      disabled={!selectedPlayer}
                    >
                      Link FargoRate Account
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
