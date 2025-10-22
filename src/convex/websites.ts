import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("websites")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const get = query({
  args: { websiteId: v.id("websites") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const website = await ctx.db.get(args.websiteId);
    if (!website || website.userId !== user._id) return null;

    return website;
  },
});

export const getByUrl = query({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    return await ctx.db
      .query("websites")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();
  },
});

export const create = mutation({
  args: {
    url: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    return await ctx.db.insert("websites", {
      userId: user._id,
      url: args.url,
      name: args.name,
      lastVisited: Date.now(),
      visitCount: 1,
    });
  },
});

export const updateVisit = mutation({
  args: { websiteId: v.id("websites") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const website = await ctx.db.get(args.websiteId);
    if (!website || website.userId !== user._id) {
      throw new Error("Website not found");
    }

    await ctx.db.patch(args.websiteId, {
      lastVisited: Date.now(),
      visitCount: website.visitCount + 1,
    });
  },
});