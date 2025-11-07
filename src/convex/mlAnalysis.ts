"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export const analyzePrivacyPolicy = internalAction({
  args: {
    policyText: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Use NLP model to extract key privacy clauses
      const prompt = `Analyze this privacy policy and extract key information:
${args.policyText}

Provide a JSON response with:
1. dataCollection: What data is collected
2. dataPurpose: Why data is collected
3. dataSharing: Who data is shared with
4. userRights: What rights users have
5. complianceRisk: Risk level (low/medium/high)
6. summary: Brief summary`;

      const response = await hf.textGeneration({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.3,
          top_p: 0.9,
        },
      });

      return {
        analysis: response.generated_text || "",
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Privacy policy analysis error:", error);
      return {
        analysis: "Unable to analyze privacy policy at this time.",
        timestamp: Date.now(),
      };
    }
  },
});

export const classifyTracker = internalAction({
  args: {
    domain: v.string(),
    requestPattern: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Use ML classification to identify tracker type and risk
      const prompt = `Classify this web tracker:
Domain: ${args.domain}
Request Pattern: ${args.requestPattern}

Classify as one of: Analytics, Advertising, Social Media, Fingerprinting, Essential
Risk Level: low, medium, high, critical
Provide reasoning.`;

      const response = await hf.textGeneration({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.2,
          top_p: 0.85,
        },
      });

      const result = response.generated_text || "";
      
      // Parse the response to extract classification
      const type = extractTrackerType(result);
      const riskLevel = extractRiskLevel(result);
      
      return {
        type,
        riskLevel,
        reasoning: result,
        shouldBlock: riskLevel === "high" || riskLevel === "critical",
      };
    } catch (error) {
      console.error("Tracker classification error:", error);
      // Fallback to rule-based classification
      return {
        type: "Unknown",
        riskLevel: "medium" as const,
        reasoning: "Classification unavailable",
        shouldBlock: false,
      };
    }
  },
});

export const calculatePersonalizedRisk = internalAction({
  args: {
    userId: v.id("users"),
    websiteUrl: v.string(),
    cookieCount: v.number(),
    trackerCount: v.number(),
    userHistory: v.array(v.object({
      url: v.string(),
      riskLevel: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    try {
      // Use ML regression to calculate personalized risk score
      const historyContext = args.userHistory
        .map(h => `${h.url}: ${h.riskLevel}`)
        .join(", ");

      const prompt = `Calculate personalized privacy risk score:
Website: ${args.websiteUrl}
Cookies: ${args.cookieCount}
Trackers: ${args.trackerCount}
User History: ${historyContext}

Provide:
1. Risk Score (0-100)
2. Risk Level (low/medium/high/critical)
3. Key Risk Factors
4. Personalized Recommendations`;

      const response = await hf.textGeneration({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.4,
          top_p: 0.9,
        },
      });

      const result = response.generated_text || "";
      const score = extractRiskScore(result);
      const level = extractRiskLevel(result);
      const factors = extractRiskFactors(result);

      return {
        score,
        level,
        factors,
        analysis: result,
      };
    } catch (error) {
      console.error("Personalized risk calculation error:", error);
      // Fallback to formula-based calculation
      const score = Math.min(100, (args.cookieCount * 3) + (args.trackerCount * 5));
      return {
        score,
        level: score < 25 ? "low" : score < 50 ? "medium" : score < 75 ? "high" : "critical",
        factors: ["Standard risk assessment applied"],
        analysis: "ML analysis unavailable",
      };
    }
  },
});

// Helper functions to parse ML responses
function extractTrackerType(text: string): string {
  const types = ["Analytics", "Advertising", "Social Media", "Fingerprinting", "Essential"];
  for (const type of types) {
    if (text.toLowerCase().includes(type.toLowerCase())) {
      return type;
    }
  }
  return "Unknown";
}

function extractRiskLevel(text: string): "low" | "medium" | "high" | "critical" {
  const lower = text.toLowerCase();
  if (lower.includes("critical")) return "critical";
  if (lower.includes("high")) return "high";
  if (lower.includes("medium")) return "medium";
  return "low";
}

function extractRiskScore(text: string): number {
  const match = text.match(/score[:\s]+(\d+)/i);
  if (match) {
    return Math.min(100, Math.max(0, parseInt(match[1])));
  }
  return 50; // Default middle score
}

function extractRiskFactors(text: string): Array<string> {
  const factors: Array<string> = [];
  const lines = text.split("\n");
  
  for (const line of lines) {
    if (line.includes("factor") || line.includes("risk") || line.includes("-")) {
      const cleaned = line.replace(/^[-*•]\s*/, "").trim();
      if (cleaned.length > 10 && cleaned.length < 200) {
        factors.push(cleaned);
      }
    }
  }
  
  return factors.length > 0 ? factors : ["Standard risk factors applied"];
}
