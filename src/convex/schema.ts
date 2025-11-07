import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

export const cookieCategoryValidator = v.union(
  v.literal("essential"),
  v.literal("analytics"),
  v.literal("marketing"),
  v.literal("thirdParty"),
);

export const consentStatusValidator = v.union(
  v.literal("granted"),
  v.literal("denied"),
  v.literal("pending"),
);

export const riskLevelValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("critical"),
);

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      privacyScore: v.optional(v.number()),
      gamificationPoints: v.optional(v.number()),
    }).index("email", ["email"]),

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
      category: cookieCategoryValidator,
      domain: v.string(),
      expiryDate: v.optional(v.number()),
      isThirdParty: v.boolean(),
      purpose: v.optional(v.string()),
    })
      .index("by_userId", ["userId"])
      .index("by_websiteId", ["websiteId"]),

    trackers: defineTable({
      userId: v.id("users"),
      websiteId: v.id("websites"),
      type: v.string(),
      domain: v.string(),
      blocked: v.boolean(),
      detectedAt: v.number(),
    })
      .index("by_userId", ["userId"])
      .index("by_websiteId", ["websiteId"]),

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
      riskLevel: riskLevelValidator,
      factors: v.array(v.string()),
      score: v.number(),
      assessedAt: v.number(),
    })
      .index("by_userId", ["userId"])
      .index("by_websiteId", ["websiteId"]),

    browserSessions: defineTable({
      userId: v.id("users"),
      sessionId: v.string(),
      startTime: v.number(),
      lastActivity: v.number(),
      isActive: v.boolean(),
      cookiesDetected: v.number(),
      trackersDetected: v.number(),
      sitesVisited: v.array(v.string()),
    })
      .index("by_userId", ["userId"])
      .index("by_sessionId", ["sessionId"])
      .index("by_isActive", ["isActive"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;