import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getReportData = query({
  args: { websiteId: v.optional(v.id("websites")) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    // If websiteId is provided, fetch data for that specific website
    // Otherwise, fetch data for all websites the user has scanned
    
    let websites;
    if (args.websiteId) {
      const website = await ctx.db.get(args.websiteId);
      if (!website || website.userId !== user._id) return null;
      websites = [website];
    } else {
      websites = await ctx.db
        .query("websites")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect();
    }

    const reportData = await Promise.all(
      websites.map(async (website) => {
        const cookies = await ctx.db
          .query("cookies")
          .withIndex("by_websiteId", (q) => q.eq("websiteId", website._id))
          .collect();

        const trackers = await ctx.db
          .query("trackers")
          .withIndex("by_websiteId", (q) => q.eq("websiteId", website._id))
          .collect();

        const assessment = await ctx.db
          .query("riskAssessments")
          .withIndex("by_websiteId", (q) => q.eq("websiteId", website._id))
          .order("desc")
          .first();

        return {
          website,
          cookies,
          trackers,
          assessment,
        };
      })
    );

    return reportData;
  },
});
