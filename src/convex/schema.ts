import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export const cookieCategoryValidator = v.union(
  v.literal("essential"),
  v.literal("analytics"),
  v.literal("marketing"),
  v.literal("thirdParty")
);

export const consentStatusValidator = v.union(
  v.literal("granted"),
  v.literal("denied"),
  v.literal("expired")
);

export const riskLevelValidator = v.union(
  v.literal("Low"),
  v.literal("Medium"),
  v.literal("High"),
  v.literal("Critical")
);

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),
    privacyScore: v.optional(v.number()),
    gamificationPoints: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  }).index("by_token", ["tokenIdentifier"]),

  websites: defineTable({
    userId: v.id("users"),
    url: v.string(),
    name: v.string(),
    lastVisited: v.number(),
    visitCount: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_url", ["url"]),

  cookies: defineTable({
    userId: v.id("users"),
    websiteId: v.id("websites"),
    name: v.string(),
    domain: v.string(),
    category: cookieCategoryValidator,
    isThirdParty: v.boolean(),
    purpose: v.optional(v.string()),
    expirationDate: v.optional(v.number()),
  })
    .index("by_websiteId", ["websiteId"])
    .index("by_userId", ["userId"])
    .index("by_category", ["category"]),

  trackers: defineTable({
    userId: v.id("users"),
    websiteId: v.id("websites"),
    domain: v.string(),
    type: v.string(), // Analytics, Advertising, etc.
    blocked: v.boolean(),
    riskLevel: v.optional(v.string()),
    detectedAt: v.optional(v.number()),
  })
    .index("by_websiteId", ["websiteId"])
    .index("by_userId", ["userId"])
    .index("by_type", ["type"]),

  consents: defineTable({
    userId: v.id("users"),
    websiteId: v.id("websites"),
    category: cookieCategoryValidator,
    status: consentStatusValidator,
    timestamp: v.number(),
    expiresAt: v.optional(v.number()),
    autoRenew: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_websiteId", ["websiteId"]),

  riskAssessments: defineTable({
    userId: v.id("users"),
    websiteId: v.id("websites"),
    riskLevel: v.string(), // Low, Medium, High, Critical
    score: v.number(), // 0-100
    details: v.string(),
    factors: v.optional(v.array(v.string())),
    timestamp: v.number(),
  })
    .index("by_websiteId", ["websiteId"])
    .index("by_userId", ["userId"]),

  browserSessions: defineTable({
    userId: v.id("users"),
    sessionId: v.string(),
    startTime: v.number(),
    lastActivity: v.number(),
    isActive: v.boolean(),
    sitesVisited: v.array(v.string()),
    cookiesDetected: v.number(),
    trackersDetected: v.number(),
    isExpiringSoon: v.optional(v.boolean()),
  })
    .index("by_userId", ["userId"])
    .index("by_sessionId", ["sessionId"]),
});