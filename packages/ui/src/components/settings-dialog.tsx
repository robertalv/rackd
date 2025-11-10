"use client"

import * as React from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@rackd/ui/components/breadcrumb"
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
import { User, Settings as SettingsIcon, CreditCard, Shield, Tag, Link2 } from "lucide-react"

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

type Tab = "account" | "interests" | "preferences" | "sessions" | "accounts" | "billing";

export function SettingsDialog({ open, onOpenChange, user, profileSettings, dangerZone, sessionsManager, interestsManager, connectedAccounts, initialTab: initialTabProp }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = React.useState<Tab>(initialTabProp || "account")

  // Update active tab when initialTab prop changes
  React.useEffect(() => {
    if (initialTabProp && open) {
      setActiveTab(initialTabProp)
    }
  }, [initialTabProp, open])

  const navItems = [
    {
      name: "Account",
      icon: User,
      tab: "account" as Tab,
    },
    {
      name: "Interests",
      icon: Tag,
      tab: "interests" as Tab,
    },
    {
      name: "Preferences",
      icon: SettingsIcon,
      tab: "preferences" as Tab,
    },
    {
      name: "Sessions",
      icon: Shield,
      tab: "sessions" as Tab,
    },
    {
      name: "Connected Accounts",
      icon: Link2,
      tab: "accounts" as Tab,
    },
    {
      name: "Usage & Billing",
      icon: CreditCard,
      tab: "billing" as Tab,
    },
  ]

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTabTitle = (tab: Tab) => {
    switch (tab) {
      case "account":
        return "Account";
      case "interests":
        return "Interests";
      case "preferences":
        return "Preferences";
      case "sessions":
        return "Sessions";
      case "accounts":
        return "Connected Accounts";
      case "billing":
        return "Usage & Billing";
      default:
        return "Settings";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[700px] md:max-w-[900px] lg:max-w-[1000px]">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize your settings here.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton
                            asChild
                            isActive={activeTab === item.tab}
                          >
                            <button
                              type="button"
                              onClick={() => setActiveTab(item.tab)}
                              className="w-full"
                            >
                              <Icon className="h-4 w-4" />
                              <span>{item.name}</span>
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
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
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
                    <h2 className="text-lg font-semibold">Interests</h2>
                    <p className="text-sm text-muted-foreground">
                      Add interests to help others discover your profile and connect with like-minded players.
                    </p>
                  </div>
                  {interestsManager || (
                    <p className="text-sm text-muted-foreground">Interests management coming soon...</p>
                  )}
                </div>
              )}
              {activeTab === "preferences" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-lg font-semibold">Preferences</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your preferences and settings.
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">Coming soon...</p>
                </div>
              )}
              {activeTab === "sessions" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-lg font-semibold">Sessions</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your active sessions and security settings.
                    </p>
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
                    <h2 className="text-lg font-semibold">Usage & Billing</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your subscription and billing.
                    </p>
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
