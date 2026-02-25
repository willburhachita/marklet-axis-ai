import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the strategy for an app profile.
 */
export const getByProfile = query({
    args: { appProfileId: v.id("appProfiles") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("strategies")
            .withIndex("by_profile", (q) => q.eq("appProfileId", args.appProfileId))
            .first();
    },
});

/**
 * Save or update a strategy.
 */
export const save = mutation({
    args: {
        appProfileId: v.id("appProfiles"),
        positioning: v.string(),
        brandVoice: v.object({
            tone: v.string(),
            personality: v.string(),
            doList: v.array(v.string()),
            dontList: v.array(v.string()),
        }),
        contentCalendar: v.array(
            v.object({
                day: v.number(),
                title: v.string(),
                platform: v.string(),
                contentType: v.string(),
            })
        ),
        launchRoadmap: v.array(
            v.object({
                week: v.number(),
                title: v.string(),
                tasks: v.array(v.string()),
            })
        ),
        targetCommunities: v.array(
            v.object({
                name: v.string(),
                platform: v.string(),
                url: v.optional(v.string()),
            })
        ),
        differentiators: v.array(v.string()),
        pricingPosition: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Check if strategy already exists for this profile
        const existing = await ctx.db
            .query("strategies")
            .withIndex("by_profile", (q) => q.eq("appProfileId", args.appProfileId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                ...args,
                updatedAt: now,
            });
            return existing._id;
        }

        return await ctx.db.insert("strategies", {
            ...args,
            createdAt: now,
            updatedAt: now,
        });
    },
});
