"use client";

import { useCustomer, CheckoutDialog } from "autumn-js/react";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { Button } from "@rackd/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rackd/ui/components/card";
import { Badge } from "@rackd/ui/components/badge";
import { Progress } from "@rackd/ui/components/progress";
import { Separator } from "@rackd/ui/components/separator";
import { useCurrentUser } from "@/hooks/use-current-user";

export function BillingManager() {
  const { customer, checkout, openBillingPortal } = useCustomer();
  const currentUser = useCurrentUser();
  
  const usageStats = useQuery(
    api.usage.getUsageStats,
    currentUser?.user?._id ? {} : "skip"
  );

  const planLimits = useQuery(
    api.usage.getPlanLimits,
    currentUser?.user?._id ? {} : "skip"
  );

  const tournamentCount = usageStats?.localCounts?.tournaments || 0;
  const venueCount = usageStats?.localCounts?.venues || 0;
  const postsToday = usageStats?.localCounts?.postsToday || 0;

  const isProPlan = customer?.products?.find((p: any) => p.id === "player")?.status === "active" || 
                    customer?.products?.find((p: any) => p.id === "player")?.status === "trialing";
  
  const hasUnlimitedTournaments = isProPlan || false;
  const hasUnlimitedVenues = isProPlan || false;
  const hasUnlimitedPosts = isProPlan || false;

  const playerProduct = customer?.products?.find((p: any) => p.id === "player");
  const monthlyPrice = (playerProduct as any)?.price?.amount 
    ? `$${(((playerProduct as any).price.amount) / 100).toFixed(2)}/month`
    : (playerProduct as any)?.amount
    ? `$${(((playerProduct as any).amount) / 100).toFixed(2)}/month`
    : "$5/month";

  const tournamentLimit = planLimits?.tournaments || 3;
  const venueLimit = planLimits?.venues || 1;
  const postsPerDayLimit = planLimits?.postsPerDay || 10;

  const tournamentUsagePercentage = hasUnlimitedTournaments ? 0 : (tournamentCount / tournamentLimit) * 100;
  const venueUsagePercentage = hasUnlimitedVenues ? 0 : (venueCount / venueLimit) * 100;
  const postsUsagePercentage = hasUnlimitedPosts ? 0 : (postsToday / postsPerDayLimit) * 100;

  const remainingTournaments = hasUnlimitedTournaments ? null : Math.max(0, tournamentLimit - tournamentCount);
  const remainingVenues = hasUnlimitedVenues ? null : Math.max(0, venueLimit - venueCount);
  const remainingPosts = hasUnlimitedPosts ? null : Math.max(0, postsPerDayLimit - postsToday);

  const handleUpgrade = async () => {
    await checkout({
      productId: "player",
      dialog: CheckoutDialog,
    });
  };

  const handleManageBilling = async () => {
    await openBillingPortal({
      returnUrl: window.location.href,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                {isProPlan ? "You're on the Player plan" : "You're on the Free plan"}
              </CardDescription>
            </div>
            <Badge variant={isProPlan ? "default" : "secondary"}>
              {isProPlan ? "Player Plan" : "Free Plan"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isProPlan && customer?.products?.find((p: any) => p.id === "player") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline">
                  {customer.products.find((p: any) => p.id === "player")?.status || "Unknown"}
                </Badge>
              </div>
              {customer.products.find((p: any) => p.id === "player")?.current_period_end && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next billing date</span>
                  <span>
                    {new Date(
                      customer.products.find((p: any) => p.id === "player")?.current_period_end || 0
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tournament Usage</CardTitle>
          <CardDescription>
            {hasUnlimitedTournaments
              ? "Create unlimited tournaments with your Player plan"
              : "Free plan includes up to 3 tournaments"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasUnlimitedTournaments ? (
            <div className="flex items-center gap-2 text-sm">
              <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="font-medium">Unlimited tournaments</span>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tournaments created</span>
                  <span className="font-medium">
                    {tournamentCount} / {tournamentLimit}
                  </span>
                </div>
                <Progress value={tournamentUsagePercentage} className="h-2" />
              </div>
              {remainingTournaments !== null && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-4 w-4 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">i</span>
                  </div>
                  <span className="text-muted-foreground">
                    {remainingTournaments === 0
                      ? "You've reached your limit. Upgrade to create more tournaments."
                      : `${remainingTournaments} tournament${remainingTournaments !== 1 ? "s" : ""} remaining`}
                  </span>
                </div>
              )}
            </>
          )}
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Venues created</span>
              <span className="font-medium">
                {venueCount} / {hasUnlimitedVenues ? "∞" : venueLimit}
              </span>
            </div>
            {!hasUnlimitedVenues && (
              <>
                <Progress value={venueUsagePercentage} className="h-2" />
                {remainingVenues !== null && remainingVenues < venueLimit && (
                  <div className="text-xs text-muted-foreground">
                    {remainingVenues === 0
                      ? "Venue limit reached. Upgrade for unlimited venues."
                      : `${remainingVenues} venue${remainingVenues !== 1 ? "s" : ""} remaining`}
                  </div>
                )}
              </>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Posts today</span>
              <span className="font-medium">
                {postsToday} / {hasUnlimitedPosts ? "∞" : postsPerDayLimit}
              </span>
            </div>
            {!hasUnlimitedPosts && (
              <>
                <Progress value={postsUsagePercentage} className="h-2" />
                {remainingPosts !== null && remainingPosts < postsPerDayLimit && (
                  <div className="text-xs text-muted-foreground">
                    {remainingPosts === 0
                      ? "Daily post limit reached. Upgrade for unlimited posts."
                      : `${remainingPosts} post${remainingPosts !== 1 ? "s" : ""} remaining today`}
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
          <CardDescription>What's included in your plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {hasUnlimitedTournaments ? "Unlimited" : "3"} Tournaments
                </p>
                <p className="text-xs text-muted-foreground">
                  Create and manage tournaments
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className={`h-5 w-5 rounded-full flex items-center justify-center mt-0.5 ${isProPlan ? "bg-green-500" : "bg-muted-foreground/20"}`}>
                <span className={`text-xs ${isProPlan ? "text-white" : "text-muted-foreground"}`}>
                  {isProPlan ? "✓" : "✕"}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">All Tournament Features</p>
                <p className="text-xs text-muted-foreground">
                  Access to all tournament management features
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className={`h-5 w-5 rounded-full flex items-center justify-center mt-0.5 ${isProPlan ? "bg-green-500" : "bg-muted-foreground/20"}`}>
                <span className={`text-xs ${isProPlan ? "text-white" : "text-muted-foreground"}`}>
                  {isProPlan ? "✓" : "✕"}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Priority Support</p>
                <p className="text-xs text-muted-foreground">
                  {isProPlan ? "Get priority support" : "Email support only"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {!isProPlan ? (
          <Button onClick={handleUpgrade} className="w-full">
            Upgrade to Player Plan - {monthlyPrice}
          </Button>
        ) : (
          <Button onClick={handleManageBilling} variant="outline" className="w-full">
            Manage Billing & Subscription
          </Button>
        )}
        {isProPlan && (
          <p className="text-xs text-center text-muted-foreground">
            Manage your subscription, update payment methods, or cancel your plan
          </p>
        )}
      </div>
    </div>
  );
}

