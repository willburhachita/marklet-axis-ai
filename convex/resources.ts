import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all resources for an app profile.
 */
export const getByProfile = query({
    args: { appProfileId: v.id("appProfiles") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("resources")
            .withIndex("by_profile", (q) => q.eq("appProfileId", args.appProfileId))
            .collect();
    },
});

/**
 * Get resources filtered by category.
 */
export const getByCategory = query({
    args: {
        appProfileId: v.id("appProfiles"),
        category: v.union(
            v.literal("legal"),
            v.literal("marketing"),
            v.literal("technical"),
            v.literal("other")
        ),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("resources")
            .withIndex("by_category", (q) =>
                q
                    .eq("appProfileId", args.appProfileId)
                    .eq("category", args.category)
            )
            .collect();
    },
});

/**
 * Get a single resource by ID.
 */
export const getById = query({
    args: { resourceId: v.id("resources") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.resourceId);
    },
});

/**
 * Save a new resource.
 */
export const save = mutation({
    args: {
        appProfileId: v.id("appProfiles"),
        type: v.string(),
        title: v.string(),
        body: v.string(),
        category: v.union(
            v.literal("legal"),
            v.literal("marketing"),
            v.literal("technical"),
            v.literal("other")
        ),
        status: v.union(
            v.literal("draft"),
            v.literal("final"),
            v.literal("archived")
        ),
        generatedBy: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("resources", {
            ...args,
            version: 1,
            createdAt: now,
            updatedAt: now,
        });
    },
});

/**
 * Update a resource (creates a new version).
 */
export const update = mutation({
    args: {
        resourceId: v.id("resources"),
        title: v.optional(v.string()),
        body: v.optional(v.string()),
        status: v.optional(
            v.union(
                v.literal("draft"),
                v.literal("final"),
                v.literal("archived")
            )
        ),
    },
    handler: async (ctx, args) => {
        const { resourceId, ...updates } = args;
        const existing = await ctx.db.get(resourceId);
        if (!existing) throw new Error("Resource not found");

        const filtered: Record<string, unknown> = {
            updatedAt: Date.now(),
            version: existing.version + 1,
        };
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) filtered[key] = value;
        }
        await ctx.db.patch(resourceId, filtered);
    },
});
