import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const startSession = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    // End any existing active sessions
    const activeSessions = await ctx.db
      .query("browserSessions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    for (const session of activeSessions) {
      if (session.isActive) {
        await ctx.db.patch(session._id, { isActive: false });
      }
    }

    // Create new session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionDocId = await ctx.db.insert("browserSessions", {
      userId: user._id,
      sessionId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      isActive: true,
      cookiesDetected: 0,
      trackersDetected: 0,
      sitesVisited: [],
    });

    return { sessionId, sessionDocId };
  },
});

export const getActiveSession = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    return await ctx.db
      .query("browserSessions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
  },
});

export const updateSessionActivity = mutation({
  args: {
    sessionId: v.string(),
    siteUrl: v.optional(v.string()),
    cookiesCount: v.optional(v.number()),
    trackersCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const session = await ctx.db
      .query("browserSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session || session.userId !== user._id) {
      throw new Error("Session not found");
    }

    const updates: any = {
      lastActivity: Date.now(),
    };

    if (args.siteUrl && !session.sitesVisited.includes(args.siteUrl)) {
      updates.sitesVisited = [...session.sitesVisited, args.siteUrl];
    }

    if (args.cookiesCount !== undefined) {
      updates.cookiesDetected = session.cookiesDetected + args.cookiesCount;
    }

    if (args.trackersCount !== undefined) {
      updates.trackersDetected = session.trackersDetected + args.trackersCount;
    }

    await ctx.db.patch(session._id, updates);
  },
});

export const endSession = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const session = await ctx.db
      .query("browserSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session || session.userId !== user._id) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(session._id, { isActive: false });
  },
});

export const getSessionStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const activeSession = await ctx.db
      .query("browserSessions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!activeSession) return null;

    const duration = Date.now() - activeSession.startTime;
    const durationMinutes = Math.floor(duration / 60000);

    return {
      sessionId: activeSession.sessionId,
      duration: durationMinutes,
      sitesVisited: activeSession.sitesVisited.length,
      cookiesDetected: activeSession.cookiesDetected,
      trackersDetected: activeSession.trackersDetected,
      startTime: activeSession.startTime,
    };
  },
});
