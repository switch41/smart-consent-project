import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const scanWebsite = action({
  args: {
    url: v.string(),
  },
  handler: async (ctx, args): Promise<{ cookiesFound: number; trackersFound: number }> => {
    // Get current user
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if website already exists
    const existingWebsite = await ctx.runQuery(internal.websites.internalGetByUrl, {
      url: args.url,
      userId: userId.subject as Id<"users">,
    });

    let websiteId: Id<"websites">;

    if (existingWebsite) {
      // Update visit count
      await ctx.runMutation(internal.websites.internalUpdateVisit, {
        websiteId: existingWebsite._id,
      });
      websiteId = existingWebsite._id;
    } else {
      // Create new website entry
      websiteId = await ctx.runMutation(internal.websites.internalCreate, {
        url: args.url,
        name: args.url,
        userId: userId.subject as Id<"users">,
      });
    }

    // Run the actual scan
    const result = await ctx.runAction(internal.websiteScanner.scanWebsite, {
      websiteId,
      url: args.url,
    });

    return result;
  },
});