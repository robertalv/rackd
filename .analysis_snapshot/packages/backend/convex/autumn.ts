import { components } from "./_generated/api";
import { Autumn } from "@useautumn/convex";
import { getCurrentUser } from "./lib/utils";
import { api } from "./_generated/api";
import type { ActionCtx, QueryCtx, MutationCtx } from "./_generated/server";

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

// No-op implementations when Autumn is not configured
const noOpCheck = async (_ctx: any, _options?: any) => ({
  data: { allowed: false }, // Default to not allowed (free plan limits apply)
});

const noOpAsync = async () => ({});
const noOpVoid = async () => {};

// Wrapper functions to handle both RegisteredAction and no-op cases
export const check = async (ctx: any, options?: any) => {
  if (autumnApi?.check) {
    return await (autumnApi.check as any)(ctx, options);
  }
  return noOpCheck(ctx, options);
};

export const track = async (...args: any[]) => {
  if (autumnApi?.track) {
    return await (autumnApi.track as any)(...args);
  }
  return noOpVoid();
};

export const cancel = async (...args: any[]) => {
  if (autumnApi?.cancel) {
    return await (autumnApi.cancel as any)(...args);
  }
  return noOpVoid();
};

export const query = async (...args: any[]) => {
  if (autumnApi?.query) {
    return await (autumnApi.query as any)(...args);
  }
  return noOpAsync();
};

export const attach = async (...args: any[]) => {
  if (autumnApi?.attach) {
    return await (autumnApi.attach as any)(...args);
  }
  return noOpVoid();
};

export const checkout = async (...args: any[]) => {
  if (autumnApi?.checkout) {
    return await (autumnApi.checkout as any)(...args);
  }
  return noOpAsync();
};

export const usage = async (...args: any[]) => {
  if (autumnApi?.usage) {
    return await (autumnApi.usage as any)(...args);
  }
  return noOpAsync();
};

export const setupPayment = async (...args: any[]) => {
  if (autumnApi?.setupPayment) {
    return await (autumnApi.setupPayment as any)(...args);
  }
  return noOpAsync();
};

export const createCustomer = async (...args: any[]) => {
  if (autumnApi?.createCustomer) {
    return await (autumnApi.createCustomer as any)(...args);
  }
  return noOpAsync();
};

export const listProducts = async (...args: any[]) => {
  if (autumnApi?.listProducts) {
    return await (autumnApi.listProducts as any)(...args);
  }
  return noOpAsync();
};

export const billingPortal = async (...args: any[]) => {
  if (autumnApi?.billingPortal) {
    return await (autumnApi.billingPortal as any)(...args);
  }
  return noOpAsync();
};

export const createReferralCode = async (...args: any[]) => {
  if (autumnApi?.createReferralCode) {
    return await (autumnApi.createReferralCode as any)(...args);
  }
  return noOpAsync();
};

export const redeemReferralCode = async (...args: any[]) => {
  if (autumnApi?.redeemReferralCode) {
    return await (autumnApi.redeemReferralCode as any)(...args);
  }
  return noOpAsync();
};

export const createEntity = async (...args: any[]) => {
  if (autumnApi?.createEntity) {
    return await (autumnApi.createEntity as any)(...args);
  }
  return noOpAsync();
};

export const getEntity = async (...args: any[]) => {
  if (autumnApi?.getEntity) {
    return await (autumnApi.getEntity as any)(...args);
  }
  return noOpAsync();
};

