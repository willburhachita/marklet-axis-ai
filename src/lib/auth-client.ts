/**
 * Better Auth Client — Frontend
 *
 * This is used in React components to handle sign-in, sign-up,
 * sign-out, and session management on the client side.
 */

import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    plugins: [convexClient()],
});

// Re-export useful hooks
export const {
    signIn,
    signUp,
    signOut,
    useSession,
} = authClient;
