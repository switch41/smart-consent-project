import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { cookieCategoryValidator } from "./schema";

export const storeCookie = internalMutation({
  args: {
    websiteId: v.id("websites"),
    name: v.string(),
    domain: v.string(),
    category: cookieCategoryValidator,
    isThirdParty: v.boolean(),
    purpose: v.optional(v.string()),
    expirationDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const website = await ctx.db.get(args.websiteId);
    if (!website) throw new Error("Website not found");

    // Check if cookie already exists
    const existing = await ctx.db
      .query("cookies")
      .withIndex("by_websiteId", (q) => q.eq("websiteId", args.websiteId))
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("cookies", {
      userId: website.userId,
      websiteId: args.websiteId,
      name: args.name,
      domain: args.domain,
      category: args.category,
      isThirdParty: args.isThirdParty,
      purpose: args.purpose,
      expirationDate: args.expirationDate,
    });
  },
});

export const storeTracker = internalMutation({
  args: {
    websiteId: v.id("websites"),
    domain: v.string(),
    type: v.string(),
    blocked: v.boolean(),
    riskLevel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const website = await ctx.db.get(args.websiteId);
    if (!website) throw new Error("Website not found");

    // Check if tracker already exists
    const existing = await ctx.db
      .query("trackers")
      .withIndex("by_websiteId", (q) => q.eq("websiteId", args.websiteId))
      .filter((q) => q.eq(q.field("domain"), args.domain))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("trackers", {
      userId: website.userId,
      websiteId: args.websiteId,
      domain: args.domain,
      type: args.type,
      blocked: args.blocked,
      riskLevel: args.riskLevel,
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

    // Simple risk assessment logic
    let score = 100;
    let riskLevel = "Low";

    // Deduct points for trackers
    score -= args.trackerCount * 5;
    
    // Deduct points for cookies
    score -= args.cookieCount * 1;

    // Normalize score
    score = Math.max(0, Math.min(100, score));

    // Determine risk level
    if (score < 50) riskLevel = "Critical";
    else if (score < 70) riskLevel = "High";
    else if (score < 90) riskLevel = "Medium";

    return await ctx.db.insert("riskAssessments", {
      userId: website.userId,
      websiteId: args.websiteId,
      riskLevel,
      score,
      details: `Detected ${args.cookieCount} cookies and ${args.trackerCount} trackers.`,
      timestamp: Date.now(),
    });
  },
});