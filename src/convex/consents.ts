import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { consentStatusValidator, cookieCategoryValidator } from "./schema";

export const list = query({
  args: {
    websiteId: v.optional(v.id("websites")),
    status: v.optional(consentStatusValidator),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    let q = ctx.db.query("consents").withIndex("by_userId", (q) => q.eq("userId", user._id));

    const consents = await q.collect();

    return consents.filter((consent) => {
      if (args.websiteId && consent.websiteId !== args.websiteId) return false;
      if (args.status && consent.status !== args.status) return false;
      return true;
    });
  },
});

export const getUserConsents = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const consents = await ctx.db
      .query("consents")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    return consents.map((consent) => ({
      _id: consent._id,
      _creationTime: consent._creationTime,
      status: consent.status === "granted" ? "active" : consent.status === "denied" ? "revoked" : "expired",
      version: "1.0",
      responses: {
        essential: consent.category === "essential" && consent.status === "granted",
        analytics: consent.category === "analytics" && consent.status === "granted",
        marketing: consent.category === "marketing" && consent.status === "granted",
        thirdParty: consent.category === "thirdParty" && consent.status === "granted",
      },
    }));
  },
});

export const grant = mutation({
  args: {
    websiteId: v.id("websites"),
    category: cookieCategoryValidator,
    expiresAt: v.optional(v.number()),
    autoRenew: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    return await ctx.db.insert("consents", {
      userId: user._id,
      websiteId: args.websiteId,
      category: args.category,
      status: "granted",
      timestamp: Date.now(),
      expiresAt: args.expiresAt,
      autoRenew: args.autoRenew ?? false,
    });
  },
});

export const deny = mutation({
  args: {
    websiteId: v.id("websites"),
    category: cookieCategoryValidator,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    return await ctx.db.insert("consents", {
      userId: user._id,
      websiteId: args.websiteId,
      category: args.category,
      status: "denied",
      timestamp: Date.now(),
      autoRenew: false,
    });
  },
});

export const revoke = mutation({
  args: { consentId: v.id("consents") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const consent = await ctx.db.get(args.consentId);
    if (!consent || consent.userId !== user._id) {
      throw new Error("Consent not found");
    }

    await ctx.db.patch(args.consentId, {
      status: "denied",
      timestamp: Date.now(),
    });
  },
});
