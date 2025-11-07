import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { internal } from "./_generated/api";

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
    
    const websites = await ctx.db
      .query("websites")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    
    // Enhanced ML-based scoring algorithm
    let score = 50; // Base score
    
    // Positive factors
    const deniedConsents = consents.filter(c => c.status === "denied").length;
    score += deniedConsents * 5;
    
    const blockedTrackers = trackers.filter(t => t.blocked).length;
    score += blockedTrackers * 3;
    
    // Active consent management bonus
    if (consents.length > 0) {
      score += Math.min(10, consents.length * 2);
    }
    
    // Negative factors
    const highRiskSites = riskAssessments.filter(r => r.riskLevel === "high" || r.riskLevel === "critical").length;
    score -= highRiskSites * 10;
    
    const thirdPartyTrackers = trackers.filter(t => !t.blocked).length;
    score -= thirdPartyTrackers * 2;
    
    // Normalize score
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
      breakdown: {
        consentManagement: consents.filter(c => c.status === "denied").length * 5,
        trackerBlocking: trackers.filter(t => t.blocked).length * 3,
        riskPenalty: riskAssessments.filter(r => r.riskLevel === "high" || r.riskLevel === "critical").length * -10,
      },
    };
  },
});