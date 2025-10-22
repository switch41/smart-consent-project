import { mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User must be authenticated");

    const website1 = await ctx.db.insert("websites", {
      userId: user._id,
      name: "Example Website",
      url: "https://example.com",
      lastVisited: Date.now(),
      visitCount: 5,
    });

    const website2 = await ctx.db.insert("websites", {
      userId: user._id,
      name: "Shopping Site",
      url: "https://shop.example.com",
      lastVisited: Date.now() - 86400000,
      visitCount: 3,
    });

    await ctx.db.insert("cookies", {
      userId: user._id,
      websiteId: website1,
      name: "session_id",
      category: "essential",
      domain: "example.com",
      isThirdParty: false,
      purpose: "Session management",
      expiryDate: Date.now() + 86400000 * 30,
    });

    await ctx.db.insert("cookies", {
      userId: user._id,
      websiteId: website1,
      name: "_ga",
      category: "analytics",
      domain: "example.com",
      isThirdParty: true,
      purpose: "Google Analytics tracking",
      expiryDate: Date.now() + 86400000 * 730,
    });

    await ctx.db.insert("trackers", {
      userId: user._id,
      websiteId: website1,
      type: "Analytics",
      domain: "google-analytics.com",
      blocked: false,
      detectedAt: Date.now(),
    });

    await ctx.db.insert("trackers", {
      userId: user._id,
      websiteId: website2,
      type: "Marketing",
      domain: "facebook.com",
      blocked: true,
      detectedAt: Date.now(),
    });

    await ctx.db.insert("consents", {
      userId: user._id,
      websiteId: website1,
      category: "essential",
      status: "granted",
      timestamp: Date.now(),
      autoRenew: true,
    });

    await ctx.db.insert("consents", {
      userId: user._id,
      websiteId: website1,
      category: "analytics",
      status: "granted",
      timestamp: Date.now(),
      autoRenew: false,
    });

    await ctx.db.insert("riskAssessments", {
      userId: user._id,
      websiteId: website1,
      riskLevel: "medium",
      factors: ["Third-party cookies", "Analytics tracking"],
      score: 65,
      assessedAt: Date.now(),
    });

    await ctx.db.patch(user._id, {
      privacyScore: 75,
      gamificationPoints: 150,
    });

    return { success: true, message: "Seed data created successfully" };
  },
});