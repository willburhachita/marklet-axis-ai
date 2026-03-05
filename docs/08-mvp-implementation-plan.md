# MarketAxis AI — MVP Implementation Plan

> **Rule: NO dead ends.** Every button, icon, card, and link in the UI must either perform a working action or navigate to a working destination. No placeholder toasts, no "coming soon" buttons, no noop handlers.

---

## Status Legend
- ✅ **DONE** — Complete and working
- 🔨 **IN PROGRESS** — Currently being built
- ⬜ **TODO** — Not started

---

## What Is Done

| Item | Status |
|------|--------|
| Landing page (`/`) — dark mode, Sana-style, fully scrollable | ✅ DONE |
| Auth page (`/auth`) — Sign In / Sign Up toggle | ✅ DONE |
| GitHub OAuth + Google OAuth buttons (UI wired) | ✅ DONE |
| Email/password form + validation | ✅ DONE |
| Route structure — Landing, Auth, Dashboard routes separated | ✅ DONE |
| All Convex backend tables + functions deployed | ✅ DONE |
| Better Auth server config (`convex/betterAuth/auth.ts`) | ✅ DONE |
| Better Auth client config (`src/lib/auth-client.ts`) | ✅ DONE |
| `convex/users.ts` — syncUser, getCurrentUser, toggleMode | ✅ DONE |
| Generated product images (logo, dashboard, content studio) | ✅ DONE |
| Scroll bug fixed (overflow:hidden scoped to .app-layout) | ✅ DONE |

---

## Phase 1 (NOW): Full Auth Implementation

This is the current focus. Wire the auth UI to Better Auth + Convex so real users can sign in, get a session, and reach the dashboard.

### 1.1 Wire ConvexProvider in `main.jsx`
```
File: src/main.jsx

Action:
- Import ConvexProvider from 'convex/react'
- Import convex client from src/lib/convex-client.ts
- Wrap <App /> with <ConvexProvider client={convex}>
- This makes useQuery / useMutation available everywhere
```

### 1.2 Connect Auth.jsx to Better Auth
```
File: src/pages/Auth.jsx

Replace the stub handlers:
- handleSocialAuth('github') → signIn.social({ provider: 'github', callbackURL: '/auth/callback' })
- handleSocialAuth('google') → signIn.social({ provider: 'google', callbackURL: '/auth/callback' })
- handleSubmit (sign in) → signIn.email({ email, password })
- handleSubmit (sign up) → signUp.email({ email, password, name })

After successful auth:
- Call useMutation(api.users.syncUser) to create/update our Convex users table
- Check if user has an appProfile via useQuery(api.appProfiles.getByUser)
  - If NO profile → redirect to /onboarding
  - If YES profile → redirect to /overview

Free trial:
- New users get plan = 'free' automatically in syncUser mutation
- Free trial badge shown in sidebar showing "Free Trial" plan
```

### 1.3 OAuth Callback Route
```
File: src/pages/AuthCallback.jsx (NEW)
Route: /auth/callback

Purpose:
- Better Auth social providers redirect here after OAuth
- Extract session from URL, call syncUser, redirect to /onboarding or /overview
- Show "Completing sign in..." loading state while processing
```

### 1.4 AuthGuard Component
```
File: src/components/AuthGuard.jsx (ALREADY IN PLAN — NOW BUILDING)

Logic:
- useSession() → if loading show skeleton
- If no session → redirect to /auth
- If session + no appProfile → redirect to /onboarding  
- If session + profile → render children

Wire into App.jsx:
  <Route element={<AuthGuard><Layout .../></AuthGuard>}>
    ... dashboard routes
  </Route>
```

### 1.5 Onboarding Page
```
File: src/pages/Onboarding.jsx (NEW)
Route: /onboarding (requires auth, no profile)

Step 1: App Profile
- App name, description, target audience, platforms, region, stage, monetization
- Submit → useMutation(api.appProfiles.create)(formData)

Step 2: Generate Strategy (or skip)
- "Generate My Strategy" → useAction(api.agentActions.generateStrategy)
- Show animated loading steps while generating
- On complete → redirect to /overview

Free trial note:
- Show "You are on the Free Trial plan" banner
- Free plan limits: 1 profile, 10 content pieces, no autopilot
```

### 1.6 Dashboard: Real User Data
```
File: src/components/layout/Layout.jsx

Replace mock user:
- const user = useQuery(api.users.getCurrentUser)
- Show user.name in sidebar footer
- Show user.plan badge (free → "Free Trial", indie → "Indie", etc.)
- Sign Out button → calls signOut() → redirect to /

File: src/App.jsx
- Pass real mode from user.mode instead of local useState
- Sync mode toggle to useMutation(api.users.toggleMode)
```

### 1.7 Free Trial UI
```
Locations:
1. Sidebar footer — plan badge shows "Free Trial" in amber
2. Settings page — "Current Plan: Free Trial" + "Upgrade" button  
3. Onboarding — "You're on the Free Trial" info banner
4. If free user tries Autopilot → show upgrade modal:
   "Autopilot is available on Indie plan and above"
   [See Plans] button → scroll landing page to #pricing or navigate to /settings

Free Trial limits (enforced in UI, not backend — MVP):
- 1 app profile
- 10 content generations per month
- Assist mode only (no Autopilot)
- Basic codebase analysis (no legal document generation)
```

---

## Table of Contents

1. [Phase 0: Infrastructure Setup](#phase-0-infrastructure-setup)
2. [Phase 1: Authentication & Onboarding](#phase-1-authentication--onboarding)
3. [Phase 2: Overview Dashboard (Assist + Autopilot)](#phase-2-overview-dashboard)
4. [Phase 3: Strategy Page](#phase-3-strategy-page)
5. [Phase 4: Content Studio](#phase-4-content-studio)
6. [Phase 5: Launch Kit](#phase-5-launch-kit)
7. [Phase 6: Codebase Page](#phase-6-codebase-page)
8. [Phase 7: Resources Page](#phase-7-resources-page)
9. [Phase 8: Settings Page](#phase-8-settings-page)
10. [Phase 9: Global Components](#phase-9-global-components)
11. [Phase 10: Polish & Testing](#phase-10-polish--testing)
12. [Manual Setup Checklist](#manual-setup-checklist)

---

## Phase 0: Infrastructure Setup

### 0.1 Initialize Convex Project
- [ ] Run `npx convex dev` from `app/` directory
- [ ] This creates the Convex project, generates `_generated/` types, and creates `.env.local`
- [ ] Confirm `VITE_CONVEX_URL` is set in `.env.local`

### 0.2 Set Environment Variables on Convex
- [ ] `BETTER_AUTH_SECRET` — generated via `openssl rand -base64 32`
- [ ] `SITE_URL` — `http://localhost:5173`
- [ ] `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` — from GitHub OAuth App
- [ ] `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — from Google Cloud Console
- [ ] `DO_INFERENCE_API_KEY` — from DigitalOcean Gradient AI Platform → Serverless Inference
- [ ] `COMPOSIO_API_KEY` — from Composio dashboard

### 0.3 Generate Better Auth Schema
- [ ] Run `npx @better-auth/cli generate --config ./convex/betterAuth/auth.ts --output ./convex/betterAuth/schema.ts`
- [ ] Verify the schema matches the expected user/session/account/verification tables

### 0.4 Verify Backend Deployment
- [ ] Run `npx convex dev` — keeps syncing functions to Convex cloud
- [ ] Confirm schema deploys without errors
- [ ] Confirm all functions appear in Convex dashboard

### 0.5 Wire Convex Provider in `main.jsx`
```
File: src/main.jsx

Action:
- Import ConvexProvider and convex client from src/lib/convex-client.ts
- Wrap <App /> with <ConvexProvider client={convex}>
- Add conditional: if convex client is null (URL missing), show setup instructions
```

### 0.6 Add Vite Proxy (if needed)
```
File: vite.config.js

Action:
- If Better Auth API is proxied through Vite, add proxy config
- For Convex, this is NOT needed — auth goes through convex.site domain
```

---

## Phase 1: Authentication & Onboarding

### 1.1 Create Login/Signup Page

```
File: src/pages/Auth.jsx (NEW)
Route: /auth

UI Elements:
- App logo + "MarketAxis AI" title
- "Sign in to your account" heading
- Email input field → MUST validate email format
- Password input field → MUST validate min 8 chars
- "Sign in" button → calls authClient.signIn.email({ email, password })
- "Sign up" link → toggles form to show Name + Confirm Password fields
- "Sign up" button → calls authClient.signUp.email({ email, password, name })
- Divider "or continue with"
- "Continue with GitHub" button → calls authClient.signIn.social({ provider: "github", callbackURL: "/overview" })
- "Continue with Google" button → calls authClient.signIn.social({ provider: "google", callbackURL: "/overview" })
- Error state: show inline error messages below form fields
- Loading state: disable buttons, show spinner during auth

Backend connections:
- authClient.signIn.email() → Better Auth handles internally
- authClient.signUp.email() → Better Auth creates user in betterAuth tables
- After successful auth → call Convex mutation users.syncUser({ email, name, avatarUrl })
  This ensures our users table has a matching record
- Redirect to /onboarding if no appProfile exists, else /overview
```

### 1.2 Create Onboarding Page

```
File: src/pages/Onboarding.jsx (NEW)
Route: /onboarding

UI Elements:
Step 1 of 2 — "Tell us about your app"
- App name input (required)
- Description textarea (required, 1-3 sentences)
- Target audience input (required)
- Platform multi-select: iOS, Android, Web (at least one required)
- Region select: Global, North America, Europe, Asia, Latin America, Africa
- Stage select: Idea, MVP, Beta, Launched
- Monetization select: Free, Freemium, Paid, SaaS
- App URL input (optional)
- Competitor URLs — dynamic list with add/remove (optional)
- "Continue" button → validates all required fields, goes to Step 2

Step 2 of 2 — "Connect your accounts" (optional, skippable)
- "Connect GitHub" button → initiates Composio OAuth for GitHub
- "Connect Twitter" button → initiates Composio OAuth for Twitter
- "Connect LinkedIn" button → initiates Composio OAuth for LinkedIn
- "Skip for now" link → proceeds without connecting
- "Generate My Strategy" button → saves profile + triggers strategy generation

Backend connections:
- "Continue" (step 1) → Convex mutation appProfiles.create(formData)
- "Connect *" buttons → Composio initiateConnection() → redirect → callback saves to socialAccounts.connect()
- "Generate My Strategy" → Convex action agentActions.generateStrategy({ appProfileId, userId })
- After generation → redirect to /overview
- Show loading overlay during generation: "Creating your marketing strategy..." with animated steps:
  1. "Analyzing your product..."
  2. "Defining brand positioning..."
  3. "Building content calendar..."
  4. "Mapping target communities..."
  5. "Strategy ready!"
```

### 1.3 Auth Guard (Route Protection)

```
File: src/components/AuthGuard.jsx (NEW)

Logic:
- Use authClient.useSession() to check authentication
- If session loading → show full-page skeleton loader
- If no session → redirect to /auth
- If session exists but no appProfile (check via users.getCurrentUser + appProfiles.getByUser) → redirect to /onboarding
- If session + profile → render children (dashboard)

Wire into:
- App.jsx: Wrap Layout route with AuthGuard
- Auth page and Onboarding page are NOT wrapped (public routes)
```

### 1.4 Update App.jsx Routes

```
File: src/App.jsx

Changes:
- Add /auth route → <Auth />
- Add /onboarding route → <Onboarding /> (requires auth but no profile)
- Wrap Layout with AuthGuard: only render if authenticated + has profile
- Add redirect: / → /auth if not authenticated, /overview if authenticated
- Pass real user data instead of mock data
```

---

## Phase 2: Overview Dashboard

### 2.1 Assist Mode — Every Interactive Element

```
File: src/pages/Overview.jsx (UPDATE)

REPLACE: Import from mockData → Import from Convex queries

Data Sources (replace all mock data):
- const user = useQuery(api.users.getCurrentUser)
- const profile = useQuery(api.appProfiles.getByUser, { userId: user._id })
- const contents = useQuery(api.contents.getByProfile, { appProfileId: profile._id })
- const resources = useQuery(api.resources.getByProfile, { appProfileId: profile._id })
- const launchAssets = useQuery(api.launchAssets.getByProfile, { appProfileId: profile._id })
- const analysis = useQuery(api.codebaseAnalysis.getByProfile, { appProfileId: profile._id })
- const activities = useQuery(api.activities.getByUser, { userId: user._id })

Interactive Elements — Assist Mode:

1. QUICK ACTION: "Generate a Twitter thread"
   - onClick → navigate('/content') AND pre-select twitter_thread type
   - Pass state via React Router: navigate('/content', { state: { selectedType: 'twitter_thread' } })

2. QUICK ACTION: "Analyze your codebase"
   - onClick → navigate('/codebase')

3. QUICK ACTION: "Create a legal document"
   - onClick → navigate('/resources') AND open document type selector
   - Pass state: navigate('/resources', { state: { openGenerator: true } })

4. QUICK ACTION: "Build your launch kit"
   - onClick → navigate('/launch')

5. REVIEW QUEUE — "Approve" button (per item)
   - Content items: onClick → Convex mutation contents.updateStatus({ contentId, status: 'approved' })
   - Resource items: onClick → Convex mutation resources.update({ resourceId, status: 'final' })
   - Launch assets: onClick → Convex mutation launchAssets.updateStatus({ assetId, status: 'ready' })
   - After approve → item disappears from queue (real-time via Convex)

6. REVIEW QUEUE — "View" (eye) button (per item)
   - Content items: onClick → navigate('/content', { state: { viewContent: contentId } })
   - Resource items: onClick → navigate('/resources', { state: { viewDoc: resourceId } })
   - Launch assets: onClick → navigate('/launch', { state: { viewAsset: assetId } })

7. PROGRESS CARD — Each metric row
   - "Content pieces" → clickable, navigates to /content
   - "Resources generated" → clickable, navigates to /resources
   - "Launch readiness" → clickable, navigates to /launch
   - "Features detected" → clickable, navigates to /codebase

8. TECH STACK CARD — Each tag
   - Non-interactive display only (acceptable — these are info tags)
```

### 2.2 Autopilot Mode — Every Interactive Element

```
Interactive Elements — Autopilot Mode:

1. AGENT STATUS CARDS (5 cards)
   - Each card shows: agent name, status (idle/running), last action text
   - Status comes from: query agentLogs for each agent type, get latest log
   - If agent is running (status="running"), show green "Running" dot + live text
   - Click on any agent card → navigate to that agent's page:
     - Strategy Agent → /strategy
     - Content Agent → /content
     - Launch Agent → /launch
     - Codebase Agent → /codebase
     - Legal Agent → /resources

2. LIVE ACTIVITY FEED
   - Data source: useQuery(api.activities.getByUser, { userId, limit: 20 })
   - Each feed item shows: icon (by agent type), description, time ago
   - Feed items are clickable → navigate to relevant page based on agentType:
     - "content" → /content
     - "strategy" → /strategy
     - "launch" → /launch
     - "codebase" → /codebase
     - "legal" → /resources
   - "Streaming" badge → live pulse animation (CSS, already implemented)

3. CONTROL: "Pause all agents"
   - onClick → Convex mutation users.toggleMode({ userId, mode: 'assist' })
   - This switches to Assist mode globally
   - Show confirmation modal: "Are you sure? All agents will stop autonomous execution."

4. CONTROL: "View agent logs"
   - onClick → navigate to a logs view
   - Implementation: Add a query parameter to /settings: navigate('/settings?tab=logs')
   - OR: Create src/pages/AgentLogs.jsx with full execution log viewer
   - Decision: Create a modal/drawer that shows agentLogs.getByProfile results
   - UI: Table with columns: Agent, Action, Status, Duration, Time

5. CONTROL: "Configure guardrails"
   - onClick → navigate('/settings')
   - Settings page has the mode selector that shows guardrail info

6. CONTROL: "Review posted content"
   - onClick → navigate('/content', { state: { tab: 'history', statusFilter: 'posted' } })

7. AUTOPILOT STATS CARD
   - Stats are calculated from: activities in last 24h, filtered by action type
   - Non-interactive display metrics (acceptable — these are summary numbers)
```

---

## Phase 3: Strategy Page

```
File: src/pages/Strategy.jsx (UPDATE)

Data Source:
- const profile = useQuery(api.appProfiles.getByUser, { userId })
- const strategy = useQuery(api.strategies.getByProfile, { appProfileId: profile._id })
- If strategy is null → show empty state: "No strategy generated yet" + "Generate Strategy" button

Interactive Elements:

1. "Edit profile" button (page header)
   - onClick → navigate('/settings')
   - Settings page has the app profile edit form

2. "Regenerate" button (page header)
   - onClick → show confirmation modal: "This will regenerate your entire strategy. Current strategy will be replaced."
   - On confirm → call Convex action agentActions.generateStrategy({ appProfileId, userId })
   - Show loading overlay with progress steps
   - Strategy page auto-updates via real-time Convex subscription

3. TAB: "Positioning"
   - "Regenerate" button (per section) → calls generateStrategy but only updates positioning
   - Implementation: For MVP, regenerate full strategy (partial regen is Phase 2)
   - Positioning text is editable → double-click or "Edit" icon to toggle contentEditable
   - On blur (after editing) → Convex mutation strategies.save({ ...strategy, positioning: newText })

4. TAB: "Positioning" — Differentiators list
   - Each differentiator shown with number badge
   - Non-interactive display (acceptable for MVP — editing happens on regenerate)

5. TAB: "Voice" — Brand Tone + Personality
   - Display only for MVP
   - Future: inline editing

6. TAB: "Voice" — Do/Don't lists
   - Display only (acceptable — regenerate updates these)

7. TAB: "Calendar" — 30-day content calendar grid
   - Each calendar event is clickable → onClick navigates to Content Studio with that content type:
     navigate('/content', { state: { selectedType: event.contentType } })
   - "Export" button → downloads calendar as .ics or .csv file
   - Implementation: Generate CSV string from contentCalendar array, trigger browser download

8. TAB: "Roadmap" — Week cards with task checkboxes
   - Each checkbox toggles its checked state → store in local state for MVP
   - Future: persist task completion to Convex
   - Each week card is display-only otherwise

9. TAB: "Communities" — Table
   - "Add community" button → show inline form at bottom of table (name, platform, url fields + save button)
   - On save → update strategy via strategies.save() with new community appended
   - URL column links → open in new tab (target="_blank", already implemented)
   - Status badge "Not joined" → clickable, shows tooltip: "Coming in Phase 2 — auto-join communities"
```

---

## Phase 4: Content Studio

```
File: src/pages/ContentStudio.jsx (UPDATE)

Data Sources:
- const contents = useQuery(api.contents.getByProfile, { appProfileId })
- const strategy = useQuery(api.strategies.getByProfile, { appProfileId })

Location state handling:
- const { state } = useLocation()
- If state?.selectedType → set selectedType to that value on mount
- If state?.viewContent → switch to history tab, highlight that content
- If state?.tab → set activeTab ('create' or 'history')

Interactive Elements — Create Tab:

1. CONTENT TYPE SELECTOR (8 types: X Thread, LinkedIn, Reddit, App Store, Email, Blog, Product Hunt, Landing Page)
   - Each card onClick → sets selectedType state
   - Also loads the most recent content of that type from DB (if exists) into editor
   - If no content exists for that type → show empty editor with "Click Generate to create"

2. "Generate All" button (page header)
   - onClick → show confirmation: "Generate content for all 8 types?"
   - On confirm → for each content type, call agentActions.generateContent({ appProfileId, userId, contentType, platform })
   - Show loading overlay with progress: "Generating 1 of 8... X Thread"
   - As each completes, the content list updates in real-time

3. EDITOR — "Regenerate" button
   - onClick → call agentActions.generateContent for the selected type
   - Show skeleton loading in editor body while generating
   - On complete → editor body updates via Convex subscription

4. EDITOR — "Copy" button
   - onClick → navigator.clipboard.writeText(selectedContent.body)
   - Toggle icon to Check + "Copied" for 2 seconds (already implemented)

5. EDITOR — "Post" button (Assist mode)
   - onClick → check if social account is connected for this platform
   - If not connected → show modal: "Connect your [platform] account to post directly" + "Connect" button (→ /settings)
   - If connected → show confirmation: "Post this to [platform]?"
   - On confirm → call agentActions.postToSocial({ contentId, userId })
   - On success → update button to "Posted ✓", update content status badge
   - On error → show error toast with retry option

6. EDITOR — "Auto-queue" button (Autopilot mode)
   - onClick → call contents.updateStatus({ contentId, status: 'scheduled' })
   - Content enters auto-post queue
   - Show toast: "Queued for auto-posting"

7. EDITOR — Content body area
   - Currently display-only
   - Make it contentEditable: on focus, switch to textarea mode
   - On blur → call contents.updateBody({ contentId, body: newBody })
   - Show "Saved" indicator after successful mutation

8. STATUS BADGE next to title
   - Clickable → shows dropdown with status options: Draft, Approved, Scheduled, Posted
   - On select → call contents.updateStatus({ contentId, status: newStatus })

Interactive Elements — History Tab:

9. HISTORY TABLE — Each row
   - "View" button → switch to Create tab, load that content in editor
     Set selectedType to this content's type, show in editor
   - Title column text → also clickable, same as View
   - Status badge → clickable, shows status dropdown (same as #8)
   - Future: Add "Delete" button per row → contents.remove({ contentId })

10. TABLE SORTING
    - Column headers (Title, Type, Platform, Status, Created) → clickable to sort
    - Implementation: local state sort, not backend sort (small dataset for MVP)
```

---

## Phase 5: Launch Kit

```
File: src/pages/LaunchKit.jsx (UPDATE)

Data Sources:
- const launchAssets = useQuery(api.launchAssets.getByProfile, { appProfileId })
- Readiness calculation: readyCount / totalCount from query results

Interactive Elements:

1. "Generate all" button (page header)
   - onClick → show confirmation: "Generate all 6 launch assets?"
   - On confirm → call agentActions.generateLaunchKit({ appProfileId, userId })
   - Show loading overlay: "Generating launch assets... Product Hunt (1/6)"
   - Assets appear in real-time as each completes

2. READINESS PROGRESS BAR
   - Auto-calculates from asset statuses
   - Non-interactive (acceptable — it's a summary)

3. ASSET CARDS (6 cards: Product Hunt, Hacker News, Press Email, Twitter Launch, LinkedIn Launch, BetaList)
   - Card click → toggles expanded view showing full content body
   - "View" button → same as card click (expand/collapse)
   - "Edit" button → switch card content to textarea for editing
     On save → call launchAssets.updateBody({ assetId, body: newBody })
   - Status badge → clickable dropdown: Draft, Ready, Submitted
     On select → call launchAssets.updateStatus({ assetId, status: newStatus })
   - Arrow icon (prompt-card-arrow) → visual indicator only (acceptable)

4. EMPTY STATE (no assets generated yet)
   - Show: "No launch assets yet" + "Generate your launch kit" button
   - Button triggers same flow as #1
```

---

## Phase 6: Codebase Page

```
File: src/pages/Codebase.jsx (UPDATE)

Data Sources:
- const repos = useQuery(api.githubRepos.getByProfile, { appProfileId })
- const analysis = useQuery(api.codebaseAnalysis.getByProfile, { appProfileId })
- const socialAccounts = useQuery(api.socialAccounts.getByUser, { userId })
- const githubConnected = socialAccounts?.some(a => a.platform === 'github' && a.isActive)

Interactive Elements:

1. EMPTY STATE (no repo connected)
   - Show: "Connect your GitHub repository to get started"
   - "Connect GitHub" button → check if GitHub is connected via Composio
     - If not connected → initiate Composio OAuth for GitHub
     - If connected → show repo selector modal

2. REPO SELECTOR MODAL (after GitHub connected)
   - Fetch user's repos via Composio GitHub API
   - Show searchable list of repos (name, description, language, stars)
   - On select → call githubRepos.connect({ appProfileId, repoName, repoUrl, defaultBranch, ... })
   - Then trigger analysis → agentActions will be extended with analyzeCodebase action

3. REPO INFO CARD (when repo is connected)
   - Shows: repo name, URL, branch, language, last analyzed timestamp
   - "View on GitHub" link (ExternalLink icon) → opens repoUrl in new tab
   - "Re-analyze" button → triggers codebase analysis action
   - "Disconnect" button → show confirmation, then githubRepos.remove({ repoId })

4. TAB: "Tech Stack"
   - Displays tech stack tags from analysis.techStack
   - Non-interactive tags (acceptable)

5. TAB: "Features" — Feature cards
   - Each feature shows: name, description, category badge
   - Non-interactive display (acceptable)
   - "Generate marketing copy" button at bottom → navigate to /content with feature context

6. TAB: "Dependencies" — Dependency table
   - Columns: Name, Version, Type (production/dev)
   - Non-interactive display (acceptable)

7. TAB: "File Structure"
   - Shows file tree from analysis.fileStructure
   - Non-interactive display (acceptable)

8. TAB: "Legal Requirements"
   - Shows legal requirement cards with severity badges (required/recommended/optional)
   - Each card has "Generate" button → calls agentActions.generateLegalDocument({
       appProfileId, userId, documentType: requirement.documentType
     })
   - Show loading → on complete → badge changes to "Generated ✓", links to /resources
   - "View All" link → navigate('/resources', { state: { activeCategory: 'legal' } })
```

---

## Phase 7: Resources Page

```
File: src/pages/Resources.jsx (UPDATE)

Data Sources:
- const resources = useQuery(api.resources.getByProfile, { appProfileId })

Location state handling:
- If state?.openGenerator → open document type generator modal
- If state?.viewDoc → open doc viewer for that resourceId
- If state?.activeCategory → set activeCategory tab

Interactive Elements:

1. "Generate document" button (page header)
   - onClick → open modal with document type selector:
     - Privacy Policy
     - Terms of Service
     - Cookie Policy
     - GDPR Compliance
     - CCPA Compliance
     - Acceptable Use Policy
   - On select → call agentActions.generateLegalDocument({ appProfileId, userId, documentType })
   - Show loading: "Generating Privacy Policy..."
   - On complete → document appears in grid (real-time via Convex)

2. CATEGORY TABS (All, Legal, Marketing, Technical)
   - Each tab filters the resource list
   - Count badges update from query results
   - Already implemented — just wire to real data

3. RESOURCE CARDS — Card click
   - Opens document viewer (already implemented)
   - Wire viewingDoc state to resourceId from query results

4. RESOURCE CARDS — "View" (eye) button
   - Same as card click — opens viewer

5. RESOURCE CARDS — "Download" button
   - onClick → generate downloadable file:
     - Format: Markdown (.md) by default
     - Create a Blob from resource.body, trigger download
     - Implementation:
       const blob = new Blob([resource.body], { type: 'text/markdown' });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url; a.download = `${resource.title.toLowerCase().replace(/\s+/g, '-')}.md`;
       a.click();

6. DOCUMENT VIEWER — "Back" button
   - Already implemented (sets viewingDoc to null)

7. DOCUMENT VIEWER — "Edit" button
   - onClick → toggle body into contentEditable/textarea mode
   - Show "Save" + "Cancel" buttons
   - On save → call resources.update({ resourceId, body: newBody })
   - On cancel → revert to original body

8. DOCUMENT VIEWER — "Download" button
   - Same as card download (#5)

9. EMPTY STATE (no resources)
   - Show: "No documents generated yet"
   - "Generate your first document" button → same as #1
```

---

## Phase 8: Settings Page

```
File: src/pages/Settings.jsx (UPDATE)

Data Sources:
- const user = useQuery(api.users.getCurrentUser)
- const profile = useQuery(api.appProfiles.getByUser, { userId })
- const socialAccounts = useQuery(api.socialAccounts.getByUser, { userId })

Interactive Elements:

1. "Save changes" button (page header)
   - onClick → call appProfiles.update({ profileId, ...formChanges })
   - Show toast: "Profile saved"
   - Disable button if no changes detected

2. MODE SELECTOR — Assist/Autopilot cards
   - Each card onClick → call users.toggleMode({ userId, mode: 'assist'|'autopilot' })
   - If switching TO autopilot → show confirmation modal:
     "Autopilot mode will allow agents to act autonomously. You'll be notified of all actions."
     [Cancel] [Enable Autopilot]
   - Mode updates in real-time across all open tabs (Convex subscription)
   - Update topbar toggle simultaneously (shared state via Convex)

3. APP PROFILE FORM — All input fields
   - App Name, App URL, Description, Target Audience, Region, Stage, Monetization
   - Each field onChange → update local form state
   - On "Save changes" → batch update via appProfiles.update()
   - Add validation: App Name required, Description required

4. CONNECTED ACCOUNTS — "Connect" buttons (per platform)
   - Twitter: onClick → initiate Composio OAuth for Twitter
     - Redirect to Composio OAuth URL
     - On callback → save via socialAccounts.connect({ userId, platform: 'twitter', accountName, composioEntityId })
   - LinkedIn: Same flow for LinkedIn
   - GitHub: Same flow for GitHub
   - Gmail: Same flow for Gmail (Phase 2 — hide for MVP or show as "Coming soon" with disabled state)
   - Instagram: Phase 2 — hide or disabled

5. CONNECTED ACCOUNTS — "Disconnect" buttons
   - onClick → show confirmation: "Disconnect [Platform]? You won't be able to post to [Platform] until you reconnect."
   - On confirm → call socialAccounts.disconnect({ accountId })
   - Update UI to show "Not connected" state

6. CONNECTED ACCOUNTS — Status display
   - Green dot + "Connected" for active accounts
   - Show account name/handle from socialAccounts query

7. ACCOUNT SECTION — Name/Email
   - Read-only display from user query (Better Auth manages these)

8. ACCOUNT SECTION — Plan badge + "Upgrade" button
   - For MVP → "Upgrade" → show modal or link to pricing page
   - If no pricing yet → button opens mailto: link or typeform survey

9. ACCOUNT SECTION — Auth Provider badge
   - Display only: "Better Auth" badge (informational)

10. SIGN OUT
    - Add a "Sign out" button at the bottom of Settings
    - onClick → authClient.signOut() → redirect to /auth
```

---

## Phase 9: Global Components

### 9.1 Sidebar (Layout.jsx)

```
File: src/components/layout/Layout.jsx (UPDATE)

Interactive Elements:

1. SIDEBAR NAV LINKS (7 items)
   - All already wired to React Router NavLink — WORKING
   - Active state highlighting — WORKING
   - Resources badge "5" → make dynamic: show count of draft resources
     Data: const resources = useQuery(api.resources.getByProfile, { appProfileId })
     Badge: resources?.filter(r => r.status === 'draft').length || null

2. USER AVATAR AREA (sidebar footer)
   - Shows user name + plan from real auth data
   - Make clickable → navigate('/settings')

3. LOGO
   - "MarketAxis" click → navigate('/overview')
```

### 9.2 Top Bar

```
Interactive Elements:

1. MODE TOGGLE (Assist/Autopilot)
   - Already wired to local state
   - Upgrade: wire to Convex mutation users.toggleMode()
   - Mode state comes from: useQuery(api.users.getCurrentUser).mode
   - On toggle → mutation → real-time update across all pages

2. SEARCH BUTTON (magnifying glass)
   - onClick → open search modal/command palette
   - Implementation: Create SearchModal.jsx with:
     - Input field with keyboard shortcut (Cmd+K / Ctrl+K)
     - Search across: content titles, resource titles, strategy text
     - Results grouped by type (Content, Resources, Strategy)
     - Click result → navigate to that item
   - Data: client-side search across cached query results
   - Note: For MVP, can be simplified to a basic text filter

3. NOTIFICATIONS BELL
   - Red dot indicator → show when new activities exist since last viewed
   - onClick → open notifications dropdown/panel
   - Shows recent activities from activities.getByUser
   - Each notification clickable → navigate to relevant page
   - "Mark all read" button → store lastViewedAt in local storage
   - Red dot disappears when all notifications are viewed
```

### 9.3 Toast/Notification System

```
File: src/components/common/Toast.jsx (NEW)

- Create a toast notification system for success/error/info feedback
- Used by: all mutations (save, approve, post, generate, etc.)
- Auto-dismiss after 4 seconds
- Support types: success (green), error (red), info (blue), warning (yellow)
- Position: bottom-right corner
- Stack multiple toasts with stagger animation
```

### 9.4 Confirmation Modal

```
File: src/components/common/ConfirmModal.jsx (NEW)

- Reusable confirmation dialog for destructive/important actions
- Props: title, message, confirmLabel, cancelLabel, onConfirm, onCancel, variant (danger/warning/info)
- Used by: mode toggle, regenerate strategy, delete content, disconnect account, sign out
```

### 9.5 Loading States

```
For EVERY page:
- If Convex queries are loading (return undefined) → show skeleton loaders
- Use the existing .skeleton CSS class
- Each page needs a SkeletonLoader variant matching its layout:
  - Overview: 4 skeleton prompt cards + skeleton queue items
  - Strategy: skeleton text blocks
  - Content Studio: skeleton type cards + skeleton editor
  - Launch Kit: skeleton progress bar + skeleton cards
  - Codebase: skeleton repo card + skeleton tabs
  - Resources: skeleton card grid
  - Settings: skeleton form fields
```

---

## Phase 10: Polish & Testing

### 10.1 Error Handling

```
For EVERY action/mutation call:
- Wrap in try/catch
- On error → show error toast with message
- For agent actions (LLM calls): show "Generation failed. Retry?" with retry button
- For Composio actions: show "Connection error. Please check your [Platform] connection."
- For auth failures: redirect to /auth with error message
```

### 10.2 Empty States

```
Every page must handle the "no data" state:

- Overview (no content/resources) → show "Welcome! Start by generating your strategy" + button
- Strategy (no strategy) → show "Generate your marketing strategy" + button
- Content Studio (no content) → show "Create your first content piece" + type selector
- Launch Kit (no assets) → show "Build your launch kit" + generate button
- Codebase (no repo) → show "Connect GitHub to analyze your codebase" + connect button
- Resources (no docs) → show "Generate your first document" + button
- Settings (connected accounts empty) → show "Connect your first account" message
```

### 10.3 Responsive Design

```
- Sidebar: collapsible on mobile (hamburger menu)
- Cards: single column on mobile, 2 columns on tablet
- Editor: full-width on mobile
- Tables: horizontal scroll on mobile
- Mode toggle: smaller on mobile
```

### 10.4 End-to-End Flow Testing

```
Flow 1: New User Complete Journey
1. Visit / → redirect to /auth
2. Sign up with email + password
3. Redirect to /onboarding
4. Fill in app profile → click "Generate My Strategy"
5. Loading overlay → strategy generates
6. Redirect to /overview (Assist mode)
7. See strategy snapshot + empty review queue
8. Navigate to /strategy → see full strategy
9. Navigate to /content → generate a Twitter thread
10. Copy the thread → verify clipboard has content
11. Connect Twitter in Settings
12. Return to Content Studio → click "Post" → content posts

Flow 2: Returning User Content Creation
1. Visit / → redirect to /overview
2. See review queue with pending items
3. Click "Approve" on a content item
4. Navigate to Content Studio → generate new LinkedIn post
5. Edit the post inline → save
6. Click "Post" → successfully posts to LinkedIn

Flow 3: Codebase → Legal Flow
1. Navigate to /codebase → connect GitHub
2. Select repo → analysis runs
3. See tech stack, features, legal requirements
4. Click "Generate" on "Privacy Policy" requirement
5. Privacy Policy generates → navigate to /resources
6. Open Privacy Policy viewer → edit → download as .md file

Flow 4: Autopilot Toggle
1. Go to Settings → click Autopilot mode card
2. Confirmation modal → confirm
3. Overview page switches to Autopilot dashboard
4. See agent status cards with Running/Idle states
5. Live activity feed shows agent actions
6. Click "Pause all agents" → switches back to Assist
```

---

## Manual Setup Checklist

These are things that **cannot be done via code** and require manual action by you:

### Required Before First Run

| # | Task | Where | Notes |
|---|------|-------|-------|
| 1 | **Create a Convex account** | [convex.dev](https://convex.dev) | Free tier is sufficient for development |
| 2 | **Run `npx convex dev`** | Terminal in `app/` directory | Creates project, generates types — I can run the command but you need to log in via browser |
| 3 | **Create a GitHub OAuth App** | [github.com/settings/developers](https://github.com/settings/developers) → New OAuth App | Homepage URL: `http://localhost:5173`, Callback URL: `https://YOUR-DEPLOYMENT.convex.site/api/auth/callback/github` |
| 4 | **Create a Google OAuth Client** | [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) | Web application type, add redirect URI: `https://YOUR-DEPLOYMENT.convex.site/api/auth/callback/google` |
| 5 | **Get a DigitalOcean Model Access Key** | [cloud.digitalocean.com](https://cloud.digitalocean.com) → Gradient AI Platform → Serverless Inference | Create a Model Access Key for API access |
| 6 | **Get a Composio API key** | [composio.dev](https://composio.dev) | Sign up → Dashboard → API Keys |
| 7 | **Set up Composio integrations** | Composio Dashboard → Integrations | Enable Twitter, LinkedIn, and GitHub integrations — each needs its own OAuth app credentials on the respective platforms |
| 8 | **Set Convex environment variables** | Run the npx convex env set commands listed in Phase 0.2 | You'll need the keys from steps 3-6 |

### Required Before Social Posting Works

| # | Task | Where | Notes |
|---|------|-------|-------|
| 9 | **Create a Twitter/X Developer Account** | [developer.twitter.com](https://developer.twitter.com) | Needed for Composio to post tweets on behalf of users |
| 10 | **Create a LinkedIn Developer App** | [linkedin.com/developers](https://www.linkedin.com/developers/) | For Composio LinkedIn posting integration |

### Required Before Production Deploy

| # | Task | Where | Notes |
|---|------|-------|-------|
| 11 | **Create DigitalOcean account** | [digitalocean.com](https://digitalocean.com) | For frontend hosting via App Platform |
| 12 | **Deploy Convex to production** | `npx convex deploy` | Deploys backend to production Convex |
| 13 | **Set production env vars on Convex** | Convex Dashboard → Settings → Environment Variables | Same keys but with production URLs/secrets |
| 14 | **Update OAuth callback URLs** | GitHub, Google developer consoles | Change from localhost to production domain |
| 15 | **Set up custom domain** | DigitalOcean App Platform + DNS provider | Point your domain to the DO app |

---

## File Manifest (All files to create/modify)

### New Files
| File | Purpose |
|------|---------|
| `src/pages/Auth.jsx` | Login/signup page |
| `src/pages/Onboarding.jsx` | App profile onboarding + strategy generation |
| `src/components/AuthGuard.jsx` | Route protection based on auth state |
| `src/components/common/Toast.jsx` | Toast notification system |
| `src/components/common/ConfirmModal.jsx` | Confirmation dialog |
| `src/components/common/SearchModal.jsx` | Command palette / search |

### Modified Files
| File | Changes |
|------|---------|
| `src/main.jsx` | Add ConvexProvider wrapper |
| `src/App.jsx` | Add auth/onboarding routes, wrap with AuthGuard |
| `src/pages/Overview.jsx` | Replace mock data with Convex queries, wire all buttons |
| `src/pages/Strategy.jsx` | Replace mock data, wire regenerate + editing |
| `src/pages/ContentStudio.jsx` | Replace mock data, wire generate + post + edit |
| `src/pages/LaunchKit.jsx` | Replace mock data, wire generate + edit |
| `src/pages/Codebase.jsx` | Replace mock data, wire GitHub connect + analysis |
| `src/pages/Resources.jsx` | Replace mock data, wire generate + edit + download |
| `src/pages/Settings.jsx` | Replace mock data, wire save + connect + disconnect |
| `src/components/layout/Layout.jsx` | Dynamic badge counts, user data from auth |
| `src/index.css` | Add styles for auth page, onboarding, toast, modal, search |

### Backend Files (Already Created)
| File | Status |
|------|--------|
| `convex/schema.ts` | DONE |
| `convex/users.ts` | DONE |
| `convex/appProfiles.ts` | DONE |
| `convex/strategies.ts` | DONE |
| `convex/contents.ts` | DONE |
| `convex/launchAssets.ts` | DONE |
| `convex/socialAccounts.ts` | DONE |
| `convex/activities.ts` | DONE |
| `convex/agentLogs.ts` | DONE |
| `convex/githubRepos.ts` | DONE |
| `convex/codebaseAnalysis.ts` | DONE |
| `convex/resources.ts` | DONE |
| `convex/agentActions.ts` | DONE |
| `convex/lib/llm.ts` | DONE |
| `convex/lib/composio.ts` | DONE |
| `convex/lib/prompts.ts` | DONE |
| `convex/betterAuth/*` | DONE |
| `convex/http.ts` | DONE |
| `convex/auth.config.ts` | DONE |
| `src/lib/auth-client.ts` | DONE |
| `src/lib/convex-client.ts` | DONE |

---

## Implementation Order (Recommended)

```
Week 1: Phase 0 (Setup) + Phase 1 (Auth + Onboarding)
  ├── Day 1-2: Convex project init, env vars, verify deployment
  ├── Day 3-4: Auth page (login/signup), AuthGuard
  └── Day 5-7: Onboarding page, profile creation, strategy generation trigger

Week 2: Phase 2 (Overview) + Phase 3 (Strategy)
  ├── Day 1-3: Wire Overview to real data, all buttons working
  └── Day 4-7: Wire Strategy page, regenerate, calendar events

Week 3: Phase 4 (Content) + Phase 5 (Launch Kit)
  ├── Day 1-4: Content Studio — generate, edit, copy, post
  └── Day 5-7: Launch Kit — generate all, edit, status updates

Week 4: Phase 6 (Codebase) + Phase 7 (Resources)
  ├── Day 1-3: GitHub connect, repo analysis, display results
  └── Day 4-7: Resources — generate legal docs, edit, download

Week 5: Phase 8 (Settings) + Phase 9 (Global) + Phase 10 (Polish)
  ├── Day 1-2: Settings — social connect, profile save, mode toggle
  ├── Day 3-4: Toast system, confirm modals, search, notifications
  └── Day 5-7: Error handling, empty states, responsive, end-to-end testing
```
