import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {
    websiteId: v.optional(v.id("websites")),
    blocked: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    let q = ctx.db.query("trackers").withIndex("by_userId", (q) => q.eq("userId", user._id));

    const trackers = await q.collect();

    return trackers.filter((tracker) => {
      if (args.websiteId && tracker.websiteId !== args.websiteId) return false;
      if (args.blocked !== undefined && tracker.blocked !== args.blocked) return false;
      return true;
    });
  },
});

export const create = mutation({
  args: {
    websiteId: v.id("websites"),
    type: v.string(),
    domain: v.string(),
    blocked: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    return await ctx.db.insert("trackers", {
      userId: user._id,
      websiteId: args.websiteId,
      type: args.type,
      domain: args.domain,
      blocked: args.blocked,
      detectedAt: Date.now(),
    });
  },
});

export const toggleBlock = mutation({
  args: {
    trackerId: v.id("trackers"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const tracker = await ctx.db.get(args.trackerId);
    if (!tracker || tracker.userId !== user._id) {
      throw new Error("Tracker not found");
    }

    await ctx.db.patch(args.trackerId, {
      blocked: !tracker.blocked,
    });
  },
});