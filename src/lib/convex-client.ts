/**
 * Convex Client Provider
 *
 * Wraps the app with ConvexProviderWithAuth for real-time data
 * and authenticated queries/mutations.
 */

import { ConvexProvider, ConvexReactClient } from "convex/react";

// The Convex URL is set in .env.local
const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
    console.warn(
        "VITE_CONVEX_URL not set. Convex features will not work.\n" +
        "Run `npx convex dev` and add VITE_CONVEX_URL to your .env.local file."
    );
}

export const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export { ConvexProvider };
