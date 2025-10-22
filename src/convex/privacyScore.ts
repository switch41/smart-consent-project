import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const calculateScore = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const consents = await ctx.db
      .query("consents")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    
    const trackers = await ctx.db
      .query("trackers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    
    const riskAssessments = await ctx.db
      .query("riskAssessments")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    
    let score = 50;
    
    const deniedConsents = consents.filter(c => c.status === "denied").length;
    score += deniedConsents * 5;
    
    const blockedTrackers = trackers.filter(t => t.blocked).length;
    score += blockedTrackers * 3;
    
    const highRiskSites = riskAssessments.filter(r => r.riskLevel === "high" || r.riskLevel === "critical").length;
    score -= highRiskSites * 10;
    
    score = Math.max(0, Math.min(100, score));
    
    await ctx.db.patch(user._id, {
      privacyScore: score,
    });
    
    return score;
  },
});

export const getScore = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return 0;
    
    return user.privacyScore ?? 0;
  },
});

export const getScoreBreakdown = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    
    const consents = await ctx.db
      .query("consents")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    
    const trackers = await ctx.db
      .query("trackers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    
    const riskAssessments = await ctx.db
      .query("riskAssessments")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    
    return {
      totalScore: user.privacyScore ?? 0,
      consentsManaged: consents.length,
      trackersBlocked: trackers.filter(t => t.blocked).length,
      highRiskSites: riskAssessments.filter(r => r.riskLevel === "high" || r.riskLevel === "critical").length,
    };
  },
});
