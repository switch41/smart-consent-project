import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { cookieCategoryValidator } from "./schema";

export const list = query({
  args: {
    websiteId: v.optional(v.id("websites")),
    category: v.optional(cookieCategoryValidator),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    let q = ctx.db.query("cookies").withIndex("by_userId", (q) => q.eq("userId", user._id));

    const cookies = await q.collect();

    return cookies.filter((cookie) => {
      if (args.websiteId && cookie.websiteId !== args.websiteId) return false;
      if (args.category && cookie.category !== args.category) return false;
      return true;
    });
  },
});

export const getStats = query({
  args: { websiteId: v.optional(v.id("websites")) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    let q = ctx.db.query("cookies").withIndex("by_userId", (q) => q.eq("userId", user._id));

    const cookies = await q.collect();

    const filtered = args.websiteId
      ? cookies.filter((c) => c.websiteId === args.websiteId)
      : cookies;

    return {
      total: filtered.length,
      byCategory: {
        essential: filtered.filter((c) => c.category === "essential").length,
        analytics: filtered.filter((c) => c.category === "analytics").length,
        marketing: filtered.filter((c) => c.category === "marketing").length,
        thirdParty: filtered.filter((c) => c.category === "thirdParty").length,
      },
      thirdParty: filtered.filter((c) => c.isThirdParty).length,
      firstParty: filtered.filter((c) => !c.isThirdParty).length,
    };
  },
});