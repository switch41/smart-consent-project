import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

export const getUserHistory = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const websites = await ctx.db
      .query("websites")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const history = await Promise.all(
      websites.slice(0, 10).map(async (website) => {
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
