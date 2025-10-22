import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const storeCookie = internalMutation({
  args: {
    websiteId: v.id("websites"),
    name: v.string(),
    category: v.union(
      v.literal("essential"),
      v.literal("analytics"),
      v.literal("marketing"),
      v.literal("thirdParty")
    ),
    domain: v.string(),
    isThirdParty: v.boolean(),
    purpose: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const website = await ctx.db.get(args.websiteId);
    if (!website) throw new Error("Website not found");
    
    return await ctx.db.insert("cookies", {
      userId: website.userId,
      websiteId: args.websiteId,
      name: args.name,
      category: args.category,
      domain: args.domain,
      isThirdParty: args.isThirdParty,
      purpose: args.purpose,
    });
  },
});

export const storeTracker = internalMutation({
  args: {
    websiteId: v.id("websites"),
    type: v.string(),
    domain: v.string(),
    blocked: v.boolean(),
  },
  handler: async (ctx, args) => {
    const website = await ctx.db.get(args.websiteId);
    if (!website) throw new Error("Website not found");
    
    return await ctx.db.insert("trackers", {
      userId: website.userId,
      websiteId: args.websiteId,
      type: args.type,
      domain: args.domain,
      blocked: args.blocked,
      detectedAt: Date.now(),
    });
  },
});

export const assessRisk = internalMutation({
  args: {
    websiteId: v.id("websites"),
    cookieCount: v.number(),
    trackerCount: v.number(),
  },
  handler: async (ctx, args) => {
    const website = await ctx.db.get(args.websiteId);
    if (!website) throw new Error("Website not found");
    
    const score = calculateRiskScore(args.cookieCount, args.trackerCount);
    const riskLevel = getRiskLevel(score);
    const factors = generateRiskFactors(args.cookieCount, args.trackerCount);
    
    return await ctx.db.insert("riskAssessments", {
      userId: website.userId,
      websiteId: args.websiteId,
      riskLevel,
      factors,
      score,
      assessedAt: Date.now(),
    });
  },
});

function calculateRiskScore(cookieCount: number, trackerCount: number): number {
  return Math.min(100, (cookieCount * 3) + (trackerCount * 5));
}

function getRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score < 25) return "low";
  if (score < 50) return "medium";
  if (score < 75) return "high";
  return "critical";
}

function generateRiskFactors(cookieCount: number, trackerCount: number): Array<string> {
  const factors: Array<string> = [];
  
  if (cookieCount > 10) factors.push("High number of cookies detected");
  if (trackerCount > 5) factors.push("Multiple third-party trackers found");
  if (cookieCount > 15) factors.push("Excessive data collection");
  if (trackerCount > 8) factors.push("Aggressive tracking behavior");
  
  return factors.length > 0 ? factors : ["Normal tracking behavior"];
}
