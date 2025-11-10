"use client";

import { Button } from "@rackd/ui/components/button";
import { Separator } from "@rackd/ui/components/separator";
import { Link, useNavigate } from "@tanstack/react-router";
import { ProfileAvatar } from "@/components/profile-avatar";
import { calculateProfileCompletion } from "@/lib/profile-utils";
import { AnimatedBadge } from "@rackd/ui/components/animated-badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@rackd/ui/components/dropdown-menu";
  import { 
    User, 
    Settings, 
    CreditCard, 
    KeyRound, 
    LogOut, 
    LayoutDashboard, 
    Trophy,
    MapPin
  } from "lucide-react";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { NavigationButton } from "@/components/navigation-button";
import { IconAlignJustified, IconMenu2, IconSportBillard, IconX } from "@tabler/icons-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@rackd/ui/components/tooltip";
import { ThemeToggle } from "@rackd/ui/components/theme-toggle";
import { useTheme } from "@/providers/ThemeProvider";
import { authClient } from "@/lib/auth-client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { SettingsDialog } from "@rackd/ui/components/settings-dialog";
import { DangerZone } from "@/components/settings/danger-zone";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { SessionsManager } from "@/components/settings/sessions-manager";
import { InterestTagsManager } from "@/components/settings/interest-tags-manager";
import { ConnectedAccounts } from "@/components/settings/connected-accounts";
import { useSettingsState } from "@/providers/SettingsProvider";

export function Header() {
  const navigate = useNavigate();
	const { user: currentUser, isLoading } = useCurrentUser();
	const profileCompletion = currentUser ? calculateProfileCompletion(currentUser) : 0;
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { open: settingsDialogOpen, setOpen: setSettingsDialogOpen, initialTab } = useSettingsState();

	const handleSignOut = async () => {
    await authClient.signOut();
    navigate({ to: "/login" });
  };
  
  return (
    <>
    <header className="border-b">
      <div className="grid grid-cols-3 items-center gap-2 p-4">
        {/* Left: Sidebar toggle */}
        <div className="flex items-center gap-2 justify-start">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: sidebarOpen ? 90 : 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  {sidebarOpen ? (
                    <IconX className="stroke-1" />
                  ) : (
                    <IconMenu2 className="stroke-1" />
                  )}
                </motion.div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{sidebarOpen ? "Close menu" : "Open menu"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Center: Logo */}
        <div className="flex items-center justify-center">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Rackd logo" 
              className="h-8 w-8"
            />
            <span className="hidden font-bold lowercase tracking-tighter font-mono md:block text-xl">rackd</span>
          </Link>
        </div>

        {/* Right: Navigation and user menu */}
        <div className="flex items-center gap-2 justify-end">
				<NavigationButton
					icon={IconAlignJustified}
					ariaLabel="Feed"
					tooltip="Feed"
					navigate={() => navigate({ to: "/feed" })}
				/>
				<NotificationsDropdown />

        <ThemeToggle useTheme={useTheme} />

        {currentUser && (
        <div className="flex items-center gap-3 shrink-0">
          {/* Profile Completion Badge */}
          {profileCompletion !== 100 && (
            <AnimatedBadge
              text={`Complete Profile ${profileCompletion}%`}
              color={profileCompletion >= 80 ? "#22c55e" : profileCompletion >= 60 ? "#eab308" : "#ef4444"}
              onClick={() => setSettingsDialogOpen(true)}
            />
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger>
              <ProfileAvatar
                showShimmer={true}
                user={{
                  displayName: currentUser.displayName,
                  image: currentUser.imageUrl ?? undefined,
                  country: currentUser.locale
                }}
                size="xs"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none truncate">
                    {currentUser.displayName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {currentUser.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => navigate({ to: `/${currentUser.username}` })}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate({ to: `/players/${currentUser.id}` })}>
                <IconSportBillard className="mr-2 h-4 w-4" />
                Player Profile
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setSettingsDialogOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setSettingsDialogOpen(true)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
        </div>
      </div>
    </header>

    {/* Floating Sidebar - slides in from the left */}
    <motion.div
      initial={false}
      animate={{
        x: sidebarOpen ? 0 : -20,
        opacity: sidebarOpen ? 1 : 0,
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed left-2 top-[56px] z-50 w-[300px] rounded-lg border bg-sidebar shadow-lg"
      style={{
        pointerEvents: sidebarOpen ? "auto" : "none",
      }}
    >
      <div className="p-2">
        <div className="flex flex-col gap-2">
          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <Link to="/feed"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <IconAlignJustified className="h-4 w-4 stroke-1" />
              Feed
            </Link>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              Discover (Coming Soon)
            </div>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              Tournaments (Coming Soon)
            </div>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              Players (Coming Soon)
            </div>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Venues (Coming Soon)
            </div>
          </nav>

          <Separator />

          {/* User Section */}
          {currentUser && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground">
                <Settings className="h-4 w-4" />
                Settings (Coming Soon)
              </div>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                Billing (Coming Soon)
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>

    {/* Settings Dialog */}
    {currentUser && (
      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        user={{
          displayName: currentUser.displayName,
          email: currentUser.email,
          imageUrl: currentUser.imageUrl ?? undefined,
          country: currentUser.locale
        }}
        profileSettings={<ProfileSettings user={currentUser} />}
        dangerZone={<DangerZone user={currentUser} />}
        sessionsManager={<SessionsManager />}
        interestsManager={<InterestTagsManager interests={currentUser?.interests || []} maxTags={15} placeholder="e.g., 8-ball, 9-ball, tournaments..." />}
        connectedAccounts={<ConnectedAccounts userId={currentUser?.id} />}
        initialTab={initialTab}
      />
    )}
    </>
  );
}