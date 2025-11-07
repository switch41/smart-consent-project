import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

/**
 * Helper function for testing - gets user history
 */
export const internalGetUserHistory = internalQuery({
  args: {
    userId: v.id("users"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const websites = await ctx.db
      .query("websites")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit);

    const history = await Promise.all(
      websites.map(async (website) => {
        const assessment = await ctx.db
          .query("riskAssessments")
          .withIndex("by_websiteId", (q) => q.eq("websiteId", website._id))
          .first();

        return {
          url: website.url,
          riskLevel: assessment?.riskLevel || "medium",
        };
      })
    );

    return history;
  },
});
