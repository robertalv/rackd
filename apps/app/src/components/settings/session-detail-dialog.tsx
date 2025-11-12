"use client"

import { Button } from "@rackd/ui/components/button"
import { Badge } from "@rackd/ui/components/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@rackd/ui/components/dialog"
import { Monitor, Smartphone, Tablet, Globe } from "lucide-react"
import { Separator } from "@rackd/ui/components/separator"

interface SessionDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: any
  onRevoke?: () => void
}

export function SessionDetailDialog({
  open,
  onOpenChange,
  session,
  onRevoke,
}: SessionDetailDialogProps) {
  if (!session) return null

  const formatDate = (dateValue?: string | number | null) => {
    if (!dateValue) return "Unknown"
    try {
      const date = typeof dateValue === "number" ? new Date(dateValue) : new Date(dateValue)
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return String(dateValue)
    }
  }

  const getDeviceIcon = () => {
    if (!session.deviceName) return <Globe className="h-12 w-12 text-muted-foreground" />
    const lower = session.deviceName.toLowerCase()
    if (lower.includes("iphone") || lower.includes("android") || lower.includes("mobile")) {
      return <Smartphone className="h-12 w-12 text-muted-foreground" />
    }
    if (lower.includes("ipad") || lower.includes("tablet")) {
      return <Tablet className="h-12 w-12 text-muted-foreground" />
    }
    return <Monitor className="h-12 w-12 text-muted-foreground" />
  }

  const getStatusBadge = () => {
    if (session.status === "active" || !session.endedAt) {
      return (
        <Badge variant="default" className="gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          Active
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="gap-1.5">
        <span className="h-2 w-2 rounded-full bg-gray-400"></span>
        Ended
      </Badge>
    )
  }

  const getAuthMethodDisplay = (authMethod?: string | null) => {
    if (!authMethod) return "Unknown"
    const method = authMethod.toLowerCase()
    if (method === "oauth" || method.includes("oauth")) {
      // Try to extract provider from userAgent or return generic
      if (session.userAgent?.toLowerCase().includes("google")) {
        return "Google OAuth"
      }
      return "OAuth"
    }
    if (method === "password") return "Password"
    if (method === "magic_link") return "Magic Link"
    if (method === "passkey") return "Passkey"
    return authMethod.charAt(0).toUpperCase() + authMethod.slice(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User session</DialogTitle>
          <DialogDescription>Session details and device information</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            {getStatusBadge()}
          </div>

          <Separator />

          {/* Session Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-muted-foreground">Issued</span>
              <span className="text-sm text-right">
                {formatDate(session.createdAt)}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-muted-foreground">Expires</span>
              <span className="text-sm text-right">
                {formatDate(session.expiresAt)}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-muted-foreground">IP address</span>
              <span className="text-sm text-right font-mono">
                {session.ipAddress || "Not available"}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-muted-foreground">User agent</span>
              <span className="text-sm text-right max-w-[60%] break-all">
                {session.userAgent || "Not available"}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-muted-foreground">Method</span>
              <span className="text-sm text-right">
                {getAuthMethodDisplay(session.authMethod)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Device Visual */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {session.browserAndOS && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {session.browserAndOS}
                  </p>
                  {session.deviceName && (
                    <p className="text-xs text-muted-foreground">
                      {session.deviceName}
                    </p>
                  )}
                </div>
              )}
              {!session.browserAndOS && session.deviceName && (
                <p className="text-sm font-medium">
                  {session.deviceName}
                </p>
              )}
              {!session.browserAndOS && !session.deviceName && (
                <p className="text-sm text-muted-foreground">
                  Unknown device
                </p>
              )}
            </div>
            <div className="flex items-center justify-center w-20 h-20 rounded-lg bg-muted">
              {getDeviceIcon()}
            </div>
          </div>

          {/* Action Buttons */}
          {session.status === "active" && !session.endedAt && onRevoke && (
            <>
              <Separator />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Done
                </Button>
                <Button variant="destructive" onClick={onRevoke}>
                  Revoke
                </Button>
              </div>
            </>
          )}
          {(!session.status || session.status !== "active" || session.endedAt) && (
            <>
              <Separator />
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Done
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

