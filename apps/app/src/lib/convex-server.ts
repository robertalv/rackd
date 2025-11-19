import type { ConvexQueryClient } from "@convex-dev/react-query";
import type { QueryClient } from "@tanstack/react-query";
import type { FunctionReference } from "convex/server";

export async function callConvexQuery<
  Query extends FunctionReference<"query", "public", any, any>,
>(
  _queryClient: QueryClient,
  convexQueryClient: ConvexQueryClient,
  query: Query,
  args?: any,
): Promise<Awaited<ReturnType<Query["_returnType"]>>> {
  const convexClient = convexQueryClient.convexClient;
  const data = await convexClient.query(query, args !== undefined ? args : undefined);
  
  return data as Awaited<ReturnType<Query["_returnType"]>>;
}

export async function callConvexMutation<
  Mutation extends FunctionReference<"mutation", "public", any, any>,
>(
  convexQueryClient: ConvexQueryClient,
  mutation: Mutation,
  args?: any,
): Promise<Awaited<ReturnType<Mutation["_returnType"]>>> {
  const convexClient = convexQueryClient.convexClient;
  
  return await convexClient.mutation(mutation, args);
}

