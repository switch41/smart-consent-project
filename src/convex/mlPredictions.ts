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

      const explanation = await ctx.runAction(internal.mlExplainability.explainTrackerClassification, {
        domain: args.domain,
        type: classification.type,
        riskLevel: classification.riskLevel,
        reasoning: classification.reasoning,
      });

      return {
        success: true,
        prediction: {
          type: classification.type,
          riskLevel: classification.riskLevel,
          shouldBlock: classification.shouldBlock,
          confidence: classification.explainability.confidence,
        },
        explanation: {
          decision: explanation.decision,
          confidence: explanation.confidence,
          factors: explanation.reasoning,
          alternatives: explanation.alternatives,
        },
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
      const userHistory = await ctx.runQuery(internal.websites.internalGetUserHistory, {
        userId: userId.subject as Id<"users">,
        limit: 10,
      });

      const riskAnalysis = await ctx.runAction(internal.mlAnalysis.calculatePersonalizedRisk, {
        userId: userId.subject as Id<"users">,
        websiteUrl: args.websiteUrl,
        cookieCount: args.cookieCount,
        trackerCount: args.trackerCount,
        userHistory: userHistory || [],
      });

      const explanation = await ctx.runAction(internal.mlExplainability.explainRiskScore, {
        score: riskAnalysis.score,
        level: riskAnalysis.level,
        factors: riskAnalysis.factors,
        analysis: riskAnalysis.analysis,
      });

      return {
        success: true,
        prediction: {
          score: riskAnalysis.score,
          level: riskAnalysis.level,
          factors: riskAnalysis.factors,
          confidence: riskAnalysis.explainability.confidence,
        },
        explanation: {
          decision: explanation.decision,
          confidence: explanation.confidence,
          reasoning: explanation.reasoning,
          recommendations: riskAnalysis.explainability.recommendations,
        },
        modelInfo: riskAnalysis.modelInfo,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Prediction failed",
        fallback: {
          score: 50,
          level: "medium",
          factors: ["Standard risk assessment applied"],
          confidence: 70,
        },
      };
    }
  },
});

export const analyzePrivacyPolicyText = action({
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
        modelInfo: analysis.modelInfo,
        explainability: analysis.explainability,
        timestamp: analysis.timestamp,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
        fallback: {
          analysis: "Unable to analyze privacy policy at this time.",
          confidence: 50,
        },
      };
    }
  },
});
