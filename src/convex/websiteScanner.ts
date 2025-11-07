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
    // Simulate website scanning with ML-enhanced detection
    const cookies = await simulateCookieDetection(args.url);
    const trackers = await simulateTrackerDetection(args.url);
    
    // Store cookies with ML classification
    for (const cookie of cookies) {
      await ctx.runMutation(internal.websiteScannerMutations.storeCookie, {
        websiteId: args.websiteId,
        ...cookie,
      });
    }
    
    // Store trackers with ML-based risk assessment
    for (const tracker of trackers) {
      // Use ML to classify tracker (if API key is available)
      let trackerData = tracker;
      try {
        const mlClassification = await ctx.runAction(internal.mlAnalysis.classifyTracker, {
          domain: tracker.domain,
          requestPattern: tracker.type,
        });
        
        trackerData = {
          ...tracker,
          type: mlClassification.type,
          blocked: mlClassification.shouldBlock,
        };
      } catch (error) {
        console.log("ML classification unavailable, using rule-based");
      }
      
      await ctx.runMutation(internal.websiteScannerMutations.storeTracker, {
        websiteId: args.websiteId,
        ...trackerData,
      });
    }
    
    // ML-enhanced risk assessment
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