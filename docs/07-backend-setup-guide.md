# MarketAxis AI — Backend Setup Guide

## Architecture Overview

```
MarketAxis AI Backend
├── Convex (Real-time Database + Serverless Functions)
│   ├── Better Auth (Authentication)
│   │   ├── Email/Password sign-in
│   │   ├── GitHub OAuth
│   │   └── Google OAuth
│   ├── 11 Database Tables (schema.ts)
│   ├── 10 Query/Mutation Files
│   ├── 1 Agent Actions File (5 AI actions)
│   └── Lib Helpers
│       ├── llm.ts (Google Gemini)
│       ├── composio.ts (Social integrations)
│       └── prompts.ts (Agent system prompts)
├── Google Gemini (LLM)
└── Composio (Social platform actions)
```

## Quick Start

### 1. Create a Convex Project

```bash
cd app
npx convex dev
```

This will:
- Create a Convex project (choose a team or create one)
- Generate `_generated/` types
- Create `.env.local` with `CONVEX_DEPLOYMENT` and `VITE_CONVEX_URL`

### 2. Set Environment Variables

**On Convex (server-side — via CLI or dashboard):**

```bash
# Auth secret (required)
npx convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
npx convex env set SITE_URL "http://localhost:5173"

# GitHub OAuth (required for GitHub login + codebase features)
npx convex env set GITHUB_CLIENT_ID "your-github-client-id"
npx convex env set GITHUB_CLIENT_SECRET "your-github-client-secret"

# Google OAuth (optional, for Google login)
npx convex env set GOOGLE_CLIENT_ID "your-google-client-id"
npx convex env set GOOGLE_CLIENT_SECRET "your-google-client-secret"

# Google Gemini (required for AI features)
npx convex env set GOOGLE_GEMINI_API_KEY "your-gemini-api-key"

# Composio (required for social posting)
npx convex env set COMPOSIO_API_KEY "your-composio-api-key"
```

**In `.env.local` (auto-created by `npx convex dev`):**
```
CONVEX_DEPLOYMENT=dev:your-deployment
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

### 3. Generate Better Auth Schema

```bash
npx @better-auth/cli generate --config ./convex/betterAuth/auth.ts --output ./convex/betterAuth/schema.ts
```

### 4. Run Development

```bash
# Terminal 1: Convex backend
npm run dev:backend

# Terminal 2: Vite frontend
npm run dev
```

## External Service Setup

### GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Set Homepage URL: `http://localhost:5173`
4. Set Callback URL: `https://your-deployment.convex.site/api/auth/callback/github`
5. Copy Client ID and Secret

### Google OAuth
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `https://your-deployment.convex.site/api/auth/callback/google`
4. Copy Client ID and Secret

### Google Gemini API
1. Go to https://aistudio.google.com/app/apikey
2. Create an API key
3. Copy the key

### Composio
1. Go to https://composio.dev
2. Create account and get API key
3. Set up integrations for Twitter, LinkedIn, GitHub in the Composio dashboard

### DigitalOcean (Production Deployment)
- Convex handles the backend hosting
- For the frontend, deploy the Vite build to DigitalOcean App Platform:
  ```bash
  npm run build  # Creates dist/
  ```
- Set `VITE_CONVEX_URL` as an environment variable in DO App Platform

## File Reference

| File | Purpose |
|------|---------|
| `convex/schema.ts` | All 11 database tables |
| `convex/auth.config.ts` | Better Auth provider config |
| `convex/http.ts` | HTTP routes for auth endpoints |
| `convex/betterAuth/auth.ts` | Better Auth instance + OAuth config |
| `convex/betterAuth/schema.ts` | Auth-managed tables (user, session, etc.) |
| `convex/betterAuth/index.ts` | Adapter CRUD exports |
| `convex/betterAuth/convex.config.ts` | Component definition |
| `convex/convex.config.ts` | App-level component registration |
| `convex/users.ts` | User queries + mutations |
| `convex/appProfiles.ts` | App profile CRUD |
| `convex/strategies.ts` | Strategy query + upsert |
| `convex/contents.ts` | Content CRUD + status lifecycle |
| `convex/launchAssets.ts` | Launch asset management |
| `convex/socialAccounts.ts` | Connected accounts |
| `convex/activities.ts` | Activity feed |
| `convex/agentLogs.ts` | Execution tracking |
| `convex/githubRepos.ts` | GitHub repo management |
| `convex/codebaseAnalysis.ts` | Analysis results |
| `convex/resources.ts` | Document vault CRUD |
| `convex/agentActions.ts` | 5 server-side AI actions |
| `convex/lib/llm.ts` | Google Gemini wrapper |
| `convex/lib/composio.ts` | Composio API wrapper |
| `convex/lib/prompts.ts` | Agent system prompts |
| `src/lib/auth-client.ts` | Frontend auth hooks |
| `src/lib/convex-client.ts` | Convex React client |

## API Surface

### Queries (Real-time)
- `users.getCurrentUser` — Get authenticated user
- `appProfiles.getByUser` — Get user's app profile
- `strategies.getByProfile` — Get marketing strategy
- `contents.getByProfile` / `getByStatus` — Get content
- `launchAssets.getByProfile` — Get launch assets
- `socialAccounts.getByUser` — Get connected accounts
- `activities.getByUser` — Get activity feed
- `agentLogs.getByProfile` — Get execution logs
- `githubRepos.getByProfile` — Get connected repos
- `codebaseAnalysis.getByProfile` — Get analysis
- `resources.getByProfile` / `getByCategory` — Get documents

### Mutations
- `users.syncUser` / `toggleMode` — User management
- `appProfiles.create` / `update` — Profile CRUD
- `strategies.save` — Upsert strategy
- `contents.save` / `updateStatus` / `updateBody` — Content lifecycle
- `launchAssets.save` / `updateStatus` — Launch asset management
- `socialAccounts.connect` / `disconnect` — Account linking
- `activities.log` — Activity logging
- `resources.save` / `update` — Document management

### Actions (Server-side, async)
- `agentActions.generateStrategy` — AI strategy generation
- `agentActions.generateContent` — AI content creation
- `agentActions.generateLaunchKit` — Generate all launch assets
- `agentActions.generateLegalDocument` — Legal document generation
- `agentActions.postToSocial` — Post via Composio
