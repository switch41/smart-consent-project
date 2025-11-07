"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";

/**
 * Model Explainability Module
 * Provides transparency into ML model decisions
 */

export interface ExplanationResult {
  decision: string;
  confidence: number;
  reasoning: Array<{
    factor: string;
    impact: "high" | "medium" | "low";
    description: string;
  }>;
  alternatives: Array<{
    option: string;
    probability: number;
  }>;
}

export const explainTrackerClassification = internalAction({
  args: {
    domain: v.string(),
    type: v.string(),
    riskLevel: v.string(),
    reasoning: v.string(),
  },
  handler: async (ctx, args): Promise<ExplanationResult> => {
    // Parse ML reasoning to extract key factors
    const factors = extractFactors(args.reasoning, args.type, args.riskLevel);
    
    return {
      decision: `Classified as ${args.type} with ${args.riskLevel} risk`,
      confidence: calculateConfidence(args.riskLevel),
      reasoning: factors,
      alternatives: generateAlternatives(args.type),
    };
  },
});

export const explainRiskScore = internalAction({
  args: {
    score: v.number(),
    level: v.string(),
    factors: v.array(v.string()),
    analysis: v.string(),
  },
  handler: async (ctx, args): Promise<ExplanationResult> => {
    const reasoning = args.factors.map((factor, index) => ({
      factor,
      impact: determineImpact(factor, args.score),
      description: generateFactorDescription(factor),
    }));

    return {
      decision: `Risk Score: ${args.score}/100 (${args.level})`,
      confidence: args.score / 100,
      reasoning,
      alternatives: [
        { option: "Block all trackers", probability: 0.95 },
        { option: "Allow essential only", probability: 0.85 },
        { option: "Custom filtering", probability: 0.70 },
      ],
    };
  },
});

// Helper functions
function extractFactors(
  reasoning: string,
  type: string,
  riskLevel: string
): Array<{ factor: string; impact: "high" | "medium" | "low"; description: string }> {
  const factors: Array<{ factor: string; impact: "high" | "medium" | "low"; description: string }> = [];

  // Domain-based factor
  factors.push({
    factor: "Tracker Type",
    impact: type === "Advertising" || type === "Fingerprinting" ? "high" : "medium",
    description: `Identified as ${type} tracker based on request patterns`,
  });

  // Risk-based factor
  factors.push({
    factor: "Risk Assessment",
    impact: riskLevel === "high" || riskLevel === "critical" ? "high" : "low",
    description: `${riskLevel} risk level determined by privacy impact analysis`,
  });

  // Behavioral factor
  if (reasoning.toLowerCase().includes("third-party")) {
    factors.push({
      factor: "Third-Party Data Sharing",
      impact: "high",
      description: "Shares data with external domains",
    });
  }

  return factors;
}

function calculateConfidence(riskLevel: string): number {
  const confidenceMap: Record<string, number> = {
    critical: 0.95,
    high: 0.85,
    medium: 0.70,
    low: 0.60,
  };
  return confidenceMap[riskLevel] || 0.50;
}

function generateAlternatives(type: string): Array<{ option: string; probability: number }> {
  const alternatives: Array<{ option: string; probability: number }> = [
    { option: type, probability: 0.85 },
  ];

  // Add similar tracker types
  if (type === "Advertising") {
    alternatives.push({ option: "Marketing", probability: 0.60 });
    alternatives.push({ option: "Analytics", probability: 0.40 });
  } else if (type === "Analytics") {
    alternatives.push({ option: "Essential", probability: 0.50 });
    alternatives.push({ option: "Advertising", probability: 0.30 });
  }

  return alternatives;
}

function determineImpact(factor: string, score: number): "high" | "medium" | "low" {
  if (score > 70) return "high";
  if (score > 40) return "medium";
  return "low";
}

function generateFactorDescription(factor: string): string {
  const descriptions: Record<string, string> = {
    "High number of cookies detected": "Website uses excessive cookies for tracking",
    "Multiple third-party trackers found": "External services monitoring your activity",
    "Excessive data collection": "Collects more data than necessary",
    "Aggressive tracking behavior": "Persistent cross-site tracking detected",
    "Standard risk factors applied": "Normal tracking patterns observed",
  };
  return descriptions[factor] || factor;
}
