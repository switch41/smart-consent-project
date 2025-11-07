"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Model configuration for explainability
const MODEL_CONFIG = {
  privacyPolicy: {
    model: "mistralai/Mistral-7B-Instruct-v0.2",
    maxTokens: 500,
    temperature: 0.3,
    description: "NLP model for privacy policy analysis and clause extraction",
  },
  trackerClassification: {
    model: "mistralai/Mistral-7B-Instruct-v0.2",
    maxTokens: 200,
    temperature: 0.2,
    description: "Classification model for tracker type and risk assessment",
  },
  riskScoring: {
    model: "mistralai/Mistral-7B-Instruct-v0.2",
    maxTokens: 300,
    temperature: 0.4,
    description: "Regression model for personalized risk score calculation",
  },
};

export const analyzePrivacyPolicy = internalAction({
  args: {
    policyText: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const config = MODEL_CONFIG.privacyPolicy;
      const prompt = `Analyze this privacy policy and extract key information:
${args.policyText}

Provide a JSON response with:
1. dataCollection: What data is collected
2. dataPurpose: Why data is collected
3. dataSharing: Who data is shared with
4. userRights: What rights users have
5. complianceRisk: Risk level (low/medium/high)
6. summary: Brief summary
7. confidence: Confidence score (0-100)
8. reasoning: Explanation of the analysis`;

      const response = await hf.textGeneration({
        model: config.model,
        inputs: prompt,
        parameters: {
          max_new_tokens: config.maxTokens,
          temperature: config.temperature,
          top_p: 0.9,
        },
      });

      return {
        analysis: response.generated_text || "",
        timestamp: Date.now(),
        modelInfo: {
          name: config.model,
          description: config.description,
          parameters: {
            temperature: config.temperature,
            maxTokens: config.maxTokens,
          },
        },
        explainability: {
          method: "Transformer-based NLP analysis",
          features: ["Text extraction", "Clause classification", "Risk assessment"],
          confidence: extractConfidence(response.generated_text || ""),
        },
      };
    } catch (error) {
      console.error("Privacy policy analysis error:", error);
      return {
        analysis: "Unable to analyze privacy policy at this time.",
        timestamp: Date.now(),
        modelInfo: null,
        explainability: {
          method: "Fallback rule-based analysis",
          features: ["Basic text parsing"],
          confidence: 50,
        },
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
      const config = MODEL_CONFIG.trackerClassification;
      const prompt = `Classify this web tracker:
Domain: ${args.domain}
Request Pattern: ${args.requestPattern}

Provide:
1. Type: One of (Analytics, Advertising, Social Media, Fingerprinting, Essential)
2. Risk Level: One of (low, medium, high, critical)
3. Confidence Score: 0-100
4. Key Features: What patterns indicate this classification
5. Reasoning: Why this classification was chosen`;

      const response = await hf.textGeneration({
        model: config.model,
        inputs: prompt,
        parameters: {
          max_new_tokens: config.maxTokens,
          temperature: config.temperature,
          top_p: 0.85,
        },
      });

      const result = response.generated_text || "";
      const type = extractTrackerType(result);
      const riskLevel = extractRiskLevel(result);
      const confidence = extractConfidence(result);
      const features = extractKeyFeatures(result);
      
      return {
        type,
        riskLevel,
        reasoning: result,
        shouldBlock: riskLevel === "high" || riskLevel === "critical",
        modelInfo: {
          name: config.model,
          description: config.description,
          parameters: {
            temperature: config.temperature,
            maxTokens: config.maxTokens,
          },
        },
        explainability: {
          method: "ML-based classification",
          confidence,
          keyFeatures: features,
          decisionFactors: [
            `Domain pattern: ${args.domain}`,
            `Request type: ${args.requestPattern}`,
            `Risk threshold: ${riskLevel}`,
          ],
        },
      };
    } catch (error) {
      console.error("Tracker classification error:", error);
      return {
        type: "Unknown",
        riskLevel: "medium" as const,
        reasoning: "Classification unavailable",
        shouldBlock: false,
        modelInfo: null,
        explainability: {
          method: "Fallback rule-based classification",
          confidence: 50,
          keyFeatures: ["Domain analysis"],
          decisionFactors: ["Default medium risk assigned"],
        },
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
      const config = MODEL_CONFIG.riskScoring;
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
3. Key Risk Factors (list specific concerns)
4. Personalized Recommendations
5. Confidence Score (0-100)
6. Feature Importance: Which factors contributed most to the score`;

      const response = await hf.textGeneration({
        model: config.model,
        inputs: prompt,
        parameters: {
          max_new_tokens: config.maxTokens,
          temperature: config.temperature,
          top_p: 0.9,
        },
      });

      const result = response.generated_text || "";
      const score = extractRiskScore(result);
      const level = extractRiskLevel(result);
      const factors = extractRiskFactors(result);
      const confidence = extractConfidence(result);
      const featureImportance = calculateFeatureImportance(args);

      return {
        score,
        level,
        factors,
        analysis: result,
        modelInfo: {
          name: config.model,
          description: config.description,
          parameters: {
            temperature: config.temperature,
            maxTokens: config.maxTokens,
          },
        },
        explainability: {
          method: "Personalized ML regression",
          confidence,
          featureImportance,
          decisionPath: [
            `Base score calculated from cookies (${args.cookieCount}) and trackers (${args.trackerCount})`,
            `Adjusted based on user history (${args.userHistory.length} sites)`,
            `Final risk level: ${level}`,
          ],
          recommendations: generateRecommendations(score, level, args),
        },
      };
    } catch (error) {
      console.error("Personalized risk calculation error:", error);
      const score = Math.min(100, (args.cookieCount * 3) + (args.trackerCount * 5));
      const level = score < 25 ? "low" : score < 50 ? "medium" : score < 75 ? "high" : "critical";
      
      return {
        score,
        level,
        factors: ["Standard risk assessment applied"],
        analysis: "ML analysis unavailable",
        modelInfo: null,
        explainability: {
          method: "Fallback formula-based calculation",
          confidence: 70,
          featureImportance: calculateFeatureImportance(args),
          decisionPath: [
            `Formula: (cookies × 3) + (trackers × 5) = ${score}`,
            `Risk level determined by score threshold`,
          ],
          recommendations: generateRecommendations(score, level, args),
        },
      };
    }
  },
});

// Helper functions for parsing ML responses
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
  return 50;
}

function extractConfidence(text: string): number {
  const match = text.match(/confidence[:\s]+(\d+)/i);
  if (match) {
    return Math.min(100, Math.max(0, parseInt(match[1])));
  }
  return 75;
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

function extractKeyFeatures(text: string): Array<string> {
  const features: Array<string> = [];
  const lines = text.split("\n");
  
  for (const line of lines) {
    if (line.toLowerCase().includes("feature") || line.toLowerCase().includes("pattern")) {
      const cleaned = line.replace(/^[-*•]\s*/, "").trim();
      if (cleaned.length > 5 && cleaned.length < 150) {
        features.push(cleaned);
      }
    }
  }
  
  return features.length > 0 ? features : ["Domain analysis", "Request pattern matching"];
}

function calculateFeatureImportance(args: {
  cookieCount: number;
  trackerCount: number;
  userHistory: Array<{ url: string; riskLevel: string }>;
}): Record<string, number> {
  const total = args.cookieCount + args.trackerCount + args.userHistory.length;
  
  return {
    cookieCount: total > 0 ? (args.cookieCount / total) * 100 : 33,
    trackerCount: total > 0 ? (args.trackerCount / total) * 100 : 33,
    userHistory: total > 0 ? (args.userHistory.length / total) * 100 : 34,
  };
}

function generateRecommendations(
  score: number,
  level: string,
  args: { cookieCount: number; trackerCount: number }
): Array<string> {
  const recommendations: Array<string> = [];
  
  if (score > 70) {
    recommendations.push("Consider blocking third-party trackers");
    recommendations.push("Review and deny non-essential cookie consents");
  }
  
  if (args.trackerCount > 5) {
    recommendations.push("High tracker count detected - enable tracker blocking");
  }
  
  if (args.cookieCount > 10) {
    recommendations.push("Excessive cookies found - review consent preferences");
  }
  
  if (level === "critical") {
    recommendations.push("⚠️ Critical risk - avoid sharing sensitive data on this site");
  }
  
  return recommendations.length > 0 
    ? recommendations 
    : ["Your privacy settings look good - keep monitoring"];
}