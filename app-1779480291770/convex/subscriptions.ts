import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const subscribe = mutation({
  args: { email: v.string() },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq("email", args.email))
      .first();

    if (existing) {
      return {
        success: true,
        message: "Ya estás suscrito. ¡Gracias!",
      };
    }

    // Create new subscription
    await ctx.db.insert("subscriptions", {
      email: args.email,
      createdAt: Date.now(),
      confirmed: false,
    });

    return {
      success: true,
      message: "¡Suscrito! Recibirás las mejores convocatorias cada jueves.",
    };
  },
});