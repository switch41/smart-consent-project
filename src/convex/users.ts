import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx, internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

export const getBySubject = internalQuery({
  args: { subject: v.string() },
  handler: async (ctx, args) => {
    // The subject from auth identity corresponds to the tokenIdentifier
    // We need to find the user by checking the authAccounts table
    const authAccount = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider")
      .filter((q) => q.eq(q.field("providerAccountId"), args.subject))
      .first();

    if (!authAccount) {
      return null;
    }

    return await ctx.db.get(authAccount.userId);
  },
});