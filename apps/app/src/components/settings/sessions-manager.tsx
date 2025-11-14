"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rackd/ui/components/card"
import { Button } from "@rackd/ui/components/button"
import { Badge } from "@rackd/ui/components/badge"
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
import { SessionDetailDialog } from "./session-detail-dialog"
import { authClient } from "@/lib/auth-client"
import { 
  Icon, 
  Delete03Icon, 
  ChromeIcon, 
  ComputerIcon, 
  SmartPhone01Icon, 
  Tablet02Icon, 
  EarthIcon,
} from "@rackd/ui/icons"
import { formatDate } from "@/lib/utils"

export function SessionsManager() {
  const [selectedSession, setSelectedSession] = useState<any | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true)
        const currentSessionResult = await authClient.getSession()
        const currentSession = currentSessionResult?.data
        if (currentSession?.session?.id) {
          setCurrentSessionId(currentSession.session.id)
        }

        const sessionsResult = await authClient.listSessions()
        
        const sessionsList = sessionsResult?.data && Array.isArray(sessionsResult.data)
          ? sessionsResult.data
          : []

        setSessions(sessionsList)
      } catch (error) {
        console.error("Failed to fetch sessions:", error)
        toast.error("Failed to load sessions")
        setSessions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [])

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await authClient.revokeSession({ token: sessionId })
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      
      toast.success("Session revoked successfully")
      setIsDetailDialogOpen(false)
      setSelectedSession(null)
    } catch (error: any) {
      console.error("Failed to revoke session:", error)
      toast.error("Failed to revoke session", {
        description: error.message || "Please try again"
      })
    }
  }

  const handleViewSession = (session: any) => {
    setSelectedSession(session)
    setIsDetailDialogOpen(true)
  }

  const handleRevokeFromDetail = () => {
    if (selectedSession?.id) {
      handleRevokeSession(selectedSession.id)
    }
  }

  const handleRevokeAllOther = async () => {
    try {
      await authClient.revokeOtherSessions()
      
      const sessionsResult = await authClient.listSessions()
      const sessionsList = sessionsResult?.data && Array.isArray(sessionsResult.data)
        ? sessionsResult.data
        : []
      setSessions(sessionsList)
      
      toast.success("All other sessions revoked successfully")
    } catch (error: any) {
      console.error("Failed to revoke sessions:", error)
      toast.error("Failed to revoke sessions", {
        description: error.message || "Please try again"
      })
    }
  }

  const getDeviceIcon = (userAgent?: string | null) => {
    if (!userAgent) return <Icon icon={EarthIcon} className="h-4 w-4" />
    const lower = userAgent.toLowerCase()
    
    if (lower.includes("expo")) {
      return <Icon icon={SmartPhone01Icon} className="h-4 w-4" />
    }
    
    if (lower.includes("iphone") || (lower.includes("android") && lower.includes("mobile"))) {
      return <Icon icon={SmartPhone01Icon} className="h-4 w-4" />
    }
    
    if (lower.includes("ipad") || (lower.includes("android") && !lower.includes("mobile"))) {
      return <Icon icon={Tablet02Icon} className="h-4 w-4" />
    }
    
    return <Icon icon={ComputerIcon} className="h-4 w-4" />
  }

  const getBrowserIcon = (userAgent?: string | null) => {
    if (!userAgent) return null
    const lower = userAgent.toLowerCase()
    
    if (lower.includes("chrome") && !lower.includes("edg")) {
      return <Icon icon={ChromeIcon} className="h-4 w-4" />
    }
    
    return null
  }

  const parseUserAgent = (userAgent: string): string => {
    if (!userAgent) return "Unknown Device"
    
    const ua = userAgent.toLowerCase()
    
    if (ua.includes("iphone")) return "iPhone"
    if (ua.includes("ipad")) return "iPad"
    if (ua.includes("android")) {
      if (ua.includes("mobile")) return "Android Phone"
      return "Android Tablet"
    }
    
    if (ua.includes("chrome")) return "Chrome Browser"
    if (ua.includes("firefox")) return "Firefox Browser"
    if (ua.includes("safari") && !ua.includes("chrome")) return "Safari Browser"
    if (ua.includes("edge")) return "Edge Browser"
    
    if (ua.includes("windows")) return "Windows Device"
    if (ua.includes("mac")) return "Mac Device"
    if (ua.includes("linux")) return "Linux Device"
    
    return "Unknown Device"
  }

  const isActiveSession = (session: any) => {
    if (!session.expiresAt) return true
    const expiresAt = typeof session.expiresAt === 'number' 
      ? session.expiresAt 
      : new Date(session.expiresAt).getTime()
    return expiresAt > Date.now()
  }

  const activeSessions = sessions
    .filter(isActiveSession)
    .sort((a, b) => {
      if (a.id === currentSessionId) return -1
      if (b.id === currentSessionId) return 1
      const aCreated = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime()
      const bCreated = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime()
      return bCreated - aCreated
    })
  const inactiveSessions = sessions.filter((s) => !isActiveSession(s))

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Loading sessions...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-y-0">
        {activeSessions.length > 1 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-fit">
                <Icon icon={Delete03Icon} className="h-4 w-4" />
                Revoke All Others
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke all other sessions?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will sign you out from all other devices. You will remain signed in on this device.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRevokeAllOther}>
                  Revoke All Others
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {activeSessions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">No active sessions</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activeSessions.map((session) => (
            <Card key={session.id}>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      {getDeviceIcon(session.userAgent)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {getBrowserIcon(session.userAgent)}
                        <button
                          onClick={() => handleViewSession(session)}
                          className="text-sm font-medium hover:underline text-left"
                        >
                          {session.userAgent 
                            ? parseUserAgent(session.userAgent)
                            : session.ipAddress 
                            ? `Device from ${session.ipAddress}`
                            : "Unknown Device"}
                        </button>
                        {session.id === currentSessionId && (
                          <Badge variant="default">Current</Badge>
                        )}
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {session.ipAddress && (
                          <p>IP Address: {session.ipAddress}</p>
                        )}
                        {session.userAgent && (
                          <p>User Agent: {session.userAgent.substring(0, 50)}...</p>
                        )}
                        {session.createdAt && (
                          <p>Created: {formatDate(session.createdAt)}</p>
                        )}
                        {session.expiresAt && (
                          <p>Expires: {formatDate(session.expiresAt)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewSession(session)}
                    >
                      View Details
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Icon icon={Delete03Icon} className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke this session?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will sign you out from this device. You'll need to sign in again to access your account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRevokeSession(session.id)}>
                            Revoke Session
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

      {inactiveSessions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Recent Sessions</h3>
          <div className="space-y-2">
            {inactiveSessions.slice(0, 5).map((session) => (
              <Card key={session.id} className="opacity-60">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(session.userAgent)}
                      <div>
                        <p className="text-sm font-medium">
                          {session.userAgent 
                            ? parseUserAgent(session.userAgent)
                            : session.ipAddress 
                            ? `Device from ${session.ipAddress}`
                            : "Unknown Device"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expired: {formatDate(session.expiresAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Ended</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Session Detail Dialog */}
      <SessionDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        session={selectedSession}
        onRevoke={handleRevokeFromDetail}
      />
    </div>
  )
}

