"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Public API endpoint for ML predictions
 * Provides direct access to ML model predictions
 */

export const predictTrackerRisk = action({
  args: {
    domain: v.string(),
    requestPattern: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const classification = await ctx.runAction(internal.mlAnalysis.classifyTracker, {
        domain: args.domain,
        requestPattern: args.requestPattern,
      });

      return {
        success: true,
        prediction: {
          type: classification.type,
          riskLevel: classification.riskLevel,
          shouldBlock: classification.shouldBlock,
          confidence: classification.explainability.confidence,
          reasoning: classification.reasoning,
        },
        explainability: classification.explainability,
        modelInfo: classification.modelInfo,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Prediction failed",
        fallback: {
          type: "Unknown",
          riskLevel: "medium",
          shouldBlock: false,
          confidence: 50,
        },
      };
    }
  },
});

export const predictPrivacyRisk = action({
  args: {
    websiteUrl: v.string(),
    cookieCount: v.number(),
    trackerCount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    try {
      // Get user history for personalization
      const userHistory = await ctx.runQuery(internal.mlPredictions.getUserHistory, {
        userId: userId.subject,
      });

      const riskAnalysis = await ctx.runAction(internal.mlAnalysis.calculatePersonalizedRisk, {
        userId: userId.subject,
        websiteUrl: args.websiteUrl,
        cookieCount: args.cookieCount,
        trackerCount: args.trackerCount,
        userHistory,
      });

      return {
        success: true,
        prediction: {
          score: riskAnalysis.score,
          level: riskAnalysis.level,
          factors: riskAnalysis.factors,
        },
        explainability: riskAnalysis.explainability,
        modelInfo: riskAnalysis.modelInfo,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Risk prediction failed",
        fallback: {
          score: Math.min(100, (args.cookieCount * 3) + (args.trackerCount * 5)),
          level: "medium",
          factors: ["Standard risk assessment applied"],
        },
      };
    }
  },
});

export const analyzePolicy = action({
  args: {
    policyText: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const analysis = await ctx.runAction(internal.mlAnalysis.analyzePrivacyPolicy, {
        policyText: args.policyText,
      });

      return {
        success: true,
        analysis: analysis.analysis,
        explainability: analysis.explainability,
        modelInfo: analysis.modelInfo,
        timestamp: analysis.timestamp,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Policy analysis failed",
        fallback: {
          analysis: "Unable to analyze privacy policy at this time.",
          explainability: {
            method: "Fallback rule-based analysis",
            features: ["Basic text parsing"],
            confidence: 50,
          },
        },
      };
    }
  },
});
