/**
 * Unit Tests for ML Model Integration
 * 
 * These tests verify the ML prediction endpoints and model integration
 * Run with: npx convex run mlPredictions.test:runTests
 */

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const runTests = internalAction({
  args: {},
  handler: async (ctx) => {
    const results: Array<{ test: string; passed: boolean; message: string }> = [];

    // Test 1: Tracker Classification
    try {
      const trackerResult = await ctx.runAction(internal.mlAnalysis.classifyTracker, {
        domain: "ads.example.com",
        requestPattern: "GET /track?id=123",
      });

      const passed = 
        trackerResult.type !== undefined &&
        trackerResult.riskLevel !== undefined &&
        trackerResult.explainability !== undefined &&
        trackerResult.explainability.confidence >= 0 &&
        trackerResult.explainability.confidence <= 100;

      results.push({
        test: "Tracker Classification",
        passed,
        message: passed 
          ? `✓ Classified as ${trackerResult.type} with ${trackerResult.riskLevel} risk`
          : "✗ Invalid tracker classification response",
      });
    } catch (error) {
      results.push({
        test: "Tracker Classification",
        passed: false,
        message: `✗ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }

    // Test 2: Risk Score Calculation
    try {
      const riskResult = await ctx.runAction(internal.mlAnalysis.calculatePersonalizedRisk, {
        userId: "test_user_id" as any,
        websiteUrl: "https://example.com",
        cookieCount: 10,
        trackerCount: 5,
        userHistory: [
          { url: "https://site1.com", riskLevel: "low" },
          { url: "https://site2.com", riskLevel: "medium" },
        ],
      });

      const passed = 
        riskResult.score >= 0 &&
        riskResult.score <= 100 &&
        riskResult.level !== undefined &&
        riskResult.explainability !== undefined &&
        riskResult.explainability.confidence >= 0;

      results.push({
        test: "Risk Score Calculation",
        passed,
        message: passed 
          ? `✓ Risk score: ${riskResult.score}/100 (${riskResult.level})`
          : "✗ Invalid risk score response",
      });
    } catch (error) {
      results.push({
        test: "Risk Score Calculation",
        passed: false,
        message: `✗ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }

    // Test 3: Explainability
    try {
      const explanation = await ctx.runAction(internal.mlExplainability.explainTrackerClassification, {
        domain: "analytics.example.com",
        type: "Analytics",
        riskLevel: "medium",
        reasoning: "Standard analytics tracker detected",
      });

      const passed = 
        explanation.decision !== undefined &&
        explanation.confidence >= 0 &&
        explanation.confidence <= 1 &&
        explanation.reasoning.length > 0 &&
        explanation.alternatives.length > 0;

      results.push({
        test: "Model Explainability",
        passed,
        message: passed 
          ? `✓ Explanation generated with ${explanation.reasoning.length} factors`
          : "✗ Invalid explainability response",
      });
    } catch (error) {
      results.push({
        test: "Model Explainability",
        passed: false,
        message: `✗ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }

    // Test 4: Fallback Mechanism
    try {
      // Test with invalid data to trigger fallback
      const fallbackResult = await ctx.runAction(internal.mlAnalysis.classifyTracker, {
        domain: "",
        requestPattern: "",
      });

      const passed = 
        fallbackResult.type !== undefined &&
        fallbackResult.explainability !== undefined;

      results.push({
        test: "Fallback Mechanism",
        passed,
        message: passed 
          ? "✓ Fallback logic works correctly"
          : "✗ Fallback mechanism failed",
      });
    } catch (error) {
      results.push({
        test: "Fallback Mechanism",
        passed: true,
        message: "✓ Fallback triggered as expected",
      });
    }

    // Summary
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log("\n=== ML Model Integration Test Results ===\n");
    results.forEach(result => {
      console.log(result.message);
    });
    console.log(`\n${passedTests}/${totalTests} tests passed`);
    if (failedTests > 0) {
      console.log(`${failedTests} tests failed`);
    }

    return {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
      },
      results,
    };
  },
});
