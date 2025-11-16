"use client";

import * as React from "react";
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
  const { customer, checkout, openBillingPortal, isLoading } = useCustomer();
  const currentUser = useCurrentUser();
  
  // Get tournament count for the current user
  const tournaments = useQuery(
    api.tournaments.getByOrganizer,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const tournamentCount = tournaments?.length || 0;
  const isProPlan = customer?.products?.find((p: any) => p.id === "player")?.status === "active" || 
                    customer?.products?.find((p: any) => p.id === "player")?.status === "trialing";
  const hasUnlimitedTournaments = customer?.products?.some((p: any) => 
    p.id === "player" && (p.status === "active" || p.status === "trialing")
  );

  const freePlanLimit = 3;
  const usagePercentage = hasUnlimitedTournaments ? 0 : (tournamentCount / freePlanLimit) * 100;
  const remainingTournaments = hasUnlimitedTournaments ? null : Math.max(0, freePlanLimit - tournamentCount);

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

  if (isLoading || !customer) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">Loading billing information...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Current Plan Card */}
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

      {/* Tournament Usage Card */}
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
                    {tournamentCount} / {freePlanLimit}
                  </span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
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
        </CardContent>
      </Card>

      <Separator />

      {/* Plan Features */}
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

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {!isProPlan ? (
          <Button onClick={handleUpgrade} className="w-full">
            Upgrade to Player Plan - $5/month
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

