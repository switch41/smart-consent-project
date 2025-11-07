import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

// ML Prediction Endpoints
http.route({
  path: "/api/ml/predict-tracker",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const body = await req.json();
      const { domain, requestPattern } = body;

      if (!domain || !requestPattern) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: domain, requestPattern" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const result = await ctx.runAction(api.mlPredictions.predictTrackerRisk, {
        domain,
        requestPattern,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

http.route({
  path: "/api/ml/predict-risk",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const body = await req.json();
      const { websiteUrl, cookieCount, trackerCount } = body;

      if (!websiteUrl || cookieCount === undefined || trackerCount === undefined) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: websiteUrl, cookieCount, trackerCount" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const result = await ctx.runAction(api.mlPredictions.predictPrivacyRisk, {
        websiteUrl,
        cookieCount,
        trackerCount,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

http.route({
  path: "/api/ml/analyze-policy",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const body = await req.json();
      const { policyText } = body;

      if (!policyText) {
        return new Response(
          JSON.stringify({ error: "Missing required field: policyText" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const result = await ctx.runAction(api.mlPredictions.analyzePolicy, {
        policyText,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

export default http;