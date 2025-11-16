"use client";

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
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { ThemeToggle } from "@rackd/ui/components/theme-toggle";
import { useTheme } from "@/providers/ThemeProvider";
import { authClient } from "@/lib/auth-client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { SettingsDialog } from "@/components/layout/settings-dialog";
import { DangerZone } from "@/components/settings/danger-zone";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { SessionsManager } from "@/components/settings/sessions-manager";
import { InterestTagsManager } from "@/components/settings/interest-tags-manager";
import { ConnectedAccounts } from "@/components/settings/connected-accounts";
import { BillingManager } from "@/components/billing/billing-manager";
import { useSettingsState } from "@/providers/SettingsProvider";
import { cn } from "@rackd/ui/lib/utils";
import { useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@rackd/ui/components/button";
import { 
  Icon,
  Menu01Icon,
  Cancel01Icon,
  UserAccountIcon,
  Settings02Icon,
  CreditCardIcon,
  Logout01Icon,
  UserCircleIcon
} from "@rackd/ui/icons";
import { NavigationButton } from "@/components/navigation-button";
import { NAVIGATION_ITEMS } from "@/lib/constants";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useCurrentUser();
  const profileCompletion = currentUser ? calculateProfileCompletion(currentUser) : 0;
  const { open: settingsDialogOpen, setOpen: setSettingsDialogOpen, initialTab } = useSettingsState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: "/login" });
        },
      },
    });
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleNavClick = (path: string) => {
    navigate({ to: path });
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <div className="flex h-screen flex-col overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          <aside
            className={cn(
              "w-16 border-r bg-background shrink-0 flex flex-col transition-transform duration-300 ease-in-out",
              "fixed md:static inset-y-0 left-0 z-50 md:z-auto",
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}
          >
            <div className="h-14 flex items-center justify-center border-b shrink-0">
              <Link to="/" search={{ postId: undefined }} className="flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="Rackd logo" 
                  className="h-8 w-8"
                />
              </Link>
            </div>
            
            <nav className="flex flex-col gap-2 w-full items-center py-4 flex-1">
              {NAVIGATION_ITEMS.map((item) => (
                <NavigationButton
                  key={item.path}
                  icon={item.icon}
                  variant="outline"
                  bordered={false}
                  active={isActive(item.path)}
                  navigate={() => handleNavClick(item.path)}
                  ariaLabel={item.label}
                  tooltip={item.label}
                  tooltipPosition="right"
                />
              ))}
              
            </nav>
          </aside>

          <div className="flex flex-col flex-1 min-w-0 overflow-hidden md:ml-0">
            <header className="sticky top-0 z-10 border-b h-14 flex items-center px-4 shrink-0 bg-background">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                  >
                    {mobileMenuOpen ? (
                      <Icon icon={Cancel01Icon} className="h-5 w-5" />
                    ) : (
                      <Icon icon={Menu01Icon} className="h-5 w-5" />
                    )}
                  </Button>
                
                  <span className="hidden md:flex font-bold lowercase tracking-tighter text-xl">rackd</span>
                </div>

                <div className="flex items-center gap-2">
                  <NotificationsDropdown />

                  <ThemeToggle useTheme={useTheme} />

                  {currentUser && (
                    <div className="flex items-center gap-3 shrink-0">
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
                            size="sm"
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
                            <Icon icon={UserCircleIcon} className="mr-2 h-4 w-4" />
                            Profile
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => navigate({ to: `/players/${currentUser.playerId}` })}>
                            <Icon icon={UserAccountIcon} className="mr-2 h-4 w-4" />
                            Player Profile
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => setSettingsDialogOpen(true)}>
                            <Icon icon={Settings02Icon} className="mr-2 h-4 w-4" />
                            Settings
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => setSettingsDialogOpen(true)}>
                            <Icon icon={CreditCardIcon} className="mr-2 h-4 w-4" />
                            Billing
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem onClick={handleSignOut}>
                            <Icon icon={Logout01Icon} className="mr-2 h-4 w-4" />
                            Logout
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-h-0">
              {children}
            </main>
          </div>
        </div>
      </div>

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
          connectedAccounts={<ConnectedAccounts />}
          billingManager={<BillingManager />}
          initialTab={initialTab}
        />
      )}
    </>
  );
}

