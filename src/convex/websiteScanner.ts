"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const scanWebsite = internalAction({
  args: {
    websiteId: v.id("websites"),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    // Simulate website scanning
    const cookies = await simulateCookieDetection(args.url);
    const trackers = await simulateTrackerDetection(args.url);
    
    // Store cookies
    for (const cookie of cookies) {
      await ctx.runMutation(internal.websiteScannerMutations.storeCookie, {
        websiteId: args.websiteId,
        ...cookie,
      });
    }
    
    // Store trackers
    for (const tracker of trackers) {
      await ctx.runMutation(internal.websiteScannerMutations.storeTracker, {
        websiteId: args.websiteId,
        ...tracker,
      });
    }
    
    // Assess risk
    await ctx.runMutation(internal.websiteScannerMutations.assessRisk, {
      websiteId: args.websiteId,
      cookieCount: cookies.length,
      trackerCount: trackers.length,
    });
    
    return {
      cookiesFound: cookies.length,
      trackersFound: trackers.length,
    };
  },
});

// Helper functions
async function simulateCookieDetection(url: string) {
  const categories = ["essential", "analytics", "marketing", "thirdParty"] as const;
  const cookieCount = Math.floor(Math.random() * 15) + 5;
  
  return Array.from({ length: cookieCount }, (_, i) => ({
    name: `cookie_${i}_${url.split("//")[1]?.split("/")[0] || "unknown"}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    domain: url.split("//")[1]?.split("/")[0] || "unknown",
    isThirdParty: Math.random() > 0.6,
    purpose: "Data collection and analytics",
  }));
}

async function simulateTrackerDetection(url: string) {
  const types = ["Analytics", "Advertising", "Social Media", "Fingerprinting"];
  const trackerCount = Math.floor(Math.random() * 8) + 2;
  
  return Array.from({ length: trackerCount }, (_, i) => ({
    type: types[Math.floor(Math.random() * types.length)],
    domain: `tracker${i}.example.com`,
    blocked: Math.random() > 0.5,
  }));
}
