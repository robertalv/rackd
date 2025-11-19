import { components } from "./_generated/api";
import { Autumn } from "@useautumn/convex";
import { getCurrentUser } from "./lib/utils";
import { api } from "./_generated/api";
import type { ActionCtx, QueryCtx, MutationCtx } from "./_generated/server";
import { action } from "./_generated/server";

const autumnSecretKey = process.env.AUTUMN_SECRET_KEY;
const autumnPublishableKey = process.env.AUTUMN_PUBLISHABLE_KEY;

// Create Autumn instance only if at least one key is provided
let autumn: Autumn | null = null;
let autumnApi: ReturnType<Autumn["api"]> | null = null;

if (autumnSecretKey || autumnPublishableKey) {
  try {
    const autumnConfig: {
      secretKey?: string;
      publishableKey?: string;
      identify: (ctx: any) => Promise<{ customerId: any; customerData: { name: string; email: string } } | null>;
    } = {
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
    };

    if (autumnSecretKey) {
      autumnConfig.secretKey = autumnSecretKey;
    }
    if (autumnPublishableKey) {
      autumnConfig.publishableKey = autumnPublishableKey;
    }

    autumn = new Autumn(components.autumn, autumnConfig as any);
    autumnApi = autumn.api();
  } catch (error) {
    console.error("[Autumn] Failed to initialize Autumn:", error);
    // Don't throw - allow app to continue without Autumn
  }
} else {
  console.warn(
    "[Autumn] AUTUMN_SECRET_KEY or AUTUMN_PUBLISHABLE_KEY not set. " +
    "Autumn features are disabled. Set one of these variables in your Convex dashboard to enable Autumn."
  );
}

// Export functions that can be called with ctx from mutations/queries/actions
// and also work as Convex actions for client use
// When Autumn is configured, export directly from autumn.api() (cast to any to allow calling)
// When not configured, export no-op Convex actions
export const check = autumnApi?.check 
  ? (autumnApi.check as any)
  : action(async (_ctx: ActionCtx, _options?: any) => ({
      data: { allowed: false },
    }));

export const track = autumnApi?.track
  ? (autumnApi.track as any)
  : action(async (_ctx: ActionCtx, ..._args: any[]) => {});

export const cancel = autumnApi?.cancel
  ? (autumnApi.cancel as any)
  : action(async (_ctx: ActionCtx, ..._args: any[]) => {});

export const query = autumnApi?.query
  ? (autumnApi.query as any)
  : action(async (_ctx: ActionCtx, ..._args: any[]) => ({}));

export const attach = autumnApi?.attach
  ? (autumnApi.attach as any)
  : action(async (_ctx: ActionCtx, ..._args: any[]) => {});

export const checkout = autumnApi?.checkout
  ? (autumnApi.checkout as any)
  : action(async (_ctx: ActionCtx, ..._args: any[]) => ({}));

export const usage = autumnApi?.usage
  ? (autumnApi.usage as any)
  : action(async (_ctx: ActionCtx, ..._args: any[]) => ({}));

export const setupPayment = autumnApi?.setupPayment
  ? (autumnApi.setupPayment as any)
  : action(async (_ctx: ActionCtx, ..._args: any[]) => ({}));

export const createCustomer = autumnApi?.createCustomer
  ? (autumnApi.createCustomer as any)
  : action(async (_ctx: ActionCtx, ..._args: any[]) => ({}));

export const listProducts = autumnApi?.listProducts
  ? (autumnApi.listProducts as any)
  : action(async (_ctx: ActionCtx, ..._args: any[]) => ({}));

export const billingPortal = autumnApi?.billingPortal
  ? (autumnApi.billingPortal as any)
  : action(async (_ctx: ActionCtx, ..._args: any[]) => ({}));

export const createReferralCode = autumnApi?.createReferralCode
  ? (autumnApi.createReferralCode as any)
  : action(async (_ctx: ActionCtx, ..._args: any[]) => ({}));

export const redeemReferralCode = autumnApi?.redeemReferralCode
  ? (autumnApi.redeemReferralCode as any)
  : action(async (_ctx: ActionCtx, ..._args: any[]) => ({}));

export const createEntity = autumnApi?.createEntity
  ? (autumnApi.createEntity as any)
  : action(async (_ctx: ActionCtx, ..._args: any[]) => ({}));

export const getEntity = autumnApi?.getEntity
  ? (autumnApi.getEntity as any)
  : action(async (_ctx: ActionCtx, ..._args: any[]) => ({}));

