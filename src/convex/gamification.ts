import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getPoints = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return 0;
    
    return user.gamificationPoints ?? 0;
  },
});

export const addPoints = mutation({
  args: {
    points: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const currentPoints = user.gamificationPoints ?? 0;
    const newPoints = currentPoints + args.points;
    
    await ctx.db.patch(user._id, {
      gamificationPoints: newPoints,
    });
    
    return newPoints;
  },
});

export const getAchievements = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    
    const points = user.gamificationPoints ?? 0;
    const achievements = [];
    
    if (points >= 10) achievements.push({ name: "First Steps", description: "Earned 10 points" });
    if (points >= 50) achievements.push({ name: "Privacy Advocate", description: "Earned 50 points" });
    if (points >= 100) achievements.push({ name: "Privacy Expert", description: "Earned 100 points" });
    if (points >= 500) achievements.push({ name: "Privacy Master", description: "Earned 500 points" });
    
    return achievements;
  },
});
