import { components } from "./_generated/api";
import { Autumn } from "@useautumn/convex";
import { getCurrentUser } from "./lib/utils";
import { api } from "./_generated/api";
import type { ActionCtx, QueryCtx, MutationCtx } from "./_generated/server";

export const autumn = new Autumn(components.autumn, {
  secretKey: process.env.AUTUMN_SECRET_KEY ?? "",
  identify: async (ctx: any) => {
    try {
      // Autumn actions use ActionCtx which doesn't have direct db access
      // We need to use runQuery for ActionCtx, or direct db access for QueryCtx/MutationCtx
      if (!ctx) {
        console.warn("[Autumn identify] No context provided");
        return null;
      }

      let user = null;

      // Check if it's ActionCtx (has runQuery but no db)
      if (ctx.runQuery && !ctx.db) {
        // Use runQuery to get the user from a query
        const userData = await ctx.runQuery(api.auth.getCurrentUserWithUsersTable, {});
        user = userData?.usersTableUser || null;
      } else if (ctx.db) {
        // It's QueryCtx or MutationCtx - can use getCurrentUser directly
        user = await getCurrentUser(ctx as QueryCtx | MutationCtx);
      } else {
        console.warn("[Autumn identify] Context doesn't have runQuery or db property");
        return null;
      }

      if (!user) return null;

      return {
        customerId: user._id,
        customerData: {
          name: user.name as string,
          email: user.email as string,
        },
      };
    } catch (error: any) {
      // Silently fail if user is not authenticated - this is expected for unauthenticated requests
      if (error?.message?.includes("Unauthenticated") || error?.message?.includes("Not authenticated")) {
        return null;
      }
      console.warn("[Autumn identify] Error identifying user:", error);
      return null;
    }
  },
});

export const {
  track,
  cancel,
  query,
  attach,
  check,
  checkout,
  usage,
  setupPayment,
  createCustomer,
  listProducts,
  billingPortal,
  createReferralCode,
  redeemReferralCode,
  createEntity,
  getEntity,
} = autumn.api();

