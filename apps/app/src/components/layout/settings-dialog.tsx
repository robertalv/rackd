"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@rackd/ui/components/dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@rackd/ui/components/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@rackd/ui/components/avatar"
import { SETTINGS_NAVIGATION_ITEMS } from "@/lib/constants"
import { Icon } from "@rackd/ui/icons"
import { getInitials } from "@/lib/utils"
import { HeaderLabel } from "@rackd/ui/components/label"

type Tab = typeof SETTINGS_NAVIGATION_ITEMS[number]["tab"];

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    displayName: string;
    email?: string;
    imageUrl?: string;
    country?: string;
  };
  profileSettings?: React.ReactNode;
  dangerZone?: React.ReactNode;
  sessionsManager?: React.ReactNode;
  interestsManager?: React.ReactNode;
  connectedAccounts?: React.ReactNode;
  initialTab?: Tab;
}

export function SettingsDialog({ open, onOpenChange, user, profileSettings, dangerZone, sessionsManager, interestsManager, connectedAccounts, initialTab: initialTabProp }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = React.useState<Tab>(initialTabProp || "account")

  React.useEffect(() => {
    if (initialTabProp && open) {
      setActiveTab(initialTabProp)
    }
  }, [initialTabProp, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[700px] md:max-w-[900px] lg:max-w-[1000px] ring-4 ring-border">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize your settings here.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent className="ring-4 ring-border rounded-xl">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {SETTINGS_NAVIGATION_ITEMS.map((item) => {
                      return (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButton
                            asChild
                            isActive={activeTab === item.tab}
                          >
                            <button
                              type="button"
                              onClick={() => setActiveTab(item.tab)}
                              className="w-full"
                            >
                              <Icon icon={item.icon} className="h-4 w-4" />
                              <span>{item.label}</span>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[700px] flex-1 flex-col overflow-hidden">
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-8 py-4">
              {activeTab === "account" && (
                <div className="flex flex-col gap-6">
                  {profileSettings ? (
                    profileSettings
                  ) : (
                    <>
                      <div>
                        <h2 className="text-lg font-semibold">Profile</h2>
                        <p className="text-sm text-muted-foreground">
                          Your personal information.
                        </p>
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            {user.imageUrl && (
                              <AvatarImage src={user.imageUrl} alt={user.displayName} />
                            )}
                            <AvatarFallback>
                              {getInitials(user.displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium">{user.displayName}</p>
                            {user.email && (
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {dangerZone && (
                    <div className="mt-6">
                      {dangerZone}
                    </div>
                  )}
                </div>
              )}
              {activeTab === "interests" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <HeaderLabel size="2xl">Interests</HeaderLabel>
                    <span className="text-md text-muted-foreground">
                      Add interests to help others discover your profile and connect with like-minded players.
                    </span>
                  </div>
                  {interestsManager || (
                    <p className="text-sm text-muted-foreground">Interests management coming soon...</p>
                  )}
                </div>
              )}
              {activeTab === "preferences" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <HeaderLabel size="2xl">Preferences</HeaderLabel>
                    <span className="text-md text-muted-foreground">
                      Manage your preferences and settings.
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Coming soon...</p>
                </div>
              )}
              {activeTab === "sessions" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <HeaderLabel size="2xl">Sessions</HeaderLabel>
                    <span className="text-md text-muted-foreground">
                      Manage your active sessions and security settings.
                    </span>
                  </div>
                  {sessionsManager || (
                    <p className="text-sm text-muted-foreground">Sessions management coming soon...</p>
                  )}
                </div>
              )}
              {activeTab === "accounts" && (
                <div className="flex flex-col gap-6">
                  {connectedAccounts || (
                    <p className="text-sm text-muted-foreground">Connected accounts management coming soon...</p>
                  )}
                </div>
              )}
              {activeTab === "billing" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <HeaderLabel size="2xl">Usage & Billing</HeaderLabel>
                    <span className="text-md text-muted-foreground">
                      Manage your subscription and billing.
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Coming soon...</p>
                </div>
              )}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  )
}
