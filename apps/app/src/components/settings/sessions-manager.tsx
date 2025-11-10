"use client"

import * as React from "react"
import { useAction } from "convex/react"
import { api } from "@rackd/backend/convex/_generated/api"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rackd/ui/components/card"
import { Button } from "@rackd/ui/components/button"
import { Badge } from "@rackd/ui/components/badge"
import { Monitor, Smartphone, Tablet, Globe, Trash2, LogOut } from "lucide-react"
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

export function SessionsManager() {
  const [sessions, setSessions] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedSession, setSelectedSession] = React.useState<any | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false)
  const getMySessions = useAction(api.sessions.getMySessions)
  const revokeSession = useAction(api.sessions.revokeSession)
  const revokeAllOtherSessions = useAction(api.sessions.revokeAllOtherSessions)

  React.useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      const data = await getMySessions({})
      setSessions(data || [])
    } catch (error) {
      console.error("Failed to load sessions:", error)
      toast.error("Failed to load sessions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession({ sessionId })
      toast.success("Session revoked successfully")
      setIsDetailDialogOpen(false)
      setSelectedSession(null)
      loadSessions()
    } catch (error) {
      console.error("Failed to revoke session:", error)
      toast.error("Failed to revoke session")
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
      await revokeAllOtherSessions({})
      toast.success("All other sessions revoked successfully")
      loadSessions()
    } catch (error) {
      console.error("Failed to revoke sessions:", error)
      toast.error("Failed to revoke sessions")
    }
  }

  const getDeviceIcon = (deviceName?: string) => {
    if (!deviceName) return <Globe className="h-4 w-4" />
    const lower = deviceName.toLowerCase()
    if (lower.includes("iphone") || lower.includes("android") || lower.includes("mobile")) {
      return <Smartphone className="h-4 w-4" />
    }
    if (lower.includes("ipad") || lower.includes("tablet")) {
      return <Tablet className="h-4 w-4" />
    }
    return <Monitor className="h-4 w-4" />
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown"
    try {
      const date = new Date(dateString)
      return date.toLocaleString()
    } catch {
      return dateString
    }
  }

  const isActiveSession = (session: any) => !session.endedAt

  const activeSessions = sessions.filter(isActiveSession)
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
      <div className="space-y-2">
          {activeSessions.length > 1 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
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
                      {getDeviceIcon(session.deviceName)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewSession(session)}
                          className="text-sm font-medium hover:underline text-left"
                        >
                          {session.browserAndOS || session.deviceName || "Unknown Device"}
                        </button>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {session.browserName && (
                          <p>Browser: {session.browserName}</p>
                        )}
                        {session.ipAddress && (
                          <p>IP Address: {session.ipAddress}</p>
                        )}
                        {session.city && session.country && (
                          <p>Location: {session.city}, {session.country}</p>
                        )}
                        {session.lastAccessedAt && (
                          <p>Last accessed: {formatDate(session.lastAccessedAt)}</p>
                        )}
                        {session.createdAt && (
                          <p>Created: {formatDate(session.createdAt)}</p>
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
                          <Trash2 className="h-4 w-4" />
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
                      {getDeviceIcon(session.deviceName)}
                      <div>
                        <p className="text-sm font-medium">
                          {session.deviceName || "Unknown Device"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ended: {formatDate(session.endedAt)}
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

