import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { riskLevelValidator } from "./schema";

export const list = query({
  args: {
    websiteId: v.optional(v.id("websites")),
    riskLevel: v.optional(riskLevelValidator),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    let q = ctx.db.query("riskAssessments").withIndex("by_userId", (q) => q.eq("userId", user._id));

    const assessments = await q.collect();

    return assessments.filter((assessment) => {
      if (args.websiteId && assessment.websiteId !== args.websiteId) return false;
      if (args.riskLevel && assessment.riskLevel !== args.riskLevel) return false;
      return true;
    });
  },
});

export const create = mutation({
  args: {
    websiteId: v.id("websites"),
    riskLevel: riskLevelValidator,
    factors: v.array(v.string()),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("riskAssessments")
      .withIndex("by_websiteId", (q) => q.eq("websiteId", args.websiteId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        riskLevel: args.riskLevel,
        factors: args.factors,
        score: args.score,
        assessedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("riskAssessments", {
      userId: user._id,
      websiteId: args.websiteId,
      riskLevel: args.riskLevel,
      factors: args.factors,
      score: args.score,
      assessedAt: Date.now(),
    });
  },
});