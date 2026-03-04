import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./betterAuth/auth";

const http = httpRouter();

// cors: true handles all CORS preflight (OPTIONS) and response headers automatically.
// Required for client-side frameworks where auth server is on a different origin.
authComponent.registerRoutes(http, createAuth, { cors: true });

export default http;
