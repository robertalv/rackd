"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "@rackd/backend/convex/_generated/api"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
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
import { HeaderLabel } from "@rackd/ui/components/label"

export function ConnectedAccounts() {
  const [authMethods, setAuthMethods] = useState<any[]>([])
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true)
  const fargoRateAccount = useQuery(api.accounts.getFargoRateAccount)
  const apaAccount = useQuery(api.accounts.getAPAAccount)
  const linkFargoRateAccount = useMutation(api.accounts.linkFargoRateAccount)
  const unlinkFargoRateAccount = useMutation(api.accounts.unlinkFargoRateAccount)
  const searchFargoRatePlayersAction = useAction(api.accounts.searchFargoRatePlayers)
  const linkAPAAccount = useMutation(api.accounts.linkAPAAccount)
  const unlinkAPAAccount = useMutation(api.accounts.unlinkAPAAccount)
  const searchAPAMembersAction = useAction(api.accounts.searchAPAMembers)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // APA search state
  const [apaSearchQuery, setApaSearchQuery] = useState("")
  const [selectedAPAMember, setSelectedAPAMember] = useState<any>(null)
  const [apaSearchResults, setApaSearchResults] = useState<any[]>([])
  const [isSearchingAPA, setIsSearchingAPA] = useState(false)

  // Fetch Better Auth accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoadingAccounts(true)
        const accountsResult = await authClient.listAccounts()
        
        const accounts = accountsResult?.data && Array.isArray(accountsResult.data)
          ? accountsResult.data
          : []

        setAuthMethods(accounts)
      } catch (error) {
        console.error("Failed to fetch accounts:", error)
        toast.error("Failed to load connected accounts")
        setAuthMethods([])
      } finally {
        setIsLoadingAccounts(false)
      }
    }

    fetchAccounts()
  }, [])
  
  // Handle FargoRate search with debouncing
  useEffect(() => {
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
  
  // Handle APA search with debouncing
  useEffect(() => {
    if (apaSearchQuery.length < 2) {
      setApaSearchResults([])
      return
    }
    
    const timeoutId = setTimeout(async () => {
      setIsSearchingAPA(true)
      try {
        const results = await searchAPAMembersAction({ query: apaSearchQuery })
        setApaSearchResults(results || [])
      } catch (error) {
        console.error("Failed to search APA members:", error)
        setApaSearchResults([])
      } finally {
        setIsSearchingAPA(false)
      }
    }, 300) // Debounce by 300ms
    
    return () => clearTimeout(timeoutId)
  }, [apaSearchQuery, searchAPAMembersAction])
  
  const isLoading = isLoadingAccounts || fargoRateAccount === undefined || apaAccount === undefined

  const getProviderIcon = (account: any) => {
    const provider = getProviderName(account)
    const providerLower = provider.toLowerCase()
    
    if (providerLower.includes("google")) return <Chrome className="h-5 w-5" />
    if (providerLower.includes("apple")) return <Apple className="h-5 w-5" />
    if (providerLower.includes("github")) return <Github className="h-5 w-5" />
    if (providerLower.includes("credential") || providerLower.includes("email") || providerLower.includes("password")) {
      return <Mail className="h-5 w-5" />
    }
    return <LinkIcon className="h-5 w-5" />
  }

  const getProviderName = (account: any) => {
    // Better Auth account structure: { providerId, ... }
    const providerId = account.providerId || account.provider || ""
    
    // Map provider IDs to readable names
    if (providerId === "credential") return "Email & Password"
    if (providerId === "google") return "Google"
    if (providerId === "apple") return "Apple"
    if (providerId === "github") return "GitHub"
    
    // Fallback to capitalized provider ID
    return providerId.charAt(0).toUpperCase() + providerId.slice(1) || "Unknown"
  }

  const getProviderBadgeVariant = (account: any) => {
    const provider = getProviderName(account).toLowerCase()
    if (provider.includes("email") || provider.includes("password") || provider.includes("credential")) {
      return "default" as const
    }
    return "secondary" as const
  }

  const handleDisconnect = async (account: any) => {
    try {
      // Use Better Auth's unlinkAccount method
      // Requires providerId and optionally accountId
      await authClient.unlinkAccount({ 
        providerId: account.providerId,
        accountId: account.id 
      })
      
      // Refresh accounts list
      const accountsResult = await authClient.listAccounts()
      const accounts = accountsResult?.data && Array.isArray(accountsResult.data)
        ? accountsResult.data
        : []
      setAuthMethods(accounts)
      
      toast.success(`${getProviderName(account)} disconnected successfully`)
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

  const handleLinkAPA = async () => {
    if (!selectedAPAMember) return
    
    try {
      await linkAPAAccount({
        apaId: String(selectedAPAMember.memberId),
        name: selectedAPAMember.name,
        apaSkillLevel: selectedAPAMember.skillLevel || undefined,
      })
      toast.success("APA account linked successfully")
      setApaSearchQuery("")
      setSelectedAPAMember(null)
    } catch (error: any) {
      console.error("Failed to link APA account:", error)
      toast.error(error.message || "Failed to link APA account")
    }
  }

  const handleUnlinkAPA = async () => {
    try {
      await unlinkAPAAccount({})
      toast.success("APA account unlinked successfully")
    } catch (error: any) {
      console.error("Failed to unlink APA account:", error)
      toast.error(error.message || "Failed to unlink APA account")
    }
  }

  // Group accounts by type
  // Better Auth uses providerId: "credential" for password accounts
  const passwordMethods = authMethods.filter(m => m.providerId === "credential")
  const oauthMethods = authMethods.filter(m => m.providerId !== "credential")

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <HeaderLabel size="2xl">Connected Accounts</HeaderLabel>
        <span className="text-md text-muted-foreground">
          Manage your connected authentication methods and social accounts
        </span>
      </div>

      {passwordMethods.length > 0 && (
        <div className="space-y-3">
          <HeaderLabel size="md">Password Authentication</HeaderLabel>
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
        <HeaderLabel size="md">FargoRate Account</HeaderLabel>
        
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
            <CardContent>
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

      {/* APA Account Section */}
      <div className="space-y-3">
        <HeaderLabel size="md">APA Account (coming soon)</HeaderLabel>
        
        {apaAccount ? (
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{apaAccount.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {apaAccount.apaId && (
                        <span>Member ID: {apaAccount.apaId}</span>
                      )}
                      {apaAccount.apaSkillLevel && (
                        <span>• Skill Level: {apaAccount.apaSkillLevel}</span>
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
                        <AlertDialogTitle>Unlink APA Account?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove your APA account link. You can link it again later.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUnlinkAPA}>
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
            <CardContent className="opacity-50">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Link your APA account (coming soon)</p>
                  <p className="text-xs text-muted-foreground">
                    Connect your APA member profile to track your skill level and statistics
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      disabled
                      placeholder="Search by name or member ID..."
                      value={apaSearchQuery}
                      onChange={(e) => setApaSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  {apaSearchQuery.length >= 2 && (
                    <div className="max-h-60 overflow-y-auto rounded-md border">
                      {isSearchingAPA ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                          Searching...
                        </div>
                      ) : apaSearchResults.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No members found. Try searching by name or member ID.
                        </div>
                      ) : (
                        <div className="divide-y">
                          {apaSearchResults.map((member: any) => (
                            <button
                              key={member.memberId}
                              onClick={() => setSelectedAPAMember(member)}
                              className={`w-full p-3 text-left hover:bg-muted ${
                                selectedAPAMember?.memberId === member.memberId ? "bg-muted" : ""
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium">{member.name}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {member.memberId && (
                                      <span>Member ID: {member.memberId}</span>
                                    )}
                                    {member.email && (
                                      <span>• {member.email}</span>
                                    )}
                                  </div>
                                </div>
                                {selectedAPAMember?.memberId === member.memberId && (
                                  <Badge variant="default">Selected</Badge>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedAPAMember && (
                    <Button
                      onClick={handleLinkAPA}
                      className="w-full"
                      disabled={!selectedAPAMember}
                    >
                      Link APA Account
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
