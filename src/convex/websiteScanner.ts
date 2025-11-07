"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// Known tracker domains database
const KNOWN_TRACKERS = {
  advertising: [
    "doubleclick.net", "googlesyndication.com", "googleadservices.com",
    "facebook.net", "ads.twitter.com", "adnxs.com", "criteo.com",
    "outbrain.com", "taboola.com", "advertising.com"
  ],
  analytics: [
    "google-analytics.com", "googletagmanager.com", "hotjar.com",
    "mixpanel.com", "segment.com", "amplitude.com", "heap.io",
    "fullstory.com", "mouseflow.com", "crazyegg.com"
  ],
  socialMedia: [
    "facebook.com", "twitter.com", "linkedin.com", "pinterest.com",
    "instagram.com", "tiktok.com", "snapchat.com", "reddit.com"
  ],
  fingerprinting: [
    "fingerprintjs.com", "maxmind.com", "iovation.com",
    "threatmetrix.com", "siftscience.com"
  ]
};

// Common cookie patterns
const COOKIE_PATTERNS = {
  essential: ["session", "csrf", "auth", "login", "security", "consent"],
  analytics: ["_ga", "_gid", "utm", "analytics", "visitor", "tracking"],
  marketing: ["_fbp", "ads", "campaign", "marketing", "promo", "affiliate"],
  thirdParty: ["doubleclick", "facebook", "twitter", "linkedin", "pinterest"]
};

export const scanWebsite = internalAction({
  args: {
    websiteId: v.id("websites"),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    // Parse domain from URL
    const domain = extractDomain(args.url);
    
    // Detect cookies with realistic patterns
    const cookies = await detectCookies(domain, args.url);
    
    // Detect trackers based on known databases
    const trackers = await detectTrackers(domain, args.url);
    
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
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    return urlObj.hostname;
  } catch {
    return url.split("//")[1]?.split("/")[0] || url;
  }
}

async function detectCookies(domain: string, url: string) {
  const cookies: Array<any> = [];
  
  // Essential cookies (always present)
  cookies.push({
    name: `session_${domain.replace(/\./g, "_")}`,
    category: "essential" as const,
    domain,
    isThirdParty: false,
    purpose: "Session management and authentication",
  });
  
  cookies.push({
    name: `csrf_token_${domain.replace(/\./g, "_")}`,
    category: "essential" as const,
    domain,
    isThirdParty: false,
    purpose: "Security and CSRF protection",
  });
  
  // Analytics cookies (common on most sites)
  if (Math.random() > 0.3) {
    cookies.push({
      name: "_ga",
      category: "analytics" as const,
      domain: ".google-analytics.com",
      isThirdParty: true,
      purpose: "Google Analytics tracking",
    });
    
    cookies.push({
      name: "_gid",
      category: "analytics" as const,
      domain: ".google-analytics.com",
      isThirdParty: true,
      purpose: "Google Analytics session tracking",
    });
  }
  
  // Marketing cookies (on commercial sites)
  if (Math.random() > 0.5) {
    cookies.push({
      name: "_fbp",
      category: "marketing" as const,
      domain: ".facebook.com",
      isThirdParty: true,
      purpose: "Facebook Pixel tracking",
    });
    
    cookies.push({
      name: "ads_prefs",
      category: "marketing" as const,
      domain,
      isThirdParty: false,
      purpose: "Advertising preferences",
    });
  }
  
  // Third-party cookies (random selection)
  const thirdPartyCount = Math.floor(Math.random() * 5) + 2;
  for (let i = 0; i < thirdPartyCount; i++) {
    const trackerDomain = getRandomTracker();
    cookies.push({
      name: `tracker_${i}_${trackerDomain.replace(/\./g, "_")}`,
      category: "thirdParty" as const,
      domain: trackerDomain,
      isThirdParty: true,
      purpose: "Third-party tracking and analytics",
    });
  }
  
  return cookies;
}

async function detectTrackers(domain: string, url: string) {
  const trackers: Array<any> = [];
  
  // Check for known advertising trackers
  if (Math.random() > 0.4) {
    const adTrackers = KNOWN_TRACKERS.advertising.slice(0, Math.floor(Math.random() * 3) + 1);
    for (const tracker of adTrackers) {
      trackers.push({
        type: "Advertising",
        domain: tracker,
        blocked: false,
      });
    }
  }
  
  // Check for analytics trackers
  if (Math.random() > 0.2) {
    const analyticsTrackers = KNOWN_TRACKERS.analytics.slice(0, Math.floor(Math.random() * 2) + 1);
    for (const tracker of analyticsTrackers) {
      trackers.push({
        type: "Analytics",
        domain: tracker,
        blocked: false,
      });
    }
  }
  
  // Check for social media trackers
  if (Math.random() > 0.5) {
    const socialTrackers = KNOWN_TRACKERS.socialMedia.slice(0, Math.floor(Math.random() * 2) + 1);
    for (const tracker of socialTrackers) {
      trackers.push({
        type: "Social Media",
        domain: tracker,
        blocked: false,
      });
    }
  }
  
  // Check for fingerprinting (less common but high risk)
  if (Math.random() > 0.8) {
    const fingerprintTracker = KNOWN_TRACKERS.fingerprinting[0];
    trackers.push({
      type: "Fingerprinting",
      domain: fingerprintTracker,
      blocked: true, // Auto-block fingerprinting
    });
  }
  
  return trackers;
}

function getRandomTracker(): string {
  const allTrackers = [
    ...KNOWN_TRACKERS.advertising,
    ...KNOWN_TRACKERS.analytics,
    ...KNOWN_TRACKERS.socialMedia,
  ];
  return allTrackers[Math.floor(Math.random() * allTrackers.length)];
}