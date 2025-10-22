import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const websites = await ctx.db
      .query("websites")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const cookies = await ctx.db
      .query("cookies")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const trackers = await ctx.db
      .query("trackers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const consents = await ctx.db
      .query("consents")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    return {
      totalWebsites: websites.length,
      totalCookies: cookies.length,
      totalTrackers: trackers.length,
      trackersBlocked: trackers.filter((t) => t.blocked).length,
      consentsGranted: consents.filter((c) => c.status === "granted").length,
      consentsDenied: consents.filter((c) => c.status === "denied").length,
      privacyScore: user.privacyScore ?? 0,
      gamificationPoints: user.gamificationPoints ?? 0,
    };
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const consents = await ctx.db
      .query("consents")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const total = consents.length;
    const active = consents.filter((c) => c.status === "granted").length;
    const revoked = consents.filter((c) => c.status === "denied").length;
    const acceptanceRate = total > 0 ? (active / total) * 100 : 0;

    const categoryStats: Record<string, number> = {
      essential: 0,
      analytics: 0,
      marketing: 0,
      thirdParty: 0,
    };

    consents.forEach((consent) => {
      categoryStats[consent.category] = (categoryStats[consent.category] || 0) + 1;
    });

    return {
      total,
      active,
      revoked,
      acceptanceRate,
      categoryStats,
    };
  },
});

export const getTrends = query({
  args: { days: v.number() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const consents = await ctx.db
      .query("consents")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const now = Date.now();
    const daysAgo = now - args.days * 24 * 60 * 60 * 1000;

    const recentConsents = consents.filter((c) => c.timestamp >= daysAgo);

    const trendMap = new Map<string, number>();
    recentConsents.forEach((consent) => {
      const date = new Date(consent.timestamp).toISOString().split("T")[0];
      trendMap.set(date, (trendMap.get(date) || 0) + 1);
    });

    return Array.from(trendMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});
